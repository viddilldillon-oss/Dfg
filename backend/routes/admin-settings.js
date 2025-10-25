// FILE: backend/routes/admin-settings.js
const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/adminSettingsController');

// 🎯 STAGE 11 — Admin Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
