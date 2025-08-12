import mongoose from 'mongoose';

const courtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide court name'],
    trim: true,
    maxlength: [50, 'Court name cannot be more than 50 characters']
  },
  facility: {
    type: mongoose.Schema.ObjectId,
    ref: 'Facility',
    required: [true, 'Court must belong to a facility']
  },
  sport: {
    type: String,
    required: [true, 'Please specify the sport'],
    enum: [
      'Tennis', 'Badminton', 'Basketball', 'Football', 'Cricket',
      'Volleyball', 'Table Tennis', 'Squash', 'Swimming', 'Gym',
      'Boxing', 'Martial Arts', 'Yoga', 'Aerobics', 'Other'
    ]
  },
  courtType: {
    type: String,
    required: [true, 'Please specify court type'],
    enum: ['Indoor', 'Outdoor', 'Semi-Covered']
  },
  surface: {
    type: String,
    enum: [
      'Grass', 'Clay', 'Hard Court', 'Synthetic', 'Wooden',
      'Concrete', 'Artificial Turf', 'Sand', 'Rubber', 'Other'
    ]
  },
  dimensions: {
    length: {
      type: Number,
      required: [true, 'Please provide court length']
    },
    width: {
      type: Number,
      required: [true, 'Please provide court width']
    },
    unit: {
      type: String,
      enum: ['meters', 'feet'],
      default: 'meters'
    }
  },
  capacity: {
    players: {
      type: Number,
      required: [true, 'Please specify maximum players'],
      min: [1, 'Capacity must be at least 1']
    },
    spectators: {
      type: Number,
      default: 0
    }
  },
  pricing: {
    hourlyRate: {
      type: Number,
      required: [true, 'Please provide hourly rate'],
      min: [0, 'Price cannot be negative']
    },
    peakHourRate: {
      type: Number,
      required: [true, 'Please provide peak hour rate'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    minimumBookingDuration: {
      type: Number,
      default: 1, // in hours
      min: [0.5, 'Minimum booking duration must be at least 30 minutes']
    }
  },
  amenities: [{
    type: String,
    enum: [
      'Lighting', 'Sound System', 'Scoreboard', 'Seating',
      'Equipment Storage', 'Water Fountain', 'Towel Service',
      'Equipment Rental', 'Air Conditioning', 'Heating',
      'First Aid Kit', 'Changing Room Access'
    ]
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    },
    caption: String
  }],
  availability: {
    monday: {
      isAvailable: { type: Boolean, default: true },
      slots: [{
        startTime: String,
        endTime: String,
        isBlocked: { type: Boolean, default: false },
        blockReason: String
      }]
    },
    tuesday: {
      isAvailable: { type: Boolean, default: true },
      slots: [{
        startTime: String,
        endTime: String,
        isBlocked: { type: Boolean, default: false },
        blockReason: String
      }]
    },
    wednesday: {
      isAvailable: { type: Boolean, default: true },
      slots: [{
        startTime: String,
        endTime: String,
        isBlocked: { type: Boolean, default: false },
        blockReason: String
      }]
    },
    thursday: {
      isAvailable: { type: Boolean, default: true },
      slots: [{
        startTime: String,
        endTime: String,
        isBlocked: { type: Boolean, default: false },
        blockReason: String
      }]
    },
    friday: {
      isAvailable: { type: Boolean, default: true },
      slots: [{
        startTime: String,
        endTime: String,
        isBlocked: { type: Boolean, default: false },
        blockReason: String
      }]
    },
    saturday: {
      isAvailable: { type: Boolean, default: true },
      slots: [{
        startTime: String,
        endTime: String,
        isBlocked: { type: Boolean, default: false },
        blockReason: String
      }]
    },
    sunday: {
      isAvailable: { type: Boolean, default: true },
      slots: [{
        startTime: String,
        endTime: String,
        isBlocked: { type: Boolean, default: false },
        blockReason: String
      }]
    }
  },
  maintenanceSchedule: [{
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],
  rules: [{
    type: String
  }],
  equipment: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative']
    },
    condition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor'],
      default: 'Good'
    },
    isRentable: {
      type: Boolean,
      default: false
    },
    rentalPrice: {
      type: Number,
      default: 0
    }
  }],
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive', 'damaged'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
courtSchema.index({ facility: 1 });
courtSchema.index({ sport: 1 });
courtSchema.index({ status: 1 });
courtSchema.index({ isActive: 1 });
courtSchema.index({ 'pricing.hourlyRate': 1 });
courtSchema.index({ 'rating.average': -1 });

// Virtual for bookings
courtSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'court'
});

// Ensure virtual fields are serialized
courtSchema.set('toJSON', { virtuals: true });
courtSchema.set('toObject', { virtuals: true });

// Method to check availability for a specific date and time
courtSchema.methods.isAvailableAt = function(date, startTime, endTime) {
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
  const dayAvailability = this.availability[dayOfWeek];
  
  if (!dayAvailability.isAvailable) {
    return false;
  }

  // Check maintenance schedule
  const maintenanceConflict = this.maintenanceSchedule.some(maintenance => {
    const maintenanceDate = new Date(maintenance.date);
    return maintenanceDate.toDateString() === date.toDateString() &&
           ((startTime >= maintenance.startTime && startTime < maintenance.endTime) ||
            (endTime > maintenance.startTime && endTime <= maintenance.endTime) ||
            (startTime <= maintenance.startTime && endTime >= maintenance.endTime));
  });

  return !maintenanceConflict;
};

// Method to get available time slots for a specific date
courtSchema.methods.getAvailableSlots = async function(date) {
  const Booking = mongoose.model('Booking');
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
  const dayAvailability = this.availability[dayOfWeek];
  
  if (!dayAvailability.isAvailable) {
    return [];
  }

  // Get existing bookings for the date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingBookings = await Booking.find({
    court: this._id,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['confirmed', 'pending'] }
  });

  // Generate available slots based on facility hours and existing bookings
  // This is a simplified version - you might want to implement more sophisticated logic
  const availableSlots = [];
  // Implementation would go here...
  
  return availableSlots;
};

const Court = mongoose.model('Court', courtSchema);

export default Court;

