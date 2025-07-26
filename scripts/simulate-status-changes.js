const axios = require('axios');
const crypto = require('crypto');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-secret-key-here-change-this';
const SIMULATION_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds
const UPDATE_INTERVAL = 1500; // Update every 1.5 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Generate HMAC signature for webhook security
 */
function generateSignature(timestamp, payload) {
  const message = timestamp + payload;
  return crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(message)
    .digest('hex');
}

/**
 * Send authenticated request to backend
 */
async function sendSecureRequest(data, retryCount = 0) {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payloadString = JSON.stringify(data);
    const signature = generateSignature(timestamp, payloadString);
    
    const options = {
      method: 'POST',
      url: `${BACKEND_URL}/api/update-sheet`,
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': timestamp,
        'User-Agent': 'SecureSimulator-StatusChanges/1.0'
      },
      data: data,
      timeout: 5000, // 5 second timeout
      validateStatus: (status) => status < 500 // Don't throw for 4xx errors
    };
    
    const response = await axios(options);
    
    if (response.status >= 200 && response.status < 300) {
      return { success: true, data: response.data };
    } else {
      console.warn(`⚠️ Backend returned ${response.status}: ${response.statusText}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      if (retryCount < MAX_RETRIES) {
        console.warn(`🔄 Connection failed, retrying in ${RETRY_DELAY}ms... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return sendSecureRequest(data, retryCount + 1);
      }
    }
    
    return { 
      success: false, 
      error: error.message || 'Unknown error',
      code: error.code
    };
  }
}

/**
 * Validate apartment data before sending
 */
function validateApartmentData(apartment) {
  const errors = [];
  
  if (!apartment.apartment_id || typeof apartment.apartment_id !== 'string') {
    errors.push('apartment_id is required and must be a string');
  }
  
  if (!apartment.agency || typeof apartment.agency !== 'string') {
    errors.push('agency is required and must be a string');
  }
  
  if (typeof apartment.area !== 'number' || apartment.area <= 0 || apartment.area > 1000) {
    errors.push('area must be a positive number less than 1000');
  }
  
  if (typeof apartment.price !== 'number' || apartment.price <= 0 || apartment.price > 1000) {
    errors.push('price must be a positive number less than 1000');
  }
  
  const validStatuses = ['Sẵn hàng', 'Đang lock', 'Đã bán'];
  if (!validStatuses.includes(apartment.status)) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}`);
  }
  
  return errors;
}

// Status transition rules: Available → Lock → (Sold or Available), Sold = final
function getNextStatus(currentStatus) {
  if (currentStatus === 'Đã bán') {
    // Final state - no changes
    return currentStatus;
  } else if (currentStatus === 'Sẵn hàng') {
    // Available can only go to Lock
    return Math.random() < 0.3 ? 'Đang lock' : 'Sẵn hàng'; // 30% chance to lock
  } else if (currentStatus === 'Đang lock') {
    // Lock can go to Sold or back to Available
    const rand = Math.random();
    if (rand < 0.25) return 'Đã bán';     // 25% chance to sell
    else if (rand < 0.6) return 'Sẵn hàng'; // 35% chance back to available
    else return 'Đang lock';              // 40% chance stay locked
  }
  
  return currentStatus;
}

// Function to get current apartments from backend (with authentication)
async function getCurrentApartments() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, { 
      timeout: 5000,
      headers: {
        'User-Agent': 'SecureSimulator-StatusChanges/1.0'
      }
    });
    
    // For simulation, we'll use mock data since we don't have a secure GET endpoint yet
    // In a real implementation, you'd want to add authentication to GET endpoints too
    return await getMockApartments();
    
  } catch (error) {
    console.error('Error fetching current apartments:', error.message);
    return [];
  }
}

// Mock apartments data for simulation (in real implementation, fetch from secure endpoint)
async function getMockApartments() {
  return [
    { 
      apartment_id: 'TH2-06', 
      agency: 'ELITE CAPITAL', 
      area: 85.5, 
      price: 6.2, 
      status: 'Sẵn hàng' 
    },
    { 
      apartment_id: 'TH8-54', 
      agency: 'TPLAND', 
      area: 120.0, 
      price: 8.5, 
      status: 'Đang lock' 
    },
    { 
      apartment_id: 'AS10-109', 
      agency: 'Vinsland', 
      area: 95.3, 
      price: 7.8, 
      status: 'Sẵn hàng' 
    },
    { 
      apartment_id: 'TH5A-22', 
      agency: 'CELLA', 
      area: 110.2, 
      price: 9.1, 
      status: 'Đang lock' 
    },
    { 
      apartment_id: 'TH6-148', 
      agency: 'Vietstarland', 
      area: 88.7, 
      price: 6.9, 
      status: 'Sẵn hàng' 
    },
    { 
      apartment_id: 'TH8A-196', 
      agency: 'VHS', 
      area: 102.5, 
      price: 8.2, 
      status: 'Đang lock' 
    },
    { 
      apartment_id: 'ĐLHH-77', 
      agency: 'Tân Thời Đại', 
      area: 76.8, 
      price: 5.8, 
      status: 'Sẵn hàng' 
    },
    { 
      apartment_id: 'ST-118', 
      agency: 'Trường Phát Land', 
      area: 125.4, 
      price: 9.7, 
      status: 'Đang lock' 
    },
    { 
      apartment_id: 'TH17-47', 
      agency: 'Thiên Phúc Group', 
      area: 91.2, 
      price: 7.3, 
      status: 'Sẵn hàng' 
    },
    { 
      apartment_id: 'AS8A-48', 
      agency: 'Thành Phát Land', 
      area: 108.9, 
      price: 8.8, 
      status: 'Đang lock' 
    }
  ];
}

// Function to simulate status changes for existing apartments
async function simulateStatusChanges() {
  try {
    // Get current apartments
    const currentApartments = await getCurrentApartments();
    
    if (currentApartments.length === 0) {
      console.log('❌ No apartments found for simulation.');
      return;
    }
    
    console.log(`🏠 Found ${currentApartments.length} apartments for simulation`);
    console.log('🔄 Starting secure status change simulation...');
    console.log(`⏱️ Duration: ${SIMULATION_DURATION / 1000} seconds`);
    console.log(`📈 Update interval: ${UPDATE_INTERVAL / 1000} seconds`);
    console.log(`🛡️ Security: HMAC-SHA256 authentication enabled`);
    console.log(`🌐 Backend URL: ${BACKEND_URL}`);
    console.log('🎯 Only changing status - no apartments added/removed');
    console.log('─'.repeat(60));

    const startTime = Date.now();
    let updateCount = 0;
    let successCount = 0;
    let errorCount = 0;
    let changeCount = 0;

    const intervalId = setInterval(async () => {
      // Check if simulation time is up
      if (Date.now() - startTime >= SIMULATION_DURATION) {
        clearInterval(intervalId);
        console.log('─'.repeat(60));
        console.log('🏁 Secure simulation completed!');
        console.log(`📊 Total updates: ${updateCount}`);
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Failed: ${errorCount}`);
        console.log(`🔄 Total status changes: ${changeCount}`);
        console.log(`📈 Success rate: ${updateCount > 0 ? ((successCount / updateCount) * 100).toFixed(1) : 0}%`);
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
        if (apartmentsToUpdate.find(a => a.apartment_id === apartment.apartment_id)) continue;
        
        const oldStatus = apartment.status;
        const newStatus = getNextStatus(oldStatus);
        
        // Only update if status actually changes
        if (newStatus !== oldStatus) {
          const updateData = {
            apartment_id: apartment.apartment_id,
            agency: apartment.agency,
            area: apartment.area,
            price: apartment.price,
            status: newStatus
          };
          
          // Validate data before adding to update queue
          const validationErrors = validateApartmentData(updateData);
          if (validationErrors.length === 0) {
            apartmentsToUpdate.push(updateData);
            changeCount++;
            
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            console.log(`[${elapsed}s] 🔄 ${apartment.apartment_id}: ${oldStatus} → ${newStatus}`);
          } else {
            console.log(`❌ Validation failed for ${apartment.apartment_id}: ${validationErrors.join(', ')}`);
            errorCount++;
          }
        }
      }

      // Update the selected apartments with authentication
      for (const apartmentData of apartmentsToUpdate) {
        const result = await sendSecureRequest(apartmentData);
        updateCount++;
        
        if (result.success) {
          successCount++;
          console.log(`✅ Securely updated ${apartmentData.apartment_id}: ${apartmentData.status}`);
        } else {
          errorCount++;
          console.log(`❌ Failed to update ${apartmentData.apartment_id}: ${result.error}`);
        }
      }

      // Add some spacing for readability
      if (apartmentsToUpdate.length > 0) {
        console.log('');
      }
      
    }, UPDATE_INTERVAL);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      clearInterval(intervalId);
      console.log('\\n🛑 Secure simulation stopped by user');
      console.log(`📊 Total updates: ${updateCount}`);
      console.log(`✅ Successful: ${successCount}`);
      console.log(`❌ Failed: ${errorCount}`);
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
    const response = await axios.get(`${BACKEND_URL}/api/health`, { 
      timeout: 5000,
      headers: {
        'User-Agent': 'SecureSimulator-StatusChanges/1.0'
      }
    });
    console.log('✅ Backend is accessible');
    return true;
  } catch (error) {
    console.error('❌ Cannot connect to backend:', error.message);
    console.log('💡 Make sure the backend server is running and accessible');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔒 Real Estate Dashboard - Secure Status Change Simulator');
  console.log('═'.repeat(60));
  
  // Check environment variables
  if (WEBHOOK_SECRET === 'your-secret-key-here-change-this') {
    console.warn('⚠️  WARNING: Using default webhook secret. Please set WEBHOOK_SECRET environment variable!');
  }
  
  // Check backend connectivity
  const isBackendReady = await checkBackend();
  if (!isBackendReady) {
    console.error('❌ Cannot connect to backend. Please ensure the server is running and accessible.');
    process.exit(1);
  }
  
  await simulateStatusChanges();
}

// Run the simulation
main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
