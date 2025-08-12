import Facility from '../models/Facility.js';
import Court from '../models/Court.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { validationResult } from 'express-validator';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalFacilityOwners = await User.countDocuments({ role: 'facilityOwner' });
    const totalFacilities = await Facility.countDocuments();
    const pendingFacilities = await Facility.countDocuments({ status: 'pending' });
    const totalCourts = await Court.countDocuments();
    const pendingCourts = await Court.countDocuments({ status: 'pending' });
    const totalBookings = await Booking.countDocuments();
    const todayBookings = await Booking.countDocuments({
      createdAt: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalFacilityOwners,
          totalFacilities,
          pendingFacilities,
          totalCourts,
          pendingCourts,
          totalBookings,
          todayBookings
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats'
    });
  }
};

// @desc    Get pending facilities for approval
// @route   GET /api/admin/facilities/pending
// @access  Private (Admin)
export const getPendingFacilities = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const facilities = await Facility.find({ status: 'pending' })
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Facility.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: {
        facilities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalFacilities: total
        }
      }
    });
  } catch (error) {
    console.error('Get pending facilities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending facilities'
    });
  }
};

// @desc    Approve/Reject facility
// @route   PUT /api/admin/facilities/:id/approve
// @access  Private (Admin)
export const approveFacility = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, adminComments } = req.body;
    const { id } = req.params;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    const facility = await Facility.findById(id);
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    facility.status = status;
    facility.approvalDetails = {
      approvedBy: req.user._id,
      approvedAt: new Date(),
      adminComments: adminComments || ''
    };

    if (status === 'rejected' && !adminComments) {
      return res.status(400).json({
        success: false,
        message: 'Admin comments are required when rejecting a facility'
      });
    }

    await facility.save();

    // If facility is approved, also approve all its courts
    if (status === 'approved') {
      try {
        const courts = await Court.find({ facility: facility._id, status: 'pending' });
        for (const court of courts) {
          court.status = 'active';
          court.isActive = true;
          await court.save();
        }
        console.log(`Auto-approved ${courts.length} courts for facility ${facility.name}`);
      } catch (courtError) {
        console.error('Error auto-approving courts:', courtError);
      }
    }

    res.json({
      success: true,
      message: `Facility ${status} successfully`,
      data: { facility }
    });
  } catch (error) {
    console.error('Approve facility error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving facility'
    });
  }
};

// @desc    Get pending courts for approval
// @route   GET /api/admin/courts/pending
// @access  Private (Admin)
export const getPendingCourts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const courts = await Court.find({ status: 'pending' })
      .populate('facility', 'name owner')
      .populate({
        path: 'facility',
        populate: {
          path: 'owner',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Court.countDocuments({ status: 'pending' });

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
    console.error('Get pending courts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending courts'
    });
  }
};

// @desc    Approve/Reject court
// @route   PUT /api/admin/courts/:id/approve
// @access  Private (Admin)
export const approveCourt = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, adminComments } = req.body;
    const { id } = req.params;

    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either active or rejected'
      });
    }

    const court = await Court.findById(id);
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    court.status = status;
    court.isActive = status === 'active';

    if (status === 'rejected' && !adminComments) {
      return res.status(400).json({
        success: false,
        message: 'Admin comments are required when rejecting a court'
      });
    }

    await court.save();

    res.json({
      success: true,
      message: `Court ${status === 'active' ? 'approved' : 'rejected'} successfully`,
      data: { court }
    });
  } catch (error) {
    console.error('Approve court error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving court'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (role) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalUsers: total
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user: { id: user._id, name: user.name, email: user.email, isActive: user.isActive } }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    });
  }
};


