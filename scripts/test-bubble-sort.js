const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';

// Test bubble sort animation by updating a specific apartment
async function testBubbleSort() {
  console.log('🧪 Testing Bubble Sort Animation...\n');
  
  try {
    // Check if backend is running
    await axios.get(`${BACKEND_URL}/api/health`);
    console.log('✅ Backend server is running');
  } catch (error) {
    console.log('❌ Backend server is not running!');
    process.exit(1);
  }
  
  console.log('📊 Watch http://localhost:3000 to see the bubble sort effect!');
  console.log('='.repeat(60));
  
  // Test 1: Update apartment in middle of list
  console.log('🔄 Test 1: Updating F201 (should bubble up from position ~19)');
  await axios.post(`${BACKEND_URL}/api/update-sheet`, {
    apartment_id: 'F201',
    agency: 'Central Park Properties - 🎯 BUBBLE TEST 1',
    area: 82.0,
    price: 5.9,
    status: 'Đã bán'
  }, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
  
  await new Promise(resolve => setTimeout(resolve, 8000)); // Wait for animation
  
  // Test 2: Update apartment near bottom
  console.log('🔄 Test 2: Updating A103 (should bubble up from position ~18)');
  await axios.post(`${BACKEND_URL}/api/update-sheet`, {
    apartment_id: 'A103',
    agency: 'City View Homes - 🎯 BUBBLE TEST 2',
    area: 78.5,
    price: 6.1,
    status: 'Đang Lock'
  }, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
  
  await new Promise(resolve => setTimeout(resolve, 8000)); // Wait for animation
  
  // Test 3: Update apartment from middle
  console.log('🔄 Test 3: Updating D402 (should bubble up from position ~8)');
  await axios.post(`${BACKEND_URL}/api/update-sheet`, {
    apartment_id: 'D402',
    agency: 'Diamond Estates - 🎯 BUBBLE TEST 3',
    area: 130.0,
    price: 12.8,
    status: 'Còn trống'
  }, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
  
  console.log('\n✨ Bubble sort animation tests complete!');
  console.log('📈 Each apartment should have bubbled up to the top step by step');
}

testBubbleSort().catch(console.error);
