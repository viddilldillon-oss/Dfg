// backend/routes/cloverPayments.js
const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.post('/start', async (req, res) => {
  try {
    const { amount, currency, email } = req.body;
    const key = process.env.CLOVER_API_KEY;
    const merchant = process.env.CLOVER_MERCHANT_ID;

    const cloverRes = await fetch(`https://sandbox.dev.clover.com/v3/merchants/${merchant}/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ amount, currency, email })
    });

    const data = await cloverRes.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Clover error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
