const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up environment variables for SavakV2...\n');

// Frontend environment template
const frontendEnvTemplate = `# Frontend Environment Variables
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
REACT_APP_MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
REACT_APP_SOCKET_URL=http://localhost:5000
`;

// Backend environment template
const backendEnvTemplate = `# Backend Environment Variables
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/savakv2
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/savakv2

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Session Secret
SESSION_SECRET=your_session_secret_here

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Mapbox Token
MAPBOX_TOKEN=your_mapbox_token_here
`;

// Create directories if they don't exist
const frontendDir = path.join(__dirname, '..', 'frontend');
const backendDir = path.join(__dirname, '..', 'backend');

if (!fs.existsSync(frontendDir)) {
  fs.mkdirSync(frontendDir, { recursive: true });
}

if (!fs.existsSync(backendDir)) {
  fs.mkdirSync(backendDir, { recursive: true });
}

// Write environment files
const frontendEnvPath = path.join(frontendDir, '.env.local');
const backendEnvPath = path.join(backendDir, '.env');

try {
  // Check if files already exist
  if (fs.existsSync(frontendEnvPath)) {
    console.log('⚠️  Frontend .env.local already exists. Skipping...');
  } else {
    fs.writeFileSync(frontendEnvPath, frontendEnvTemplate);
    console.log('✅ Created frontend/.env.local');
  }

  if (fs.existsSync(backendEnvPath)) {
    console.log('⚠️  Backend .env already exists. Skipping...');
  } else {
    fs.writeFileSync(backendEnvPath, backendEnvTemplate);
    console.log('✅ Created backend/.env');
  }

  console.log('\n📝 Environment files created successfully!');
  console.log('\n🔧 Next steps:');
  console.log('1. Update the environment variables in the .env files');
  console.log('2. Set up your MongoDB database (local or Atlas)');
  console.log('3. Configure OAuth providers (Google, Microsoft)');
  console.log('4. Set up Cloudinary for image uploads');
  console.log('5. Configure Mapbox for mapping features');
  console.log('\n📚 Documentation:');
  console.log('- MongoDB Atlas: https://docs.atlas.mongodb.com/');
  console.log('- Google OAuth: https://developers.google.com/identity/protocols/oauth2');
  console.log('- Microsoft OAuth: https://docs.microsoft.com/en-us/azure/active-directory/develop/');
  console.log('- Cloudinary: https://cloudinary.com/documentation');
  console.log('- Mapbox: https://docs.mapbox.com/');

} catch (error) {
  console.error('❌ Error creating environment files:', error.message);
  process.exit(1);
} 