// backend/routes/cloverPayments.js
const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.post('/start', async (req, res) => {
  try {
    const { total: amount } = req.body;
    const secretKey = process.env.CLOVER_PRIVATE_KEY;

    const resp = await fetch("https://sandbox.dev.clover.com/v1/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secretKey}`
      },
      body: JSON.stringify({
        "amount": Math.round(amount * 100),
        "currency": "usd",
        "source": "tok_sandbox",
        "description": "Supa Dillie-Cious Order"
      })
    });

    const raw = await resp.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = { nonJson: raw }; }

    console.log("🔐 Using Clover key prefix:", (secretKey || "").slice(0,6));
    console.log("📡 Clover status:", resp.status);
    console.log("📦 Clover payload:", data);

    if (resp.ok && data.id) {
      console.log("✅ Clover charge created successfully");
      return res.json({ success: true, chargeId: data.id });
    } else {
      console.error("❌ Clover charge creation failed:", raw);
      return res.status(resp.status).json({ error: "Clover charge creation failed", details: raw });
    }
  } catch (err) {
    console.error('❌ Clover error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;