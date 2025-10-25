// backend/routes/settings.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getBusinessInfo,
  updateBusinessInfo,
  getNotifications,
  updateNotifications
} = require("../controllers/settingsController");

// ===== Business Info Routes =====
router.get("/business", protect, getBusinessInfo);
router.put("/business", protect, updateBusinessInfo);

// ===== Notification Preferences Routes =====
router.get("/notifications", protect, getNotifications);
router.put("/notifications", protect, updateNotifications);

module.exports = router;
