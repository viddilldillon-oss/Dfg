# 🧪 API Testing Script for Stages 9-11

# Test Stage 9: Sales History API
Write-Host "`n=== STAGE 9: SALES HISTORY ===" -ForegroundColor Cyan

try {
    $token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NjU5ZDc4ODBhZTIyNzg1ZTk5MWE5NyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNDkzMzQyN30.oYmVjnOsELTQkQMw4J9fDr8fFXjCKhFsAMqKqZTyC4o"
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/pos-sales/history?limit=5" -Headers $headers
    Write-Host "✅ Sales History API working!" -ForegroundColor Green
    Write-Host "   Total sales: $($response.totalSales)" -ForegroundColor Gray
    Write-Host "   Current page: $($response.currentPage)" -ForegroundColor Gray
    Write-Host "   Total pages: $($response.totalPages)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Sales History API failed: $_" -ForegroundColor Red
}

# Test Stage 10: Reports API
Write-Host "`n=== STAGE 10: REPORTS API ===" -ForegroundColor Cyan

try {
    $startDate = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")
    $endDate = (Get-Date).ToString("yyyy-MM-dd")
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/reports/generate?startDate=$startDate&endDate=$endDate&reportType=monthly" -Headers $headers
    Write-Host "✅ Reports API working!" -ForegroundColor Green
    Write-Host "   Total Revenue: `$$($response.summary.totalRevenue)" -ForegroundColor Gray
    Write-Host "   Total Transactions: $($response.summary.totalTransactions)" -ForegroundColor Gray
    Write-Host "   Top Products: $($response.topProducts.Length)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Reports API failed: $_" -ForegroundColor Red
}

# Test Stage 11: Admin Settings API (GET)
Write-Host "`n=== STAGE 11: ADMIN SETTINGS (GET) ===" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/settings" -Headers $headers
    Write-Host "✅ Admin Settings GET working!" -ForegroundColor Green
    Write-Host "   Name: $($response.name)" -ForegroundColor Gray
    Write-Host "   Email: $($response.email)" -ForegroundColor Gray
    Write-Host "   Username: $($response.username)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Admin Settings GET failed: $_" -ForegroundColor Red
}

# Test Stage 11: Admin Settings API (PUT) - Test validation only
Write-Host "`n=== STAGE 11: ADMIN SETTINGS (PUT) ===" -ForegroundColor Cyan

try {
    # Test with invalid data (should fail without currentPassword)
    $body = @{
        name = "Test Admin"
        email = "test@admin.com"
        newPassword = "newpass123"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/settings" -Method PUT -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "❌ Admin Settings PUT should have failed without currentPassword!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Admin Settings PUT validation working! (Correctly rejected password change without currentPassword)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Admin Settings PUT failed with unexpected error: $_" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Magenta
Write-Host "Stage 9: Sales History API - Check results above" -ForegroundColor White
Write-Host "Stage 10: Reports API - Check results above" -ForegroundColor White
Write-Host "Stage 11: Admin Settings API - Check results above" -ForegroundColor White
Write-Host "`nNote: Replace the token variable with your actual admin JWT token from localStorage" -ForegroundColor Yellow
Write-Host "To get your token: Open browser console → localStorage.getItem('token')`n" -ForegroundColor Yellow
