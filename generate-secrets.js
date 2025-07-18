const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generating secure secrets...');

// Generate secure random secrets
const sessionSecret = crypto.randomBytes(64).toString('hex');
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('✅ Generated secure secrets:');
console.log(`   SESSION_SECRET: ${sessionSecret}`);
console.log(`   JWT_SECRET: ${jwtSecret}`);

// Update the backend .env file
const backendEnvPath = path.join(__dirname, 'backend', '.env');

try {
  let envContent = fs.readFileSync(backendEnvPath, 'utf8');
  
  // Update session secret
  envContent = envContent.replace(
    /SESSION_SECRET="[^"]*"/,
    `SESSION_SECRET="${sessionSecret}"`
  );
  
  // Update JWT secret
  envContent = envContent.replace(
    /JWT_SECRET="[^"]*"/,
    `JWT_SECRET="${jwtSecret}"`
  );
  
  fs.writeFileSync(backendEnvPath, envContent);
  console.log('✅ Updated backend/.env with secure secrets');
  
  console.log('\n🎉 Secrets generated and updated successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Update your MongoDB connection string in backend/.env');
  console.log('2. Configure Google OAuth redirect URIs (see GOOGLE_OAUTH_SETUP.md)');
  console.log('3. Start your application: start-all.bat');
  
} catch (error) {
  console.error('❌ Error updating secrets:', error.message);
  console.log('\n📝 Manual update required:');
  console.log(`   SESSION_SECRET="${sessionSecret}"`);
  console.log(`   JWT_SECRET="${jwtSecret}"`);
} 