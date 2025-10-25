# 🛒 Supa Dillie-Cious Mart - Backend Server

## 🚀 Quick Start Guide

### Starting the Backend Server

**Option 1: Using the Batch File (Recommended for Windows)**
```batch
cd backend
start-server.bat
```

**Option 2: Using Node.js Directly**
```powershell
cd backend
node server.js
```

**Option 3: Using NPM**
```powershell
cd backend
npm start
```

### Testing the Backend

Run the automated test script:
```powershell
cd backend
powershell -ExecutionPolicy Bypass -File test-api.ps1
```

Or test manually:
- Health Check: http://localhost:5000/health
- Products API: http://localhost:5000/api/products
- Storefront: http://localhost:5000/

## 📋 Prerequisites

- **Node.js** v14 or higher (currently using v22.20.0)
- **MongoDB Atlas** account (connection string in `.env`)
- **Cloudinary** account (for image uploads)
- **Stripe** account (for payments)

## 🔧 Configuration

All configuration is stored in the `.env` file at the project root:

```
supa-mart/
├── .env           ← Environment variables here
├── backend/
│   ├── server.js  ← Main server file
│   └── ...
└── storefront/
    └── ...
```

### Required Environment Variables

- `MONGO_URI` - MongoDB Atlas connection string ✅
- `PORT` - Server port (default: 5000) ✅
- `JWT_SECRET` - Secret for JWT tokens ✅
- `CLOUDINARY_URL` - Cloudinary account URL ✅
- `STRIPE_SECRET_KEY` - Stripe API key ✅
- `TELEGRAM_BOT_TOKEN` - Telegram bot token ✅
- `TELEGRAM_CHAT_ID` - Telegram chat ID ✅

## 📡 API Endpoints

### Public Endpoints (No Auth Required)
- `GET /api/products` - Get all products
- `POST /api/checkout` - Process storefront checkout
- `GET /health` - Health check

### Protected Endpoints (Auth Required)
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/orders` - Get orders
- `GET /api/sales` - Get sales data
- `GET /api/stats` - Get statistics

### Static File Serving
- `/` - Serves storefront (from `../storefront/`)
- `/admin` - Serves admin panel (from `../admin/`)

## 🔍 Troubleshooting

### Server Won't Start

1. **Check if port 5000 is already in use:**
   ```powershell
   Get-NetTCPConnection -LocalPort 5000
   ```

2. **Verify Node.js is installed:**
   ```powershell
   node --version
   ```

3. **Check if `.env` file exists:**
   ```powershell
   Test-Path ..\\.env
   ```

### Products Not Loading in Storefront

1. **Verify backend is running:**
   - Open http://localhost:5000/health
   - Should return: `{"ok": true, "message": "Supa Dillie backend is alive!"}`

2. **Check browser console (F12):**
   - Look for network errors
   - Verify API calls to `http://localhost:5000/api/products`

3. **Verify MongoDB connection:**
   - Check server logs for "✅ MongoDB Connected Successfully"

### Images Not Loading

1. **Cloudinary images** (start with `http://res.cloudinary.com/...`):
   - Should load directly from Cloudinary CDN
   - Check if `CLOUDINARY_URL` is set in `.env`

2. **Local images** (start with `/uploads/...`):
   - Requires backend server to be running
   - Files stored in `backend/uploads/` directory

## 📊 Server Logs

When the server starts successfully, you should see:
```
🔑 Stripe key loaded? ✅ yes
✅ MongoDB Connected Successfully
✅ Server running on port 5000
✅ Telegram summaries + Gmail forwarder active
```

## 🛡️ Security Notes

- JWT tokens expire after configured time
- Admin routes protected with `protect` middleware
- CORS enabled for all origins (configure for production)
- `.env` file should NEVER be committed to git

## 📞 Support

If you encounter issues:
1. Check this README first
2. Run the test script: `test-api.ps1`
3. Check server logs in the terminal
4. Verify all environment variables in `.env`

---

**Last Updated:** October 15, 2025
**Server Version:** 1.0.0
**Node.js Version:** v22.20.0
