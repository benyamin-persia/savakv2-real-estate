const mongoose = require('mongoose');
require('dotenv').config();

const fixDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI or DATABASE_URL environment variable is required');
      process.exit(1);
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    console.log('🔧 Fixing database indexes...');

    // Drop existing indexes that might be causing issues
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

    // Clean up documents with null values in googleId and microsoftId
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

    // Ensure email index exists
    await collection.createIndex({ email: 1 }, { unique: true });
    console.log('✅ Ensured email unique index');

    console.log('✅ Database indexes fixed successfully!');
    
    // Test the indexes
    const indexes = await collection.indexes();
    console.log('📊 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
};

fixDatabase(); 