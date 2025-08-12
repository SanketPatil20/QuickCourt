import mongoose from 'mongoose';

const facilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide facility name'],
    trim: true,
    maxlength: [100, 'Facility name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide facility description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please provide street address']
    },
    city: {
      type: String,
      required: [true, 'Please provide city']
    },
    state: {
      type: String,
      required: [true, 'Please provide state']
    },
    zipCode: {
      type: String,
      required: [true, 'Please provide zip code']
    },
    country: {
      type: String,
      default: 'India'
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Please provide latitude']
      },
      longitude: {
        type: Number,
        required: [true, 'Please provide longitude']
      }
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Please provide contact phone'],
      match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
    },
    email: {
      type: String,
      required: [true, 'Please provide contact email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    website: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Please provide a valid website URL'
      }
    }
  },
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

  sportsOffered: [{
    type: String,
    required: true,
    enum: [
      'Tennis', 'Badminton', 'Basketball', 'Football', 'Cricket',
      'Volleyball', 'Table Tennis', 'Squash', 'Swimming', 'Gym',
      'Boxing', 'Martial Arts', 'Yoga', 'Aerobics', 'Other'
    ]
  }],
  operatingHours: {
    monday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '06:00' },
      closeTime: { type: String, default: '22:00' }
    },
    tuesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '06:00' },
      closeTime: { type: String, default: '22:00' }
    },
    wednesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '06:00' },
      closeTime: { type: String, default: '22:00' }
    },
    thursday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '06:00' },
      closeTime: { type: String, default: '22:00' }
    },
    friday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '06:00' },
      closeTime: { type: String, default: '22:00' }
    },
    saturday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '06:00' },
      closeTime: { type: String, default: '22:00' }
    },
    sunday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '06:00' },
      closeTime: { type: String, default: '22:00' }
    }
  },
  pricing: {
    currency: {
      type: String,
      default: 'INR'
    },
    basePrice: {
      type: Number,
      required: [true, 'Please provide base price'],
      min: [0, 'Price cannot be negative']
    },
    peakHourMultiplier: {
      type: Number,
      default: 1.5,
      min: [1, 'Peak hour multiplier must be at least 1']
    },
    peakHours: {
      start: {
        type: String,
        default: '18:00'
      },
      end: {
        type: String,
        default: '21:00'
      }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  approvalDetails: {
    approvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: String,
    adminComments: String
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
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featuredUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
facilitySchema.index({ 'address.city': 1 });
facilitySchema.index({ 'address.state': 1 });
facilitySchema.index({ sportsOffered: 1 });
facilitySchema.index({ status: 1 });
facilitySchema.index({ isActive: 1 });
facilitySchema.index({ 'rating.average': -1 });
facilitySchema.index({ owner: 1 });
facilitySchema.index({ 'address.coordinates.latitude': 1, 'address.coordinates.longitude': 1 });

// Virtual for courts
facilitySchema.virtual('courts', {
  ref: 'Court',
  localField: '_id',
  foreignField: 'facility'
});

// Virtual for reviews
facilitySchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'facility'
});

// Ensure virtual fields are serialized
facilitySchema.set('toJSON', { virtuals: true });
facilitySchema.set('toObject', { virtuals: true });

// Update rating when review is added/updated
facilitySchema.methods.calculateAverageRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    {
      $match: { facility: this._id }
    },
    {
      $group: {
        _id: '$facility',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.rating.average = Math.round(stats[0].averageRating * 10) / 10;
    this.rating.count = stats[0].totalReviews;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }

  await this.save({ validateBeforeSave: false });
};

const Facility = mongoose.model('Facility', facilitySchema);

export default Facility;
