# 🎮 POS 3-MODE SYSTEM — QUICK REFERENCE GUIDE

---

## 🔄 MODE SWITCHING

**Location:** Top-right corner of header (next to time/date)  
**Button Label:** "Mode"  
**Action:** Click to cycle through modes

---

## 📋 THE THREE MODES

### 1️⃣ **VISUAL MODE** 👁️
**Best For:** Browsing products visually  
**Display:** Products section always visible and prominent  
**Layout:**
- **Landscape:** Products 65% | Cart 35%
- **Portrait:** Products 60% (top) | Cart 40% (bottom)

**Use Case:** When customer wants to see products, or cashier needs to browse catalog.

---

### 2️⃣ **SCANNER MODE** 🔍
**Best For:** Fast barcode scanning  
**Display:** Products hidden, cart expanded  
**Layout:**
- **Landscape:** Products hidden | Cart takes 65%
- **Portrait:** Products 40% (minimized) | Cart 60%

**Use Case:** Pure barcode scanning workflow — customer has barcoded items, no browsing needed.

---

### 3️⃣ **HYBRID MODE** 🟢 *(Recommended Default)*
**Best For:** Mixed workflow (browsing + scanning)  
**Display:** Smart adaptive behavior  
**Layout:**
- **Landscape:** Products 65% | Cart 35%
- **Portrait:** Products 60% (top) | Cart 40% (bottom)

**Smart Behavior:**
- Products start at 100% visibility
- When scanning/adding items → Products fade to 30% opacity
- After **10 seconds** of no activity → Products return to 100% visibility
- Keeps cart in focus during active scanning, products visible during browsing

**Use Case:** Best of both worlds — products available when needed, cart prominent during transactions.

---

## 🔍 SEARCH & FILTER

### **Search Box**
- **Location:** Top of products section
- **Searches:** Product name, barcode, SKU
- **Behavior:** Real-time filtering as you type
- **Works With:** Category filters (both apply simultaneously)

### **Category Filters**
- **Toggle:** Click "Filters" button to show/hide
- **Options:** "All" + dynamic categories from database
- **Active Filter:** Highlighted in teal
- **Behavior:** Instant filtering on click

---

## ⚡ QUICK TIPS

1. **Default to Hybrid Mode** — It's the smartest option for most workflows
2. **Use Scanner Mode** during rush hours when speed matters
3. **Use Visual Mode** when customers want to browse
4. **Search works in all modes** — even Scanner mode (updates hidden grid)
5. **Mode persists** — Your preference is saved between sessions

---

## 🎯 WORKFLOW EXAMPLES

### **Scenario 1: Customer with grocery list (mixed barcoded + produce)**
- **Mode:** Hybrid 🟢
- **Flow:** Scan barcoded items (products fade) → Browse produce section → Add → Products fade → 10s later, products return for next browsing

### **Scenario 2: Quick convenience store transaction**
- **Mode:** Scanner 🔍
- **Flow:** Pure scanning, no browsing needed, cart fills up fast

### **Scenario 3: Customer browsing candy selection**
- **Mode:** Visual 👁️
- **Flow:** Products always visible, customer points to what they want

---

## 📱 RESPONSIVE BEHAVIOR

### **Desktop/Tablet Landscape:**
- Products and cart side-by-side
- Products on left, cart on right
- Wide product grid (3-5 columns depending on screen size)

### **Tablet/Phone Portrait:**
- Products and cart stacked vertically
- Products on top, cart on bottom
- Scrollable sections

### **All Orientations:**
- Touch-friendly buttons (minimum 44x44px touch targets)
- Readable text with dark shadows
- Smooth transitions

---

## 🔧 TROUBLESHOOTING

**Products not showing?**
- Check if you're in Scanner Mode 🔍
- Switch to Visual 👁️ or Hybrid 🟢

**Products faded out?**
- Normal in Hybrid mode during scanning
- Wait 10 seconds or click Mode button twice to reset

**Search not working?**
- Make sure you're typing in the search box (top of products section)
- Check if category filter is too restrictive

**Mode keeps resetting?**
- Clear browser cache if localStorage isn't persisting
- Check browser console for errors

---

## ✅ QUICK REFERENCE TABLE

| Mode | Icon | Products Visible | Cart Size | Best For |
|------|------|------------------|-----------|----------|
| Visual | 👁️ | Always 100% | 35% (landscape) / 40% (portrait) | Browsing |
| Scanner | 🔍 | Hidden | 65% (landscape) / 60% (portrait) | Fast scanning |
| Hybrid | 🟢 | 100% → 30% → 100% | 35% (landscape) / 40% (portrait) | Mixed workflow |

---

## 🎨 VISUAL INDICATORS

**Mode Indicator Display:**
```
👁️ Mode: Visual    ← Visual Mode active
🔍 Mode: Scanner   ← Scanner Mode active
🟢 Mode: Hybrid    ← Hybrid Mode active (default)
```

**Category Filter Active State:**
- Inactive: Gray ghost button
- Active: Teal background (brand color)

**Search Results:**
- Products found: Grid updates instantly
- No products found: "No products found" message displays

---

**End of Quick Reference Guide** ✅
