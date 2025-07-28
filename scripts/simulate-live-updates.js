const axios = require('axios');
const crypto = require('crypto');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:6867';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-secret-key-here-change-this';
const SIMULATION_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds
const UPDATE_INTERVAL = 1000; // Update every 1 second
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
        'User-Agent': 'SecureSimulator-LiveUpdates/1.0'
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

// Function to generate apartments for simulation based on real Vinhomes Duong Kinh data
function generateApartments(count = 200) {
  // Real Vinhomes Duong Kinh zones and apartment codes
  const zones = ['Thiên Hà', 'Ánh Sao'];
  const apartmentCodes = [
    // Thiên Hà zone codes from real data
    'ST-118', 'ST-3X', 'ST-7X', 'TH15B-17', 'TH15B-19', 'TH17-27', 'TH17-31', 'TH17-47',
    'TH2-06', 'TH2-08', 'TH2-1X', 'TH2-2X', 'TH2-3X', 'TH2-4X', 'TH2-54', 'TH2-58',
    'TH2-5X', 'TH2-66', 'TH2-6X', 'TH3-10X', 'TH5-0X', 'TH5-70', 'TH5-74', 'TH5A-08',
    'TH5A-14', 'TH5A-22', 'TH5A-40', 'TH6-09', 'TH6-11', 'TH6-138', 'TH6-148', 'TH6-54',
    'TH6-7X', 'TH8-106', 'TH8-126', 'TH8-145', 'TH8-1X', 'TH8-23', 'TH8-2X', 'TH8-4X',
    'TH8-50', 'TH8-54', 'TH8-73', 'TH8-89', 'TH8-8X', 'TH8-8Y', 'TH8-91', 'TH8-92',
    'TH8A-151', 'TH8A-153', 'TH8A-166', 'TH8A-182', 'TH8A-19', 'TH8A-194', 'TH8A-196',
    'TH8A-210', 'TH8A-216', 'TH8A-43', 'TH8A-55', 'TH8A-9X', 'TH8A-218', 'TH8-82',
    'TH8-151', 'TH2-74', 'ĐLHH-77', 'TH8-94', 'TH5-46', 'TD-03', 'TH6-103', 'TH6-116',
    'ĐLHH-09', 'ĐLHH-27', 'TH2-46',
    // Ánh Sao zone codes
    'AS10-109', 'AS10-20', 'ĐLHH-98', 'AS8A-48'
  ];
  
  const propertyTypes = ['Shophouse', 'Song Lập', 'Liền kề', 'Đơn lập'];
  const constructionStatus = [
    'Thô', 'Xây sau 1.5 năm', 'Xây sau 18T', 'Xây sau 2 năm', 'Xây sau 18 tháng'
  ];
  
  const agencies = [
    'ELITE CAPITAL', 'TPLAND', 'Vinsland', 'CELLA', 'Vietstarland', 'VHS',
    'Tân Thời Đại', 'Trường Phát Land', 'Thiên Phúc Group', 'Thành Phát Land',
    'Tân Long', 'Tân Hương Phát', 'Southern Homes', 'Real Homes', 'QueenLand Group',
    'QTC', 'Phúc Lộc', 'Phú Gia Land', 'NOVASKY', 'Newway Realty',
    'New Star Land', 'MICC Group', 'MGVN', 'MD Land', 'Mayhomes',
    'Joy Homes', 'Home Plus', 'HD Homes', 'GALAXY', 'Future Homes',
    'Five Star', 'Eternity Group', 'Đông Tây Land', 'Đông Đô Land', 'Đất Việt',
    'BigHomes Group', 'ATD Homes', 'An Holding', 'AHS', 'One Housing'
  ];
  
  // Updated statuses to match backend validation
  const statuses = ['Sẵn hàng', 'Đang lock', 'Đã bán'];
  const apartments = [];
  const usedIds = new Set();
  
  for (let i = 0; i < count; i++) {
    let apartmentId;
    let attempts = 0;
    
    // Use real apartment codes first, then generate similar ones
    if (i < apartmentCodes.length) {
      apartmentId = apartmentCodes[i];
    } else {
      // Generate similar codes based on patterns
      do {
        const zone = zones[Math.floor(Math.random() * zones.length)];
        const baseCode = apartmentCodes[Math.floor(Math.random() * apartmentCodes.length)];
        const randomNum = Math.floor(Math.random() * 999) + 1;
        apartmentId = baseCode.replace(/\\d+/g, String(randomNum).padStart(2, '0'));
        attempts++;
      } while (usedIds.has(apartmentId) && attempts < 100);
      
      if (attempts >= 100) {
        apartmentId = `VH${String(i + 1).padStart(3, '0')}`;
      }
    }
    
    usedIds.add(apartmentId);
    
    // Generate realistic area and price based on real Vinhomes data
    const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    const constructionType = constructionStatus[Math.floor(Math.random() * constructionStatus.length)];
    
    // Real area ranges from Vinhomes data
    let area;
    let basePrice;
    
    if (propertyType === 'Shophouse') {
      area = Math.round((Math.random() * 95 + 75) * 10) / 10; // 75-170 m²
      basePrice = Math.random() * 15 + 8; // 8-23 tỷ
    } else if (propertyType === 'Đơn lập') {
      area = Math.round((Math.random() * 83 + 247) * 10) / 10; // 247-330 m²
      basePrice = Math.random() * 20 + 20; // 20-40 tỷ
    } else if (propertyType === 'Song Lập') {
      area = Math.round((Math.random() * 68 + 162) * 10) / 10; // 162-230 m²
      basePrice = Math.random() * 10 + 14; // 14-24 tỷ
    } else { // Liền kề
      area = Math.round((Math.random() * 55 + 65) * 10) / 10; // 65-120 m²
      basePrice = Math.random() * 4 + 6; // 6-10 tỷ
    }
    
    // Add construction status premium
    if (constructionType.includes('Xây sau')) {
      basePrice *= 0.85; // Slight discount for future construction
    }
    
    const price = Math.round(basePrice * 100) / 100;
    const agency = agencies[Math.floor(Math.random() * agencies.length)];
    const agencyShort = getAgencyShortName(agency);
    const zone = i < 70 ? 'Thiên Hà' : 'Ánh Sao'; // Most properties in Thiên Hà
    
    // Status distribution: 60% available, 25% locked, 15% sold
    let status;
    const statusRand = Math.random();
    if (statusRand < 0.6) status = 'Sẵn hàng';
    else if (statusRand < 0.85) status = 'Đang lock';
    else status = 'Đã bán';
    
    apartments.push({
      apartment_id: apartmentId, // Updated field name
      zone: zone,
      propertyType: propertyType,
      constructionStatus: constructionType,
      agency: agency,
      agency_short: agencyShort,
      area: area,
      price: price,
      status: status
    });
  }
  
  return apartments;
}

// Generate 200 apartments for simulation
const apartments = generateApartments(200);

// Status transition rules: Available → Lock → (Sold or Available), Sold = final
function getNextStatus(currentStatus) {
  if (currentStatus === 'Đã bán') {
    // Final state - no changes
    return currentStatus;
  } else if (currentStatus === 'Sẵn hàng') {
    // Available can only go to Lock
    return Math.random() < 0.7 ? 'Đang lock' : 'Sẵn hàng'; // 70% chance to lock
  } else if (currentStatus === 'Đang lock') {
    // Lock can go to Sold or back to Available
    const rand = Math.random();
    if (rand < 0.4) return 'Đã bán';     // 40% chance to sell
    else if (rand < 0.7) return 'Sẵn hàng'; // 30% chance back to available
    else return 'Đang lock';              // 30% chance stay locked
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
let successCount = 0;
let errorCount = 0;
let startTime = Date.now();

console.log('🔒 Secure Live Simulation - Real-Time Apartment Dashboard');
console.log('='.repeat(60));
console.log(`⏱️  Duration: 2 minutes`);
console.log(`🔄 Update interval: ${UPDATE_INTERVAL/1000} seconds`);
console.log(`🏢 Apartments: ${apartments.length} properties`);
console.log(`🛡️  Security: HMAC-SHA256 authentication enabled`);
console.log(`🌐 Backend URL: ${BACKEND_URL}`);
console.log('='.repeat(60));
console.log('📱 Open http://localhost:3000 to watch the live updates!');
console.log('='.repeat(60));

async function checkBackend() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 5000 });
    console.log('✅ Backend health check passed');
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
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
    console.log('\\n🎉 Simulation Complete!');
    console.log(`📊 Total updates sent: ${updateCount}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📈 Success rate: ${updateCount > 0 ? ((successCount / updateCount) * 100).toFixed(1) : 0}%`);
    console.log('✨ Check your dashboard for the final state');
    process.exit(0);
  }
  
  try {
    // Filter apartments that can still change (not final status)
    const availableApartments = apartments.filter(apt => 
      apt.status !== 'Đã bán'
    );
    
    if (availableApartments.length === 0) {
      console.log('\\n🏆 All apartments are sold! Ending simulation...');
      process.exit(0);
    }
    
    // Pick a random apartment to update (only from changeable ones)
    const apartment = getRandomElement(availableApartments);
    const newStatus = getNextStatus(apartment.status);
    
    // Update the apartment's status in our local array
    apartment.status = newStatus;
    
    // Sometimes update the agency name to show visual changes
    let agency = apartment.agency;
    if (Math.random() < 0.3) { // 30% chance to update agency
      const update = getRandomElement(agencyUpdates);
      agency = `${apartment.agency} - ${update}`;
      // Limit length to prevent validation errors
      if (agency.length > 100) {
        agency = agency.substring(0, 97) + '...';
      }
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
      apartment_id: apartment.apartment_id,
      agency: agency,
      area: apartment.area,
      price: price,
      status: newStatus
    };
    
    // Validate data before sending
    const validationErrors = validateApartmentData(updateData);
    if (validationErrors.length > 0) {
      console.log(`❌ Validation failed for ${apartment.apartment_id}: ${validationErrors.join(', ')}`);
      errorCount++;
      return;
    }
    
    const result = await sendSecureRequest(updateData);
    updateCount++;
    
    if (result.success) {
      successCount++;
      const remaining = formatTime(SIMULATION_DURATION - elapsed);
      const statusEmoji = newStatus === 'Đã bán' ? '🔴' : newStatus === 'Đang lock' ? '🟡' : '🟢';
      const finalCount = apartments.filter(apt => apt.status === 'Đã bán').length;
      
      console.log(`[${remaining}] ${statusEmoji} ${apartment.apartment_id} → ${newStatus} | ${agency.substring(0, 25)}${agency.length > 25 ? '...' : ''} | ${price} tỷ (${finalCount}/${apartments.length} sold)`);
    } else {
      errorCount++;
      console.log(`❌ Update failed for ${apartment.apartment_id}: ${result.error}`);
    }
    
  } catch (error) {
    errorCount++;
    console.log(`❌ Unexpected error: ${error.message}`);
  }
}

// Function to generate agency short names
function getAgencyShortName(agencyName) {
  const shortNameMap = {
    'ELITE CAPITAL': 'ELITE',
    'TPLAND': 'TPL',
    'Vinsland': 'VIN',
    'CELLA': 'CEL',
    'Vietstarland': 'VSL',
    'VHS': 'VHS',
    'Tân Thời Đại': 'TTĐ',
    'Trường Phát Land': 'TPL',
    'Thiên Phúc Group': 'TPG',
    'Thành Phát Land': 'TḾL',
    'Tân Long': 'TL',
    'Tân Hương Phát': 'THP',
    'Southern Homes': 'SH',
    'Real Homes': 'RH',
    'QueenLand Group': 'QLG',
    'QTC': 'QTC',
    'Phúc Lộc': 'PL',
    'Phú Gia Land': 'PGL',
    'NOVASKY': 'NOV',
    'Newway Realty': 'NWR',
    'New Star Land': 'NSL',
    'MICC Group': 'MIC',
    'MGVN': 'MGV',
    'MD Land': 'MDL',
    'Mayhomes': 'MAY',
    'Joy Homes': 'JOY',
    'Home Plus': 'HP',
    'HD Homes': 'HDH',
    'GALAXY': 'GAL',
    'Future Homes': 'FH',
    'Five Star': 'FS',
    'Eternity Group': 'ETG',
    'Đông Tây Land': 'ĐTL',
    'Đông Đô Land': 'ĐĐL',
    'Đất Việt': 'ĐV',
    'BigHomes Group': 'BHG',
    'ATD Homes': 'ATD',
    'An Holding': 'AH',
    'AHS': 'AHS',
    'One Housing': 'OH'
  };
  
  return shortNameMap[agencyName] || agencyName.substring(0, 3).toUpperCase();
}

// Main execution
async function main() {
  console.log('🔒 Starting Secure Live Updates Simulation...');
  
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
  
  // Start simulation
  const intervalId = setInterval(simulateUpdate, UPDATE_INTERVAL);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\\n🛑 Simulation stopped by user');
    console.log(`📊 Total updates: ${updateCount}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    clearInterval(intervalId);
    process.exit(0);
  });
}

// Run the simulation
main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
