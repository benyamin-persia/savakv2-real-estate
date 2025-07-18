const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

async function setFirstAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL);
    console.log('✅ Connected to MongoDB');

    // Find the first user and make them admin
    const firstUser = await User.findOne().sort({ createdAt: 1 });
    
    if (!firstUser) {
      console.log('❌ No users found in database');
      return;
    }

    // Update user to admin
    firstUser.userType = 'admin';
    firstUser.role = 'admin';
    firstUser.maxDailyPosts = 999999; // Unlimited posts
    await firstUser.save();

    console.log(`✅ User "${firstUser.name}" (${firstUser.email}) is now an admin`);
    console.log(`   User ID: ${firstUser._id}`);
    console.log(`   Username: ${firstUser.username}`);
    console.log(`   User Type: ${firstUser.userType}`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error setting admin:', error);
    process.exit(1);
  }
}

setFirstAdmin(); 