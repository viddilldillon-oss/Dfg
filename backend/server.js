// backend/server.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO on the same server/port
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Expose io to the rest of the app without changing module exports
app.set("io", io);

// (Optional) Basic connection log for debugging (non-blocking, safe)
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Route Imports
const orderRoutes = require("./routes/orders");
const SFcheckoutRoutes = require("./routes/SF-checkout");
const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");
const statsRoutes = require("./routes/stats");
const uploadRoutes = require("./routes/upload");
const salesRoutes = require("./routes/sales");
const supplierRoutes = require("./routes/suppliers"); // ✅ Supplier routes
const supplierSheetsRoutes = require("./routes/supplierSheets"); // ✅ Supplier Sheets routes
const supplierFolderRoutes = require("./routes/supplierFolders"); // ✅ Supplier Folder routes (new)
const userRoutes = require("./routes/userRoutes"); // ✅ User routes (password change)
const settingsRoutes = require("./routes/settings"); // ✅ Settings routes
const exportRoutes = require("./routes/export"); // ✅ Export routes

const posSalesRoutes = require('./routes/p-b-sales'); // ✅ POS Sales routes
const reportsRoutes = require('./routes/reports'); // 🎯 STAGE 10 — Reports routes
const adminSettingsRoutes = require('./routes/admin-settings'); // 🎯 STAGE 11 — Admin Settings routes
const cloverRoutes = require('./routes/cloverPayments'); // ✅ Clover payment routes

// ✅ API Routes
app.use("/api/orders", orderRoutes);
app.use("/api/checkout", SFcheckoutRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/supplier-sheets", supplierSheetsRoutes);
app.use("/api/supplier-folders", supplierFolderRoutes);
app.use("/api/users", userRoutes); // ✅ User routes (password change)
app.use("/api/settings", settingsRoutes); // ✅ Settings routes
app.use("/api/export", exportRoutes); // ✅ Export routes
app.use("/api/clover", cloverRoutes);

app.use('/api/pos-sales', posSalesRoutes); // ✅ POS Sales routes
app.use('/api/reports', reportsRoutes); // 🎯 STAGE 10 — Reports routes
app.use('/api/admin', adminSettingsRoutes); // 🎯 STAGE 11 — Admin Settings routes

// ✅ Serve Admin Dashboard, POS, and Storefront
app.use("/admin", express.static(path.join(__dirname, "../admin")));
app.use("/pos", express.static(path.join(__dirname, "../POS-Skeleton-DarkBlue/pos")));
app.use("/", express.static(path.join(__dirname, "../storefront")));

// ✅ Health Check Route
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Supa Dillie backend is alive!" });
});

// 🧮 Database Diagnostic Endpoint
app.get("/api/db-diagnostic", async (req, res) => {
  try {
    const Sale = require("./models/Sale");
    const Order = require("./models/Order");
    const Product = require("./models/product");
    
    const [salesCount, ordersCount, productsCount] = await Promise.all([
      Sale.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments()
    ]);
    
    // Get recent sales
    const recentSales = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('product', 'name price')
      .lean();
    
    // Get collections list
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    res.json({
      database: {
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        state: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
      },
      collections: collections.map(c => c.name),
      counts: {
        sales: salesCount,
        orders: ordersCount,
        products: productsCount
      },
      models: {
        Sale: Sale.collection.name,
        Order: Order.collection.name,
        Product: Product.collection.name
      },
      recentSales: recentSales.map(s => ({
        id: s._id,
        product: s.product?.name || 'Unknown',
        quantity: s.quantity,
        totalPrice: s.totalPrice,
        date: s.date,
        createdAt: s.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// ✅ 404 Handler - Return JSON instead of HTML
app.use((req, res, next) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
});

// ✅ Global Error Handler - Return JSON instead of HTML
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

// ✅ Connect MongoDB and Start Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    
    // 🧮 DATABASE CONNECTION LOGGING
    console.log("═══════════════════════════════════════════════════");
    console.log("📊 DATABASE DIAGNOSTIC INFO:");
    console.log("═══════════════════════════════════════════════════");
    console.log("🗄️  Database Name:", mongoose.connection.name);
    console.log("🌐 Host:", mongoose.connection.host);
    console.log("🔗 Connection State:", mongoose.connection.readyState === 1 ? "Connected" : "Disconnected");
    
    // Show connection string safely (hide password)
    const uri = process.env.MONGO_URI || '';
    const safeUri = uri.replace(/:([^@]+)@/, ':********@');
    console.log("🔐 Connection URI:", safeUri);
    
    // List all collections after a short delay to ensure they're loaded
    setTimeout(() => {
      mongoose.connection.db.listCollections().toArray((err, collections) => {
        if (err) {
          console.log("⚠️  Could not list collections:", err.message);
        } else {
          console.log("📚 Available Collections:", collections.map(c => c.name).join(", "));
        }
        console.log("═══════════════════════════════════════════════════");
      });
    }, 1000);
    
   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });