// backend/routes/export.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  exportProducts,
  exportOrders,
  exportSales
} = require("../controllers/exportController");

// ===== Export Routes (Protected - Admin Only) =====
router.get("/products", protect, exportProducts);
router.get("/orders", protect, exportOrders);
router.get("/sales", protect, exportSales);

module.exports = router;
