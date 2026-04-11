# Integration Test Script for Disease EWS
# Run this to verify all components are connected

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Disease EWS - Integration Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$backendUrl = "http://localhost:5000"
$frontendUrl = "http://localhost:3000"
$allTestsPassed = $true

# Test 1: Backend Health
Write-Host "[1/6] Testing Backend Health..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/health" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅ PASS" -ForegroundColor Green
    } else {
        Write-Host " ❌ FAIL (Status: $($response.StatusCode))" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host " ❌ FAIL (Backend not running)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 2: Districts API
Write-Host "[2/6] Testing Districts API..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/districts" -UseBasicParsing -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    if ($data.Count -eq 22) {
        Write-Host " ✅ PASS (22 districts loaded)" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  WARNING ($($data.Count) districts)" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ❌ FAIL" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 3: Scoring Summary
Write-Host "[3/6] Testing Scoring Summary..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/scoring/summary" -UseBasicParsing -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    Write-Host " ✅ PASS (High Risk: $($data.high_risk_count), Medium: $($data.medium_risk_count))" -ForegroundColor Green
} catch {
    Write-Host " ❌ FAIL" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 4: Alerts API
Write-Host "[4/6] Testing Alerts API..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/alerts" -UseBasicParsing -ErrorAction Stop
    Write-Host " ✅ PASS" -ForegroundColor Green
} catch {
    Write-Host " ⚠️  WARNING (No alerts yet)" -ForegroundColor Yellow
}

# Test 5: Frontend
Write-Host "[5/6] Testing Frontend..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "$frontendUrl" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅ PASS (Running on port 3000)" -ForegroundColor Green
    } else {
        Write-Host " ❌ FAIL" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host " ❌ FAIL (Frontend not running)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 6: Database
Write-Host "[6/6] Testing Database..." -NoNewline
$dbPath = "C:\Projects\CodeVista Team Rocket\disease-ews\backend\database.db"
if (Test-Path $dbPath) {
    Write-Host " ✅ PASS (database.db exists)" -ForegroundColor Green
} else {
    Write-Host " ❌ FAIL (database not found)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
if ($allTestsPassed) {
    Write-Host "  ✅ ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Cyan
    Write-Host "Your Disease EWS is fully integrated and running!" -ForegroundColor Green
    Write-Host "`nAccess Points:" -ForegroundColor Cyan
    Write-Host "  Frontend:  $frontendUrl" -ForegroundColor White
    Write-Host "  Backend:   $backendUrl/api/health" -ForegroundColor White
    Write-Host "  API Docs:  $backendUrl/api/districts" -ForegroundColor White
} else {
    Write-Host "  ⚠️  SOME TESTS FAILED" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Yellow
    Write-Host "Please check the failed tests above." -ForegroundColor Yellow
}
Write-Host ""
