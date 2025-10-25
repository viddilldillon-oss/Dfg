// FILE: backend/controllers/adminSettingsController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// 🎯 STAGE 11 — GET ADMIN SETTINGS
exports.getSettings = async (req, res) => {
  try {
    // Assuming admin user is first user or has specific role
    const admin = await User.findOne({ role: 'admin' }).select('-password');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    res.json({
      name: admin.name || admin.username,
      email: admin.email,
      username: admin.username
    });
  } catch (err) {
    console.error('❌ Get admin settings error:', err);
    res.status(500).json({ message: 'Failed to fetch admin settings', error: err.message });
  }
};

// 🎯 STAGE 11 — UPDATE ADMIN SETTINGS
exports.updateSettings = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password required to change password' });
      }

      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash and update new password
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(newPassword, salt);
      console.log('🔐 Password updated for admin');
    }

    // Update other fields
    if (name) admin.name = name;
    if (email) admin.email = email;

    await admin.save();

    console.log('✅ Admin settings updated');

    res.json({
      message: 'Settings updated successfully',
      user: {
        name: admin.name || admin.username,
        email: admin.email,
        username: admin.username
      }
    });
  } catch (err) {
    console.error('❌ Update admin settings error:', err);
    res.status(500).json({ message: 'Failed to update settings', error: err.message });
  }
};
