console.log('=== Validation Debug Helper ===');
console.log('This script helps debug validation issues.');
console.log('');

console.log('🔍 Common causes of "undefined validation error":');
console.log('');
console.log('1. Frontend FormData issues:');
console.log('   - Missing required fields');
console.log('   - Incorrect field names');
console.log('   - JSON stringification problems');
console.log('');
console.log('2. Backend validation issues:');
console.log('   - parseFormData middleware not working');
console.log('   - Validation rules not matching data');
console.log('   - Missing environment variables');
console.log('');
console.log('3. Mongoose schema issues:');
console.log('   - Required fields missing');
console.log('   - Data type mismatches');
console.log('   - Nested object validation');
console.log('');

console.log('📋 To debug this issue:');
console.log('');
console.log('1. Open browser console (F12)');
console.log('2. Go to http://localhost:5173/owner/facilities/new');
console.log('3. Fill out the form and submit');
console.log('4. Check both browser console AND backend console');
console.log('5. Look for these specific error messages:');
console.log('   - "Validation failed"');
console.log('   - "parseFormData" logs');
console.log('   - "CREATE FACILITY START" logs');
console.log('   - Specific field validation errors');
console.log('');

console.log('🔧 Quick fixes to try:');
console.log('');
console.log('1. Check if all required fields are filled:');
console.log('   - Facility name (2-100 characters)');
console.log('   - Description (10-1000 characters)');
console.log('   - Street address (required)');
console.log('   - City (required)');
console.log('   - State (required)');
console.log('   - Zip code (required)');
console.log('   - Phone (10 digits)');
console.log('   - Email (valid format)');
console.log('   - At least one sport selected');
console.log('   - Base price (positive number)');
console.log('');
console.log('2. Check backend console for detailed logs');
console.log('3. Check browser network tab for API response');
console.log('');

console.log('📞 If you need more help, please share:');
console.log('- The exact error message from browser console');
console.log('- The backend console logs');
console.log('- The network response from browser dev tools');



