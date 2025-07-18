const fs = require('fs');
const path = require('path');

console.log('🗄️ MongoDB Connection String Updater\n');

// Check if connection string is provided as argument
if (process.argv[2]) {
  const connectionString = process.argv[2];
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  
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
    console.log('✅ Updated MongoDB connection strings!');
    console.log('🚀 You can now start your application: start-all.bat');
    
  } catch (error) {
    console.error('❌ Error updating connection string:', error.message);
  }
} else {
  console.log('📋 Usage:');
  console.log('node update-mongodb.js "your-mongodb-connection-string"');
  console.log('\n📝 Example:');
  console.log('node update-mongodb.js "mongodb+srv://username:password@cluster.mongodb.net/savakv2"');
  console.log('\n🔧 To get your MongoDB connection string:');
  console.log('1. Go to MongoDB Atlas: https://cloud.mongodb.com/');
  console.log('2. Click on your cluster');
  console.log('3. Click "Connect"');
  console.log('4. Choose "Connect your application"');
  console.log('5. Copy the connection string');
} 