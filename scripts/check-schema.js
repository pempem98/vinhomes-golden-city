const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'backend', 'database.sqlite');

console.log('🔍 Checking Database Schema');
console.log('='.repeat(30));

const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Database connection established');
});

// Get table info
db.all("PRAGMA table_info(apartments)", (err, rows) => {
  if (err) {
    console.error('❌ Error getting table info:', err.message);
  } else if (rows.length === 0) {
    console.log('⚠️  Table "apartments" does not exist');
  } else {
    console.log('\n📋 Table Schema:');
    console.log('='.repeat(50));
    rows.forEach(row => {
      console.log(`${row.name} (${row.type}) - ${row.notnull ? 'NOT NULL' : 'NULL'} - ${row.pk ? 'PRIMARY KEY' : ''}`);
    });
  }
  
  // Get sample data
  db.all("SELECT * FROM apartments LIMIT 3", (err, rows) => {
    if (err) {
      console.error('❌ Error getting sample data:', err.message);
    } else {
      console.log('\n📝 Sample Data:');
      console.log('='.repeat(30));
      if (rows.length === 0) {
        console.log('No data found');
      } else {
        rows.forEach((row, index) => {
          console.log(`Record ${index + 1}:`, JSON.stringify(row, null, 2));
        });
      }
    }
    
    // Get total count
    db.get("SELECT COUNT(*) as count FROM apartments", (err, row) => {
      if (!err) {
        console.log(`\n📊 Total records: ${row.count}`);
      }
      
      db.close();
    });
  });
});
