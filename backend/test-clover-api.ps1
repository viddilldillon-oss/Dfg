# TEST CLOVER API - Manual Test Script
# This script manually creates a test Clover payment to verify the backend works

Write-Host "`nTESTING CLOVER API...`n" -ForegroundColor Cyan

# Step 1: Create test payment data
Write-Host "Step 1: Creating test payment..." -ForegroundColor Yellow
$testPayment = @{
    amount = 50.25
    currency = "CAD"
    email = "test@example.com"
} | ConvertTo-Json

Write-Host "Payment data: $testPayment" -ForegroundColor White

# Step 2: Send payment to API
Write-Host "`nStep 2: Sending payment to backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/clover/start" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testPayment
    
    Write-Host "Payment request sent successfully!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 10)" -ForegroundColor Gray
} catch {
    Write-Host "Failed to send payment request: $_" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Response.GetResponseStream() | % { (New-Object System.IO.StreamReader($_)).ReadToEnd() })" -ForegroundColor Red
    exit
}

Write-Host "`nTEST COMPLETE!`n" -ForegroundColor Green