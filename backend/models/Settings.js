// backend/models/Settings.js
const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    // Business Information
    storeName: { type: String, default: "Supa Dillie-Cious Mart" },
    contactEmail: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    businessHours: { type: String, default: "" },

    // Notification Preferences
    notifications: {
      newOrders: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      newUsers: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

// ✅ Prevent Mongoose overwrite error
module.exports = mongoose.models.Settings || mongoose.model("Settings", settingsSchema);
