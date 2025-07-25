const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database path - relative to backend directory
const DB_PATH = path.join(__dirname, '..', 'backend', 'database.sqlite');

// Initial sample data
const sampleApartments = [
  { id: 'A101', agency: 'Sunshine Properties', area: 85.5, price: 6.2, status: 'Còn trống' },
  { id: 'A102', agency: 'Green Valley Real Estate', area: 92.0, price: 7.1, status: 'Còn trống' },
  { id: 'A103', agency: 'City View Homes', area: 78.5, price: 5.8, status: 'Đã bán' },
  { id: 'B201', agency: 'Premium Living Group', area: 105.0, price: 8.5, status: 'Còn trống' },
  { id: 'B202', agency: 'Metro Properties', area: 98.5, price: 7.8, status: 'Đang Lock' },
  { id: 'B203', agency: 'Luxury Estates Ltd', area: 110.0, price: 9.2, status: 'Còn trống' },
  { id: 'C301', agency: 'Ocean View Realty', area: 125.0, price: 11.5, status: 'Còn trống' },
  { id: 'C302', agency: 'Skyline Properties', area: 100.0, price: 8.8, status: 'Đã bán' },
  { id: 'C303', agency: 'Golden Gate Homes', area: 85.0, price: 6.5, status: 'Còn trống' },
  { id: 'D401', agency: 'Royal Residence', area: 115.5, price: 9.8, status: 'Đang Lock' },
  { id: 'D402', agency: 'Diamond Estates', area: 130.0, price: 12.2, status: 'Còn trống' },
  { id: 'D403', agency: 'Elite Properties', area: 95.0, price: 7.9, status: 'Còn trống' },
  { id: 'PH501', agency: 'Penthouse Collection', area: 200.0, price: 25.5, status: 'Còn trống' },
  { id: 'PH502', agency: 'Luxury Living VIP', area: 180.5, price: 22.8, status: 'Đã bán' },
  { id: 'PH503', agency: 'Top Floor Estates', area: 220.0, price: 28.9, status: 'Còn trống' }
];

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
    INSERT OR REPLACE INTO apartments (id, agency, area, price, status)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  let processedCount = 0;
  const totalCount = sampleApartments.length;
  
  sampleApartments.forEach((apartment, index) => {
    db.run(insertSQL, [
      apartment.id,
      apartment.agency,
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
                const emoji = row.status === 'Còn trống' ? '🟢' : 
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
