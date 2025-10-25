# 🎯 POS System - Complete Setup Guide

## ✅ Status: READY TO TEST

The POS system has been properly wired to the backend and is now served from the same origin to avoid CORS issues.

---

## 📍 Access URLs

### **Backend Server**
```
http://localhost:5000
```

### **POS System (NEW - Use this!)**
```
http://localhost:5000/pos/p-ho-index.page.html
```

### **Admin Dashboard**
```
http://localhost:5000/admin/FT-dashboard.page.html
```

### **API Test Tool**
```
http://localhost:5000/pos/test-pos-api.html
```

---

## 🧪 Testing Steps

### **Step 1: Verify Backend is Running**

Check your terminal shows:
```
✅ Server running on port 5000
```

If not running, start it:
```powershell
C:\Users\David\Desktop\Dolphin-ARM64\supa-mart\backend\start-server.bat
```

---

### **Step 2: Open POS System**

**Important:** Use the backend URL, NOT file:/// protocol!

✅ **CORRECT:**
```
http://localhost:5000/pos/p-ho-index.page.html
```

❌ **WRONG (will fail with CORS):**
```
file:///C:/Users/David/Desktop/Dolphin-ARM64/supa-mart/POS-Skeleton-DarkBlue/pos/p-ho-index.page.html
```

---

### **Step 3: Open Browser Developer Console**

- Press **F12**
- Click **Console** tab
- Keep it open during testing

---

### **Step 4: Record a Test Sale**

1. **Add Product to Cart**
   - Click on any product (e.g., "Dillie-Cious Burger")
   - Product should appear in cart on right side

2. **Complete Sale**
   - Click **"Cash Sale"** button (or **"Card Payment"** if testing Stripe)
   - Watch for receipt popup

3. **Check Console Logs**

   **Expected in Browser Console:**
   ```
   🛒 POS: Attempting to record sale...
   📦 Payload: { items: [...], total: 10.70, paymentType: 'Cash' }
   📡 Response status: 201
   ✅ Sale recorded: { message: 'Sales recorded successfully', count: 1, ... }
   ```

   **Expected in Backend Terminal:**
   ```
   🛒 POS SALE REQUEST RECEIVED
   📦 Request body: { "items": [...], "total": 10.70, "paymentType": "Cash" }
   ✅ Processing 1 items, total: $10.70
   ✅ Successfully saved 1 sales to database
   💾 Sale IDs: [ '67...' ]
   ```

---

### **Step 5: Verify in Dashboard**

1. Open Admin Dashboard:
   ```
   http://localhost:5000/admin/FT-dashboard.page.html
   ```

2. **Hard Refresh** to clear cache: `Ctrl + Shift + R`

3. **Check Total Sales**
   - Should now show: **$20.00 + $10.70 = $30.70**
   - (Or whatever your test sale amount was)

---

## 🔍 Troubleshooting

### **Problem: POS page doesn't load**

**Solution:**
- Make sure backend is running: `http://localhost:5000/health` should return `{"ok":true}`
- Check terminal for errors
- Try accessing: `http://localhost:5000/pos/` (should show directory or index)

---

### **Problem: Products don't load**

**Check:**
- Backend console should show products being fetched
- Open browser Network tab (F12 → Network)
- Look for `GET http://localhost:5000/api/products`
- Should return 200 OK with product list

---

### **Problem: Sale doesn't save (no logs in backend)**

**Possible causes:**

1. **CORS Issue** - Make sure you're using `http://localhost:5000/pos/...` NOT `file:///`

2. **Backend not running** - Check terminal shows "Server running on port 5000"

3. **JavaScript error** - Check browser console for red error messages

4. **Network error** - Open Network tab in browser, look for failed requests

---

### **Problem: Sale saves but doesn't appear in dashboard**

**Solutions:**
1. Hard refresh dashboard: `Ctrl + Shift + R`
2. Check `/api/stats` directly: `http://localhost:5000/api/stats`
3. Check backend logs show sale was saved with Sale ID

---

## 🧪 Quick API Test (Without POS UI)

If you want to test the API directly:

1. Open: `http://localhost:5000/pos/test-pos-api.html`
2. Click **"1. Test Backend Connection"** - Should show stats
3. Click **"2. Test Products Endpoint"** - Should show product list
4. Click **"3. Test Record Sale"** - Should save a real sale!

This will bypass the POS UI and directly test if the API is working.

---

## 📊 Expected Results

### **Before Testing:**
```
Database: 1 order ($20), 0 sales
Dashboard shows: $20.00
```

### **After One POS Sale (e.g., $10.70):**
```
Database: 1 order ($20), 1 sale ($10.70)
Dashboard shows: $30.70
Backend logs: "✅ Successfully saved 1 sales to database"
```

---

## 🎯 Key Configuration

### **server.js (Line 50-52):**
```javascript
app.use("/admin", express.static(path.join(__dirname, "../admin")));
app.use("/pos", express.static(path.join(__dirname, "../POS-Skeleton-DarkBlue/pos")));
app.use("/", express.static(path.join(__dirname, "../storefront")));
```

### **POS API Endpoint:**
```
POST http://localhost:5000/api/pos-sales/sale
```

### **Expected Payload Format:**
```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "name": "Product Name",
      "price": 10.00,
      "qty": 1
    }
  ],
  "total": 10.70,
  "paymentType": "Cash"
}
```

---

## ✅ Checklist Before Testing

- [ ] Backend server is running on port 5000
- [ ] Opening POS via: `http://localhost:5000/pos/p-ho-index.page.html`
- [ ] Browser DevTools console is open (F12)
- [ ] Backend terminal is visible to watch logs
- [ ] MongoDB is connected (check terminal shows "MongoDB Connected Successfully")

---

## 🚀 Ready to Test!

**Start here:**
```
http://localhost:5000/pos/p-ho-index.page.html
```

Make a sale and watch both the browser console and backend terminal for success messages!
