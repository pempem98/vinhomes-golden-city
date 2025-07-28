#!/bin/bash

echo "🏢 Vinhomes Golden City Dashboard - Local Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js không được cài đặt. Vui lòng cài đặt Node.js trước."
    exit 1
fi

print_status "Node.js version: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm không được cài đặt."
    exit 1
fi

print_status "npm version: $(npm --version)"

# Install dependencies
print_info "Cài đặt dependencies..."

# Backend
print_info "Cài đặt backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    print_error "Lỗi khi cài đặt backend dependencies"
    exit 1
fi
print_status "Backend dependencies đã cài đặt"
cd ..

# Frontend
print_info "Cài đặt frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    print_error "Lỗi khi cài đặt frontend dependencies"
    exit 1
fi
print_status "Frontend dependencies đã cài đặt"
cd ..

# Scripts
print_info "Cài đặt scripts dependencies..."
cd scripts
npm install
if [ $? -ne 0 ]; then
    print_error "Lỗi khi cài đặt scripts dependencies"
    exit 1
fi
print_status "Scripts dependencies đã cài đặt"
cd ..

# Create environment files
print_info "Tạo environment files..."

if [ ! -f ".env" ]; then
    cp .env.example .env
    print_status "Đã tạo .env từ .env.example"
else
    print_warning ".env đã tồn tại"
fi

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    print_status "Đã tạo backend/.env từ backend/.env.example"
else
    print_warning "backend/.env đã tồn tại"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    print_status "Đã tạo frontend/.env từ frontend/.env.example"
else
    print_warning "frontend/.env đã tồn tại"
fi

# Generate secrets
print_info "Tạo security secrets..."
HMAC_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
API_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Update .env files with secrets
sed -i.bak "s/your-secret-key-here-please-change-this-to-a-strong-secret/$HMAC_SECRET/g" .env
sed -i.bak "s/your-api-secret-here-please-change-this-to-a-strong-secret/$API_SECRET/g" .env
sed -i.bak "s/your-secret-key-here-please-change-this-to-a-strong-secret/$HMAC_SECRET/g" backend/.env
sed -i.bak "s/your-api-secret-here-please-change-this-to-a-strong-secret/$API_SECRET/g" backend/.env

print_status "Đã tạo security secrets tự động"

# Initialize database
print_info "Khởi tạo database..."
cd scripts
npm run init-database-safe
if [ $? -ne 0 ]; then
    print_warning "Không thể khởi tạo database, sẽ tạo khi chạy backend"
fi
cd ..

print_status "Setup hoàn tất!"
echo ""
print_info "Để chạy ứng dụng:"
echo "1. Mở terminal 1 và chạy: cd backend && npm run dev"
echo "2. Mở terminal 2 và chạy: cd frontend && npm start"
echo ""
print_info "Hoặc sử dụng script tự động:"
echo "./run-local.sh"
echo ""
print_info "Ứng dụng sẽ chạy tại:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:5000"
