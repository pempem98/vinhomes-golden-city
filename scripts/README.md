# Scripts Directory

This directory contains utility scripts for managing the Real-Time Apartment Dashboard.

## Available Scripts

### 1. `generate-sample-data.ps1`
Populates the database with comprehensive sample apartment data.

**Usage:**
```powershell
cd scripts
.\generate-sample-data.ps1
```

**Features:**
- Adds 35 sample apartments across different buildings (A, B, C, D, E, F, PH)
- Includes various price ranges (5.2 - 28.9 billion VND)
- Different apartment sizes (75 - 220 m²)
- Mixed status types (Đã bán, Đang Lock, Còn trống)
- Real estate agencies with realistic names
- Progress tracking and error handling

### 2. `clear-database.ps1`
Provides instructions for clearing the database.

**Usage:**
```powershell
cd scripts
.\clear-database.ps1
```

## Manual Data Addition

You can also add individual apartments via API:

```powershell
$apartment = @{
    apartment_id = "A101"
    agency = "Your Agency Name"
    area = 85.5
    price = 6.2
    status = "Đã bán"  # or "Đang Lock" or "Còn trống"
}

$body = $apartment | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/update-sheet" -Method POST -Body $body -ContentType "application/json"
```

## Data Structure

Each apartment record contains:
- `apartment_id`: Unique identifier (e.g., "A101", "PH502")
- `agency`: Real estate agency name
- `area`: Floor area in square meters
- `price`: Price in billion VND
- `status`: One of "Đã bán", "Đang Lock", "Còn trống"

## Prerequisites

- Backend server must be running on `http://localhost:5000`
- PowerShell execution policy must allow script execution
- Network access to localhost

## Troubleshooting

If scripts don't run:
1. Set execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
2. Ensure backend is running: Check `http://localhost:5000/api/health`
3. Check firewall settings for localhost connections
