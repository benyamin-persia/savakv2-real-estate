const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URL;

async function setAdmin() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const email = 'apaosha.1983@gmail.com';
  const user = await User.findOne({ email });
  if (!user) {
    console.error('User not found:', email);
    process.exit(1);
  }
  user.userType = 'admin';
  user.role = 'admin';
  await user.save();
  console.log('User promoted to admin:', user.email, user.userType, user.role);
  await mongoose.disconnect();
}

setAdmin(); 