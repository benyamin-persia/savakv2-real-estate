const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireAdmin } = require('../middleware/auth');
const passport = require('passport');

// All admin routes require admin authentication
router.use(passport.authenticate('session'));
router.use(requireAdmin);

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', userType = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    
    // Search by name, email, or username
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by user type
    if (userType) {
      query.userType = userType;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 },
          verifiedCount: {
            $sum: { $cond: ['$isVerified', 1, 0] }
          },
          activeCount: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const totalVerified = await User.countDocuments({ isVerified: true });
    const totalActive = await User.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        stats,
        totalUsers,
        totalVerified,
        totalActive
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Create test user for testing
router.post('/users/test', async (req, res) => {
  try {
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      userType: 'regular',
      role: 'regular',
      isVerified: true,
      isActive: true,
      authProvider: 'google',
      googleId: 'test123',
      maxDailyPosts: 5
    });

    await testUser.save();
    console.log('[Admin] Test user created:', testUser._id);
    
    res.json({
      success: true,
      data: testUser,
      message: 'Test user created successfully'
    });
  } catch (error) {
    console.error('[Admin] Error creating test user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating test user',
      error: error.message
    });
  }
});

// Update user type
router.put('/users/:id/type', async (req, res) => {
  try {
    const { id } = req.params;
    const { userType } = req.body;

    console.log('[Admin] Updating user type:', { id, userType, body: req.body });

    if (!['regular', 'advanced', 'admin', 'shadow'].includes(userType)) {
      console.log('[Admin] Invalid user type:', userType);
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }

    console.log('[Admin] Finding and updating user:', id);
    const user = await User.findByIdAndUpdate(
      id,
      { 
        userType,
        role: userType, // Keep both fields in sync
        maxDailyPosts: userType === 'advanced' ? 999999 : 5 // Advanced users get unlimited
      },
      { new: true }
    ).select('-password');

    if (!user) {
      console.log('[Admin] User not found:', id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('[Admin] User updated successfully:', user._id, 'New type:', user.userType);
    res.json({
      success: true,
      data: user,
      message: `User type updated to ${userType}`
    });
  } catch (error) {
    console.error('[Admin] Error updating user type:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user type',
      error: error.message
    });
  }
});

// Update user details (admin)
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, username, userType } = req.body;

    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (username) update.username = username;
    if (userType && ['regular', 'advanced', 'admin', 'shadow'].includes(userType)) {
      update.userType = userType;
      update.role = userType;
      update.maxDailyPosts = userType === 'advanced' ? 999999 : 5;
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user, message: 'User updated successfully' });
  } catch (error) {
    console.error('[Admin] Error updating user:', error);
    res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
  }
});

// Toggle user verification status
router.put('/users/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isVerified },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: `User verification ${isVerified ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    console.error('Error updating user verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user verification',
      error: error.message
    });
  }
});

// Toggle user active status
router.put('/users/:id/active', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: `User ${isActive ? 'activated' : 'deactivated'}`
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
});

// Reset user's daily post count
router.put('/users/:id/reset-posts', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { 
        dailyPostCount: 0,
        lastPostReset: new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User daily post count reset'
    });
  } catch (error) {
    console.error('Error resetting user post count:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting user post count',
      error: error.message
    });
  }
});

// Delete user (admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user._id || id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

module.exports = router; 