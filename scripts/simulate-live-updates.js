const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const SIMULATION_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds
const UPDATE_INTERVAL = 1000; // Update every 1 second (faster updates!)

// Base apartment data with initial status tracking
const apartments = [
  { id: 'A101', agency: 'Sunshine Properties', area: 85.5, price: 6.2, status: 'Còn trống' },
  { id: 'A102', agency: 'Green Valley Real Estate', area: 92.0, price: 7.1, status: 'Còn trống' },
  { id: 'A103', agency: 'City View Homes', area: 78.5, price: 5.8, status: 'Còn trống' },
  { id: 'B201', agency: 'Premium Living Group', area: 105.0, price: 8.5, status: 'Còn trống' },
  { id: 'B202', agency: 'Metro Properties', area: 98.5, price: 7.8, status: 'Còn trống' },
  { id: 'B203', agency: 'Luxury Estates Ltd', area: 110.0, price: 9.2, status: 'Còn trống' },
  { id: 'C301', agency: 'Ocean View Realty', area: 125.0, price: 11.5, status: 'Còn trống' },
  { id: 'C302', agency: 'Skyline Properties', area: 100.0, price: 8.8, status: 'Còn trống' },
  { id: 'C303', agency: 'Golden Gate Homes', area: 85.0, price: 6.5, status: 'Còn trống' },
  { id: 'D401', agency: 'Royal Residence', area: 115.5, price: 9.8, status: 'Còn trống' },
  { id: 'D402', agency: 'Diamond Estates', area: 130.0, price: 12.2, status: 'Còn trống' },
  { id: 'D403', agency: 'Elite Properties', area: 95.0, price: 7.9, status: 'Còn trống' },
  { id: 'PH501', agency: 'Penthouse Collection', area: 200.0, price: 25.5, status: 'Còn trống' },
  { id: 'PH502', agency: 'Luxury Living VIP', area: 180.5, price: 22.8, status: 'Còn trống' },
  { id: 'PH503', agency: 'Top Floor Estates', area: 220.0, price: 28.9, status: 'Còn trống' },
  { id: 'E101', agency: 'Garden View Properties', area: 88.5, price: 6.8, status: 'Còn trống' },
  { id: 'E102', agency: 'Riverside Homes', area: 95.0, price: 7.2, status: 'Còn trống' },
  { id: 'E103', agency: 'Mountain View Realty', area: 125.0, price: 10.2, status: 'Còn trống' },
  { id: 'F201', agency: 'Central Park Properties', area: 82.0, price: 5.8, status: 'Còn trống' },
  { id: 'F202', agency: 'Downtown Living', area: 78.5, price: 5.2, status: 'Còn trống' },
  { id: 'F203', agency: 'Urban Homes Group', area: 120.5, price: 8.5, status: 'Còn trống' }
];

// Status transition rules: Available → Lock → (Sold or Available), Sold = final
function getNextStatus(currentStatus) {
  if (currentStatus === 'Đã bán') {
    // Sold is final state - no changes
    return currentStatus;
  } else if (currentStatus === 'Còn trống') {
    // Available can only go to Lock
    return Math.random() < 0.7 ? 'Đang Lock' : 'Còn trống'; // 70% chance to lock
  } else if (currentStatus === 'Đang Lock') {
    // Lock can go to Sold or back to Available
    const rand = Math.random();
    if (rand < 0.4) return 'Đã bán';     // 40% chance to sell
    else if (rand < 0.7) return 'Còn trống'; // 30% chance back to available
    else return 'Đang Lock';              // 30% chance stay locked
  }
  return currentStatus;
}

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
    // Filter apartments that can still change (not sold)
    const availableApartments = apartments.filter(apt => apt.status !== 'Đã bán');
    
    if (availableApartments.length === 0) {
      console.log('\n🏆 All apartments are sold! Ending simulation...');
      process.exit(0);
    }
    
    // Pick a random apartment to update (only from non-sold ones)
    const apartment = getRandomElement(availableApartments);
    const newStatus = getNextStatus(apartment.status);
    
    // Update the apartment's status in our local array
    apartment.status = newStatus;
    
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
      apartment.price = price; // Update local price too
    }
    
    const updateData = {
      apartment_id: apartment.id,
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
    const soldCount = apartments.filter(apt => apt.status === 'Đã bán').length;
    
    console.log(`[${remaining}] ${statusEmoji} ${apartment.id} → ${newStatus} | ${agency.substring(0, 25)}${agency.length > 25 ? '...' : ''} | ${price} tỷ (${soldCount}/${apartments.length} sold)`);
    
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
