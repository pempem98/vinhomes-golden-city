const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database path - relative to backend directory
const DB_PATH = path.join(__dirname, '..', 'backend', 'database.sqlite');

// Initial sample data
const sampleApartments = [
  { apartment_id: 'A101', agency: 'Sunshine Properties', area: 85.5, price: 6.2, status: 'Còn trống' },
  { apartment_id: 'A102', agency: 'Green Valley Real Estate', area: 92.0, price: 7.1, status: 'Còn trống' },
  { apartment_id: 'A103', agency: 'City View Homes', area: 78.5, price: 5.8, status: 'Đã bán' },
  { apartment_id: 'B201', agency: 'Premium Living Group', area: 105.0, price: 8.5, status: 'Còn trống' },
  { apartment_id: 'B202', agency: 'Metro Properties', area: 98.5, price: 7.8, status: 'Đang Lock' },
  { apartment_id: 'B203', agency: 'Luxury Estates Ltd', area: 110.0, price: 9.2, status: 'Còn trống' },
  { apartment_id: 'C301', agency: 'Ocean View Realty', area: 125.0, price: 11.5, status: 'Còn trống' },
  { apartment_id: 'C302', agency: 'Skyline Properties', area: 100.0, price: 8.8, status: 'Đã bán' },
  { apartment_id: 'C303', agency: 'Golden Gate Homes', area: 85.0, price: 6.5, status: 'Còn trống' },
  { apartment_id: 'D401', agency: 'Royal Residence', area: 115.5, price: 9.8, status: 'Đang Lock' },
  { apartment_id: 'D402', agency: 'Diamond Estates', area: 130.0, price: 12.2, status: 'Còn trống' },
  { apartment_id: 'D403', agency: 'Elite Properties', area: 95.0, price: 7.9, status: 'Còn trống' },
  { apartment_id: 'PH501', agency: 'Penthouse Collection', area: 200.0, price: 25.5, status: 'Còn trống' },
  { apartment_id: 'PH502', agency: 'Luxury Living VIP', area: 180.5, price: 22.8, status: 'Đã bán' },
  { apartment_id: 'PH503', agency: 'Top Floor Estates', area: 220.0, price: 28.9, status: 'Còn trống' }
];

console.log('🏗️  Initializing Real Estate Database');
console.log('='.repeat(50));

// Ensure backend directory exists
const backendDir = path.dirname(DB_PATH);
if (!fs.existsSync(backendDir)) {
  console.log('📁 Creating backend directory...');
  fs.mkdirSync(backendDir, { recursive: true });
}

// Remove existing database if it exists
if (fs.existsSync(DB_PATH)) {
  console.log('🗑️  Removing existing database...');
  fs.unlinkSync(DB_PATH);
}

console.log('📊 Creating new database...');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error creating database:', err.message);
    process.exit(1);
  }
  console.log('✅ Database file created successfully');
});

// Create apartments table
const createTableSQL = `
  CREATE TABLE apartments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    apartment_id TEXT UNIQUE NOT NULL,
    agency TEXT NOT NULL,
    area REAL NOT NULL,
    price REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Còn trống', 'Đã bán', 'Đang Lock')),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.run(createTableSQL, (err) => {
  if (err) {
    console.error('❌ Error creating table:', err.message);
    process.exit(1);
  }
  console.log('🏢 Apartments table created successfully');
  
  // Insert sample data
  console.log('📝 Inserting sample data...');
  
  const insertSQL = `
    INSERT INTO apartments (apartment_id, agency, area, price, status)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  let insertedCount = 0;
  const totalCount = sampleApartments.length;
  
  sampleApartments.forEach((apartment, index) => {
    db.run(insertSQL, [
      apartment.apartment_id,
      apartment.agency,
      apartment.area,
      apartment.price,
      apartment.status
    ], function(err) {
      if (err) {
        console.error(`❌ Error inserting ${apartment.apartment_id}:`, err.message);
      } else {
        insertedCount++;
        console.log(`✅ Inserted: ${apartment.apartment_id} - ${apartment.agency} - ${apartment.status}`);
        
        // Check if all inserts are complete
        if (insertedCount === totalCount) {
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
              
              console.log(`📊 Total: ${totalCount} apartments`);
              console.log(`💾 Database: ${DB_PATH}`);
              console.log('\n🎉 Database initialization complete!');
              console.log('🚀 You can now start the backend server and simulate live updates');
            }
            
            // Close database
            db.close((err) => {
              if (err) {
                console.error('❌ Error closing database:', err.message);
              }
              process.exit(0);
            });
          });
        }
      }
    });
  });
});
