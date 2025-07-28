const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Database path - relative to backend directory
const DB_PATH = path.join(__dirname, '..', 'backend', 'database.sqlite');

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
    'Thành Phát Land': 'TML',
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

// Initial sample data based on real Vinhomes Duong Kinh data
function generateApartments(count = 150) {
  const zones = ['Thiên Hà', 'Ánh Sao'];
  const apartmentCodes = [
    'ST-118', 'ST-3X', 'ST-7X', 'TH15B-17', 'TH15B-19', 'TH17-27', 'TH17-31', 'TH17-47',
    'TH2-06', 'TH2-08', 'TH2-1X', 'TH2-2X', 'TH2-3X', 'TH2-4X', 'TH2-54', 'TH2-58',
    'TH2-5X', 'TH2-66', 'TH2-6X', 'TH3-10X', 'TH5-0X', 'TH5-70', 'TH5-74', 'TH5A-08',
    'TH5A-14', 'TH5A-22', 'TH5A-40', 'TH6-09', 'TH6-11', 'TH6-138', 'TH6-148', 'TH6-54',
    'TH6-7X', 'TH8-106', 'TH8-126', 'TH8-145', 'TH8-1X', 'TH8-23', 'TH8-2X', 'TH8-4X',
    'TH8-50', 'TH8-54', 'TH8-73', 'TH8-89', 'TH8-8X', 'TH8-8Y', 'TH8-91', 'TH8-92',
    'TH8A-151', 'TH8A-153', 'TH8A-166', 'TH8A-182', 'TH8A-19', 'TH8A-194', 'TH8A-196',
    'TH8A-210', 'TH8A-216', 'TH8A-43', 'TH8A-55', 'TH8A-9X', 'TH8A-218', 'TH8-82',
    'AS10-109', 'AS10-20', 'ĐLHH-98', 'AS8A-48', 'ĐLHH-77', 'TH8-94', 'TD-03'
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
        const baseCode = apartmentCodes[Math.floor(Math.random() * apartmentCodes.length)];
        const randomNum = Math.floor(Math.random() * 999) + 1;
        apartmentId = baseCode.replace(/\d+/g, String(randomNum).padStart(2, '0'));
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
    const zone = i < 50 ? 'Thiên Hà' : 'Ánh Sao';
    
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
    
    // Status distribution: 60% available, 25% locked, 15% sold
    let status;
    const statusRand = Math.random();
    if (statusRand < 0.6) status = 'Sẵn hàng';
    else if (statusRand < 0.85) status = 'Đang lock';
    else status = 'Đã bán';
    
    apartments.push({ 
      id: apartmentId, 
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

const sampleApartments = generateApartments(150);

console.log('🏗️  Initializing Vinhomes Golden City Database');
console.log('='.repeat(50));

// Function to check if database is in use
function isDatabaseInUse() {
  if (!fs.existsSync(DB_PATH)) return false;
  
  try {
    // Try to open the database file with exclusive access
    const fd = fs.openSync(DB_PATH, 'r+');
    fs.closeSync(fd);
    return false;
  } catch (error) {
    return error.code === 'EBUSY' || error.code === 'ENOENT';
  }
}

// Check if database is currently in use
if (fs.existsSync(DB_PATH) && isDatabaseInUse()) {
  console.log('⚠️  Database appears to be in use by another process.');
  console.log('   This usually means the backend server is running.');
  console.log('   Please stop the backend server first, then run this script again.');
  console.log('');
  console.log('   Steps:');
  console.log('   1. Stop backend server (Ctrl+C in backend terminal)');
  console.log('   2. Run this script again');
  process.exit(1);
}

// Ensure backend directory exists
const backendDir = path.dirname(DB_PATH);
if (!fs.existsSync(backendDir)) {
  console.log('📁 Creating backend directory...');
  fs.mkdirSync(backendDir, { recursive: true });
}

// Remove existing database if it exists
if (fs.existsSync(DB_PATH)) {
  console.log('🗑️  Removing existing database...');
  try {
    fs.unlinkSync(DB_PATH);
    console.log('✅ Existing database removed');
  } catch (error) {
    if (error.code === 'EBUSY') {
      console.log('⚠️  Database is currently in use. Please stop the backend server first.');
      console.log('   Then run this script again.');
      process.exit(1);
    } else {
      console.error('❌ Error removing database:', error.message);
      process.exit(1);
    }
  }
}

console.log('📊 Creating new database...');

const db = new Database(DB_PATH);

// Create apartments table with new fields
const createTableSQL = `
  CREATE TABLE apartments (
    id TEXT PRIMARY KEY,
    zone TEXT,
    propertyType TEXT,
    constructionStatus TEXT,
    agency TEXT,
    agency_short TEXT,
    area REAL,
    price REAL,
    status TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

try {
  // Create table
  db.exec(createTableSQL);
  console.log('🏢 Apartments table created successfully');
  
  // Insert sample data
  console.log('📝 Inserting sample data...');
  
  const insertSQL = `
    INSERT INTO apartments (id, zone, propertyType, constructionStatus, agency, agency_short, area, price, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const insert = db.prepare(insertSQL);
  
  let insertedCount = 0;
  const totalCount = sampleApartments.length;
  
  for (const apartment of sampleApartments) {
    try {
      insert.run([
        apartment.id,
        apartment.zone,
        apartment.propertyType,
        apartment.constructionStatus,
        apartment.agency,
        apartment.agency_short,
        apartment.area,
        apartment.price,
        apartment.status
      ]);
      insertedCount++;
      console.log(`✅ Inserted: ${apartment.id} - ${apartment.zone} - ${apartment.propertyType} - ${apartment.status}`);
    } catch (err) {
      console.error(`❌ Error inserting ${apartment.id}:`, err.message);
    }
  }
  
  console.log('\n📋 Database Summary:');
  console.log('='.repeat(50));
  
  // Get counts by status
  const statusCounts = db.prepare(`
    SELECT status, COUNT(*) as count 
    FROM apartments 
    GROUP BY status
  `).all();
  
  statusCounts.forEach(row => {
    const emoji = row.status === 'Sẵn hàng' ? '🟢' : 
                 row.status === 'Đã bán' ? '🔴' : '🟡';
    console.log(`${emoji} ${row.status}: ${row.count} apartments`);
  });
  
  console.log(`📊 Total: ${totalCount} apartments`);
  console.log(`💾 Database: ${DB_PATH}`);
  console.log('\n🎉 Database initialization complete!');
  console.log('🚀 You can now start the backend server and simulate live updates');
  
  db.close();
  
} catch (error) {
  console.error('❌ Error during database initialization:', error.message);
  if (db) db.close();
  process.exit(1);
}
