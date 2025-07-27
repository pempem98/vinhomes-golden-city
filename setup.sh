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

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Root .env file created"
fi

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
echo "⚠️ IMPORTANT SECURITY NOTES:"
echo "1. Update HMAC_SECRET and API_SECRET in your .env files with strong, unique secrets"
echo "2. Never commit .env files to version control"
echo "3. Use different secrets for development and production environments"
echo ""
echo "Next steps:"
echo "1. Edit .env, backend/.env, and frontend/.env files with your actual configuration"
echo "2. Add your background image to frontend/public/background.jpg"
echo "3. Set up your Google Apps Script with the secure code from google-apps-script/onEditTrigger-secure.gs"
echo "4. Update the WEBHOOK_URL in the Google Apps Script to match your backend URL"
echo "5. Initialize the database: cd scripts && npm install && npm run init-database"
echo "6. Start the backend: cd backend && npm run dev"
echo "7. Start the frontend: cd frontend && npm start"
echo ""
echo "📖 Read the README.md and SECURITY.md files for detailed instructions"
echo "🐳 For production deployment, see Docker configuration files and setup-ec2.sh"
