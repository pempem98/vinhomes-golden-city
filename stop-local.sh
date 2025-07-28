#!/bin/bash

echo "🛑 Dừng Vinhomes Golden City Dashboard..."
echo "======================================="

# Kill processes on ports 3000 and 5000
echo "Đang tìm và dừng processes..."

# Find and kill processes on port 5000 (Backend)
BACKEND_PID=$(lsof -ti :5000)
if [ ! -z "$BACKEND_PID" ]; then
    kill -9 $BACKEND_PID
    echo "✅ Đã dừng Backend (Port 5000)"
else
    echo "ℹ️  Không tìm thấy process trên port 5000"
fi

# Find and kill processes on port 3000 (Frontend)
FRONTEND_PID=$(lsof -ti :3000)
if [ ! -z "$FRONTEND_PID" ]; then
    kill -9 $FRONTEND_PID
    echo "✅ Đã dừng Frontend (Port 3000)"
else
    echo "ℹ️  Không tìm thấy process trên port 3000"
fi

echo "✅ Hoàn tất!"
