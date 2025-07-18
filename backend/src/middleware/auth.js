const { prisma } = require('../config/database');

// Check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.isAuthenticated) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const userRole = req.user.userType || req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: roles,
        current: userRole
      });
    }
    next();
  };
};

// Check if user can create posts (daily limit)
const checkPostLimit = async (req, res, next) => {
  // If Prisma is not available or throws any error, always allow post creation
  if (!prisma) {
    console.log('[Auth Middleware] Prisma not available, allowing post creation for all users.');
    return next();
    }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    // Reset daily count if it's a new day
    const now = new Date();
    const lastReset = new Date(user.lastPostReset);
    const isNewDay = now.getDate() !== lastReset.getDate() || 
                     now.getMonth() !== lastReset.getMonth() || 
                     now.getFullYear() !== lastReset.getFullYear();
    if (isNewDay) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          dailyPostCount: 0,
          lastPostReset: now
        }
      });
      user.dailyPostCount = 0;
    }
    // Check if user can create more posts
    const maxPosts = user.maxDailyPosts || 5;
    if (user.dailyPostCount >= maxPosts && user.userType === 'regular') {
      return res.status(429).json({ 
        message: `Daily post limit reached (${maxPosts} posts per day)`,
        dailyPostCount: user.dailyPostCount,
        maxDailyPosts: maxPosts
      });
    }
    // For admin and advanced users, no limit
    if (user.userType === 'admin' || user.userType === 'advanced') {
      return next();
    }
    // For shadow users, they can't create posts
    if (user.userType === 'shadow') {
      return res.status(403).json({ 
        message: 'Shadow users cannot create posts. They are responsible for evaluating posts only.'
      });
    }
    next();
  } catch (error) {
    // If Prisma throws any error, allow post creation for all users
    console.log('[Auth Middleware] Prisma error or schema mismatch, allowing post creation for all users. Error:', error.message);
    return next();
  }
};

// Increment post count after successful post creation
const incrementPostCount = async (req, res, next) => {
  if (!prisma) {
    return next();
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user && user.userType === 'regular') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          dailyPostCount: user.dailyPostCount + 1
        }
      });
    }
    next();
  } catch (error) {
    return next();
  }
};

const requireAdmin = requireRole(['admin']);
const requireAdvanced = requireRole(['admin', 'advanced']);
const requireShadow = requireRole(['admin', 'advanced', 'shadow']);

module.exports = {
  requireRole,
  requireAdmin,
  requireAdvanced,
  requireShadow,
  checkPostLimit,
  incrementPostCount
}; 