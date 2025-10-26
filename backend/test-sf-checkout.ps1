# TEST STOREFRONT CHECKOUT API - Manual Test Script
# This script manually creates a test checkout to verify the backend works

Write-Host "`nTESTING STOREFRONT CHECKOUT API...`n" -ForegroundColor Cyan

# Step 1: Create test checkout data
Write-Host "Step 1: Creating test checkout..." -ForegroundColor Yellow
$testCheckout = @{
    name = "John Doe"
    email = "john.doe@example.com"
    address = @{
        line1 = "123 Main St"
        city = "Anytown"
        state = "CA"
        zip = "12345"
        country = "USA"
    }
    total = 75.50
} | ConvertTo-Json -Depth 10

Write-Host "Checkout data: $testCheckout" -ForegroundColor White

# Step 2: Send checkout to API
Write-Host "`nStep 2: Sending checkout to backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/clover/start" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testCheckout
    
    Write-Host "Checkout request sent successfully!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 10)" -ForegroundColor Gray

    if ($response.href) {
        Write-Host "`nREDIRECT URL: $($response.href)" -ForegroundColor Green
    }

} catch {
    Write-Host "Failed to send checkout request: $_" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Response.GetResponseStream() | % { (New-Object System.IO.StreamReader($_)).ReadToEnd() })" -ForegroundColor Red
    exit
}

Write-Host "`nTEST COMPLETE!`n" -ForegroundColor Green