const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

async function fixUsernames() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL);

  // Fix usernames
  const usersWithoutUsername = await User.find({ $or: [{ username: { $exists: false } }, { username: null }] });
  for (const user of usersWithoutUsername) {
    user.username = user.email ? user.email.split('@')[0] : `user${user._id}`;
    await user.save();
    console.log(`Fixed username for user ${user._id}: ${user.username}`);
  }

  // Fix roles (change 'user' to 'regular')
  const usersWithOldRole = await User.find({ role: 'user' });
  for (const user of usersWithOldRole) {
    user.role = 'regular';
    user.userType = 'regular';
    await user.save();
    console.log(`Fixed role for user ${user._id}: ${user.role}`);
  }

  await mongoose.disconnect();
  console.log('Done!');
}

fixUsernames(); 