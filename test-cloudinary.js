console.log('=== Cloudinary Configuration Test ===');
console.log('This test checks if cloudinary environment variables are set.');
console.log('Note: This is a basic check. The actual upload will be tested when you create a facility.');

// Check if we're in the backend directory
try {
  const fs = require('fs');
  const path = require('path');
  
  // Try to read .env file
  const envPath = path.join(__dirname, 'backend', '.env');
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file found in backend directory');
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    let cloudName = 'NOT_FOUND';
    let apiKey = 'NOT_FOUND';
    let apiSecret = 'NOT_FOUND';
    
    lines.forEach(line => {
      if (line.startsWith('CLOUDINARY_CLOUD_NAME=')) {
        cloudName = line.split('=')[1] || 'EMPTY';
      }
      if (line.startsWith('CLOUDINARY_API_KEY=')) {
        apiKey = line.split('=')[1] ? 'SET' : 'EMPTY';
      }
      if (line.startsWith('CLOUDINARY_API_SECRET=')) {
        apiSecret = line.split('=')[1] ? 'SET' : 'EMPTY';
      }
    });
    
    console.log('Cloudinary configuration:');
    console.log('- CLOUDINARY_CLOUD_NAME:', cloudName);
    console.log('- CLOUDINARY_API_KEY:', apiKey);
    console.log('- CLOUDINARY_API_SECRET:', apiSecret);
    
    if (cloudName !== 'NOT_FOUND' && apiKey === 'SET' && apiSecret === 'SET') {
      console.log('✅ All cloudinary environment variables are configured!');
      console.log('📝 Next step: Try creating a facility with images to test the upload.');
    } else {
      console.log('❌ Some cloudinary environment variables are missing or empty.');
      console.log('📝 Please check your .env file and ensure all cloudinary credentials are set.');
    }
    
  } else {
    console.log('❌ .env file not found in backend directory');
    console.log('📝 Please run setup-env.bat to create the .env file');
  }
  
} catch (error) {
  console.error('Error reading .env file:', error.message);
}
