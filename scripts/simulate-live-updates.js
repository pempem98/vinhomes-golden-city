const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const SIMULATION_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds
const UPDATE_INTERVAL = 3000; // Update every 3 seconds

// Base apartment data
const apartments = [
  { apartment_id: 'A101', agency: 'Sunshine Properties', area: 85.5, price: 6.2 },
  { apartment_id: 'A102', agency: 'Green Valley Real Estate', area: 92.0, price: 7.1 },
  { apartment_id: 'A103', agency: 'City View Homes', area: 78.5, price: 5.8 },
  { apartment_id: 'B201', agency: 'Premium Living Group', area: 105.0, price: 8.5 },
  { apartment_id: 'B202', agency: 'Metro Properties', area: 98.5, price: 7.8 },
  { apartment_id: 'B203', agency: 'Luxury Estates Ltd', area: 110.0, price: 9.2 },
  { apartment_id: 'C301', agency: 'Ocean View Realty', area: 125.0, price: 11.5 },
  { apartment_id: 'C302', agency: 'Skyline Properties', area: 100.0, price: 8.8 },
  { apartment_id: 'C303', agency: 'Golden Gate Homes', area: 85.0, price: 6.5 },
  { apartment_id: 'D401', agency: 'Royal Residence', area: 115.5, price: 9.8 },
  { apartment_id: 'D402', agency: 'Diamond Estates', area: 130.0, price: 12.2 },
  { apartment_id: 'D403', agency: 'Elite Properties', area: 95.0, price: 7.9 },
  { apartment_id: 'PH501', agency: 'Penthouse Collection', area: 200.0, price: 25.5 },
  { apartment_id: 'PH502', agency: 'Luxury Living VIP', area: 180.5, price: 22.8 },
  { apartment_id: 'PH503', agency: 'Top Floor Estates', area: 220.0, price: 28.9 },
  { apartment_id: 'E101', agency: 'Garden View Properties', area: 88.5, price: 6.8 },
  { apartment_id: 'E102', agency: 'Riverside Homes', area: 95.0, price: 7.2 },
  { apartment_id: 'E103', agency: 'Mountain View Realty', area: 125.0, price: 10.2 },
  { apartment_id: 'F201', agency: 'Central Park Properties', area: 82.0, price: 5.8 },
  { apartment_id: 'F202', agency: 'Downtown Living', area: 78.5, price: 5.2 },
  { apartment_id: 'F203', agency: 'Urban Homes Group', area: 120.5, price: 8.5 }
];

// Status options
const statuses = ['Đã bán', 'Đang Lock', 'Còn trống'];

// Agency updates to simulate changes
const agencyUpdates = [
  'UPDATED - New Contact',
  'VIP Customer Service',
  'Premium Service',
  'EXCLUSIVE DEAL',
  '🔥 HOT PROPERTY',
  'LIMITED TIME OFFER',
  'PRICE REDUCED',
  'NEW LISTING',
  'JUST UPDATED',
  'FEATURED PROPERTY'
];

let updateCount = 0;
let startTime = Date.now();

console.log('🎬 Starting Live Simulation - Real-Time Apartment Dashboard');
console.log('='.repeat(60));
console.log(`⏱️  Duration: 2 minutes`);
console.log(`🔄 Update interval: ${UPDATE_INTERVAL/1000} seconds`);
console.log(`🏢 Apartments: ${apartments.length} properties`);
console.log('='.repeat(60));
console.log('📱 Open http://localhost:3000 to watch the live updates!');
console.log('='.repeat(60));

async function checkBackend() {
  try {
    await axios.get(`${BACKEND_URL}/api/health`);
    return true;
  } catch (error) {
    return false;
  }
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function simulateUpdate() {
  const currentTime = Date.now();
  const elapsed = currentTime - startTime;
  
  if (elapsed >= SIMULATION_DURATION) {
    console.log('\n🎉 Simulation Complete!');
    console.log(`📊 Total updates sent: ${updateCount}`);
    console.log('✨ Check your dashboard for the final state');
    process.exit(0);
  }
  
  try {
    // Pick a random apartment to update
    const apartment = getRandomElement(apartments);
    const newStatus = getRandomElement(statuses);
    
    // Sometimes update the agency name to show visual changes
    let agency = apartment.agency;
    if (Math.random() < 0.3) { // 30% chance to update agency
      const update = getRandomElement(agencyUpdates);
      agency = `${apartment.agency} - ${update}`;
    }
    
    // Sometimes slightly adjust price (±0.1-0.3 billion)
    let price = apartment.price;
    if (Math.random() < 0.2) { // 20% chance to adjust price
      const adjustment = (Math.random() - 0.5) * 0.6; // -0.3 to +0.3
      price = Math.max(1.0, apartment.price + adjustment);
      price = Math.round(price * 10) / 10; // Round to 1 decimal
    }
    
    const updateData = {
      apartment_id: apartment.apartment_id,
      agency: agency,
      area: apartment.area,
      price: price,
      status: newStatus
    };
    
    const response = await axios.post(`${BACKEND_URL}/api/update-sheet`, updateData, {
      headers: { 
        'Content-Type': 'application/json; charset=utf-8',
        'Accept-Charset': 'utf-8'
      }
    });
    
    updateCount++;
    const remaining = formatTime(SIMULATION_DURATION - elapsed);
    const statusEmoji = newStatus === 'Đã bán' ? '🔴' : newStatus === 'Đang Lock' ? '🟡' : '🟢';
    
    console.log(`[${remaining}] ${statusEmoji} ${apartment.apartment_id} → ${newStatus} | ${agency.substring(0, 25)}${agency.length > 25 ? '...' : ''} | ${price} tỷ`);
    
  } catch (error) {
    console.log(`❌ Update failed: ${error.message}`);
  }
}

async function startSimulation() {
  const backendRunning = await checkBackend();
  
  if (!backendRunning) {
    console.log('❌ Backend server is not running!');
    console.log('Please start the backend first:');
    console.log('   cd ../backend && node src/server.js');
    process.exit(1);
  }
  
  console.log('✅ Backend connected, starting simulation...\n');
  
  // Start the simulation loop
  const interval = setInterval(simulateUpdate, UPDATE_INTERVAL);
  
  // Cleanup after duration
  setTimeout(() => {
    clearInterval(interval);
  }, SIMULATION_DURATION + 1000);
}

// Handle Ctrl+C to stop simulation gracefully
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Simulation stopped by user');
  console.log(`📊 Updates sent: ${updateCount}`);
  process.exit(0);
});

startSimulation();
