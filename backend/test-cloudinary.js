import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

dotenv.config();

console.log('=== Cloudinary Configuration Test ===\n');

// Check env variables
console.log('1. Checking environment variables:');
console.log('   CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('   CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.log('\n❌ ERROR: Cloudinary credentials are missing in .env file!');
  console.log('   Please check that all three credentials are set correctly.\n');
  process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('\n2. Testing Cloudinary API connection:');

async function testCloudinary() {
  try {
    // Test API call
    const result = await cloudinary.api.resources({ max_results: 1 });
    console.log('   ✅ Cloudinary API connection successful!');
    console.log(`   Total resources in account: ${result.total_count}`);
    
    // Try uploading a test file
    console.log('\n3. Testing file upload:');
    
    const testDataURI = `data:application/pdf;base64,${Buffer.from('Test PDF Content').toString('base64')}`;
    
    const uploadResult = await cloudinary.uploader.upload(testDataURI, {
      resource_type: 'raw',
      folder: 'lms/course-resources',
      public_id: `test-${Date.now()}`,
      overwrite: false,
      use_filename: false
    });
    
    console.log('   ✅ Test upload successful!');
    console.log(`   Secure URL: ${uploadResult.secure_url}`);
    console.log(`   Public ID: ${uploadResult.public_id}`);
    
    if (uploadResult.secure_url.startsWith('https://')) {
      console.log('   ✅ URL is HTTPS (correct!)');
    } else if (uploadResult.secure_url.startsWith('file://')) {
      console.log('   ❌ ERROR: URL is file:// protocol (should be https://)');
    }
    
    // Clean up test file
    try {
      await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: 'raw' });
      console.log('   ✅ Test file cleaned up');
    } catch (e) {
      console.log('   ⚠️  Could not clean up test file');
    }
    
    console.log('\n✅ All Cloudinary tests passed! Your configuration is working correctly.\n');
    
  } catch (error) {
    console.log('\n❌ Cloudinary API Error:');
    console.log(`   ${error.message}`);
    
    if (error.http_code) {
      console.log(`   HTTP Code: ${error.http_code}`);
    }
    
    console.log('\nPossible causes:');
    console.log('1. Invalid Cloudinary credentials in .env file');
    console.log('2. Cloud name, API key, or API secret is incorrect');
    console.log('3. Network connectivity issue');
    console.log('4. Cloudinary account is disabled or expired\n');
    
    process.exit(1);
  }
}

testCloudinary();
