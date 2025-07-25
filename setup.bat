@echo off
echo 🏢 Setting up Real-Time Apartment Ranking Dashboard...
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ NPM version:
npm --version

REM Install backend dependencies
echo.
echo 📦 Installing backend dependencies...
cd backend
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo ✅ Backend dependencies installed successfully

REM Install frontend dependencies
echo.
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo ✅ Frontend dependencies installed successfully

REM Copy environment files
echo.
echo ⚙️ Setting up environment files...
cd ..

if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo ✅ Backend .env file created
)

if not exist "frontend\.env" (
    copy "frontend\.env.example" "frontend\.env"
    echo ✅ Frontend .env file created
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Add your background image to frontend/public/background.jpg
echo 2. Set up your Google Apps Script with the code from google-apps-script/onEditTrigger.gs
echo 3. Update the WEBHOOK_URL in the Google Apps Script
echo 4. Start the backend: cd backend ^&^& npm run dev
echo 5. Start the frontend: cd frontend ^&^& npm start
echo.
echo 📖 Read the README.md file for detailed instructions
pause
