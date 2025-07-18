const fs = require('fs');
const path = require('path');

console.log('🌤️  Setting up Cloudinary for image uploads...\n');

console.log('📋 Steps to set up Cloudinary:');
console.log('1. Go to https://cloudinary.com/ and create a free account');
console.log('2. After signing up, go to your Dashboard');
console.log('3. Copy your Cloud Name, API Key, and API Secret');
console.log('4. Update the backend/.env file with these values\n');

// Check if backend/.env exists
const envPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (!envContent.includes('CLOUDINARY_CLOUD_NAME')) {
    console.log('⚠️  Cloudinary variables not found in backend/.env');
    console.log('Please add the following to your backend/.env file:\n');
    console.log('# Cloudinary Configuration');
    console.log('CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name');
    console.log('CLOUDINARY_API_KEY=your_cloudinary_api_key');
    console.log('CLOUDINARY_API_SECRET=your_cloudinary_api_secret\n');
  } else {
    console.log('✅ Cloudinary variables found in backend/.env');
  }
} else {
  console.log('⚠️  backend/.env file not found');
  console.log('Please create it with the following content:\n');
  console.log('# Cloudinary Configuration');
  console.log('CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name');
  console.log('CLOUDINARY_API_KEY=your_cloudinary_api_key');
  console.log('CLOUDINARY_API_SECRET=your_cloudinary_api_secret\n');
}

console.log('🎯 Benefits of Cloudinary:');
console.log('✅ Free tier: 25GB storage, 25GB bandwidth/month');
console.log('✅ Automatic image optimization and resizing');
console.log('✅ Global CDN for fast image delivery');
console.log('✅ No server storage needed (perfect for Vercel/Heroku)');
console.log('✅ Automatic format conversion (WebP, AVIF)');
console.log('✅ Built-in security and transformations\n');

console.log('🚀 After setup:');
console.log('1. Images will be automatically uploaded to Cloudinary');
console.log('2. Images will be optimized and served via CDN');
console.log('3. You can delete images via the API');
console.log('4. Images are organized in folders (savakv2/listings)\n');

console.log('📝 Example usage:');
console.log('- Upload multiple images (max 5)');
console.log('- Images are automatically resized to 800x600');
console.log('- Quality is automatically optimized');
console.log('- Images are served via HTTPS\n'); 