# Quick Start Script for Disease EWS
# This script starts both backend and frontend servers

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Disease EWS - Quick Start" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if backend is already running
Write-Host "Checking backend status..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅ Already running" -ForegroundColor Green
    }
} catch {
    Write-Host " ⚠️  Not running - Starting..." -ForegroundColor Yellow
    
    # Start backend in new window
    $backendPath = Join-Path $PSScriptRoot "backend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; python app.py"
    Write-Host "   → Backend starting in new window..." -ForegroundColor Cyan
}

# Wait a moment
Start-Sleep -Seconds 2

# Check if frontend is already running
Write-Host "Checking frontend status..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅ Already running" -ForegroundColor Green
    }
} catch {
    Write-Host " ⚠️  Not running - Starting..." -ForegroundColor Yellow
    
    # Start frontend in new window
    $frontendPath = Join-Path $PSScriptRoot "frontend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm start"
    Write-Host "   → Frontend starting in new window..." -ForegroundColor Cyan
}

# Wait for services to be ready
Write-Host "`nWaiting for services to be ready..." -ForegroundColor Yellow
$ready = $false
$attempts = 0

while (-not $ready -and $attempts -lt 15) {
    Start-Sleep -Seconds 2
    try {
        $backend = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -ErrorAction Stop
        $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction Stop
        $ready = $true
    } catch {
        $attempts++
        Write-Host "." -NoNewline
    }
}

if ($ready) {
    Write-Host "`n`n========================================" -ForegroundColor Green
    Write-Host "  ✅ ALL SERVICES READY!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
    Write-Host "Access your application:" -ForegroundColor Cyan
    Write-Host "  🌐 Frontend:  http://localhost:3000" -ForegroundColor White
    Write-Host "  🔌 Backend:   http://localhost:5000" -ForegroundColor White
    Write-Host "  📊 API Health: http://localhost:5000/api/health`n" -ForegroundColor White
    
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Open http://localhost:3000 in your browser" -ForegroundColor Gray
    Write-Host "  2. Login with any credentials" -ForegroundColor Gray
    Write-Host "  3. Explore Analytics & Map dashboards" -ForegroundColor Gray
    Write-Host "  4. Run ML Scoring to generate fresh data`n" -ForegroundColor Gray
    
    Write-Host "Press any key to open the app in your browser..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Open browser
    Start-Process "http://localhost:3000"
} else {
    Write-Host "`n`n========================================" -ForegroundColor Red
    Write-Host "  ⚠️  SERVICES NOT READY" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Red
    
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. Backend terminal for Python errors" -ForegroundColor Gray
    Write-Host "  2. Frontend terminal for npm errors" -ForegroundColor Gray
    Write-Host "  3. Run .\test-integration.ps1 for diagnostics`n" -ForegroundColor Gray
}
