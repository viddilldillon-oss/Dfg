# 🎨 Supa Dillie-Cious Hover Theme Guide

## What Was Added

A **consistent yellow (#ffcc00) hover effect** has been applied across **ALL pages** in your project (Admin Dashboard + Storefront).

## Files Created

### 1. **Admin Hover Theme**
- **Location**: `supa-mart/admin/assets/hover-theme.css`
- **Linked to**: All `FT-*.html` pages in the admin folder

### 2. **Storefront Hover Theme**
- **Location**: `supa-mart/storefront/css/hover-theme.css`
- **Linked to**: All `.html` pages in the storefront folder

---

## How the Hover Effect Works

### Elements Affected:

#### 🔘 **Buttons**
- **Selector**: `button:hover, .btn:hover`
- **Effect**: Yellow background (#ffcc00), black text
- **Transition**: 0.25s smooth

#### 📝 **Form Inputs**
- **Selector**: `input:hover, textarea:hover, select:hover`
- **Effect**: Soft yellow glow (rgba(255, 204, 0, 0.15))
- **Focus**: Brighter yellow (rgba(255, 204, 0, 0.25)) with shadow

#### 🔗 **Links & Navigation**
- **Selector**: `a:hover, .menu a:hover, nav a:hover`
- **Effect**: Yellow background highlight (20% opacity)

#### 📊 **Table Rows & Cells**
- **Table Rows**: `tr:hover` → 10% yellow background
- **Table Cells**: `td:hover` → 8% yellow background

#### 📦 **Cards & Containers**
- **Selector**: `.card:hover, .folder:hover, .pcard:hover`
- **Effect**: Yellow border + glowing shadow

#### 📋 **List Items**
- **Selector**: `li:hover`
- **Effect**: 15% yellow background

#### 🎨 **Sidebar Links**
- **Selector**: `.sidebar a:hover`
- **Effect**: Full yellow background, black text

---

## CSS Structure (Lines Breakdown)

### **Variable Definitions** (Lines 6-9)
```css
:root {
  --hover-yellow: #ffcc00;
  --hover-transition: 0.25s ease;
}
```

### **Button Hovers** (Lines 11-18)
```css
button:hover,
.btn:hover {
  background: var(--hover-yellow) !important;
  color: #000 !important;
  transition: all var(--hover-transition);
}
```

### **Input Hovers** (Lines 20-37)
- Hover: Light yellow tint
- Focus: Stronger yellow + shadow

### **Link Hovers** (Lines 39-44)
- Semi-transparent yellow background

### **Table Hovers** (Lines 46-58)
- Rows: 10% yellow
- Cells: 8% yellow

### **Card Hovers** (Lines 60-66)
- Yellow border + shadow glow

### **Transform Preservation** (Lines 89-96)
- Buttons: `scale(1.05)`
- Folders: `translateY(-2px)`

---

## How to Customize

### **Change the Hover Color**
Edit line 7 in either CSS file:
```css
--hover-yellow: #ffcc00;  /* Change this color */
```

### **Change the Transition Speed**
Edit line 8:
```css
--hover-transition: 0.25s ease;  /* Make faster (0.15s) or slower (0.5s) */
```

### **Adjust Opacity for Backgrounds**
Find the specific selector and change the alpha value:
```css
/* Current: 20% opacity */
background: rgba(255, 204, 0, 0.2) !important;

/* Make lighter (10%) */
background: rgba(255, 204, 0, 0.1) !important;

/* Make stronger (40%) */
background: rgba(255, 204, 0, 0.4) !important;
```

### **Disable for Specific Elements**
Add this to your page-specific styles:
```css
.no-hover:hover {
  background: inherit !important;
  transform: none !important;
}
```

---

## Pages Updated

### ✅ **Admin Pages** (11 files)
- FT-auth.page.html
- FT-dashboard.page.html
- FT-hardware.page.html
- FT-layout.html
- FT-logout.page.html
- FT-orders.page.html
- FT-products.page.html
- FT-sales.page.html
- FT-settings.page.html
- FT-suppliers.page.html
- FT-upload.page.html

### ✅ **Storefront Pages** (8 files)
- index.html
- FT-about.html
- FT-cancel.html
- FT-cart.html
- FT-checkout.html
- FT-confirmation.html
- FT-contact.html
- FT-success.html

---

## Testing the Effect

1. Open any page in your browser
2. Hover over:
   - Any button → Should turn yellow
   - Any input field → Should show yellow glow
   - Table rows → Should highlight yellow
   - Cards/folders → Should get yellow border + shadow
   - Links → Should get yellow background

---

## Troubleshooting

### Hover effect not showing?
1. Clear browser cache (Ctrl + F5)
2. Check that the CSS file is linked in your page's `<head>`:
   ```html
   <link rel="stylesheet" href="assets/hover-theme.css">
   ```

### Effect too strong?
Lower the opacity values in the CSS (see "How to Customize" above)

### Effect too weak?
Increase the opacity values or remove `!important` from conflicting styles

---

## Summary

✅ **Hover theme added to ALL pages**
✅ **Consistent yellow (#ffcc00) across everything**
✅ **Smooth 0.25s transitions**
✅ **Easy to customize via CSS variables**
✅ **No layout or structure changes**
✅ **Text remains readable on hover**

🎨 Your Jamaican theme now has a **unified, professional hover experience!**
