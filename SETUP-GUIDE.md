# 📋 Setup Guide - Real-Time Apartment Dashboard

## 🚀 Quick Start

### Prerequisites
- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **Git** (optional, for version control)

### 1. Automatic Setup

For **Linux/Mac users**:
```bash
chmod +x setup.sh
./setup.sh
```

For **Windows users**:
```cmd
setup.bat
```

### 2. Manual Setup (if automatic setup fails)

#### Step 1: Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install

# Scripts dependencies  
cd ../scripts
npm install
```

#### Step 2: Environment Configuration
```bash
# Create environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

#### Step 3: Configure Environment Variables

**Root `.env` file:**
```env
# Security Configuration (REQUIRED)
HMAC_SECRET=your-secret-key-here-please-change-this-to-a-strong-secret
API_SECRET=your-api-secret-here-please-change-this-to-a-strong-secret

# Backend Configuration
BACKEND_PORT=5000
DATABASE_PATH=./backend/database.sqlite

# Frontend Configuration  
FRONTEND_URL=http://localhost:3000
REACT_APP_BACKEND_URL=http://localhost:5000
```

**Backend `.env` file:**
```env
PORT=5000
NODE_ENV=development
HMAC_SECRET=your-secret-key-here-please-change-this-to-a-strong-secret
API_SECRET=your-api-secret-here-please-change-this-to-a-strong-secret
DATABASE_PATH=./database.sqlite
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env` file:**
```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_API_TIMEOUT=10000
REACT_APP_POLL_INTERVAL=2000
```

### 3. Security Configuration

⚠️ **CRITICAL SECURITY STEPS:**

1. **Generate Strong Secrets:**
   ```bash
   # Generate HMAC_SECRET (256-bit)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Generate API_SECRET (256-bit)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Update Environment Files:**
   - Replace `your-secret-key-here-please-change-this-to-a-strong-secret` with generated secrets
   - Use different secrets for development and production
   - Never commit `.env` files to version control

### 4. Database Initialization

```bash
# Initialize database with sample data
cd scripts
npm run init-database

# Or for safe initialization (existing data preserved)
npm run init-database-safe
```

### 5. Google Apps Script Setup

1. **Open Google Apps Script:**
   - Go to [script.google.com](https://script.google.com)
   - Create a new project

2. **Add the Secure Code:**
   - Copy code from `google-apps-script/onEditTrigger-secure.gs`
   - Paste into your Google Apps Script project

3. **Configure Webhook URL:**
   ```javascript
   const WEBHOOK_URL = 'http://your-server-url:5000/api/webhook';
   const HMAC_SECRET = 'your-hmac-secret-here';
   ```

4. **Set up Trigger:**
   - Go to Triggers in the left sidebar
   - Add trigger for `onEdit` function
   - Choose "On edit" event type

### 6. Start the Application

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm start
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :5000  # or :3000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **CORS errors:**
   - Check `FRONTEND_URL` in backend `.env`
   - Ensure frontend URL matches the allowed origins

3. **Database errors:**
   - Check `DATABASE_PATH` in `.env` files
   - Ensure write permissions to database directory

4. **Authentication errors:**
   - Verify `HMAC_SECRET` matches in all configurations
   - Check Google Apps Script webhook URL

### Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | 5000 | No |
| `NODE_ENV` | Environment mode | development | No |
| `HMAC_SECRET` | HMAC signing secret | - | **Yes** |
| `API_SECRET` | API authentication secret | - | **Yes** |
| `DATABASE_PATH` | SQLite database path | ./database.sqlite | No |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 | No |
| `REACT_APP_BACKEND_URL` | Backend URL for frontend | http://localhost:5000 | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 60000 | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 | No |

## 🐳 Production Deployment

For production deployment, see:
- `Docker` configuration files (Dockerfile.backend, Dockerfile.frontend, docker-compose.yml)
- `setup-ec2.sh` for automated EC2 deployment
- `SECURITY.md` for security best practices

## 📚 Additional Resources

- **Security Guide:** [SECURITY.md](./SECURITY.md)
- **Status Updates:** [STATUS-UPDATE.md](./STATUS-UPDATE.md)
- **Docker Deployment:** [docker-compose.yml](./docker-compose.yml)
- **API Documentation:** Check backend/src/constants.js for API endpoints

## 🆘 Getting Help

If you encounter issues:

1. Check the console logs (both backend and frontend)
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Check firewall/network settings
5. Review the security configuration

For development issues, check:
- Browser developer tools
- Backend server logs
- Google Apps Script execution logs
