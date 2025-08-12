import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must have a user']
  },
  facility: {
    type: mongoose.Schema.ObjectId,
    ref: 'Facility',
    required: [true, 'Booking must have a facility']
  },
  court: {
    type: mongoose.Schema.ObjectId,
    ref: 'Court',
    required: [true, 'Booking must have a court']
  },
  date: {
    type: Date,
    required: [true, 'Please provide booking date'],
    validate: {
      validator: function(value) {
        return value >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Booking date cannot be in the past'
    }
  },
  timeSlot: {
    startTime: {
      type: String,
      required: [true, 'Please provide start time'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid start time in HH:MM format']
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid end time in HH:MM format']
    },
    duration: {
      type: Number,
      required: true,
      min: [0.5, 'Minimum duration is 30 minutes']
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    peakHourMultiplier: {
      type: Number,
      default: 1
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    taxes: {
      type: Number,
      default: 0,
      min: [0, 'Taxes cannot be negative']
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['stripe', 'razorpay', 'cash', 'wallet'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending'
    },
    transactionId: String,
    razorpayOrderId: String,
    paidAmount: {
      type: Number,
      default: 0
    },
    paidAt: Date,
    refundAmount: {
      type: Number,
      default: 0
    },
    refundedAt: Date,
    refundReason: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  bookingType: {
    type: String,
    enum: ['single', 'recurring'],
    default: 'single'
  },
  recurringDetails: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    endDate: Date,
    recurringBookings: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Booking'
    }]
  },
  participants: {
    count: {
      type: Number,
      required: true,
      min: [1, 'At least one participant required']
    },
    details: [{
      name: {
        type: String,
        required: true
      },
      email: String,
      phone: String,
      age: Number
    }]
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  equipment: [{
    name: String,
    quantity: {
      type: Number,
      min: [1, 'Equipment quantity must be at least 1']
    },
    rentalPrice: {
      type: Number,
      min: [0, 'Rental price cannot be negative']
    }
  }],
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    reason: String,
    refundAmount: {
      type: Number,
      default: 0
    },
    cancellationFee: {
      type: Number,
      default: 0
    }
  },
  checkIn: {
    checkedInAt: Date,
    checkedInBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  },
  checkOut: {
    checkedOutAt: Date,
    checkedOutBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  },
  review: {
    type: mongoose.Schema.ObjectId,
    ref: 'Review'
  },
  notifications: {
    reminder24h: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    reminder2h: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    confirmation: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ user: 1, date: -1 });
bookingSchema.index({ facility: 1, date: -1 });
bookingSchema.index({ court: 1, date: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ date: 1, 'timeSlot.startTime': 1 });
bookingSchema.index({ createdAt: -1 });

// Compound index for conflict checking
bookingSchema.index({
  court: 1,
  date: 1,
  'timeSlot.startTime': 1,
  'timeSlot.endTime': 1,
  status: 1
});

// Validation to ensure end time is after start time
bookingSchema.pre('validate', function(next) {
  if (this.timeSlot.startTime && this.timeSlot.endTime) {
    const startTime = this.timeSlot.startTime.split(':').map(Number);
    const endTime = this.timeSlot.endTime.split(':').map(Number);
    
    const startMinutes = startTime[0] * 60 + startTime[1];
    const endMinutes = endTime[0] * 60 + endTime[1];
    
    if (endMinutes <= startMinutes) {
      next(new Error('End time must be after start time'));
    }
    
    // Calculate duration
    this.timeSlot.duration = (endMinutes - startMinutes) / 60;
  }
  next();
});

// Check for booking conflicts before saving
bookingSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('date') || this.isModified('timeSlot') || this.isModified('court')) {
    const conflictingBooking = await this.constructor.findOne({
      _id: { $ne: this._id },
      court: this.court,
      date: this.date,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          'timeSlot.startTime': { $lt: this.timeSlot.endTime },
          'timeSlot.endTime': { $gt: this.timeSlot.startTime }
        }
      ]
    });

    if (conflictingBooking) {
      next(new Error('Time slot is already booked'));
    }
  }
  next();
});

// Virtual to check if booking is in the past
bookingSchema.virtual('isPast').get(function() {
  const bookingDateTime = new Date(this.date);
  const [hours, minutes] = this.timeSlot.endTime.split(':').map(Number);
  bookingDateTime.setHours(hours, minutes, 0, 0);
  return bookingDateTime < new Date();
});

// Virtual to check if booking can be cancelled
bookingSchema.virtual('canCancel').get(function() {
  if (this.status !== 'confirmed' && this.status !== 'pending') {
    return false;
  }
  
  const bookingDateTime = new Date(this.date);
  const [hours, minutes] = this.timeSlot.startTime.split(':').map(Number);
  bookingDateTime.setHours(hours, minutes, 0, 0);
  
  // Can cancel up to 2 hours before booking
  const cancellationDeadline = new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000);
  return new Date() < cancellationDeadline;
});

// Method to calculate refund amount
bookingSchema.methods.calculateRefund = function() {
  if (!this.canCancel) {
    return 0;
  }
  
  const bookingDateTime = new Date(this.date);
  const [hours, minutes] = this.timeSlot.startTime.split(':').map(Number);
  bookingDateTime.setHours(hours, minutes, 0, 0);
  
  const hoursUntilBooking = (bookingDateTime - new Date()) / (1000 * 60 * 60);
  
  let refundPercentage = 0;
  if (hoursUntilBooking >= 24) {
    refundPercentage = 100; // Full refund
  } else if (hoursUntilBooking >= 12) {
    refundPercentage = 75; // 75% refund
  } else if (hoursUntilBooking >= 6) {
    refundPercentage = 50; // 50% refund
  } else if (hoursUntilBooking >= 2) {
    refundPercentage = 25; // 25% refund
  }
  
  return (this.pricing.totalAmount * refundPercentage) / 100;
};

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;

