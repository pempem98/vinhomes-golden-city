const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const TEST_DURATION = 30 * 1000; // 30 seconds
const UPDATE_INTERVAL = 4000; // Update every 4 seconds

// Test apartments for animation
const apartments = [
  { apartment_id: 'A101', agency: 'Sunshine Properties', area: 85.5, price: 6.2 },
  { apartment_id: 'A102', agency: 'Green Valley Real Estate', area: 92.0, price: 7.1 },
  { apartment_id: 'A103', agency: 'City View Homes', area: 78.5, price: 5.8 },
  { apartment_id: 'B201', agency: 'Premium Living Group', area: 105.0, price: 8.5 },
  { apartment_id: 'B202', agency: 'Metro Properties', area: 98.5, price: 7.8 },
  { apartment_id: 'C301', agency: 'Ocean View Realty', area: 125.0, price: 11.5 },
  { apartment_id: 'D401', agency: 'Royal Residence', area: 115.5, price: 9.8 }
];

const statuses = ['Còn trống', 'Đang Lock', 'Đã bán'];
const statusEmojis = { 'Còn trống': '🟢', 'Đang Lock': '🟡', 'Đã bán': '🔴' };

// Test connectivity
async function testConnection() {
  try {
    await axios.get(`${BACKEND_URL}/api/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Send apartment update
async function sendUpdate(apartment) {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/update-sheet`, apartment);
    return response.status === 200;
  } catch (error) {
    console.error(`❌ Failed to update ${apartment.apartment_id}:`, error.message);
    return false;
  }
}

// Create random update
function createRandomUpdate() {
  const apartment = apartments[Math.floor(Math.random() * apartments.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const priceVariation = (Math.random() - 0.5) * 0.4; // ±0.2 billion variation
  
  return {
    ...apartment,
    status: status,
    price: Math.max(apartment.price + priceVariation, 1.0) // Minimum 1 billion
  };
}

// Main test function
async function runSlideTest() {
  console.log('🎯 Testing Slide Animation - Real-Time Dashboard');
  console.log('===============================================');
  console.log(`⏱️  Duration: ${TEST_DURATION/1000} seconds`);
  console.log(`🔄 Update interval: ${UPDATE_INTERVAL/1000} seconds`);
  console.log(`🏢 Test apartments: ${apartments.length} properties`);
  console.log('===============================================');
  console.log('📱 Watch http://localhost:3000 for smooth slide animations!');
  console.log('===============================================');

  const isConnected = await testConnection();
  if (!isConnected) {
    console.log('❌ Backend server is not running!');
    console.log('Please start the backend first:');
    console.log('   cd ../backend && node src/server.js');
    process.exit(1);
  }

  console.log('✅ Backend connected, starting slide animation test...');
  
  const startTime = Date.now();
  let updateCount = 0;

  const interval = setInterval(async () => {
    const elapsed = Date.now() - startTime;
    if (elapsed >= TEST_DURATION) {
      clearInterval(interval);
      console.log('\n🎉 Slide Animation Test Complete!');
      console.log(`📊 Total updates sent: ${updateCount}`);
      console.log('✨ Check your dashboard - the slide animation should be smooth and fast!');
      process.exit(0);
    }

    const apartment = createRandomUpdate();
    const success = await sendUpdate(apartment);
    
    if (success) {
      updateCount++;
      const remainingTime = Math.ceil((TEST_DURATION - elapsed) / 1000);
      const emoji = statusEmojis[apartment.status];
      console.log(`[${remainingTime}s] ${emoji} ${apartment.apartment_id} → ${apartment.status} | ${apartment.agency} | ${apartment.price.toFixed(1)} tỷ`);
    }
  }, UPDATE_INTERVAL);
}

runSlideTest().catch(error => {
  console.error('Error during slide test:', error.message);
  process.exit(1);
});
