# Supa Dillie-Cious Mart Backend Startup Script
# This ensures the server starts from the correct directory

Write-Host "Starting Supa Dillie-Cious Mart Backend..." -ForegroundColor Cyan

# Navigate to backend directory
$backendPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $backendPath

Write-Host "Working Directory: $backendPath" -ForegroundColor Yellow

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Running npm install..." -ForegroundColor Yellow
    npm install
}

# Start the server
Write-Host "Starting server.js..." -ForegroundColor Green
node server.js
