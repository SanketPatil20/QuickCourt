import Court from '../models/Court.js';
import Facility from '../models/Facility.js';
import Booking from '../models/Booking.js';
import { validationResult } from 'express-validator';
import { uploadMultipleImages, deleteMultipleImages, bufferToDataURL } from '../utils/cloudinaryUpload.js';

// @desc    Get all courts with filtering and pagination
// @route   GET /api/courts
// @access  Public
export const getCourts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sport,
      facility,
      courtType,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = { isActive: true };

    if (sport) {
      query.sport = sport;
    }

    if (facility) {
      query.facility = facility;
    }

    if (courtType) {
      query.courtType = courtType;
    }

    if (minPrice) {
      query['pricing.hourlyRate'] = { $gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      query['pricing.hourlyRate'] = {
        ...query['pricing.hourlyRate'],
        $lte: parseFloat(maxPrice)
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const courts = await Court.find(query)
      .populate('facility', 'name address rating')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Court.countDocuments(query);

    res.json({
      success: true,
      data: {
        courts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalCourts: total
        }
      }
    });
  } catch (error) {
    console.error('Get courts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courts'
    });
  }
};

// @desc    Get single court
// @route   GET /api/courts/:id
// @access  Public
export const getCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id)
      .populate('facility', 'name description address contactInfo operatingHours rating');

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    res.json({
      success: true,
      data: { court }
    });
  } catch (error) {
    console.error('Get court error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching court'
    });
  }
};

// @desc    Get courts by facility
// @route   GET /api/courts/facility/:facilityId
// @access  Public
export const getFacilityCourts = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const { isActive } = req.query;

    let query = { facility: facilityId, isActive: true };
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const courts = await Court.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { courts }
    });
  } catch (error) {
    console.error('Get facility courts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching facility courts'
    });
  }
};

// @desc    Create court
// @route   POST /api/courts
// @access  Private (Facility Owner)
export const createCourt = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { facility: facilityId } = req.body;

    // Check if facility exists and user owns it
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    if (facility.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add courts to this facility'
      });
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      try {
        const imageUploads = req.files.map(file => 
          bufferToDataURL(file.buffer, file.mimetype)
        );
        images = await uploadMultipleImages(imageUploads, 'quickcourt/courts');
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: `Image upload failed: ${uploadError.message}`
        });
      }
    }

    const courtData = {
      ...req.body,
      images
    };

    const court = await Court.create(courtData);

    const populatedCourt = await Court.findById(court._id)
      .populate('facility', 'name address');

    res.status(201).json({
      success: true,
      message: 'Court created successfully',
      data: { court: populatedCourt }
    });
  } catch (error) {
    console.error('Create court error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating court'
    });
  }
};

// @desc    Update court
// @route   PUT /api/courts/:id
// @access  Private (Facility Owner/Admin)
export const updateCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id).populate('facility');

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    // Check ownership
    if (court.facility.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this court'
      });
    }

    // Handle image uploads
    let newImages = [];
    if (req.files && req.files.length > 0) {
      try {
        const imageUploads = req.files.map(file => 
          bufferToDataURL(file.buffer, file.mimetype)
        );
        newImages = await uploadMultipleImages(imageUploads, 'quickcourt/courts');
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: `Image upload failed: ${uploadError.message}`
        });
      }
    }

    const updateData = { ...req.body };

    // Handle image replacement
    if (newImages.length > 0) {
      if (req.body.replaceImages === 'true' && court.images.length > 0) {
        // Delete old images
        try {
          const oldImageIds = court.images.map(img => img.public_id);
          await deleteMultipleImages(oldImageIds);
          updateData.images = newImages;
        } catch (deleteError) {
          console.error('Error deleting old images:', deleteError);
        }
      } else {
        // Add new images to existing ones
        updateData.images = [...court.images, ...newImages];
      }
    }

    const updatedCourt = await Court.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('facility', 'name address');

    res.json({
      success: true,
      message: 'Court updated successfully',
      data: { court: updatedCourt }
    });
  } catch (error) {
    console.error('Update court error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating court'
    });
  }
};

// @desc    Delete court
// @route   DELETE /api/courts/:id
// @access  Private (Facility Owner/Admin)
export const deleteCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id).populate('facility');

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    // Check ownership
    if (court.facility.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this court'
      });
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      court: req.params.id,
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: new Date() }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete court with active bookings'
      });
    }

    // Delete court images from cloudinary
    if (court.images.length > 0) {
      try {
        const imageIds = court.images.map(img => img.public_id);
        await deleteMultipleImages(imageIds);
      } catch (deleteError) {
        console.error('Error deleting court images:', deleteError);
      }
    }

    // Delete court
    await Court.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Court deleted successfully'
    });
  } catch (error) {
    console.error('Delete court error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting court'
    });
  }
};


