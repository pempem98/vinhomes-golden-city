require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Database = require('better-sqlite3');
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
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:6868";
const allowedOrigins = [
  frontendUrl,
  "http://localhost:3000",
  "http://localhost:6868", 
  /^http:\/\/.*/, // Allow all IPs and ports temporarily
  /^https:\/\/.*/ // Allow all HTTPS
];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Set server timeout to 30 seconds
server.timeout = 30000;

// Port configuration
const PORT = process.env.PORT || 6867;

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
const db = new Database(dbPath);

// Set SQLite to use UTF-8 encoding and enable foreign keys
db.pragma('encoding = UTF8');
db.pragma('foreign_keys = ON');

// Initialize database table
db.exec(`CREATE TABLE IF NOT EXISTS ${DATABASE.TABLE_NAME} (
  ${DATABASE.COLUMNS.ID} TEXT PRIMARY KEY,
  ${DATABASE.COLUMNS.AGENCY} TEXT,
  ${DATABASE.COLUMNS.AGENCY_SHORT} TEXT,
  ${DATABASE.COLUMNS.AREA} REAL,
  ${DATABASE.COLUMNS.PRICE} REAL,
  ${DATABASE.COLUMNS.STATUS} TEXT,
  ${DATABASE.COLUMNS.UPDATED_AT} DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Helper function to get all apartments sorted by updated_at DESC
const getAllApartments = () => {
  const stmt = db.prepare(`SELECT * FROM ${DATABASE.TABLE_NAME} ORDER BY ${DATABASE.COLUMNS.UPDATED_AT} DESC`);
  return stmt.all();
};

// API Webhook Endpoint
app.post(API_ENDPOINTS.UPDATE_SHEET, verifyWebhookSignature, validateApartmentData, async (req, res) => {
  try {
    const { apartment_id, agency, area, price, status } = req.body;
    
    // Safe logging without sensitive data
    console.log(`Received authenticated update for apartment: ${apartment_id}`);
    
    // Insert or replace the apartment data
    const stmt = db.prepare(
      `INSERT OR REPLACE INTO ${DATABASE.TABLE_NAME} (${DATABASE.COLUMNS.ID}, ${DATABASE.COLUMNS.AGENCY}, ${DATABASE.COLUMNS.AREA}, ${DATABASE.COLUMNS.PRICE}, ${DATABASE.COLUMNS.STATUS}, ${DATABASE.COLUMNS.UPDATED_AT})
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    );
    
    try {
      stmt.run(apartment_id, agency, area, price, status);
      
      // Get all apartments and broadcast to clients
      const apartments = getAllApartments();
      io.emit(SOCKET_EVENTS.APARTMENT_UPDATE, apartments);
      
      console.log(`Updated apartment ${apartment_id}, broadcasting to ${io.engine.clientsCount} clients`);
      res.json({ 
        success: true, 
        message: 'Data updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (dbErr) {
      console.error('Database error:', dbErr.message); // Don't log full error details
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Database error' });
    }
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
    const apartments = getAllApartments();
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
  try {
    db.close();
    console.log('Database connection closed.');
  } catch (err) {
    console.error('Error closing database:', err);
  }
  process.exit(0);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Vinhomes Golden City Server running on port ${PORT}`);
  console.log(`🌐 Server accessible from any IP address on port ${PORT}`);
  console.log(`🔌 WebSocket server ready for connections`);
  console.log(`🔑 Webhook Secret: ${process.env.WEBHOOK_SECRET || 'default-secret-key'}`);
  console.log(`🎯 Frontend URL: ${frontendUrl}`);
  console.log(`✅ CORS: All origins allowed (development mode)`);
});
