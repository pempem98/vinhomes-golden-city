# 🔧 Environment Variables Quick Reference

## Required Configuration Files

```
📁 real-estate-app/
├── .env                    # Root environment variables
├── backend/.env           # Backend-specific variables  
└── frontend/.env          # Frontend-specific variables
```

## 🔑 Security Variables (REQUIRED)

### Generate Strong Secrets
```bash
# Generate 256-bit secrets
node -e "console.log('HMAC_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('API_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### Root .env
```env
# Security (REQUIRED for production)
HMAC_SECRET=64-character-hex-string
API_SECRET=64-character-hex-string

# Basic Configuration
BACKEND_PORT=5000
FRONTEND_PORT=3000
FRONTEND_URL=http://localhost:3000
DATABASE_PATH=./backend/database.sqlite
```

### Backend .env
```env
# Core Settings
PORT=5000
NODE_ENV=development
DATABASE_PATH=./database.sqlite

# Security (REQUIRED)
HMAC_SECRET=same-as-root-env
API_SECRET=same-as-root-env

# CORS
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Frontend .env
```env
# API Configuration
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_API_TIMEOUT=10000
REACT_APP_POLL_INTERVAL=2000

# Features
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_SOUND=false
```

## 🚀 Production Configuration

### For Production Deployment
```env
# Root .env (production)
NODE_ENV=production
HMAC_SECRET=production-secret-256-bit
API_SECRET=production-secret-256-bit
BACKEND_PORT=5000
FRONTEND_URL=https://your-domain.com
DATABASE_PATH=/app/data/database.sqlite

# Backend .env (production)
NODE_ENV=production
PORT=5000
HMAC_SECRET=production-secret-256-bit
API_SECRET=production-secret-256-bit
DATABASE_PATH=/app/data/database.sqlite
FRONTEND_URL=https://your-domain.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=50
LOG_LEVEL=warn

# Frontend .env (production)
REACT_APP_BACKEND_URL=https://api.your-domain.com
REACT_APP_API_TIMEOUT=15000
REACT_APP_POLL_INTERVAL=3000
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_SOUND=false
```

## 🔍 Variable Descriptions

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `HMAC_SECRET` | Signs webhook requests | 64-char hex | ✅ |
| `API_SECRET` | API authentication | 64-char hex | ✅ |
| `PORT` | Backend server port | 5000 | ❌ |
| `NODE_ENV` | Environment mode | development/production | ❌ |
| `DATABASE_PATH` | SQLite database file | ./database.sqlite | ❌ |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 | ❌ |
| `REACT_APP_BACKEND_URL` | Backend API endpoint | http://localhost:5000 | ❌ |
| `RATE_LIMIT_WINDOW_MS` | Rate limit time window | 60000 (1 min) | ❌ |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 | ❌ |
| `LOG_LEVEL` | Logging verbosity | info/warn/error | ❌ |

## ⚠️ Security Best Practices

1. **Never commit .env files** to version control
2. **Use different secrets** for development/production
3. **Generate new secrets** for each environment
4. **Rotate secrets** regularly
5. **Use strong, random secrets** (256-bit recommended)

## 🔧 Quick Setup Commands

```bash
# Copy environment templates
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Generate secrets and update .env files
node -e "console.log('HMAC_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('API_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../scripts && npm install

# Initialize database
cd scripts && npm run init-database

# Start development servers
cd ../backend && npm run dev &
cd ../frontend && npm start
```

## 🆘 Troubleshooting

### Common Issues:
- **CORS errors**: Check `FRONTEND_URL` matches actual frontend URL
- **Auth errors**: Verify `HMAC_SECRET` is identical in all configs
- **Port conflicts**: Change `PORT` values if ports are in use
- **Database errors**: Ensure write permissions for `DATABASE_PATH`

### Debug Commands:
```bash
# Check environment variables are loaded
node -e "require('dotenv').config(); console.log(process.env.HMAC_SECRET)"

# Test backend connection
curl http://localhost:5000/api/apartments

# Check frontend connection
curl http://localhost:3000
```
