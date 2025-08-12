import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { uploadImage, deleteImage, bufferToDataURL } from '../utils/cloudinaryUpload.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const {
      name,
      phone,
      address,
      dateOfBirth,
      preferences
    } = req.body;

    // Update allowed fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// @desc    Upload user avatar
// @route   POST /api/users/upload-avatar
// @access  Private
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      try {
        // Extract public_id from avatar URL
        const urlParts = user.avatar.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        await deleteImage(`quickcourt/avatars/${publicId}`);
      } catch (deleteError) {
        console.error('Error deleting old avatar:', deleteError);
      }
    }

    // Upload new avatar
    const dataURL = bufferToDataURL(req.file.buffer, req.file.mimetype);
    const result = await uploadImage(dataURL, 'quickcourt/avatars');

    user.avatar = result.url;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading avatar'
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/users/bookings
// @access  Private
export const getUserBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, upcoming } = req.query;

    let query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('facility', 'name address images rating')
      .populate('court', 'name sport courtType')
      .sort({ date: -1, 'timeSlot.startTime': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    // Get booking statistics
    const stats = {
      total: await Booking.countDocuments({ user: req.user._id }),
      completed: await Booking.countDocuments({ user: req.user._id, status: 'completed' }),
      cancelled: await Booking.countDocuments({ user: req.user._id, status: 'cancelled' }),
      upcoming: await Booking.countDocuments({ 
        user: req.user._id, 
        status: 'confirmed', 
        date: { $gte: new Date() } 
      })
    };

    res.json({
      success: true,
      data: {
        bookings,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalBookings: total
        }
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings'
    });
  }
};

// @desc    Get user reviews
// @route   GET /api/users/reviews
// @access  Private
export const getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ user: req.user._id })
      .populate('facility', 'name images')
      .populate('court', 'name sport')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalReviews: total
        }
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      user: req.user._id,
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: new Date() }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with active bookings. Please cancel all bookings first.'
      });
    }

    // Delete avatar from cloudinary
    if (user.avatar) {
      try {
        const urlParts = user.avatar.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        await deleteImage(`quickcourt/avatars/${publicId}`);
      } catch (deleteError) {
        console.error('Error deleting avatar:', deleteError);
      }
    }

    // Soft delete - deactivate account instead of deleting
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting account'
    });
  }
};


