# Clear Database Script for Real-Time Apartment Dashboard
# This script clears all apartment data from the database

Write-Host "🗑️  Clear Database - Real-Time Apartment Dashboard" -ForegroundColor Red
Write-Host "=================================================" -ForegroundColor Red

$confirmation = Read-Host "Are you sure you want to clear ALL apartment data? (yes/no)"

if ($confirmation -eq "yes") {
    try {
        # Check if backend is running
        $healthCheck = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction Stop
        Write-Host "✅ Backend server is running" -ForegroundColor Green
        
        # Since we don't have a clear endpoint, we'll inform the user
        Write-Host "⚠️  No clear endpoint available." -ForegroundColor Yellow
        Write-Host "To clear the database, you can:" -ForegroundColor Yellow
        Write-Host "1. Stop the backend server" -ForegroundColor White
        Write-Host "2. Delete the database.sqlite file in the backend folder" -ForegroundColor White
        Write-Host "3. Restart the backend server (it will create a new empty database)" -ForegroundColor White
        Write-Host "4. Run the generate-sample-data.ps1 script to add fresh data" -ForegroundColor White
        
    } catch {
        Write-Host "❌ Backend server is not running" -ForegroundColor Red
        Write-Host "You can manually delete the database.sqlite file in the backend folder" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Operation cancelled" -ForegroundColor Yellow
}

Write-Host "=================================================" -ForegroundColor Red
