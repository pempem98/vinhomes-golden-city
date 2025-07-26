const crypto = require('crypto');

// Configuration
const CONFIG = {
  API_SECRET: process.env.WEBHOOK_SECRET || 'your-secret-key-here-change-this',
  ALLOWED_IPS: [
    // Google Apps Script IP ranges (cần update định kỳ)
    '64.18.0.0/20',
    '64.233.160.0/19',
    '66.102.0.0/20',
    '66.249.80.0/20',
    '72.14.192.0/18',
    '74.125.0.0/16',
    '108.177.8.0/21',
    '173.194.0.0/16',
    '207.126.144.0/20',
    '209.85.128.0/17',
    '216.58.192.0/19',
    '216.239.32.0/19'
  ],
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};

/**
 * Middleware để verify webhook signature
 */
function verifyWebhookSignature(req, res, next) {
  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];
  
  if (!signature || !timestamp) {
    return res.status(401).json({ error: 'Missing signature or timestamp' });
  }
  
  // Check timestamp to prevent replay attacks (5 minutes tolerance)
  const currentTime = Math.floor(Date.now() / 1000);
  const requestTime = parseInt(timestamp);
  
  if (Math.abs(currentTime - requestTime) > 300) {
    return res.status(401).json({ error: 'Request too old' });
  }
  
  // Verify signature
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', CONFIG.API_SECRET)
    .update(timestamp + payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
}

/**
 * Middleware để validate dữ liệu apartment
 */
function validateApartmentData(req, res, next) {
  const { apartment_id, agency, area, price, status } = req.body;
  
  // Validate required fields
  if (!apartment_id || typeof apartment_id !== 'string') {
    return res.status(400).json({ error: 'apartment_id is required and must be a string' });
  }
  
  if (!agency || typeof agency !== 'string') {
    return res.status(400).json({ error: 'agency is required and must be a string' });
  }
  
  // Validate numeric fields
  if (area !== undefined && (typeof area !== 'number' || area <= 0 || area > 1000)) {
    return res.status(400).json({ error: 'area must be a positive number less than 1000' });
  }
  
  if (price !== undefined && (typeof price !== 'number' || price <= 0 || price > 1000)) {
    return res.status(400).json({ error: 'price must be a positive number less than 1000' });
  }
  
  // Validate status
  const validStatuses = ['Sẵn hàng', 'Đang lock', 'Đã bán'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }
  
  // Sanitize strings
  req.body.apartment_id = apartment_id.trim().substring(0, 50);
  req.body.agency = agency.trim().substring(0, 100);
  if (req.body.status) {
    req.body.status = req.body.status.trim();
  }
  
  next();
}

/**
 * Simple rate limiting middleware
 */
const rateLimitStore = new Map();

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowStart = now - CONFIG.RATE_LIMIT.windowMs;
  
  // Clean old entries
  for (const [key, timestamps] of rateLimitStore.entries()) {
    rateLimitStore.set(key, timestamps.filter(time => time > windowStart));
    if (rateLimitStore.get(key).length === 0) {
      rateLimitStore.delete(key);
    }
  }
  
  // Check current IP
  const requests = rateLimitStore.get(ip) || [];
  const recentRequests = requests.filter(time => time > windowStart);
  
  if (recentRequests.length >= CONFIG.RATE_LIMIT.max) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);
  
  next();
}

/**
 * Security headers middleware
 */
function securityHeaders(req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'none'"
  });
  next();
}

module.exports = {
  CONFIG,
  verifyWebhookSignature,
  validateApartmentData,
  rateLimit,
  securityHeaders
};
