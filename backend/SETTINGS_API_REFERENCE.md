# Settings API Reference

## 📋 Overview
Backend API endpoints for the FT-settings.page.html functionality.

---

## 🔐 Authentication
All endpoints require authentication via JWT token:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📍 API Endpoints

### 1️⃣ **Password Change**

**Endpoint:** `PUT /api/users/password`

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Success Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

**Error Responses:**
- `400` - Current password incorrect
- `400` - New password too short (< 6 chars)
- `400` - New password same as current
- `401` - No token / Invalid token
- `404` - User not found

---

### 2️⃣ **Business Information**

#### Get Business Info
**Endpoint:** `GET /api/settings/business`

**Success Response (200):**
```json
{
  "storeName": "Supa Dillie-Cious Mart",
  "contactEmail": "contact@example.com",
  "phone": "(876) 123-4567",
  "address": "123 Main Street, Kingston, Jamaica",
  "businessHours": "Mon-Fri: 8am-6pm\nSat: 9am-4pm\nSun: Closed"
}
```

---

#### Update Business Info
**Endpoint:** `PUT /api/settings/business`

**Request Body:**
```json
{
  "storeName": "Supa Dillie-Cious Mart",
  "contactEmail": "contact@example.com",
  "phone": "(876) 123-4567",
  "address": "123 Main Street, Kingston, Jamaica",
  "businessHours": "Mon-Fri: 8am-6pm"
}
```

**Success Response (200):**
```json
{
  "message": "Business information updated successfully",
  "settings": {
    "storeName": "Supa Dillie-Cious Mart",
    "contactEmail": "contact@example.com",
    "phone": "(876) 123-4567",
    "address": "123 Main Street, Kingston, Jamaica",
    "businessHours": "Mon-Fri: 8am-6pm"
  }
}
```

---

### 3️⃣ **Notification Preferences**

#### Get Notification Preferences
**Endpoint:** `GET /api/settings/notifications`

**Success Response (200):**
```json
{
  "newOrders": true,
  "lowStock": false,
  "newUsers": true
}
```

---

#### Update Notification Preferences
**Endpoint:** `PUT /api/settings/notifications`

**Request Body:**
```json
{
  "newOrders": true,
  "lowStock": false,
  "newUsers": true
}
```

**Success Response (200):**
```json
{
  "message": "Notification preferences updated successfully",
  "notifications": {
    "newOrders": true,
    "lowStock": false,
    "newUsers": true
  }
}
```

---

### 4️⃣ **Data Export**

#### Export Products CSV
**Endpoint:** `GET /api/export/products`

**Success Response (200):**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="products.csv"`

**CSV Columns:**
- ID, Name, Category, Price, Stock, UnitType, UnitAmount, Description, ImageURL, CreatedAt

---

#### Export Orders CSV
**Endpoint:** `GET /api/export/orders`

**Success Response (200):**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="orders.csv"`

**CSV Columns:**
- OrderID, Product, Quantity, TotalPrice, CustomerName, CustomerEmail, Status, CreatedAt

---

#### Export Sales CSV
**Endpoint:** `GET /api/export/sales`

**Success Response (200):**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="sales.csv"`

**CSV Columns:**
- SaleID, Product, Category, Quantity, TotalPrice, Customer, Date

---

## 🗄️ Database Models

### Settings Model
```javascript
{
  storeName: String,
  contactEmail: String,
  phone: String,
  address: String,
  businessHours: String,
  notifications: {
    newOrders: Boolean,
    lowStock: Boolean,
    newUsers: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing with Postman/Thunder Client

### 1. Password Change
```bash
PUT http://localhost:5000/api/users/password
Headers:
  Authorization: Bearer <your_token>
  Content-Type: application/json
Body:
{
  "currentPassword": "test123",
  "newPassword": "newpass456"
}
```

### 2. Get Business Info
```bash
GET http://localhost:5000/api/settings/business
Headers:
  Authorization: Bearer <your_token>
```

### 3. Update Business Info
```bash
PUT http://localhost:5000/api/settings/business
Headers:
  Authorization: Bearer <your_token>
  Content-Type: application/json
Body:
{
  "storeName": "My Store",
  "contactEmail": "contact@store.com",
  "phone": "123-456-7890",
  "address": "123 Main St",
  "businessHours": "Mon-Fri: 9am-5pm"
}
```

### 4. Export Products
```bash
GET http://localhost:5000/api/export/products
Headers:
  Authorization: Bearer <your_token>
```

---

## ✅ Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (not admin)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔧 Error Response Format

```json
{
  "message": "Error description here",
  "error": "Technical error details (dev mode only)"
}
```

---

## 📝 Notes

1. All settings endpoints create default settings if none exist
2. Password must be at least 6 characters
3. Export endpoints return CSV files for download
4. Notification preferences auto-save (debounced on frontend)
5. All endpoints require valid JWT token

---

**Created for:** Supa Dillie-Cious Admin Dashboard  
**Last Updated:** 2024
