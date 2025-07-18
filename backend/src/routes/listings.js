const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const passport = require('passport');
const { checkPostLimit, incrementPostCount } = require('../middleware/auth');

// Remove sampleListings and all sample data logic

// Get all listings
router.get('/', async (req, res) => {
  try {
    if (!prisma) {
      // If database is not available, return empty list
      return res.json({
        success: true,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 }
      });
    }
    const { category, location, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (category && category !== '') where.category = category;
    if (location && location !== '') where.location = { contains: location, mode: 'insensitive' };
    if (search && search !== '') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      }),
      prisma.listing.count({ where })
    ]);
    res.json({
      success: true,
      data: listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching listings',
      error: error.message
    });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // This route will now only return a single listing if it exists in the database.
    // If the database is unavailable, it will return an error.
    if (!prisma) {
      return res.status(503).json({
        success: false,
        message: 'Database not available - cannot fetch single listing'
      });
    }
    const listing = await prisma.listing.findUnique({
      where: { id }
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching listing',
      error: error.message
    });
  }
});

// Test route to check database connection
router.post('/test', passport.authenticate('session'), async (req, res) => {
  try {
    console.log('Testing database connection...');
    console.log('User:', req.user);
    
    if (!prisma) {
      return res.status(503).json({
        success: false,
        message: 'Database not available - using sample data mode',
        data: {
          title: 'Test Listing (Sample Data)',
          description: 'This is a test listing using sample data',
          category: 'Test',
          location: 'Test Location',
          coordinates: { lat: 0, lng: 0 },
          images: [],
          price: 0,
          contact: { email: 'test@test.com' },
          features: [],
          userId: req.user?.id || 'sample-user'
        }
      });
    }
    
    // Try to create a simple test listing
    const testListing = await prisma.listing.create({
      data: {
        title: 'Test Listing',
        description: 'This is a test listing',
        category: 'Test',
        location: 'Test Location',
        coordinates: { lat: 0, lng: 0 },
        images: [],
        price: 0,
        contact: { email: 'test@test.com' },
        features: [],
        userId: req.user.id
      }
    });
    
    console.log('Test listing created:', testListing);
    
    res.json({
      success: true,
      message: 'Database connection working',
      data: testListing
    });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message,
      code: error.code
    });
  }
});

// Create listing (protected route with post limits)
router.post('/', passport.authenticate('session'), checkPostLimit, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      coordinates,
      images,
      price,
      contact,
      features
    } = req.body;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Debug: Log user information
    console.log('User from session:', req.user);
    console.log('User ID:', req.user.id);
    console.log('User ID type:', typeof req.user.id);

    // Validate required fields
    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, category, location'
      });
    }

    const userId = req.user.id;

    // If Prisma is not available, return a mock response
    if (!prisma) {
      const mockListing = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        location: location.trim(),
        coordinates: coordinates || { lat: 0, lng: 0 },
        images: Array.isArray(images) ? images.filter(img => typeof img === 'string' && img.trim() !== '') : [],
        price: price ? parseFloat(price) : null,
        contact: contact || {},
        features: Array.isArray(features) ? features.filter(feature => typeof feature === 'string' && feature.trim() !== '') : [],
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: userId,
          username: req.user.username || 'user',
          firstName: req.user.firstName || 'User',
          lastName: req.user.lastName || 'Name',
          avatar: req.user.avatar || null
        }
      };

      console.log('Created mock listing:', mockListing);

      res.status(201).json({
        success: true,
        message: 'Listing created (sample data mode)',
        data: mockListing
      });
      
      // Increment post count after successful creation
      incrementPostCount(req, res, () => {});
      return;
    }

    // Create listing data with proper validation
    const listingData = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      location: location.trim(),
      coordinates: coordinates || { lat: 0, lng: 0 },
      images: Array.isArray(images) ? images.filter(img => typeof img === 'string' && img.trim() !== '') : [],
      price: price ? parseFloat(price) : null,
      contact: contact || {},
      features: Array.isArray(features) ? features.filter(feature => typeof feature === 'string' && feature.trim() !== '') : [],
      userId: userId
    };

    console.log('Creating listing with data:', listingData);

    const listing = await prisma.listing.create({
      data: listingData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    console.log('Listing created successfully:', listing);

    res.status(201).json({
      success: true,
      data: listing
    });
    
    // Increment post count after successful creation
    incrementPostCount(req, res, () => {});
  } catch (error) {
    console.error('Error creating listing:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Error creating listing';
    if (error.code === 'P2002') {
      errorMessage = 'A listing with this title already exists';
    } else if (error.code === 'P2003') {
      errorMessage = 'Invalid user reference';
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
});

// Update listing (protected route)
router.put('/:id', passport.authenticate('session'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!prisma) {
      return res.status(503).json({
        success: false,
        message: 'Database not available - using sample data mode'
      });
    }

    // Ownership/Admin check
    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    if (existing.userId !== req.user.id && req.user.userType !== 'admin') {
      console.warn(`User ${req.user.id} (${req.user.userType}) attempted to update listing ${id} owned by ${existing.userId}`);
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing' });
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating listing',
      error: error.message
    });
  }
});

// Delete listing (protected route)
router.delete('/:id', passport.authenticate('session'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!prisma) {
      return res.status(503).json({
        success: false,
        message: 'Database not available - using sample data mode'
      });
    }

    // Ownership/Admin check
    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    if (existing.userId !== req.user.id && req.user.userType !== 'admin') {
      console.warn(`User ${req.user.id} (${req.user.userType}) attempted to delete listing ${id} owned by ${existing.userId}`);
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await prisma.listing.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting listing',
      error: error.message
    });
  }
});

// Get categories
router.get('/categories/all', async (req, res) => {
  try {
    // This route will now only return categories if the database is available.
    // If the database is unavailable, it will return an empty array.
    if (!prisma) {
      return res.json({
        success: true,
        data: []
      });
    }
    const categories = await prisma.listing.findMany({
      select: { category: true },
      distinct: ['category']
    });
    const uniqueCategories = [...new Set(categories.map(listing => listing.category))];
    
    res.json({
      success: true,
      data: uniqueCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

module.exports = router; 