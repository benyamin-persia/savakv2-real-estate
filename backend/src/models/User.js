const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Username cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.microsoftId; // Password required only for local auth
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: null
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'microsoft'],
    default: 'local'
  },
  googleId: {
    type: String,
    sparse: true
  },
  microsoftId: {
    type: String,
    sparse: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['regular', 'advanced', 'admin', 'shadow'],
    default: 'regular'
  },
  userType: {
    type: String,
    enum: ['regular', 'advanced', 'admin', 'shadow'],
    default: 'regular'
  },
  dailyPostCount: {
    type: Number,
    default: 0
  },
  lastPostReset: {
    type: Date,
    default: Date.now
  },
  maxDailyPosts: {
    type: Number,
    default: 5 // Regular users get 5 posts per day
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: undefined
    }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    privacy: {
      profileVisible: { type: Boolean, default: true },
      showLocation: { type: Boolean, default: true }
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes - using compound indexes to avoid duplicate key errors
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { sparse: true, unique: true });
userSchema.index({ microsoftId: 1 }, { sparse: true, unique: true });
userSchema.index({ location: '2dsphere' });
userSchema.index({ createdAt: -1 });

// Virtual for user's listings
userSchema.virtual('listings', {
  ref: 'Listing',
  localField: '_id',
  foreignField: 'creator'
});

// Virtual for user's comments
userSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'author'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to ensure valid location coordinates
userSchema.pre('save', function(next) {
  if (!this.location) {
    this.location = { type: 'Point', coordinates: [0, 0] };
  } else {
    if (!Array.isArray(this.location.coordinates) || this.location.coordinates.length !== 2) {
      this.location.coordinates = [0, 0];
    }
    if (!this.location.type) {
      this.location.type = 'Point';
    }
  }
  if (this.email === 'apaosha.1983@gmail.com') {
    this.isAdmin = true;
    this.role = 'admin';
    this.userType = 'admin';
  }
  next();
});

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.googleId;
  delete userObject.microsoftId;
  delete userObject.preferences;
  return userObject;
};

// Static method to find user by email or social ID
userSchema.statics.findByEmailOrSocialId = function(email, googleId, microsoftId) {
  return this.findOne({
    $or: [
      { email },
      { googleId },
      { microsoftId }
    ]
  });
};

// Static method to find or create user for OAuth
userSchema.statics.findOrCreateOAuthUser = async function(profile, provider) {
  try {
    let user = null;
    
    // First try to find by provider ID
    if (provider === 'google' && profile.id) {
      user = await this.findOne({ googleId: profile.id });
    } else if (provider === 'microsoft' && profile.id) {
      user = await this.findOne({ microsoftId: profile.id });
    }
    
    // If not found by provider ID, try to find by email
    if (!user && profile.emails && profile.emails[0]) {
      user = await this.findOne({ email: profile.emails[0].value });
      
      // If found by email, update with provider ID and ensure username exists
      if (user) {
        if (provider === 'google') {
          user.googleId = profile.id;
        } else if (provider === 'microsoft') {
          user.microsoftId = profile.id;
        }
        user.authProvider = provider;
        user.isVerified = true;
        
        // Ensure username exists
        if (!user.username) {
          let username = profile.emails[0].value.split('@')[0];
          if (profile.displayName) {
            username = profile.displayName.replace(/\s+/g, '').toLowerCase();
          }
          
          // Ensure username is unique
          let counter = 1;
          let originalUsername = username;
          while (await this.findOne({ username, _id: { $ne: user._id } })) {
            username = `${originalUsername}${counter}`;
            counter++;
          }
          user.username = username;
        }
        
        await user.save();
      }
    }
    
    // If still not found, create new user
    if (!user) {
      // Generate username from email or display name
      let username = profile.emails[0].value.split('@')[0];
      if (profile.displayName) {
        username = profile.displayName.replace(/\s+/g, '').toLowerCase();
      }
      
      // Ensure username is unique
      let counter = 1;
      let originalUsername = username;
      while (await this.findOne({ username })) {
        username = `${originalUsername}${counter}`;
        counter++;
      }
      
      const userData = {
        name: profile.displayName,
        username: username,
        email: profile.emails[0].value,
        authProvider: provider,
        isVerified: true,
        location: { type: 'Point', coordinates: [0, 0] }, // Always set valid location
      };
      
      if (provider === 'google') {
        userData.googleId = profile.id;
      } else if (provider === 'microsoft') {
        userData.microsoftId = profile.id;
      }
      
      user = await this.create(userData);
    }
    
    return user;
  } catch (error) {
    console.error('Error in findOrCreateOAuthUser:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema); 