const fs = require('fs');
const path = require('path');

const envContent = `# Database Configuration
DATABASE_URL="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/savakv2?retryWrites=true&w=majority"

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

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created backend/.env file');
  console.log('\n📝 Next steps:');
  console.log('1. Update DATABASE_URL with your MongoDB Atlas connection string');
  console.log('2. Update JWT_SECRET and SESSION_SECRET with secure random strings');
  console.log('3. Add your OAuth credentials (Google/Microsoft) if using social login');
  console.log('\n💡 For MongoDB Atlas:');
  console.log('- Go to MongoDB Atlas dashboard');
  console.log('- Click "Connect" on your cluster');
  console.log('- Choose "Connect your application"');
  console.log('- Copy the connection string and replace the DATABASE_URL value');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
} 