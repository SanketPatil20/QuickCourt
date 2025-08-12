import Booking from '../models/Booking.js';
import Court from '../models/Court.js';
import Facility from '../models/Facility.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import { createOrder, verifyPaymentSignature, fetchPayment } from '../utils/razorpay.js';
import sendEmail, { emailTemplates } from '../utils/sendEmail.js';

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      facility,
      court,
      date,
      timeSlot,
      participants,
      specialRequests,
      equipment,
      paymentMethod = 'razorpay'
    } = req.body;

    // Validate court exists and belongs to facility
    const courtDoc = await Court.findById(court).populate('facility');
    if (!courtDoc) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    if (courtDoc.facility._id.toString() !== facility) {
      return res.status(400).json({
        success: false,
        message: 'Court does not belong to the specified facility'
      });
    }

    // Check if court is available at the requested time
    const bookingDate = new Date(date);
    if (!courtDoc.isAvailableAt(bookingDate, timeSlot.startTime, timeSlot.endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Court is not available at the requested time'
      });
    }

    // Check for existing bookings
    const existingBooking = await Booking.findOne({
      court,
      date: bookingDate,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          'timeSlot.startTime': { $lt: timeSlot.endTime },
          'timeSlot.endTime': { $gt: timeSlot.startTime }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is already booked'
      });
    }

    // Calculate pricing
    const startTime = timeSlot.startTime.split(':').map(Number);
    const endTime = timeSlot.endTime.split(':').map(Number);
    const startMinutes = startTime[0] * 60 + startTime[1];
    const endMinutes = endTime[0] * 60 + endTime[1];
    const duration = (endMinutes - startMinutes) / 60;

    // Check if it's peak hours
    const facilityDoc = await Facility.findById(facility);
    const peakStart = facilityDoc.pricing.peakHours.start.split(':').map(Number);
    const peakEnd = facilityDoc.pricing.peakHours.end.split(':').map(Number);
    const peakStartMinutes = peakStart[0] * 60 + peakStart[1];
    const peakEndMinutes = peakEnd[0] * 60 + peakEnd[1];

    let isPeakHour = false;
    if (startMinutes >= peakStartMinutes && startMinutes < peakEndMinutes) {
      isPeakHour = true;
    }

    const basePrice = courtDoc.pricing.hourlyRate;
    const peakMultiplier = isPeakHour ? facilityDoc.pricing.peakHourMultiplier : 1;
    const totalAmount = basePrice * duration * peakMultiplier;

    // Add equipment rental costs
    let equipmentCost = 0;
    if (equipment && equipment.length > 0) {
      equipment.forEach(item => {
        equipmentCost += item.rentalPrice * item.quantity;
      });
    }

    const finalAmount = totalAmount + equipmentCost;

    // Create Razorpay order
    let razorpayOrder = null;
    if (paymentMethod === 'razorpay') {
      try {
        razorpayOrder = await createOrder(finalAmount, 'INR', `booking_${Date.now()}`, {
          bookingId: `booking_${Date.now()}`,
          userId: req.user._id.toString(),
          facilityId: facility,
          courtId: court,
          facilityName: courtDoc.facility.name,
          courtName: courtDoc.name
        });
      } catch (paymentError) {
        return res.status(400).json({
          success: false,
          message: `Payment setup failed: ${paymentError.message}`
        });
      }
    }

    // Create booking
    const bookingData = {
      user: req.user._id,
      facility,
      court,
      date: bookingDate,
      timeSlot: {
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        duration
      },
      pricing: {
        basePrice,
        peakHourMultiplier: peakMultiplier,
        totalAmount: finalAmount,
        currency: 'INR'
      },
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cash' ? 'pending' : 'pending',
        razorpayOrderId: razorpayOrder ? razorpayOrder.id : null
      },
      participants,
      specialRequests,
      equipment: equipment || []
    };

    const booking = await Booking.create(bookingData);

    // Populate booking details for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('facility', 'name address contactInfo')
      .populate('court', 'name sport')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: populatedBooking,
        razorpayOrder: razorpayOrder,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking'
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
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
      .populate('facility', 'name address images')
      .populate('court', 'name sport')
      .sort({ date: -1, 'timeSlot.startTime': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
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

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('facility', 'name description address contactInfo images amenities')
      .populate('court', 'name sport courtType surface amenities')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking or is facility owner/admin
    const facility = await Facility.findById(booking.facility._id);
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isFacilityOwner = facility.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isFacilityOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking'
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'cancelled', 'completed', 'no_show'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('facility')
      .populate('user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const facility = booking.facility;
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isFacilityOwner = facility.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isFacilityOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Handle cancellation
    if (status === 'cancelled') {
      if (!booking.canCancel) {
        return res.status(400).json({
          success: false,
          message: 'Booking cannot be cancelled at this time'
        });
      }

      // Calculate refund amount
      const refundAmount = booking.calculateRefund();
      
      // Process refund if payment was completed
      if (booking.payment.status === 'completed' && refundAmount > 0) {
        try {
          if (booking.payment.stripePaymentIntentId) {
            await createRefund(booking.payment.stripePaymentIntentId, refundAmount);
          }
          
          booking.payment.status = 'refunded';
          booking.payment.refundAmount = refundAmount;
          booking.payment.refundedAt = new Date();
        } catch (refundError) {
          console.error('Refund error:', refundError);
          return res.status(400).json({
            success: false,
            message: 'Failed to process refund'
          });
        }
      }

      booking.cancellation = {
        cancelledAt: new Date(),
        cancelledBy: req.user._id,
        reason: req.body.reason || 'User requested cancellation',
        refundAmount
      };
    }

    booking.status = status;
    await booking.save();

    // Send notification email
    if (status === 'confirmed') {
      try {
        await sendEmail({
          email: booking.user.email,
          subject: 'Booking Confirmed - QuickCourt',
          html: emailTemplates.bookingConfirmation(booking.user.name, {
            id: booking._id.toString().slice(-8).toUpperCase(),
            facility: facility.name,
            court: booking.court.name,
            date: booking.date.toLocaleDateString(),
            time: `${booking.timeSlot.startTime} - ${booking.timeSlot.endTime}`,
            amount: booking.pricing.totalAmount
          })
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      data: { booking }
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating booking status'
    });
  }
};

// @desc    Confirm payment
// @route   POST /api/bookings/:id/confirm-payment
// @access  Private
export const confirmPayment = async (req, res) => {
  try {
    const { paymentId, orderId, signature } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm payment for this booking'
      });
    }

    // Verify payment with Razorpay
    if (booking.payment.method === 'razorpay' && paymentId && orderId && signature) {
      try {
        // Verify payment signature
        const isValidSignature = verifyPaymentSignature(orderId, paymentId, signature);
        
        if (!isValidSignature) {
          booking.payment.status = 'failed';
          await booking.save();
          return res.status(400).json({
            success: false,
            message: 'Invalid payment signature'
          });
        }

        // Fetch payment details from Razorpay
        const payment = await fetchPayment(paymentId);
        
        if (payment.status === 'captured') {
          booking.payment.status = 'completed';
          booking.payment.transactionId = paymentId;
          booking.payment.paidAmount = booking.pricing.totalAmount;
          booking.payment.paidAt = new Date();
          booking.status = 'confirmed';
        } else {
          booking.payment.status = 'failed';
        }
      } catch (paymentError) {
        booking.payment.status = 'failed';
        return res.status(400).json({
          success: false,
          message: `Payment confirmation failed: ${paymentError.message}`
        });
      }
    }

    await booking.save();

    // Update facility total bookings
    await Facility.findByIdAndUpdate(booking.facility, {
      $inc: { totalBookings: 1 }
    });

    // Update court total bookings
    await Court.findByIdAndUpdate(booking.court, {
      $inc: { totalBookings: 1 }
    });

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while confirming payment'
    });
  }
};

// @desc    Get facility bookings (for facility owners)
// @route   GET /api/bookings/facility/:facilityId
// @access  Private (Facility Owner/Admin)
export const getFacilityBookings = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const { page = 1, limit = 10, status, date } = req.query;

    // Check if user owns the facility or is admin
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
        message: 'Not authorized to view facility bookings'
      });
    }

    let query = { facility: facilityId };

    if (status) {
      query.status = status;
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('court', 'name sport')
      .sort({ date: -1, 'timeSlot.startTime': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalBookings: total
        }
      }
    });
  } catch (error) {
    console.error('Get facility bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching facility bookings'
    });
  }
};

// @desc    Get available time slots for a court on a specific date
// @route   GET /api/bookings/available-slots/:courtId
// @access  Public
export const getAvailableSlots = async (req, res) => {
  try {
    const { courtId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const court = await Court.findById(courtId).populate('facility');
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    const searchDate = new Date(date);
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][searchDate.getDay()];
    
    // Get facility operating hours for the day
    const facilityHours = court.facility.operatingHours[dayOfWeek];
    
    if (!facilityHours.isOpen) {
      return res.json({
        success: true,
        data: { availableSlots: [] }
      });
    }

    // Get existing bookings for the date
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      court: courtId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['confirmed', 'pending'] }
    });

    // Generate time slots (1-hour intervals)
    const availableSlots = [];
    const openTime = facilityHours.openTime.split(':').map(Number);
    const closeTime = facilityHours.closeTime.split(':').map(Number);
    
    const openMinutes = openTime[0] * 60 + openTime[1];
    const closeMinutes = closeTime[0] * 60 + closeTime[1];

    for (let time = openMinutes; time < closeMinutes; time += 60) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const endHours = Math.floor((time + 60) / 60);
      const endMinutes = (time + 60) % 60;
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

      // Check if slot is available
      const isBooked = existingBookings.some(booking => {
        return (startTime >= booking.timeSlot.startTime && startTime < booking.timeSlot.endTime) ||
               (endTime > booking.timeSlot.startTime && endTime <= booking.timeSlot.endTime) ||
               (startTime <= booking.timeSlot.startTime && endTime >= booking.timeSlot.endTime);
      });

      if (!isBooked && court.isAvailableAt(searchDate, startTime, endTime)) {
        // Determine if it's peak hour
        const peakStart = court.facility.pricing.peakHours.start.split(':').map(Number);
        const peakEnd = court.facility.pricing.peakHours.end.split(':').map(Number);
        const peakStartMinutes = peakStart[0] * 60 + peakStart[1];
        const peakEndMinutes = peakEnd[0] * 60 + peakEnd[1];
        
        const isPeakHour = time >= peakStartMinutes && time < peakEndMinutes;
        const price = isPeakHour ? 
          court.pricing.hourlyRate * court.facility.pricing.peakHourMultiplier : 
          court.pricing.hourlyRate;

        availableSlots.push({
          startTime,
          endTime,
          duration: 1,
          price,
          isPeakHour
        });
      }
    }

    res.json({
      success: true,
      data: { availableSlots }
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching available slots'
    });
  }
};

