const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;

async function fixUserLocations() {
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const result = await User.updateMany(
    {
      $or: [
        { 'location.coordinates': { $exists: false } },
        { 'location.coordinates': null },
        { 'location.type': { $ne: 'Point' } },
        { 'location.coordinates': { $not: { $type: 'array' } } },
        { 'location.coordinates.0': { $exists: false } },
        { 'location.coordinates.1': { $exists: false } }
      ]
    },
    {
      $set: { 'location.type': 'Point', 'location.coordinates': [0, 0] }
    }
  );
  console.log(`✅ Fixed user locations for ${result.modifiedCount || result.nModified} users.`);
  await mongoose.disconnect();
}

fixUserLocations().catch(err => {
  console.error('❌ Error fixing user locations:', err);
  process.exit(1);
}); 