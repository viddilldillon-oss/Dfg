// FILE: backend/routes/reports.js
const express = require('express');
const router = express.Router();
const { generateReport } = require('../controllers/reportsController');

// 🎯 STAGE 10 — Reports & Export
router.get('/generate', generateReport);

module.exports = router;
