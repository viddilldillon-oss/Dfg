// backend/routes/cloverPayments.js
const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.post('/start', async (req, res) => {
  try {
    const { total: amount } = req.body;
    const secretKey = process.env.CLOVER_PRIVATE_KEY;

    const response = await fetch("https://sandbox.dev.clover.com/v1/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secretKey}`
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "usd",
        source: "tok_sandbox", // temporary token for test
        description: "Supa Dillie-Cious Mart Test Order"
      })
    });

    const responseText = await response.text();
    console.log("Clover response status:", response.status);
    console.log("Clover response text:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { error: 'Invalid JSON response from Clover' };
    }

    if (response.ok && data.id) {
      console.log("✅ Clover charge created successfully");
      return res.json({ success: true, chargeId: data.id });
    } else {
      console.error("❌ Clover charge creation failed:", responseText);
      return res.status(response.status).json({ error: "Clover charge creation failed", details: responseText });
    }
  } catch (err) {
    console.error('❌ Clover error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});
module.exports = router;