// backend/controllers/settingsController.js
const Settings = require("../models/Settings");

// ===== GET Business Info =====
exports.getBusinessInfo = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // If no settings exist, create default ones
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    res.json({
      storeName: settings.storeName,
      contactEmail: settings.contactEmail,
      phone: settings.phone,
      address: settings.address,
      businessHours: settings.businessHours
    });
  } catch (err) {
    console.error("❌ Error fetching business info:", err);
    res.status(500).json({ message: "Failed to fetch business info", error: err.message });
  }
};

// ===== UPDATE Business Info =====
exports.updateBusinessInfo = async (req, res) => {
  try {
    const { storeName, contactEmail, phone, address, businessHours } = req.body;

    let settings = await Settings.findOne();
    
    // If no settings exist, create new
    if (!settings) {
      settings = new Settings();
    }

    // Update fields
    if (storeName !== undefined) settings.storeName = storeName;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (phone !== undefined) settings.phone = phone;
    if (address !== undefined) settings.address = address;
    if (businessHours !== undefined) settings.businessHours = businessHours;

    await settings.save();

    res.json({
      message: "Business information updated successfully",
      settings: {
        storeName: settings.storeName,
        contactEmail: settings.contactEmail,
        phone: settings.phone,
        address: settings.address,
        businessHours: settings.businessHours
      }
    });
  } catch (err) {
    console.error("❌ Error updating business info:", err);
    res.status(500).json({ message: "Failed to update business info", error: err.message });
  }
};

// ===== GET Notification Preferences =====
exports.getNotifications = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // If no settings exist, return defaults
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    res.json({
      newOrders: settings.notifications.newOrders,
      lowStock: settings.notifications.lowStock,
      newUsers: settings.notifications.newUsers
    });
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ message: "Failed to fetch notification preferences", error: err.message });
  }
};

// ===== UPDATE Notification Preferences =====
exports.updateNotifications = async (req, res) => {
  try {
    const { newOrders, lowStock, newUsers } = req.body;

    let settings = await Settings.findOne();
    
    // If no settings exist, create new
    if (!settings) {
      settings = new Settings();
    }

    // Update notification preferences
    if (newOrders !== undefined) settings.notifications.newOrders = newOrders;
    if (lowStock !== undefined) settings.notifications.lowStock = lowStock;
    if (newUsers !== undefined) settings.notifications.newUsers = newUsers;

    await settings.save();

    res.json({
      message: "Notification preferences updated successfully",
      notifications: settings.notifications
    });
  } catch (err) {
    console.error("❌ Error updating notifications:", err);
    res.status(500).json({ message: "Failed to update notification preferences", error: err.message });
  }
};
