# 🚀 Hướng dẫn chạy Vinhomes Golden City Dashboard (Môi trường thường)

## 📋 Yêu cầu hệ thống

- **Node.js** (phiên bản 16 trở lên)
- **npm** (đi kèm với Node.js)
- **Git** (tùy chọn)

## 🛠️ Cài đặt và chạy

### Bước 1: Kiểm tra Node.js
```bash
node --version
npm --version
```

### Bước 2: Cài đặt dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend  
```bash
cd frontend
npm install
```

#### Scripts (tùy chọn)
```bash
cd scripts
npm install
```

### Bước 3: Cấu hình Environment

#### Tạo file .env gốc
```bash
# Từ thư mục gốc
cp .env.example .env
```

#### Tạo file .env cho backend
```bash
cd backend
cp .env.example .env
```

#### Tạo file .env cho frontend
```bash
cd frontend  
cp .env.example .env
```

### Bước 4: Chỉnh sửa cấu hình

#### File `.env` (thư mục gốc):
```env
# Backend Configuration
BACKEND_PORT=6867
BACKEND_HOST=localhost

# Frontend Configuration
FRONTEND_PORT=3000
FRONTEND_HOST=localhost

# Database
DATABASE_PATH=./backend/database.sqlite

# Security (Tạo secret mới!)
HMAC_SECRET=your-secure-secret-here
API_SECRET=your-api-secret-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

#### File `backend/.env`:
```env
PORT=6867
NODE_ENV=development
HMAC_SECRET=your-secure-secret-here
API_SECRET=your-api-secret-here
DATABASE_PATH=./database.sqlite
FRONTEND_URL=http://localhost:3000
```

#### File `frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:6867
REACT_APP_API_TIMEOUT=10000
REACT_APP_POLL_INTERVAL=2000
```

### Bước 5: Tạo secret keys bảo mật
```bash
# Tạo HMAC_SECRET
node -e "console.log('HMAC_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Tạo API_SECRET
node -e "console.log('API_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### Bước 6: Khởi tạo database
```bash
cd scripts
npm run init-database
```

### Bước 7: Chạy ứng dụng

#### Mở 2 terminal/command prompt

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash  
cd frontend
npm start
```

## 🌐 Truy cập ứng dụng

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:6867
- **Health Check:** http://localhost:6867/api/health

## 🔧 Scripts hữu ích

### Database Management
```bash
cd scripts

# Khởi tạo database với dữ liệu mẫu
npm run init-database

# Khởi tạo an toàn (không xóa dữ liệu cũ)
npm run init-database-safe

# Simulate cập nhật real-time
npm run simulate:live
npm run simulate:status

# Xóa database
npm run clean
```

### Development
```bash
# Backend với auto-reload
cd backend
npm run dev

# Frontend với hot-reload
cd frontend
npm start

# Build production
cd frontend
npm run build
```

## 🔍 Troubleshooting

### Lỗi thường gặp

1. **Port đã được sử dụng:**
```bash
# Kiểm tra port 6867
netstat -ano | findstr :6867

# Kiểm tra port 3000  
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F

# Kill process (Linux/Mac)
kill -9 <PID>
```

2. **Database không tạo được:**
```bash
# Kiểm tra quyền ghi thư mục
ls -la backend/

# Tạo thư mục logs (nếu cần)
mkdir backend/logs
```

3. **CORS errors:**
- Kiểm tra `FRONTEND_URL` trong backend/.env
- Đảm bảo URL frontend đúng

4. **Module không tìm thấy:**
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

## 📱 Google Apps Script Setup

1. Mở Google Sheet của bạn
2. Đi tới **Extensions > Apps Script**
3. Copy code từ `google-apps-script/onEditTrigger.gs`
4. Cập nhật URL webhook:
```javascript
const WEBHOOK_URL = 'http://localhost:6867/api/update-sheet';
const HMAC_SECRET = 'your-hmac-secret-here';
```

## 🔒 Bảo mật Production

Khi deploy lên server thật:

1. **Thay đổi URLs:**
```env
REACT_APP_BACKEND_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com
```

2. **Tạo secrets mới:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. **Sử dụng HTTPS**
4. **Cấu hình firewall**

## 📦 Build Production

```bash
# Build frontend
cd frontend
npm run build

# Serve static files với backend
cd backend
npm start
```

Ứng dụng sẽ serve frontend build từ backend port 6867.

---

**Lưu ý:** Đây là hướng dẫn chạy local development. Để deploy production, xem thêm `setup-service.sh` và `SECURITY.md`.
