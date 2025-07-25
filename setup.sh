#!/bin/bash

echo "🏢 Setting up Real-Time Apartment Ranking Dashboard..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Copy environment files
echo ""
echo "⚙️ Setting up environment files..."
cd ..

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Backend .env file created"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Frontend .env file created"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Add your background image to frontend/public/background.jpg"
echo "2. Set up your Google Apps Script with the code from google-apps-script/onEditTrigger.gs"
echo "3. Update the WEBHOOK_URL in the Google Apps Script"
echo "4. Start the backend: cd backend && npm run dev"
echo "5. Start the frontend: cd frontend && npm start"
echo ""
echo "📖 Read the README.md file for detailed instructions"
