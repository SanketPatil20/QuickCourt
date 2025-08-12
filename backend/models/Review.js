import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must have a user']
  },
  facility: {
    type: mongoose.Schema.ObjectId,
    ref: 'Facility',
    required: [true, 'Review must be for a facility']
  },
  court: {
    type: mongoose.Schema.ObjectId,
    ref: 'Court'
  },
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: [true, 'Review must be associated with a booking']
  },
  rating: {
    overall: {
      type: Number,
      required: [true, 'Please provide overall rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    cleanliness: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    facilities: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    staff: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    valueForMoney: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    }
  },
  title: {
    type: String,
    required: [true, 'Please provide review title'],
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Please provide review comment'],
    trim: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: [200, 'Pro point cannot exceed 200 characters']
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: [200, 'Con point cannot exceed 200 characters']
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
  isVerified: {
    type: Boolean,
    default: true // Set to true if booking is verified
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }]
  },
  reportedBy: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'fake', 'offensive', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'hidden', 'pending_moderation', 'removed'],
    default: 'active'
  },
  moderationDetails: {
    moderatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    reason: String,
    action: {
      type: String,
      enum: ['approved', 'hidden', 'removed', 'edited']
    }
  },
  response: {
    text: {
      type: String,
      maxlength: [500, 'Response cannot exceed 500 characters']
    },
    respondedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reviewSchema.index({ facility: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ court: 1, createdAt: -1 });
reviewSchema.index({ booking: 1 }, { unique: true }); // One review per booking
reviewSchema.index({ 'rating.overall': -1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ isVerified: 1 });

// Ensure one review per booking
reviewSchema.index({ user: 1, booking: 1 }, { unique: true });

// Virtual to get average rating
reviewSchema.virtual('averageRating').get(function() {
  const ratings = [
    this.rating.overall,
    this.rating.cleanliness,
    this.rating.facilities,
    this.rating.staff,
    this.rating.valueForMoney
  ].filter(rating => rating !== undefined);
  
  if (ratings.length === 0) return this.rating.overall;
  
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Method to mark review as helpful
reviewSchema.methods.markHelpful = function(userId) {
  if (!this.helpfulVotes.users.includes(userId)) {
    this.helpfulVotes.users.push(userId);
    this.helpfulVotes.count += 1;
    return this.save();
  }
  throw new Error('User has already marked this review as helpful');
};

// Method to unmark review as helpful
reviewSchema.methods.unmarkHelpful = function(userId) {
  const index = this.helpfulVotes.users.indexOf(userId);
  if (index > -1) {
    this.helpfulVotes.users.splice(index, 1);
    this.helpfulVotes.count = Math.max(0, this.helpfulVotes.count - 1);
    return this.save();
  }
  throw new Error('User has not marked this review as helpful');
};

// Method to report review
reviewSchema.methods.report = function(userId, reason, description) {
  // Check if user has already reported this review
  const existingReport = this.reportedBy.find(report => 
    report.user.toString() === userId.toString()
  );
  
  if (existingReport) {
    throw new Error('User has already reported this review');
  }
  
  this.reportedBy.push({
    user: userId,
    reason,
    description,
    reportedAt: new Date()
  });
  
  // If multiple reports, change status to pending moderation
  if (this.reportedBy.length >= 3) {
    this.status = 'pending_moderation';
  }
  
  return this.save();
};

// Update facility rating when review is saved
reviewSchema.post('save', async function() {
  const Facility = mongoose.model('Facility');
  const facility = await Facility.findById(this.facility);
  if (facility) {
    await facility.calculateAverageRating();
  }
});

// Update facility rating when review is removed
reviewSchema.post('remove', async function() {
  const Facility = mongoose.model('Facility');
  const facility = await Facility.findById(this.facility);
  if (facility) {
    await facility.calculateAverageRating();
  }
});

// Ensure virtual fields are serialized
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;



