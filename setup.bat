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

if not exist ".env" (
    copy ".env.example" ".env"
    echo ✅ Root .env file created
)

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
echo ⚠️ IMPORTANT SECURITY NOTES:
echo 1. Update HMAC_SECRET and API_SECRET in your .env files with strong, unique secrets
echo 2. Never commit .env files to version control
echo 3. Use different secrets for development and production environments
echo.
echo Next steps:
echo 1. Edit .env, backend\.env, and frontend\.env files with your actual configuration
echo 2. Add your background image to frontend/public/background.jpg
echo 3. Set up your Google Apps Script with the secure code from google-apps-script/onEditTrigger-secure.gs
echo 4. Update the WEBHOOK_URL in the Google Apps Script to match your backend URL
echo 5. Initialize the database: cd scripts ^&^& npm install ^&^& npm run init-database
echo 6. Start the backend: cd backend ^&^& npm run dev
echo 7. Start the frontend: cd frontend ^&^& npm start
echo.
echo 📖 Read the README.md and SECURITY.md files for detailed instructions
echo 🐳 For production deployment, see Docker configuration files and setup-ec2.sh
pause
