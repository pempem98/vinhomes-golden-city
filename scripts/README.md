# Real Estate Dashboard - Scripts

Thư mục này chứa các utility scripts để quản lý database và simulation cho Real Estate Dashboard.

## 📋 Scripts có sẵn

### 1. 🏗️ Database Initialization
- **`init-database.js`** - Khởi tạo database với dữ liệu mẫu
- **Cross-platform support** - Chạy được trên Windows, Linux, và macOS

### 2. 🎬 Live Updates Simulation  
- **`simulate-live-updates.js`** - Mô phỏng cập nhật real-time với tạo căn hộ mới
- **`simulate-status-changes.js`** - Chỉ thay đổi trạng thái căn hộ hiện có (không thêm/xóa)
- **Automatic updates** - Tự động gửi updates trong khoảng thời gian nhất định

## 🚀 Cách sử dụng

### Windows (PowerShell)
```powershell
# Cài đặt dependencies
.\scripts.ps1 install

# Khởi tạo database
.\scripts.ps1 init

# Mô phỏng live updates (cần backend server chạy trước)
.\scripts.ps1 simulate

# Xóa database
.\scripts.ps1 clean

# Xem trợ giúp
.\scripts.ps1 help
```

### Linux/macOS (Bash)
```bash
# Cấp quyền thực thi (chỉ cần làm 1 lần)
chmod +x scripts.sh

# Cài đặt dependencies
./scripts.sh install

# Khởi tạo database
./scripts.sh init

# Mô phỏng live updates (cần backend server chạy trước)
./scripts.sh simulate

# Xóa database
./scripts.sh clean

# Xem trợ giúp
./scripts.sh help
```

### Node.js trực tiếp
```bash
# Cài đặt dependencies
npm install

# Khởi tạo database
npm run init

# Mô phỏng live updates (tạo căn hộ mới)
npm run simulate

# Mô phỏng thay đổi trạng thái (chỉ đổi status)
npm run simulate:status

# Xóa database
npm run clean
```

## 📊 Database Schema

Database sẽ được tạo với bảng `apartments`:

```sql
CREATE TABLE apartments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  apartment_id TEXT UNIQUE NOT NULL,
  agency TEXT NOT NULL,
  area REAL NOT NULL,
  price REAL NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Còn trống', 'Đã bán', 'Đang Lock')),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## 🎯 Workflow khuyến nghị

1. **Khởi tạo database**
   ```bash
   # Windows
   .\scripts.ps1 init
   
   # Linux/macOS  
   ./scripts.sh init
   ```

2. **Chạy backend server** (terminal mới)
   ```bash
   cd ../backend
   npm start
   ```

3. **Chạy frontend** (terminal mới)
   ```bash
   cd ../frontend
   npm start
   ```

4. **Mô phỏng live updates** (terminal mới)
   ```bash
   # Windows - Full simulation (adds new apartments)
   cd scripts
   .\scripts.ps1 simulate
   
   # Windows - Status changes only (no new apartments)
   .\scripts.ps1 simulate:status
   
   # Linux/macOS - Full simulation
   cd scripts
   ./scripts.sh simulate
   
   # Linux/macOS - Status changes only  
   ./scripts.sh simulate:status
   ```

## 🔄 Simulation Types

### 1. **Full Simulation** (`simulate`)
- Tạo căn hộ mới và cập nhật trạng thái
- Thích hợp để test với dữ liệu lớn
- Duration: 2 phút, interval: 1 giây

### 2. **Status Change Simulation** (`simulate:status`) 
- **Chỉ thay đổi trạng thái căn hộ hiện có**
- **Không thêm hoặc xóa căn hộ nào**
- Thích hợp để test UI với dữ liệu ổn định
- Duration: 2 phút, interval: 1.5 giây
- Transition rules:
  - `Còn trống` → `Đang Lock` (30% chance)
  - `Đang Lock` → `Đã bán` (25%) hoặc `Còn trống` (35%)
  - `Đã bán` → No changes (final state)

## 📁 File Structure

```
scripts/
├── init-database.js       # Database initialization script
├── simulate-live-updates.js  # Live updates simulation
├── scripts.ps1          # Windows PowerShell wrapper
├── scripts.sh           # Linux/macOS bash wrapper
├── package.json         # Dependencies và npm scripts
└── README.md           # Tài liệu này
```

## 🔧 Dependencies

- **axios** - HTTP client cho việc gửi requests
- **sqlite3** - SQLite database driver
- **Node.js** >= 14.0.0

## 📝 Notes

- Database file sẽ được tạo tại `../backend/database.sqlite`
- Simulation sẽ gửi updates đến `http://localhost:3001/api/update-sheet`
- Mỗi update sẽ thay đổi ngẫu nhiên status, agency name, hoặc price
- Script tự động dừng sau 2 phút hoặc khi nhấn Ctrl+C

## 🐛 Troubleshooting

### Backend không chạy
```
❌ Backend server is not running!
```
**Giải pháp:** Đảm bảo backend server đang chạy trên port 3001

### Database không tạo được
```
❌ Error creating database
```
**Giải pháp:** Kiểm tra quyền ghi file trong thư mục backend

### Dependencies thiếu
```
❌ Node.js is not installed!
```
**Giải pháp:** Cài đặt Node.js từ https://nodejs.org/
