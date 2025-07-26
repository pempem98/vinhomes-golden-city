const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const SIMULATION_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds
const UPDATE_INTERVAL = 1500; // Update every 1.5 seconds

// Status transition rules: Available → Lock → (Sold or Available), Sold = final
function getNextStatus(currentStatus) {
  if (currentStatus === 'Đã bán') {
    // Sold is final state - no changes
    return currentStatus;
  } else if (currentStatus === 'Sẵn sàng') {
    // Available can only go to Lock
    return Math.random() < 0.3 ? 'Đang lock' : 'Sẵn sàng'; // 30% chance to lock
  } else if (currentStatus === 'Đang lock') {
    // Lock can go to Sold or back to Available
    const rand = Math.random();
    if (rand < 0.25) return 'Đã bán';     // 25% chance to sell
    else if (rand < 0.6) return 'Sẵn sàng'; // 35% chance back to available
    else return 'Đang lock';              // 40% chance stay locked
  }
  
  return currentStatus;
}

// Function to get current apartments from backend
async function getCurrentApartments() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/apartments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching current apartments:', error.message);
    return [];
  }
}

// Function to update apartment status
async function updateApartmentStatus(apartment) {
  try {
    const response = await axios.put(`${BACKEND_URL}/api/apartments/${apartment.id}`, {
      agency: apartment.agency,
      area: apartment.area,
      price: apartment.price,
      status: apartment.status
    });
    
    if (response.status === 200) {
      console.log(`✅ Updated ${apartment.id}: ${apartment.status}`);
      return true;
    } else {
      console.log(`❌ Failed to update ${apartment.id}: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${apartment.id}:`, error.message);
    return false;
  }
}

// Function to simulate status changes for existing apartments
async function simulateStatusChanges() {
  try {
    // Get current apartments
    const currentApartments = await getCurrentApartments();
    
    if (currentApartments.length === 0) {
      console.log('❌ No apartments found. Please run init-database.js first.');
      return;
    }
    
    console.log(`🏠 Found ${currentApartments.length} existing apartments`);
    console.log('🔄 Starting status change simulation...');
    console.log(`⏱️ Duration: ${SIMULATION_DURATION / 1000} seconds`);
    console.log(`📈 Update interval: ${UPDATE_INTERVAL / 1000} seconds`);
    console.log('🎯 Only changing status - no apartments added/removed');
    console.log('─'.repeat(60));

    const startTime = Date.now();
    let updateCount = 0;
    let changeCount = 0;

    const intervalId = setInterval(async () => {
      // Check if simulation time is up
      if (Date.now() - startTime >= SIMULATION_DURATION) {
        clearInterval(intervalId);
        console.log('─'.repeat(60));
        console.log('🏁 Simulation completed!');
        console.log(`📊 Total updates: ${updateCount}`);
        console.log(`🔄 Total status changes: ${changeCount}`);
        console.log('💡 All apartments retained their original data except status');
        return;
      }

      // Get fresh apartment data
      const apartments = await getCurrentApartments();
      if (apartments.length === 0) return;

      // Select 1-3 random apartments to update status
      const numToUpdate = Math.floor(Math.random() * 3) + 1;
      const apartmentsToUpdate = [];
      
      for (let i = 0; i < numToUpdate; i++) {
        const randomIndex = Math.floor(Math.random() * apartments.length);
        const apartment = apartments[randomIndex];
        
        // Skip if already selected in this round
        if (apartmentsToUpdate.find(a => a.id === apartment.id)) continue;
        
        const oldStatus = apartment.status;
        const newStatus = getNextStatus(oldStatus);
        
        // Only update if status actually changes
        if (newStatus !== oldStatus) {
          apartmentsToUpdate.push({
            ...apartment,
            status: newStatus
          });
          changeCount++;
          
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          console.log(`[${elapsed}s] 🔄 ${apartment.id}: ${oldStatus} → ${newStatus}`);
        }
      }

      // Update the selected apartments
      for (const apartment of apartmentsToUpdate) {
        await updateApartmentStatus(apartment);
        updateCount++;
      }

      // Add some spacing for readability
      if (apartmentsToUpdate.length > 0) {
        console.log('');
      }
      
    }, UPDATE_INTERVAL);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      clearInterval(intervalId);
      console.log('\n🛑 Simulation stopped by user');
      console.log(`📊 Total updates: ${updateCount}`);
      console.log(`🔄 Total status changes: ${changeCount}`);
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Simulation error:', error.message);
  }
}

// Check if backend is accessible
async function checkBackend() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/apartments`);
    console.log('✅ Backend is accessible');
    return true;
  } catch (error) {
    console.error('❌ Cannot connect to backend:', error.message);
    console.log('💡 Make sure the backend server is running on http://localhost:5000');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🏠 Real Estate Dashboard - Status Change Simulator');
  console.log('═'.repeat(60));
  
  if (await checkBackend()) {
    await simulateStatusChanges();
  }
}

// Run the simulation
main().catch(console.error);
