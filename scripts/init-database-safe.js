const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database path - relative to backend directory
const DB_PATH = path.join(__dirname, '..', 'backend', 'database.sqlite');

// Function to generate agency short names
function getAgencyShortName(agencyName) {
  const shortNameMap = {
    'Sunshine Properties': 'SUN',
    'Green Valley Real Estate': 'GVR',
    'City View Homes': 'CVH',
    'Premium Living Group': 'PLG',
    'Metro Properties': 'MET',
    'Luxury Estates Ltd': 'LEL',
    'Ocean View Realty': 'OVR',
    'Skyline Properties': 'SKY',
    'Golden Gate Homes': 'GGH',
    'Royal Residence': 'RR',
    'Diamond Estates': 'DIA',
    'Elite Properties': 'ELI',
    'Penthouse Collection': 'PEN',
    'Luxury Living VIP': 'LLV',
    'Top Floor Estates': 'TFE',
    'Garden View Properties': 'GVP',
    'Riverside Homes': 'RH',
    'Mountain View Realty': 'MVR',
    'Central Park Properties': 'CPP',
    'Downtown Living': 'DL',
    'Urban Homes Group': 'UHG',
    'Riverside Luxury': 'RL',
    'Highland Properties': 'HP',
    'Bay Area Realty': 'BAR',
    'Emerald Estates': 'EME',
    'Crystal Properties': 'CRY',
    'Platinum Homes': 'PLT',
    'Silver Lake Realty': 'SLR',
    'Golden Tower Properties': 'GTP',
    'Sapphire Estates': 'SAP',
    'Pearl Harbor Homes': 'PHH',
    'Ruby Real Estate': 'RUB',
    'Jade Properties Group': 'JPG',
    'Opal Living Spaces': 'OLS',
    'Amber Residential': 'AMB',
    'Diamond Peak Realty': 'DPR'
  };
  
  return shortNameMap[agencyName] || agencyName.substring(0, 3).toUpperCase();
}

// Initial sample data
function generateApartments(count = 150) {
  const floors = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
  const agencies = [
    'Sunshine Properties', 'Green Valley Real Estate', 'City View Homes', 'Premium Living Group',
    'Metro Properties', 'Luxury Estates Ltd', 'Ocean View Realty', 'Skyline Properties',
    'Golden Gate Homes', 'Royal Residence', 'Diamond Estates', 'Elite Properties',
    'Penthouse Collection', 'Luxury Living VIP', 'Top Floor Estates', 'Garden View Properties',
    'Riverside Homes', 'Mountain View Realty', 'Central Park Properties', 'Downtown Living',
    'Urban Homes Group', 'Riverside Luxury', 'Highland Properties', 'Bay Area Realty',
    'Emerald Estates', 'Crystal Properties', 'Platinum Homes', 'Silver Lake Realty',
    'Golden Tower Properties', 'Sapphire Estates', 'Pearl Harbor Homes', 'Ruby Real Estate',
    'Jade Properties Group', 'Opal Living Spaces', 'Amber Residential', 'Diamond Peak Realty'
  ];
  const statuses = ['Sẵn sàng', 'Đang lock', 'Đã bán'];
  
  const apartments = [];
  
  for (let i = 0; i < count; i++) {
    const floorIndex = Math.floor(i / 10);
    const unitNumber = (i % 10) + 1;
    const floor = floors[floorIndex % floors.length];
    const unit = unitNumber.toString().padStart(2, '0');
    const aptNumber = floorIndex + 1;
    
    // Generate apartment ID in format like A101, B205, etc.
    const id = `${floor}${aptNumber.toString().padStart(2, '0')}${unit}`;
    
    // Random area between 45-250 sqm
    const area = Math.round((Math.random() * 205 + 45) * 10) / 10;
    
    // Price based on area with some randomness (80-200 per sqm)
    const pricePerSqm = Math.random() * 120 + 80; // 80-200k per sqm
    let price = Math.round((area * pricePerSqm / 1000) * 10) / 10; // Convert to billions
    
    // Add some premium for higher floors
    if (floorIndex >= 8) price *= 1.2; // 20% premium for floors 9+
    if (floorIndex >= 12) price *= 1.3; // Additional 30% for floors 13+
    
    price = Math.round(price * 10) / 10; // Round to 1 decimal
    
    // Random agency
    const agency = agencies[Math.floor(Math.random() * agencies.length)];
    const agencyShort = getAgencyShortName(agency);
    
    // Status distribution: 60% available, 25% locked, 15% sold
    let status;
    const statusRand = Math.random();
    if (statusRand < 0.6) status = 'Sẵn sàng';
    else if (statusRand < 0.85) status = 'Đang lock';
    else status = 'Đã bán';
    
    apartments.push({ id, agency, agency_short: agencyShort, area, price, status });
  }
  
  return apartments;
}

const sampleApartments = generateApartments(150);

console.log('🔄 Safe Database Initialization (Non-destructive)');
console.log('='.repeat(55));

// Ensure backend directory exists
const backendDir = path.dirname(DB_PATH);
if (!fs.existsSync(backendDir)) {
  console.log('📁 Creating backend directory...');
  fs.mkdirSync(backendDir, { recursive: true });
}

const dbExists = fs.existsSync(DB_PATH);
if (dbExists) {
  console.log('📊 Database file exists, will add/update data safely...');
} else {
  console.log('📊 Creating new database...');
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Database connection established');
});

// Create apartments table if it doesn't exist
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS apartments (
    id TEXT PRIMARY KEY,
    agency TEXT,
    agency_short TEXT,
    area REAL,
    price REAL,
    status TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.run(createTableSQL, (err) => {
  if (err) {
    console.error('❌ Error creating table:', err.message);
    process.exit(1);
  }
  console.log('🏢 Apartments table ready');
  
  // Insert or update sample data
  console.log('📝 Processing sample data...');
  
  const insertSQL = `
    INSERT OR REPLACE INTO apartments (id, agency, agency_short, area, price, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  let processedCount = 0;
  const totalCount = sampleApartments.length;
  
  sampleApartments.forEach((apartment, index) => {
    db.run(insertSQL, [
      apartment.id,
      apartment.agency,
      apartment.agency_short,
      apartment.area,
      apartment.price,
      apartment.status
    ], function(err) {
      if (err) {
        console.error(`❌ Error processing ${apartment.id}:`, err.message);
      } else {
        processedCount++;
        console.log(`✅ Processed: ${apartment.id} - ${apartment.agency} - ${apartment.status}`);
        
        // Check if all inserts are complete
        if (processedCount === totalCount) {
          console.log('\n📋 Database Summary:');
          console.log('='.repeat(50));
          
          // Get counts by status
          db.all(`
            SELECT status, COUNT(*) as count 
            FROM apartments 
            GROUP BY status
          `, (err, rows) => {
            if (err) {
              console.error('❌ Error getting summary:', err.message);
            } else {
              rows.forEach(row => {
                const emoji = row.status === 'Sẵn sàng' ? '🟢' : 
                             row.status === 'Đã bán' ? '🔴' : '🟡';
                console.log(`${emoji} ${row.status}: ${row.count} apartments`);
              });
              
              // Get total count
              db.get('SELECT COUNT(*) as total FROM apartments', (err, row) => {
                if (!err) {
                  console.log(`📊 Total: ${row.total} apartments`);
                }
                console.log(`💾 Database: ${DB_PATH}`);
                console.log('\n🎉 Safe database initialization complete!');
                console.log('🚀 Backend server can continue running');
                
                // Close database
                db.close((err) => {
                  if (err) {
                    console.error('❌ Error closing database:', err.message);
                  }
                  process.exit(0);
                });
              });
            }
          });
        }
      }
    });
  });
});
