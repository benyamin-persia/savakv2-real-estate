const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting comprehensive setup...\n');

// Step 1: Create environment files
console.log('📝 Creating environment files...');

const backendEnvContent = `# Database Configuration
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

const frontendEnvContent = `# Frontend Environment Variables
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_MICROSOFT_CLIENT_ID=your-microsoft-client-id
`;

try {
  fs.writeFileSync(path.join(__dirname, 'backend', '.env'), backendEnvContent);
  console.log('✅ Created backend/.env file');
} catch (error) {
  console.log('⚠️ Could not create backend/.env file:', error.message);
}

try {
  fs.writeFileSync(path.join(__dirname, 'frontend', '.env'), frontendEnvContent);
  console.log('✅ Created frontend/.env file');
} catch (error) {
  console.log('⚠️ Could not create frontend/.env file:', error.message);
}

// Step 2: Install dependencies
console.log('\n📦 Installing dependencies...');

try {
  console.log('Installing backend dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
} catch (error) {
  console.log('⚠️ Backend dependency installation failed:', error.message);
}

try {
  console.log('Installing frontend dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.log('⚠️ Frontend dependency installation failed:', error.message);
}

// Step 3: Generate Prisma client
console.log('\n🔧 Generating Prisma client...');

try {
  execSync('npx prisma generate', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.log('⚠️ Prisma client generation failed:', error.message);
}

// Step 4: Create database setup script
console.log('\n🗄️ Creating database setup script...');

const dbSetupContent = `const mongoose = require('mongoose');
require('dotenv').config();

const setupDatabase = async () => {
  try {
    console.log('🔧 Setting up database...');
    
    // Check if environment variables are set
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!mongoUri || mongoUri.includes('your-username')) {
      console.log('⚠️ Please update your .env file with your MongoDB connection string');
      console.log('📝 Example: MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/savakv2"');
      return;
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    console.log('🔧 Fixing database indexes...');

    // Drop existing problematic indexes
    try {
      await collection.dropIndex('googleId_1');
      console.log('✅ Dropped googleId index');
    } catch (error) {
      console.log('ℹ️ googleId index not found or already dropped');
    }

    try {
      await collection.dropIndex('microsoftId_1');
      console.log('✅ Dropped microsoftId index');
    } catch (error) {
      console.log('ℹ️ microsoftId index not found or already dropped');
    }

    // Clean up documents with null values
    const result = await collection.updateMany(
      { 
        $or: [
          { googleId: null },
          { microsoftId: null }
        ]
      },
      { 
        $unset: { 
          googleId: "",
          microsoftId: ""
        }
      }
    );
    console.log(\`✅ Cleaned up \${result.modifiedCount} documents with null values\`);

    // Create new sparse unique indexes
    await collection.createIndex({ googleId: 1 }, { sparse: true, unique: true });
    console.log('✅ Created new googleId sparse unique index');

    await collection.createIndex({ microsoftId: 1 }, { sparse: true, unique: true });
    console.log('✅ Created new microsoftId sparse unique index');

    await collection.createIndex({ email: 1 }, { unique: true });
    console.log('✅ Ensured email unique index');

    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('💡 Make sure your MongoDB connection string is correct in the .env file');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ Database connection closed');
    }
  }
};

setupDatabase();
`;

try {
  fs.writeFileSync(path.join(__dirname, 'backend', 'setup-database.js'), dbSetupContent);
  console.log('✅ Created database setup script');
} catch (error) {
  console.log('⚠️ Could not create database setup script:', error.message);
}

// Step 5: Create startup scripts
console.log('\n🚀 Creating startup scripts...');

const startBackendScript = `@echo off
echo Starting backend server...
cd backend
npm start
`;

const startFrontendScript = `@echo off
echo Starting frontend server...
cd frontend
npm start
`;

const startAllScript = `@echo off
echo Starting both servers...
start cmd /k "cd backend && npm start"
timeout /t 3
start cmd /k "cd frontend && npm start"
`;

try {
  fs.writeFileSync(path.join(__dirname, 'start-backend.bat'), startBackendScript);
  fs.writeFileSync(path.join(__dirname, 'start-frontend.bat'), startFrontendScript);
  fs.writeFileSync(path.join(__dirname, 'start-all.bat'), startAllScript);
  console.log('✅ Created startup scripts');
} catch (error) {
  console.log('⚠️ Could not create startup scripts:', error.message);
}

// Step 6: Create comprehensive README
console.log('\n📚 Creating comprehensive README...');

const readmeContent = `# SavakV2 - Real Estate Platform

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Google OAuth credentials (optional)
- Microsoft OAuth credentials (optional)

### Setup Instructions

1. **Environment Configuration**
   - Update \`backend/.env\` with your MongoDB connection string
   - Update \`frontend/.env\` with your API URL
   - Add OAuth credentials if using social login

2. **Database Setup**
   \`\`\`bash
   cd backend
   node setup-database.js
   \`\`\`

3. **Start the Application**
   - Run \`start-all.bat\` to start both servers
   - Or run \`start-backend.bat\` and \`start-frontend.bat\` separately

### Environment Variables

#### Backend (.env)
\`\`\`
DATABASE_URL="your-mongodb-connection-string"
MONGODB_URI="your-mongodb-connection-string"
SESSION_SECRET="your-session-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
\`\`\`

#### Frontend (.env)
\`\`\`
REACT_APP_API_URL=http://localhost:5000
\`\`\`

### Features
- User authentication (local + OAuth)
- Real estate listings
- Interactive maps
- Real-time chat
- User profiles
- Search and filtering

### Troubleshooting

#### Database Connection Issues
1. Check your MongoDB connection string
2. Ensure your IP is whitelisted in MongoDB Atlas
3. Run \`node setup-database.js\` to fix indexes

#### OAuth Issues
1. Verify your OAuth credentials in .env
2. Check redirect URIs in OAuth provider settings
3. Ensure CORS is properly configured

#### Port Issues
- Backend runs on port 5000
- Frontend runs on port 3000
- Check if ports are available

### Development
- Backend: Express.js, MongoDB, Prisma
- Frontend: React, Leaflet, Socket.io
- Authentication: Passport.js, Session-based
`;

try {
  fs.writeFileSync(path.join(__dirname, 'SETUP_COMPLETE.md'), readmeContent);
  console.log('✅ Created comprehensive README');
} catch (error) {
  console.log('⚠️ Could not create README:', error.message);
}

console.log('\n🎉 Setup completed!');
console.log('\n📋 Next steps:');
console.log('1. Update the .env files with your actual credentials');
console.log('2. Run: cd backend && node setup-database.js');
console.log('3. Run: start-all.bat (or start servers separately)');
console.log('\n💡 Check SETUP_COMPLETE.md for detailed instructions'); 