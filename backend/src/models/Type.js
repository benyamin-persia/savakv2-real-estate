const mongoose = require('mongoose');

const typeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Type name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Type name cannot be more than 50 characters']
  },
  slug: {
    type: String,
    required: [true, 'Type slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Type description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  icon: {
    type: String,
    required: [true, 'Type icon is required']
  },
  color: {
    type: String,
    required: [true, 'Type color is required'],
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
  },
  category: {
    type: String,
    enum: ['professional', 'creative', 'service', 'social', 'educational', 'health'],
    required: [true, 'Type category is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  metadata: {
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Average rating cannot be negative'],
      max: [5, 'Average rating cannot exceed 5']
    },
    totalListings: {
      type: Number,
      default: 0,
      min: [0, 'Total listings cannot be negative']
    },
    popularTags: [{
      tag: String,
      count: Number
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
typeSchema.index({ slug: 1 });
typeSchema.index({ category: 1 });
typeSchema.index({ isActive: 1 });
typeSchema.index({ isFeatured: 1 });
typeSchema.index({ sortOrder: 1 });

// Virtual for listings of this type
typeSchema.virtual('listings', {
  ref: 'Listing',
  localField: '_id',
  foreignField: 'type'
});

// Virtual for listing count
typeSchema.virtual('listingCount', {
  ref: 'Listing',
  localField: '_id',
  foreignField: 'type',
  count: true
});

// Pre-save middleware to generate slug if not provided
typeSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Static method to get all active types
typeSchema.statics.getActiveTypes = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
};

// Static method to get featured types
typeSchema.statics.getFeaturedTypes = function() {
  return this.find({ isActive: true, isFeatured: true }).sort({ sortOrder: 1, name: 1 });
};

// Static method to get types by category
typeSchema.statics.getTypesByCategory = function(category) {
  return this.find({ isActive: true, category }).sort({ sortOrder: 1, name: 1 });
};

// Instance method to update metadata
typeSchema.methods.updateMetadata = async function() {
  const Listing = mongoose.model('Listing');
  
  // Get total listings for this type
  const totalListings = await Listing.countDocuments({ 
    type: this._id, 
    isActive: true 
  });
  
  // Get average rating for this type
  const avgRatingResult = await Listing.aggregate([
    { $match: { type: this._id, isActive: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating.average' } } }
  ]);
  
  const averageRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;
  
  // Get popular tags for this type
  const popularTags = await Listing.aggregate([
    { $match: { type: this._id, isActive: true } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $project: { tag: '$_id', count: 1, _id: 0 } }
  ]);
  
  this.metadata = {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalListings,
    popularTags
  };
  
  return this.save();
};

module.exports = mongoose.model('Type', typeSchema); 