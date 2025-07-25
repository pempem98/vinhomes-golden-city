const fs = require('fs');
const axios = require('axios');
const path = require('path');

const BACKEND_URL = 'http://localhost:5000';
const SAMPLE_DATA_FILE = path.join(__dirname, 'sample-data.json');

async function loadSampleData() {
  console.log('🏢 Loading sample apartment data...\n');
  
  try {
    // Check if backend is running
    await axios.get(`${BACKEND_URL}/api/health`);
    console.log('✅ Backend server is running');
  } catch (error) {
    console.log('❌ Backend server is not running. Please start it first:');
    console.log('   cd backend && node src/server.js\n');
    process.exit(1);
  }
  
  try {
    // Read sample data
    const sampleData = JSON.parse(fs.readFileSync(SAMPLE_DATA_FILE, 'utf8'));
    console.log(`📊 Found ${sampleData.length} apartments to add\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const apartment of sampleData) {
      try {
        const response = await axios.post(`${BACKEND_URL}/api/update-sheet`, apartment, {
          headers: { 
            'Content-Type': 'application/json; charset=utf-8',
            'Accept-Charset': 'utf-8'
          }
        });
        
        if (response.status === 200) {
          console.log(`✅ ${apartment.apartment_id} - ${apartment.agency} [${apartment.status}]`);
          successCount++;
        } else {
          console.log(`⚠️  ${apartment.apartment_id} - Unexpected status: ${response.status}`);
          failCount++;
        }
      } catch (error) {
        console.log(`❌ ${apartment.apartment_id} - Failed: ${error.message}`);
        failCount++;
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n=================================================');
    console.log('🎉 Sample data loading complete!');
    console.log(`   ✅ Successfully added: ${successCount} apartments`);
    if (failCount > 0) {
      console.log(`   ❌ Failed to add: ${failCount} apartments`);
    }
    console.log(`   📊 Total processed: ${successCount + failCount} apartments`);
    console.log('\n🌐 Open your browser to view the dashboard:');
    console.log('   http://localhost:3000');
    console.log('=================================================');
    
  } catch (error) {
    console.log(`❌ Error reading sample data file: ${error.message}`);
    process.exit(1);
  }
}

// Check if axios is available
try {
  require.resolve('axios');
} catch (e) {
  console.log('❌ axios is required but not installed.');
  console.log('Please install it by running: npm install axios');
  process.exit(1);
}

loadSampleData().catch(console.error);
