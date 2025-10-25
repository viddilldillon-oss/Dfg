const express = require('express');
const router = express.Router();
const { recordSale, listSales } = require('../controllers/p-b-salesController');

router.post('/sale', recordSale);
router.get('/history', listSales); // 🎯 STAGE 9 — Sales history with filters

module.exports = router;
