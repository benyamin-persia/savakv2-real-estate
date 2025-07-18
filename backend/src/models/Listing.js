const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Type',
    required: [true, 'Type is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && 
                 v[1] >= -90 && v[1] <= 90;
        },
        message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90.'
      }
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    caption: String
  }],
  contact: {
    phone: {
      type: String,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email'
      ]
    },
    website: {
      type: String,
      match: [
        /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        'Please enter a valid URL'
      ]
    }
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    schedule: {
      monday: { start: String, end: String, available: Boolean },
      tuesday: { start: String, end: String, available: Boolean },
      wednesday: { start: String, end: String, available: Boolean },
      thursday: { start: String, end: String, available: Boolean },
      friday: { start: String, end: String, available: Boolean },
      saturday: { start: String, end: String, available: Boolean },
      sunday: { start: String, end: String, available: Boolean }
    }
  },
  pricing: {
    hasPricing: {
      type: Boolean,
      default: false
    },
    currency: {
      type: String,
      default: 'USD'
    },
    amount: {
      type: Number,
      min: [0, 'Price cannot be negative']
    },
    period: {
      type: String,
      enum: ['hour', 'day', 'week', 'month', 'year', 'one-time'],
      default: 'one-time'
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot be more than 50 characters']
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiration: 1 year from creation
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      return date;
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
listingSchema.index({ location: '2dsphere' });
listingSchema.index({ creator: 1 });
listingSchema.index({ type: 1 });
listingSchema.index({ isActive: 1 });
listingSchema.index({ isFeatured: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ expiresAt: 1 });
listingSchema.index({ 'rating.average': -1 });
listingSchema.index({ views: -1 });

// Compound indexes for common queries
listingSchema.index({ type: 1, isActive: 1 });
listingSchema.index({ type: 1, location: '2dsphere' });
listingSchema.index({ creator: 1, isActive: 1 });

// Virtual for comments
listingSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'listing'
});

// Virtual for comment count
listingSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'listing',
  count: true
});

// Pre-save middleware to update rating average
listingSchema.pre('save', function(next) {
  if (this.isModified('rating.count') && this.rating.count > 0) {
    // This would be updated by the rating system
    // For now, we'll keep the average as is
  }
  next();
});

// Instance method to get distance from a point
listingSchema.methods.getDistanceFrom = function(lat, lng) {
  if (!this.location || !this.location.coordinates) return null;
  
  const R = 6371; // Earth's radius in kilometers
  const lat1 = this.location.coordinates[1];
  const lon1 = this.location.coordinates[0];
  const lat2 = lat;
  const lon2 = lng;
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
};

// Static method to find listings within radius
listingSchema.statics.findWithinRadius = function(lat, lng, radiusKm) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: radiusKm * 1000 // Convert to meters
      }
    },
    isActive: true
  });
};

// Static method to find listings by type within radius
listingSchema.statics.findByTypeWithinRadius = function(typeId, lat, lng, radiusKm) {
  return this.find({
    type: typeId,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: radiusKm * 1000
      }
    },
    isActive: true
  });
};

module.exports = mongoose.model('Listing', listingSchema); 