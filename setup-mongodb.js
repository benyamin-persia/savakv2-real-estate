const fs = require('fs');
const path = require('path');

console.log('🗄️ MongoDB Connection Setup\n');

console.log('📋 You need to update your MongoDB connection string in backend/.env');
console.log('\n🔧 To get your MongoDB connection string:');
console.log('1. Go to MongoDB Atlas: https://cloud.mongodb.com/');
console.log('2. Click on your cluster');
console.log('3. Click "Connect"');
console.log('4. Choose "Connect your application"');
console.log('5. Copy the connection string');
console.log('\n📝 The connection string should look like this:');
console.log('mongodb+srv://username:password@cluster.mongodb.net/savakv2?retryWrites=true&w=majority');

console.log('\n🔧 Current .env file status:');
const backendEnvPath = path.join(__dirname, 'backend', '.env');

try {
  const envContent = fs.readFileSync(backendEnvPath, 'utf8');
  
  // Check if MongoDB connection strings are still placeholders
  const hasPlaceholderMongo = envContent.includes('your-username') || envContent.includes('your-cluster');
  
  if (hasPlaceholderMongo) {
    console.log('❌ MongoDB connection strings still contain placeholder values');
    console.log('⚠️ You need to update DATABASE_URL and MONGODB_URI with your actual MongoDB connection string');
  } else {
    console.log('✅ MongoDB connection strings appear to be configured');
  }
  
  // Show current values (masked for security)
  const lines = envContent.split('\n');
  const mongoLines = lines.filter(line => line.includes('DATABASE_URL') || line.includes('MONGODB_URI'));
  
  console.log('\n📄 Current MongoDB configuration:');
  mongoLines.forEach(line => {
    if (line.includes('your-username')) {
      console.log(`   ${line.split('=')[0]}="[PLACEHOLDER - NEEDS UPDATE]"`);
    } else {
      const parts = line.split('=');
      const value = parts[1] || '';
      const masked = value.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://***:***@');
      console.log(`   ${parts[0]}="${masked}"`);
    }
  });
  
} catch (error) {
  console.log('❌ Could not read .env file:', error.message);
}

console.log('\n🚀 Quick Fix Options:');
console.log('\nOption 1: Manual Update');
console.log('1. Edit backend/.env');
console.log('2. Replace the placeholder values with your actual MongoDB connection string');
console.log('3. Save the file');
console.log('4. Run: npm start (in backend directory)');

console.log('\nOption 2: Create a new .env file');
console.log('1. Copy your MongoDB connection string from MongoDB Atlas');
console.log('2. Run this script with your connection string as an argument');
console.log('3. Example: node setup-mongodb.js "your-connection-string"');

// If connection string is provided as argument
if (process.argv[2]) {
  const connectionString = process.argv[2];
  
  try {
    let envContent = fs.readFileSync(backendEnvPath, 'utf8');
    
    // Update both DATABASE_URL and MONGODB_URI
    envContent = envContent.replace(
      /DATABASE_URL="[^"]*"/,
      `DATABASE_URL="${connectionString}"`
    );
    
    envContent = envContent.replace(
      /MONGODB_URI="[^"]*"/,
      `MONGODB_URI="${connectionString}"`
    );
    
    fs.writeFileSync(backendEnvPath, envContent);
    console.log('\n✅ Updated MongoDB connection strings!');
    console.log('🚀 You can now start your backend: npm start');
    
  } catch (error) {
    console.error('❌ Error updating connection string:', error.message);
  }
}

console.log('\n💡 After updating the connection string:');
console.log('1. cd backend');
console.log('2. npm start');
console.log('3. The server should start without database connection errors'); 