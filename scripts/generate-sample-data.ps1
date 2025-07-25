# Sample Data Generator for Real-Time Apartment Dashboard
# This script populates the database with sample apartment data

Write-Host "🏢 Real-Time Apartment Dashboard - Sample Data Generator" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Check if backend is running
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Backend server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server is not running. Please start it first:" -ForegroundColor Red
    Write-Host "   cd backend && node src/server.js" -ForegroundColor Yellow
    exit 1
}

# Sample apartment data
$sampleApartments = @(
    # Building A - Standard Apartments
    @{apartment_id="A101"; agency="Sunshine Properties"; area=85.5; price=6.2; status="Đã bán"},
    @{apartment_id="A102"; agency="Green Valley Real Estate"; area=92.0; price=7.1; status="Đang Lock"},
    @{apartment_id="A103"; agency="City View Homes"; area=78.5; price=5.8; status="Còn trống"},
    @{apartment_id="A104"; agency="Dream Home Realty"; area=89.0; price=6.7; status="Đã bán"},
    @{apartment_id="A105"; agency="Smart Living Group"; area=83.5; price=6.0; status="Đang Lock"},

    # Building B - Mid-tier Apartments  
    @{apartment_id="B201"; agency="Premium Living Group"; area=105.0; price=8.5; status="Đã bán"},
    @{apartment_id="B202"; agency="Metro Properties"; area=98.5; price=7.8; status="Đang Lock"},
    @{apartment_id="B203"; agency="Luxury Estates Ltd"; area=110.0; price=9.2; status="Còn trống"},
    @{apartment_id="B204"; agency="Modern Homes Co"; area=103.5; price=8.3; status="Đã bán"},
    @{apartment_id="B205"; agency="Elite Living Spaces"; area=107.0; price=8.9; status="Đang Lock"},

    # Building C - High-end Apartments
    @{apartment_id="C301"; agency="Ocean View Realty"; area=125.0; price=11.5; status="Đã bán"},
    @{apartment_id="C302"; agency="Skyline Properties"; area=95.0; price=7.5; status="Đang Lock"},
    @{apartment_id="C303"; agency="Golden Gate Homes"; area=88.0; price=6.8; status="Còn trống"},
    @{apartment_id="C304"; agency="Prestige Properties"; area=118.0; price=10.8; status="Đã bán"},
    @{apartment_id="C305"; agency="Horizon Real Estate"; area=132.0; price=12.5; status="Đang Lock"},

    # Building D - Luxury Apartments
    @{apartment_id="D401"; agency="Royal Residence"; area=115.5; price=9.8; status="Đã bán"},
    @{apartment_id="D402"; agency="Diamond Estates"; area=102.5; price=8.2; status="Đang Lock"},
    @{apartment_id="D403"; agency="Elite Properties"; area=120.0; price=10.5; status="Còn trống"},
    @{apartment_id="D404"; agency="Crown Properties"; area=128.0; price=11.8; status="Đã bán"},
    @{apartment_id="D405"; agency="Platinum Homes"; area=135.0; price=13.2; status="Đang Lock"},

    # Penthouse Collection
    @{apartment_id="PH501"; agency="Penthouse Collection"; area=200.0; price=25.5; status="Đã bán"},
    @{apartment_id="PH502"; agency="Luxury Living VIP"; area=180.5; price=22.8; status="Đang Lock"},
    @{apartment_id="PH503"; agency="Top Floor Estates"; area=220.0; price=28.9; status="Còn trống"},
    @{apartment_id="PH504"; agency="Sky Villa Properties"; area=195.0; price=24.8; status="Đã bán"},
    @{apartment_id="PH505"; agency="Executive Penthouse"; area=210.0; price=27.5; status="Đang Lock"},

    # Building E - Economic Range
    @{apartment_id="E101"; agency="Garden View Properties"; area=82.0; price=5.9; status="Đã bán"},
    @{apartment_id="E102"; agency="Riverside Homes"; area=87.5; price=6.5; status="Đang Lock"},
    @{apartment_id="E103"; agency="Mountain View Realty"; area=75.0; price=5.2; status="Còn trống"},
    @{apartment_id="E104"; agency="Valley Homes"; area=79.5; price=5.6; status="Đã bán"},
    @{apartment_id="E105"; agency="Fresh Air Properties"; area=84.0; price=6.1; status="Đang Lock"},

    # Building F - Business District
    @{apartment_id="F201"; agency="Central Park Properties"; area=108.0; price=8.8; status="Đã bán"},
    @{apartment_id="F202"; agency="Downtown Living"; area=94.5; price=7.3; status="Đang Lock"},
    @{apartment_id="F203"; agency="Urban Homes Group"; area=101.0; price=8.1; status="Còn trống"},
    @{apartment_id="F204"; agency="City Center Realty"; area=112.0; price=9.5; status="Đã bán"},
    @{apartment_id="F205"; agency="Metropolitan Homes"; area=99.5; price=7.9; status="Đang Lock"}
)

Write-Host "📊 Preparing to add $($sampleApartments.Count) sample apartments..." -ForegroundColor Yellow

$successCount = 0
$failCount = 0

foreach ($apartment in $sampleApartments) {
    $jsonBody = $apartment | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/update-sheet" -Method POST -Body $jsonBody -ContentType "application/json" -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($apartment.apartment_id) - $($apartment.agency) [$($apartment.status)]" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "⚠️  $($apartment.apartment_id) - Unexpected status: $($response.StatusCode)" -ForegroundColor Yellow
            $failCount++
        }
    } catch {
        Write-Host "❌ $($apartment.apartment_id) - Failed: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
    
    # Small delay to avoid overwhelming the server
    Start-Sleep -Milliseconds 150
}

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "🎉 Sample data generation complete!" -ForegroundColor Cyan
Write-Host "   ✅ Successfully added: $successCount apartments" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "   ❌ Failed to add: $failCount apartments" -ForegroundColor Red
}
Write-Host "   📊 Total apartments in database: $($successCount)" -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 Open your browser to view the dashboard:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000" -ForegroundColor Blue
Write-Host "=================================================" -ForegroundColor Cyan
