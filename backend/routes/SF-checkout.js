// backend/routes/SF-checkout.js

const express = require("express");
const router = express.Router();
const { createCheckoutSession } = require("../controllers/checkoutController");

// POST /api/checkout → Creates a checkout session
router.post("/", createCheckoutSession);

module.exports = router;
