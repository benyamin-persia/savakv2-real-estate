const fs = require('fs');
const path = require('path');

console.log('🔧 Updating OAuth credentials...');

// Read the Google OAuth credentials from the JSON file
const googleCredentialsPath = path.join(__dirname, 'client_secret_559118569009-p6q0v8ql994e09kl52j06c2d2d3nbtmc.apps.googleusercontent.com.json');
const backendEnvPath = path.join(__dirname, 'backend', '.env');

try {
  // Read Google credentials
  const googleCredentials = JSON.parse(fs.readFileSync(googleCredentialsPath, 'utf8'));
  const clientId = googleCredentials.web.client_id;
  const clientSecret = googleCredentials.web.client_secret;
  
  console.log('✅ Found Google OAuth credentials:');
  console.log(`   Client ID: ${clientId}`);
  console.log(`   Client Secret: ${clientSecret.substring(0, 10)}...`);
  
  // Read current .env file
  let envContent = '';
  try {
    envContent = fs.readFileSync(backendEnvPath, 'utf8');
  } catch (error) {
    console.log('⚠️ No existing .env file found, creating new one...');
    envContent = `# Database Configuration
DATABASE_URL="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/savakv2?retryWrites=true&w=majority"
MONGODB_URI="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/savakv2?retryWrites=true&w=majority"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Session Configuration
SESSION_SECRET="your-session-secret-key-change-this-in-production"

# OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"
`;
  }
  
  // Update Google OAuth credentials
  envContent = envContent.replace(
    /GOOGLE_CLIENT_ID="[^"]*"/,
    `GOOGLE_CLIENT_ID="${clientId}"`
  );
  
  envContent = envContent.replace(
    /GOOGLE_CLIENT_SECRET="[^"]*"/,
    `GOOGLE_CLIENT_SECRET="${clientSecret}"`
  );
  
  // Write updated .env file
  fs.writeFileSync(backendEnvPath, envContent);
  console.log('✅ Updated backend/.env with actual Google OAuth credentials');
  
  // Also create frontend .env
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
  const frontendEnvContent = `# Frontend Environment Variables
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=${clientId}
REACT_APP_MICROSOFT_CLIENT_ID=your-microsoft-client-id
`;
  
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Created frontend/.env with Google Client ID');
  
  console.log('\n🎉 OAuth credentials updated successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Update DATABASE_URL and MONGODB_URI with your MongoDB connection string');
  console.log('2. Update SESSION_SECRET and JWT_SECRET with secure random strings');
  console.log('3. Start your application: start-all.bat');
  
} catch (error) {
  console.error('❌ Error updating OAuth credentials:', error.message);
} 