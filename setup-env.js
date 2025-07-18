const fs = require('fs');
const path = require('path');

// Backend environment variables
const backendEnv = `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/savakv2
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
JWT_SECRET=your-jwt-secret-key-change-this-in-production
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=http://localhost:3000
`;

// Frontend environment variables
const frontendEnv = `REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_MAPBOX_TOKEN=your-mapbox-token
`;

// Create backend .env file
const backendEnvPath = path.join(__dirname, 'backend', '.env');
fs.writeFileSync(backendEnvPath, backendEnv);
console.log('✅ Created backend/.env');

// Create frontend .env file
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
fs.writeFileSync(frontendEnvPath, frontendEnv);
console.log('✅ Created frontend/.env');

console.log('\n📝 Next steps:');
console.log('1. Install MongoDB: https://www.mongodb.com/try/download/community');
console.log('2. Update the environment variables in backend/.env and frontend/.env');
console.log('3. Run: npm run dev');
console.log('\n🔗 Useful links:');
console.log('- MongoDB: https://www.mongodb.com/try/download/community');
console.log('- Google OAuth: https://console.cloud.google.com/');
console.log('- Microsoft OAuth: https://portal.azure.com/');
console.log('- Mapbox: https://www.mapbox.com/');
console.log('- Cloudinary: https://cloudinary.com/'); 