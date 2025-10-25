# 🧪 TEST POS SALE API - Manual Test Script
# This script manually creates a test POS sale to verify the backend works

Write-Host "`n🧪 TESTING POS SALE API...`n" -ForegroundColor Cyan

# Step 1: Get available products
Write-Host "📦 Step 1: Fetching products..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "http://localhost:5000/api/products"
    Write-Host "   ✅ Found $($products.Count) products" -ForegroundColor Green
    
    if ($products.Count -eq 0) {
        Write-Host "   ❌ No products available - cannot create sale" -ForegroundColor Red
        exit
    }
    
    # Show first 3 products
    Write-Host "`n   Available products:" -ForegroundColor White
    for ($i = 0; $i -lt [Math]::Min(3, $products.Count); $i++) {
        Write-Host "   - $($products[$i].name) (ID: $($products[$i]._id)) - `$$($products[$i].price)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Failed to fetch products: $_" -ForegroundColor Red
    exit
}

# Step 2: Create test sale data
Write-Host "`n🛒 Step 2: Creating test sale..." -ForegroundColor Yellow
$testProduct = $products[0]
$testSale = @{
    items = @(
        @{
            productId = $testProduct._id
            qty = 2
            price = [double]$testProduct.price
        },
        @{
            productId = $products[1]._id
            qty = 1
            price = [double]$products[1].price
        }
    )
    total = ([double]$testProduct.price * 2) + [double]$products[1].price
    paymentType = "Card"
} | ConvertTo-Json -Depth 10

Write-Host "   📋 Sale data:" -ForegroundColor White
Write-Host "   - Item 1: $($testProduct.name) x2 = `$$([double]$testProduct.price * 2)" -ForegroundColor Gray
Write-Host "   - Item 2: $($products[1].name) x1 = `$$([double]$products[1].price)" -ForegroundColor Gray
Write-Host "   - Total: `$$($testSale | ConvertFrom-Json | Select-Object -ExpandProperty total)" -ForegroundColor Gray
Write-Host "   - Payment: Card" -ForegroundColor Gray

# Step 3: Send sale to API
Write-Host "`n📡 Step 3: Sending sale to backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/pos-sales/sale" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testSale
    
    Write-Host "   ✅ Sale recorded successfully!" -ForegroundColor Green
    Write-Host "   - Sales created: $($response.count)" -ForegroundColor Gray
    Write-Host "   - Total amount: `$$($response.total)" -ForegroundColor Gray
    Write-Host "   - Payment type: $($response.paymentType)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Failed to record sale: $_" -ForegroundColor Red
    Write-Host "   Error details: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 4: Verify sale was saved
Write-Host "`n🔍 Step 4: Verifying sale in database..." -ForegroundColor Yellow
Start-Sleep -Seconds 1  # Wait for database write
try {
    $diagnostic = Invoke-RestMethod -Uri "http://localhost:5000/api/db-diagnostic"
    Write-Host "   📊 Database counts:" -ForegroundColor White
    Write-Host "   - Sales: $($diagnostic.counts.sales)" -ForegroundColor Gray
    Write-Host "   - Orders: $($diagnostic.counts.orders)" -ForegroundColor Gray
    Write-Host "   - Products: $($diagnostic.counts.products)" -ForegroundColor Gray
    
    if ($diagnostic.counts.sales -gt 0) {
        Write-Host "   ✅ Sale confirmed in database!" -ForegroundColor Green
        
        # Show recent sales
        if ($diagnostic.recentSales.Count -gt 0) {
            Write-Host "`n   📝 Recent sales:" -ForegroundColor White
            foreach ($sale in $diagnostic.recentSales) {
                Write-Host "   - $($sale.product) x$($sale.quantity) = `$$($sale.totalPrice)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "   ⚠️  Sale not found in database yet (may need to wait)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Failed to verify: $_" -ForegroundColor Red
}

# Step 5: Check stats API
Write-Host "`n📈 Step 5: Checking stats endpoint..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:5000/api/stats"
    Write-Host "   💰 Dashboard stats:" -ForegroundColor White
    Write-Host "   - Products: $($stats.products)" -ForegroundColor Gray
    Write-Host "   - Total Sales: `$$($stats.sales)" -ForegroundColor Gray
    Write-Host "   - Users: $($stats.users)" -ForegroundColor Gray
    
    if ($stats.breakdown) {
        Write-Host "`n   📊 Breakdown:" -ForegroundColor White
        Write-Host "   - From Orders: `$$($stats.breakdown.ordersTotal)" -ForegroundColor Gray
        Write-Host "   - From POS Sales: `$$($stats.breakdown.salesTotal)" -ForegroundColor Gray
        Write-Host "   - Total Orders: $($stats.breakdown.ordersCount)" -ForegroundColor Gray
        Write-Host "   - Total POS Sales: $($stats.breakdown.salesCount)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Failed to fetch stats: $_" -ForegroundColor Red
}

# Step 6: Check sales history
Write-Host "`n📜 Step 6: Checking sales history..." -ForegroundColor Yellow
try {
    $history = Invoke-RestMethod -Uri "http://localhost:5000/api/pos-sales/history?limit=5"
    Write-Host "   📋 Sales history:" -ForegroundColor White
    Write-Host "   - Total sales: $($history.total)" -ForegroundColor Gray
    Write-Host "   - Current page: $($history.page)/$($history.pages)" -ForegroundColor Gray
    
    if ($history.items.Count -gt 0) {
        Write-Host "`n   📝 Recent transactions:" -ForegroundColor White
        foreach ($item in $history.items) {
            $productName = if ($item.product) { $item.product.name } else { "Unknown" }
            Write-Host "   - $productName x$($item.quantity) = `$$($item.totalPrice) [$($item.customerName)]" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   ❌ Failed to fetch history: $_" -ForegroundColor Red
}

Write-Host "`n✅ TEST COMPLETE!`n" -ForegroundColor Green
Write-Host "📌 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Open Admin Dashboard: http://localhost:5000/admin/FT-dashboard.page.html" -ForegroundColor White
Write-Host "   2. Check if the total sales number updated" -ForegroundColor White
Write-Host "   3. Scroll down to Sales History panel to see the transaction" -ForegroundColor White
Write-Host "   4. Watch for real-time updates via Socket.IO`n" -ForegroundColor White
