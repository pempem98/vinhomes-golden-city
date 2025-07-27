require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const { SOCKET_EVENTS, API_ENDPOINTS, DATABASE, HTTP_STATUS } = require('./constants');
const { 
  verifyWebhookSignature, 
  validateApartmentData, 
  rateLimit, 
  securityHeaders 
} = require('./auth');

const app = express();
const server = http.createServer(app);

// Configure allowed origins from environment
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const allowedOrigins = [
  frontendUrl,
  "http://localhost:3000", 
  "http://192.168.31.205:3000",
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/, // Allow any 192.168.x.x:3000
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:3000$/, // Allow any 10.x.x.x:3000
  /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:3000$/ // Allow 172.16-31.x.x:3000
];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(securityHeaders);
app.use(rateLimit);
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Enhanced request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  console.log(`[${timestamp}] ${req.method} ${req.path} from ${ip}`);
  next();
});
app.use(express.json({ 
  charset: 'utf-8',
  limit: '10kb' // Limit request size
}));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// Database setup
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Set SQLite to use UTF-8 encoding
db.run("PRAGMA encoding = 'UTF-8'");
db.run("PRAGMA foreign_keys = ON");

// Initialize database table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS ${DATABASE.TABLE_NAME} (
    ${DATABASE.COLUMNS.ID} TEXT PRIMARY KEY,
    ${DATABASE.COLUMNS.AGENCY} TEXT,
    ${DATABASE.COLUMNS.AGENCY_SHORT} TEXT,
    ${DATABASE.COLUMNS.AREA} REAL,
    ${DATABASE.COLUMNS.PRICE} REAL,
    ${DATABASE.COLUMNS.STATUS} TEXT,
    ${DATABASE.COLUMNS.UPDATED_AT} DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Helper function to get all apartments sorted by updated_at DESC
const getAllApartments = () => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM ${DATABASE.TABLE_NAME} ORDER BY ${DATABASE.COLUMNS.UPDATED_AT} DESC`,
      [],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
};

// API Webhook Endpoint
app.post(API_ENDPOINTS.UPDATE_SHEET, verifyWebhookSignature, validateApartmentData, async (req, res) => {
  try {
    const { apartment_id, agency, area, price, status } = req.body;
    
    // Safe logging without sensitive data
    console.log(`Received authenticated update for apartment: ${apartment_id}`);
    
    // Insert or replace the apartment data
    db.run(
      `INSERT OR REPLACE INTO ${DATABASE.TABLE_NAME} (${DATABASE.COLUMNS.ID}, ${DATABASE.COLUMNS.AGENCY}, ${DATABASE.COLUMNS.AREA}, ${DATABASE.COLUMNS.PRICE}, ${DATABASE.COLUMNS.STATUS}, ${DATABASE.COLUMNS.UPDATED_AT})
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [apartment_id, agency, area, price, status],
      async function(err) {
        if (err) {
          console.error('Database error:', err.message); // Don't log full error details
          return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Database error' });
        }
        
        try {
          // Get all apartments and broadcast to clients
          const apartments = await getAllApartments();
          io.emit(SOCKET_EVENTS.APARTMENT_UPDATE, apartments);
          
          console.log(`Updated apartment ${apartment_id}, broadcasting to ${io.engine.clientsCount} clients`);
          res.json({ 
            success: true, 
            message: 'Data updated successfully',
            timestamp: new Date().toISOString()
          });
        } catch (fetchErr) {
          console.error('Error fetching apartments:', fetchErr.message);
          res.status(500).json({ error: 'Error fetching updated data' });
        }
      }
    );
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get(API_ENDPOINTS.HEALTH, (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Socket.IO connection handling
io.on(SOCKET_EVENTS.CONNECTION, async (socket) => {
  console.log('New client connected:', socket.id);
  
  try {
    // Send current apartment data to the newly connected client
    const apartments = await getAllApartments();
    socket.emit(SOCKET_EVENTS.APARTMENT_UPDATE, apartments);
    console.log(`Sent ${apartments.length} apartments to client ${socket.id}`);
  } catch (error) {
    console.error('Error sending initial data to client:', error);
  }
  
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible from any IP address on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
});
