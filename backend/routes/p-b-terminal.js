// backend/routes/p-b-terminal.js

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/p-b-terminalController');

// POS Terminal routes
router.post('/connection_token', ctrl.createConnectionToken);
router.post('/payment_intents', ctrl.createPaymentIntent);
router.post('/payment_intents/:id/capture', ctrl.capturePaymentIntent);

module.exports = router;