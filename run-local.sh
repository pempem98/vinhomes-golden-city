#!/bin/bash

echo "🚀 Chạy Vinhomes Golden City Dashboard..."
echo "========================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Check if setup was run
if [ ! -f "backend/.env" ] || [ ! -f "frontend/.env" ]; then
    echo "⚠️  Environment files chưa được tạo. Chạy setup trước:"
    echo "./setup-local.sh"
    exit 1
fi

# Function to check if port is available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 đang được sử dụng. Vui lòng đóng process đang sử dụng port này."
        echo "Để kiểm tra: lsof -i :$1"
        return 1
    fi
    return 0
}

# Check ports
print_info "Kiểm tra ports..."
check_port 5000 || exit 1
check_port 3000 || exit 1
print_status "Ports available"

# Start backend in background
print_info "Khởi động Backend (Port 5000)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend in background  
print_info "Khởi động Frontend (Port 3000)..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

print_status "Ứng dụng đang chạy!"
echo ""
echo "📱 Truy cập:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:5000"
echo "- Health Check: http://localhost:5000/api/health"
echo ""
echo "🛑 Để dừng ứng dụng, nhấn Ctrl+C hoặc chạy:"
echo "./stop-local.sh"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    print_info "Đang dừng ứng dụng..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Đã dừng ứng dụng"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for processes
wait
