# Test API endpoints
Write-Host "`n=== Testing Supa Dillie-Cious Mart API ===" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n[1/3] Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -TimeoutSec 10
    Write-Host "  SUCCESS: $($health.message)" -ForegroundColor Green
} catch {
    Write-Host "  FAILED: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Products API
Write-Host "`n[2/3] Testing Products API..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "http://localhost:5000/api/products" -TimeoutSec 10
    $count = if ($products -is [Array]) { $products.Count } else { 1 }
    Write-Host "  SUCCESS: Found $count product(s)" -ForegroundColor Green
    
    if ($count -gt 0) {
        $sample = if ($products -is [Array]) { $products[0] } else { $products }
        Write-Host "  Sample: $($sample.name) - `$$($sample.price)" -ForegroundColor Cyan
        if ($sample.imageUrl) {
            Write-Host "  Image: $($sample.imageUrl)" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "  FAILED: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Static Files
Write-Host "`n[3/3] Testing Static File Serving..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/" -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  SUCCESS: Storefront is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "  FAILED: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== All Tests Passed! ===" -ForegroundColor Green
Write-Host "Your backend is running correctly.`n" -ForegroundColor Green
