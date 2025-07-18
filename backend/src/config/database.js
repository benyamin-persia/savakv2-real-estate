const mongoose = require('mongoose');

let prisma = null;
// Try to initialize Prisma, but don't fail if it doesn't work
try {
const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (error) {
  console.warn('⚠️ Prisma not available:', error.message);
  console.log('ℹ️ Server will run with Mongoose only');
}

const connectDB = async () => {
  try {
    // Connect Mongoose - use MONGODB_URI if available, otherwise use DATABASE_URL
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!mongoUri) {
      console.warn('⚠️ No MongoDB URI found. Using sample data mode.');
      console.log('ℹ️ To use real database, set MONGODB_URI or DATABASE_URL in .env file');
      return;
    }
    if (mongoUri.includes('your-username')) {
      console.warn('⚠️ Using placeholder MongoDB URI. Using sample data mode.');
      console.log('ℹ️ To use real database, update MONGODB_URI in .env file');
      return;
    }
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Mongoose connected to MongoDB');
    // Try to connect Prisma if available
    if (prisma) {
      try {
    await prisma.$connect();
    console.log('✅ Prisma connected to MongoDB');
      } catch (prismaError) {
        console.warn('⚠️ Prisma connection failed:', prismaError.message);
        console.log('ℹ️ Server will run with Mongoose only');
        prisma = null;
      }
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('ℹ️ Server will run with sample data mode');
    console.log('💡 To use real database, check your MongoDB connection string in .env file');
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  if (prisma) {
    try {
    await prisma.$disconnect();
    } catch (error) {
      console.warn('Prisma disconnect error:', error.message);
    }
  }
  if (mongoose.connection.readyState === 1) {
    try {
    await mongoose.connection.close();
    } catch (error) {
      console.warn('Mongoose disconnect error:', error.message);
    }
  }
});

module.exports = { connectDB, prisma }; 