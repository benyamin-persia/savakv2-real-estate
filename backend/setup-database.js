const mongoose = require('mongoose');
require('dotenv').config();

const setupDatabase = async () => {
  try {
    console.log('🔧 Setting up database...');
    
    // Check if environment variables are set
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!mongoUri || mongoUri.includes('your-username')) {
      console.log('⚠️ Please update your .env file with your MongoDB connection string');
      console.log('📝 Example: MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/savakv2"');
      return;
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    console.log('🔧 Fixing database indexes...');

    // Drop existing problematic indexes
    try {
      await collection.dropIndex('googleId_1');
      console.log('✅ Dropped googleId index');
    } catch (error) {
      console.log('ℹ️ googleId index not found or already dropped');
    }

    try {
      await collection.dropIndex('microsoftId_1');
      console.log('✅ Dropped microsoftId index');
    } catch (error) {
      console.log('ℹ️ microsoftId index not found or already dropped');
    }

    // Clean up documents with null values
    const result = await collection.updateMany(
      { 
        $or: [
          { googleId: null },
          { microsoftId: null }
        ]
      },
      { 
        $unset: { 
          googleId: "",
          microsoftId: ""
        }
      }
    );
    console.log(`✅ Cleaned up ${result.modifiedCount} documents with null values`);

    // Create new sparse unique indexes
    await collection.createIndex({ googleId: 1 }, { sparse: true, unique: true });
    console.log('✅ Created new googleId sparse unique index');

    await collection.createIndex({ microsoftId: 1 }, { sparse: true, unique: true });
    console.log('✅ Created new microsoftId sparse unique index');

    await collection.createIndex({ email: 1 }, { unique: true });
    console.log('✅ Ensured email unique index');

    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('💡 Make sure your MongoDB connection string is correct in the .env file');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ Database connection closed');
    }
  }
};

setupDatabase();
