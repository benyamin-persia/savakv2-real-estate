const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

async function migrateUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      try {
        // Update user data directly in database to avoid validation
        const updateData = {};
        
        // Fix username if missing
        if (!user.username) {
          updateData.username = user.email ? user.email.split('@')[0] : `user${user._id}`;
        }
        
        // Fix role if it's 'user'
        if (user.role === 'user') {
          updateData.role = 'regular';
          updateData.userType = 'regular';
        }
        
        // Add missing fields
        if (!user.userType) {
          updateData.userType = user.role || 'regular';
        }
        
        if (!user.dailyPostCount) {
          updateData.dailyPostCount = 0;
        }
        
        if (!user.lastPostReset) {
          updateData.lastPostReset = new Date();
        }
        
        if (!user.maxDailyPosts) {
          updateData.maxDailyPosts = 5;
        }

        // Update user directly in database
        if (Object.keys(updateData).length > 0) {
          await User.updateOne({ _id: user._id }, { $set: updateData });
          console.log(`✅ Migrated user: ${user.email || user._id}`);
        }
      } catch (error) {
        console.error(`❌ Error migrating user ${user._id}:`, error.message);
      }
    }

    console.log('✅ Migration completed');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateUsers(); 