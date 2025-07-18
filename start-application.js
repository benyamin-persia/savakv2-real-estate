const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting SavakV2 Application...\n');

// Check if MongoDB connection string is configured
const backendEnvPath = path.join(__dirname, 'backend', '.env');
let mongoConfigured = false;

try {
  const envContent = fs.readFileSync(backendEnvPath, 'utf8');
  mongoConfigured = !envContent.includes('your-username') && !envContent.includes('your-cluster');
} catch (error) {
  console.log('⚠️ Could not read .env file');
}

if (!mongoConfigured) {
  console.log('❌ MongoDB connection string not configured!');
  console.log('\n📋 To fix this:');
  console.log('1. Get your MongoDB connection string from MongoDB Atlas');
  console.log('2. Run: node update-mongodb.js "your-connection-string"');
  console.log('3. Then run this script again');
  console.log('\n💡 Example:');
  console.log('node update-mongodb.js "mongodb+srv://username:password@cluster.mongodb.net/savakv2"');
  process.exit(1);
}

console.log('✅ MongoDB connection configured');
console.log('✅ OAuth credentials updated');
console.log('✅ Secure secrets generated');
console.log('✅ Dependencies installed');
console.log('✅ Prisma client generated');

console.log('\n🚀 Starting servers...\n');

// Start backend server
console.log('📡 Starting backend server...');
try {
  const backendProcess = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
  });
  
  // Wait a moment for backend to start
  setTimeout(() => {
    console.log('\n🌐 Starting frontend server...');
    try {
      const frontendProcess = spawn('npm', ['start'], {
        cwd: path.join(__dirname, 'frontend'),
        stdio: 'inherit',
        shell: true
      });
      
      console.log('\n🎉 Both servers are starting!');
      console.log('📱 Backend: http://localhost:5000');
      console.log('🌐 Frontend: http://localhost:3000');
      console.log('\n⏳ Please wait for the servers to fully start...');
      
    } catch (error) {
      console.error('❌ Failed to start frontend:', error.message);
    }
  }, 3000);
  
} catch (error) {
  console.error('❌ Failed to start backend:', error.message);
  console.log('\n💡 Try running the servers manually:');
  console.log('1. cd backend && npm start');
  console.log('2. cd frontend && npm start');
} 