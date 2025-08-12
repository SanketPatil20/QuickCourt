import Facility from '../models/Facility.js';
import Court from '../models/Court.js';
import Booking from '../models/Booking.js';
import { validationResult } from 'express-validator';
import { processLocalImages, validateImageFile } from '../utils/localImageUpload.js';

// @desc    Get all facilities with filtering, sorting, and pagination
// @route   GET /api/facilities
// @access  Public
export const getFacilities = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sport,
      city,
      state,
      minPrice,
      maxPrice,
      rating,
      amenities,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build query
    let query = { status: 'approved', isActive: true };

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by sport
    if (sport) {
      query.sportsOffered = { $in: [sport] };
    }

    // Filter by location
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }
    if (state) {
      query['address.state'] = { $regex: state, $options: 'i' };
    }

    // Filter by rating
    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) };
    }



    // Price filtering requires aggregation with courts
    let aggregationPipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'courts',
          localField: '_id',
          foreignField: 'facility',
          as: 'courts',
          pipeline: [
            { $match: { isActive: true, status: 'active' } }
          ]
        }
      }
    ];

    // Filter by price range
    if (minPrice || maxPrice) {
      let priceMatch = {};
      if (minPrice) priceMatch['courts.pricing.hourlyRate'] = { $gte: parseFloat(minPrice) };
      if (maxPrice) {
        priceMatch['courts.pricing.hourlyRate'] = {
          ...priceMatch['courts.pricing.hourlyRate'],
          $lte: parseFloat(maxPrice)
        };
      }
      aggregationPipeline.push({ $match: priceMatch });
    }

    // Add sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    aggregationPipeline.push({ $sort: sortOptions });

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    aggregationPipeline.push(
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    // Populate owner and courts
    aggregationPipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
          pipeline: [
            { $project: { name: 1, email: 1, phone: 1 } }
          ]
        }
      },
      {
        $unwind: '$owner'
      }
    );

    const facilities = await Facility.aggregate(aggregationPipeline);

    // Get total count for pagination
    const totalQuery = { ...query };
    const total = await Facility.countDocuments(totalQuery);

    res.json({
      success: true,
      data: {
        facilities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalFacilities: total,
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get facilities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching facilities'
    });
  }
};

// @desc    Get single facility
// @route   GET /api/facilities/:id
// @access  Public
export const getFacility = async (req, res) => {
  try {
    console.log('Fetching facility:', req.params.id);
    
    const facility = await Facility.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate({
        path: 'courts',
        match: { isActive: true, status: 'active' }
      })
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name avatar'
        },
        options: { sort: { createdAt: -1 }, limit: 10 }
      });

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    console.log('Facility found:', facility.name);
    console.log('Number of courts:', facility.courts ? facility.courts.length : 0);
    if (facility.courts && facility.courts.length > 0) {
      console.log('Courts:', facility.courts.map(c => ({ id: c._id, name: c.name, status: c.status, isActive: c.isActive })));
    }

    res.json({
      success: true,
      data: { facility }
    });
  } catch (error) {
    console.error('Get facility error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching facility'
    });
  }
};

// @desc    Create facility
// @route   POST /api/facilities
// @access  Private (Facility Owner)
// Middleware to parse JSON strings before validation
export const parseFormData = (req, res, next) => {
  try {
    console.log('parseFormData - Original req.body:', req.body);
    console.log('parseFormData - Keys in req.body:', Object.keys(req.body));
    
    // Parse nested objects if they were sent as JSON strings
    if (typeof req.body.address === 'string') {
      try {
        req.body.address = JSON.parse(req.body.address);
        console.log('Parsed address:', req.body.address);
      } catch (e) {
        console.error('Failed to parse address:', e);
        req.body.address = {};
      }
    }
    
    if (typeof req.body.contactInfo === 'string') {
      try {
        req.body.contactInfo = JSON.parse(req.body.contactInfo);
        console.log('Parsed contactInfo:', req.body.contactInfo);
      } catch (e) {
        console.error('Failed to parse contactInfo:', e);
        req.body.contactInfo = {};
      }
    }
    
    if (typeof req.body.pricing === 'string') {
      try {
        req.body.pricing = JSON.parse(req.body.pricing);
        console.log('Parsed pricing:', req.body.pricing);
      } catch (e) {
        console.error('Failed to parse pricing:', e);
        req.body.pricing = {};
      }
    }
    
    if (typeof req.body.sportsOffered === 'string') {
      try {
        req.body.sportsOffered = JSON.parse(req.body.sportsOffered);
        console.log('Parsed sportsOffered:', req.body.sportsOffered);
      } catch (e) {
        console.error('Failed to parse sportsOffered:', e);
        req.body.sportsOffered = [];
      }
    }
    

    
    if (typeof req.body.operatingHours === 'string') {
      try {
        req.body.operatingHours = JSON.parse(req.body.operatingHours);
        console.log('Parsed operatingHours:', req.body.operatingHours);
      } catch (e) {
        console.error('Failed to parse operatingHours:', e);
        req.body.operatingHours = {};
      }
    }
    
    if (typeof req.body.policies === 'string') {
      try {
        req.body.policies = JSON.parse(req.body.policies);
        console.log('Parsed policies:', req.body.policies);
      } catch (e) {
        console.error('Failed to parse policies:', e);
        req.body.policies = {};
      }
    }
    
    console.log('parseFormData - Final req.body:', req.body);
    console.log('parseFormData - Address object:', req.body.address);
    console.log('parseFormData - Address.street:', req.body.address?.street);
    next();
  } catch (error) {
    console.error('Error parsing FormData:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid data format'
    });
  }
};

export const createFacility = async (req, res) => {
  try {
    console.log('=== CREATE FACILITY START ===');
    console.log('Received facility data:', req.body);
    console.log('Files:', req.files);
    console.log('User:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    console.log('Validation passed successfully!');

    // Handle image uploads using local storage
    let images = [];
    if (req.files && req.files.length > 0) {
      console.log('Processing image uploads...');
      console.log('Number of files:', req.files.length);
      
      try {
        // Validate and process images locally
        req.files.forEach(file => {
          validateImageFile(file);
        });
        
        images = processLocalImages(req.files);
        console.log('Images processed and stored locally:', images.length);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        console.error('Error details:', uploadError.message);
        // Continue without images rather than failing the entire request
        console.log('Continuing without image upload due to error');
      }
    } else {
      console.log('No files uploaded, using placeholder image');
      // Add a placeholder image based on the first sport type
      const firstSport = req.body.sportsOffered ? JSON.parse(req.body.sportsOffered)[0] : 'Badminton';
      const placeholderImages = {
        'Badminton': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop',
        'Tennis': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop',
        'Basketball': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop',
        'Football': 'https://images.unsplash.com/photo-1579952363873-27d3bade7f55?w=400&h=300&fit=crop',
        'Cricket': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=300&fit=crop',
        'Volleyball': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=300&fit=crop',
        'Table Tennis': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
      };
      
      images = [{
        url: placeholderImages[firstSport] || placeholderImages['Badminton'],
        public_id: `placeholder_${Date.now()}`,
        filename: 'placeholder.jpg',
        mimetype: 'image/jpeg',
        size: 0
      }];
    }

    const facilityData = {
      ...req.body,
      owner: req.user._id,
      images,
      status: 'pending' // Require admin approval
    };
    


    console.log('Creating facility with data:', facilityData);
    const facility = await Facility.create(facilityData);
    console.log('Facility created successfully:', facility._id);

    // Automatically create default courts for the facility
    try {
      console.log('Creating default courts for facility...');
      const sportsOffered = JSON.parse(req.body.sportsOffered || '["Badminton"]');
      
      // Create one court for each sport offered
      const defaultCourts = [];
      for (const sport of sportsOffered) {
        const courtData = {
          name: `${sport} Court 1`,
          facility: facility._id,
          sport: sport,
          courtType: 'Indoor',
          surface: sport === 'Tennis' ? 'Hard Court' : 'Synthetic',
          dimensions: {
            length: sport === 'Tennis' ? 23.77 : 13.4,
            width: sport === 'Tennis' ? 10.97 : 6.1,
            unit: 'meters'
          },
          capacity: {
            players: sport === 'Tennis' ? 4 : 2,
            spectators: 10
          },
          pricing: {
            hourlyRate: 500,
            peakHourRate: 700,
            currency: 'INR',
            minimumBookingDuration: 1
          },
          amenities: ['Lighting', 'Seating'],
          status: 'pending',
          isActive: false
        };
        
        const court = await Court.create(courtData);
        defaultCourts.push(court);
        console.log(`Created default ${sport} court:`, court._id);
        console.log('Court details:', {
          id: court._id,
          name: court.name,
          status: court.status,
          isActive: court.isActive,
          facility: court.facility
        });
      }
      
      console.log(`Successfully created ${defaultCourts.length} default courts`);
    } catch (courtError) {
      console.error('Error creating default courts:', courtError);
      // Don't fail the facility creation if court creation fails
      console.log('Continuing without default courts');
    }

    res.status(201).json({
      success: true,
      message: 'Facility created successfully and is now live!',
      data: { facility }
    });
  } catch (error) {
    console.error('Create facility error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if it's a validation error from mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating facility'
    });
  }
};

// @desc    Update facility
// @route   PUT /api/facilities/:id
// @access  Private (Facility Owner/Admin)
export const updateFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    // Check ownership
    if (facility.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this facility'
      });
    }

    // Handle image uploads
    let newImages = [];
    if (req.files && req.files.length > 0) {
      try {
        const imageUploads = req.files.map(file => 
          bufferToDataURL(file.buffer, file.mimetype)
        );
        newImages = await uploadMultipleImages(imageUploads, 'quickcourt/facilities');
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: `Image upload failed: ${uploadError.message}`
        });
      }
    }

    // Update facility
    const updateData = { ...req.body };
    
    // Handle image replacement
    if (newImages.length > 0) {
      // Delete old images if replacing
      if (req.body.replaceImages === 'true' && facility.images.length > 0) {
        try {
          const oldImageIds = facility.images.map(img => img.public_id);
          await deleteMultipleImages(oldImageIds);
          updateData.images = newImages;
        } catch (deleteError) {
          console.error('Error deleting old images:', deleteError);
        }
      } else {
        // Add new images to existing ones
        updateData.images = [...facility.images, ...newImages];
      }
    }

    // If facility was rejected and now being updated, reset status to pending
    if (facility.status === 'rejected') {
      updateData.status = 'pending';
      updateData.approvalDetails = {};
    }

    const updatedFacility = await Facility.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email phone');

    res.json({
      success: true,
      message: 'Facility updated successfully',
      data: { facility: updatedFacility }
    });
  } catch (error) {
    console.error('Update facility error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating facility'
    });
  }
};

// @desc    Delete facility
// @route   DELETE /api/facilities/:id
// @access  Private (Facility Owner/Admin)
export const deleteFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    // Check ownership
    if (facility.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this facility'
      });
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      facility: req.params.id,
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: new Date() }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete facility with active bookings'
      });
    }

    // Delete associated courts
    await Court.deleteMany({ facility: req.params.id });

    // Delete facility images from cloudinary
    if (facility.images.length > 0) {
      try {
        const imageIds = facility.images.map(img => img.public_id);
        await deleteMultipleImages(imageIds);
      } catch (deleteError) {
        console.error('Error deleting facility images:', deleteError);
      }
    }

    // Delete facility
    await Facility.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Facility deleted successfully'
    });
  } catch (error) {
    console.error('Delete facility error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting facility'
    });
  }
};

// @desc    Get facilities by owner
// @route   GET /api/facilities/owner/my-facilities
// @access  Private (Facility Owner)
export const getMyFacilities = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = { owner: req.user._id };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const facilities = await Facility.find(query)
      .populate('courts')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Facility.countDocuments(query);

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
    console.error('Get my facilities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching facilities'
    });
  }
};

// @desc    Get popular facilities
// @route   GET /api/facilities/popular
// @access  Public
export const getPopularFacilities = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const facilities = await Facility.find({
      status: 'approved',
      isActive: true
    })
      .populate('owner', 'name')
      .sort({ 'rating.average': -1, totalBookings: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { facilities }
    });
  } catch (error) {
    console.error('Get popular facilities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching popular facilities'
    });
  }
};

// @desc    Get facility statistics for owner
// @route   GET /api/facilities/:id/stats
// @access  Private (Facility Owner/Admin)
export const getFacilityStats = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    // Check ownership
    if (facility.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view facility statistics'
      });
    }

    // Get statistics
    const totalCourts = await Court.countDocuments({ facility: req.params.id, isActive: true });
    const totalBookings = await Booking.countDocuments({ facility: req.params.id });
    const activeBookings = await Booking.countDocuments({
      facility: req.params.id,
      status: 'confirmed',
      date: { $gte: new Date() }
    });

    // Calculate total earnings
    const earningsResult = await Booking.aggregate([
      {
        $match: {
          facility: facility._id,
          'payment.status': 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    const totalEarnings = earningsResult.length > 0 ? earningsResult[0].totalEarnings : 0;

    // Get booking trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bookingTrends = await Booking.aggregate([
      {
        $match: {
          facility: facility._id,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          earnings: {
            $sum: {
              $cond: [
                { $eq: ['$payment.status', 'completed'] },
                '$pricing.totalAmount',
                0
              ]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalCourts,
          totalBookings,
          activeBookings,
          totalEarnings,
          averageRating: facility.rating.average,
          totalReviews: facility.rating.count
        },
        bookingTrends
      }
    });
  } catch (error) {
    console.error('Get facility stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching facility statistics'
    });
  }
};
