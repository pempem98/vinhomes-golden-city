# Real Estate App - Database Management Scripts for Windows
# Usage: .\scripts.ps1 [command]

param(
    [string]$Command = "help"
)

# Function to print colored output
function Write-ColorOutput([string]$ForegroundColor, [string]$Message) {
    $originalColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $Host.UI.RawUI.ForegroundColor = $originalColor
}

function Print-Header {
    Write-ColorOutput "Blue" "================================"
    Write-ColorOutput "Magenta" "  Real Estate Dashboard Scripts"
    Write-ColorOutput "Blue" "================================"
}

function Print-Usage {
    Write-ColorOutput "Yellow" "Usage: .\scripts.ps1 [command]"
    Write-Output ""
    Write-Output "Commands:"
    Write-ColorOutput "Green" "  init        Initialize database with sample data (removes existing)"
    Write-ColorOutput "Green" "  init-safe   Initialize database safely (keeps existing data)"
    Write-ColorOutput "Green" "  simulate    Start live updates simulation"
    Write-ColorOutput "Green" "  clean       Clean database (remove all data)"
    Write-ColorOutput "Green" "  install     Install dependencies"
    Write-ColorOutput "Green" "  help        Show this help message"
    Write-Output ""
    Write-Output "Examples:"
    Write-Output "  .\scripts.ps1 init      # Initialize database (destructive)"
    Write-Output "  .\scripts.ps1 init-safe # Initialize database (safe mode)"
    Write-Output "  .\scripts.ps1 simulate  # Start simulation"
}

function Check-Node {
    try {
        $nodeVersion = node --version
        Write-ColorOutput "Green" "✅ Node.js found: $nodeVersion"
        return $true
    }
    catch {
        Write-ColorOutput "Red" "❌ Node.js is not installed!"
        Write-Output "Please install Node.js from https://nodejs.org/"
        return $false
    }
}

function Check-Dependencies {
    if (-Not (Test-Path "node_modules")) {
        Write-ColorOutput "Yellow" "Dependencies not found. Installing..."
        npm install
    }
}

function Initialize-Database {
    Print-Header
    Write-ColorOutput "Blue" "💾 Initializing Database"
    Write-Output ""
    
    if (-Not (Check-Node)) {
        exit 1
    }
    
    Check-Dependencies
    
    Write-ColorOutput "Yellow" "Starting database initialization..."
    node init-database.js
    
    Write-Output ""
    Write-ColorOutput "Green" "✅ Database initialization complete!"
}

function Start-Simulation {
    Print-Header
    Write-ColorOutput "Blue" "🎬 Starting Live Updates Simulation"
    Write-Output ""
    
    if (-Not (Check-Node)) {
        exit 1
    }
    
    Check-Dependencies
    
    Write-ColorOutput "Yellow" "Make sure the backend server is running on http://localhost:3001"
    Write-ColorOutput "Yellow" "Press Ctrl+C to stop simulation"
    Write-Output ""
    
    node simulate-live-updates.js
}

function Clean-Database {
    Print-Header
    Write-ColorOutput "Blue" "🧹 Cleaning Database"
    Write-Output ""
    
    $dbPath = "..\backend\database.sqlite"
    
    if (Test-Path $dbPath) {
        Write-ColorOutput "Yellow" "Removing database file..."
        Remove-Item $dbPath -Force
        Write-ColorOutput "Green" "✅ Database removed successfully"
    }
    else {
        Write-ColorOutput "Yellow" "No database file found"
    }
    
    Write-ColorOutput "Yellow" "Run '.\scripts.ps1 init' to create a new database"
}

function Install-Dependencies {
    Print-Header
    Write-ColorOutput "Blue" "🚀 Installing Dependencies"
    Write-Output ""
    
    if (-Not (Check-Node)) {
        exit 1
    }
    
    Write-ColorOutput "Yellow" "Installing script dependencies..."
    npm install
    
    Write-Output ""
    Write-ColorOutput "Green" "✅ Dependencies installed successfully!"
}

function Initialize-Database-Safe {
    Print-Header
    Write-ColorOutput "Blue" "🔄 Safe Database Initialization"
    Write-Output ""
    
    if (-Not (Check-Node)) {
        exit 1
    }
    
    Check-Dependencies
    
    Write-ColorOutput "Yellow" "Starting safe database initialization (non-destructive)..."
    node init-database-safe.js
    
    Write-Output ""
    Write-ColorOutput "Green" "✅ Safe database initialization complete!"
}

# Main script logic
switch ($Command.ToLower()) {
    "init" {
        Initialize-Database
    }
    "init-safe" {
        Initialize-Database-Safe
    }
    "simulate" {
        Start-Simulation
    }
    "clean" {
        Clean-Database
    }
    "install" {
        Install-Dependencies
    }
    "help" {
        Print-Header
        Print-Usage
    }
    default {
        Print-Header
        Write-ColorOutput "Red" "❌ Unknown command: $Command"
        Write-Output ""
        Print-Usage
        exit 1
    }
}
