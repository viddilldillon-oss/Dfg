// backend/routes/cloverPayments.js
const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.post('/start', async (req, res) => {
  try {
    const { total } = req.body;
    const secretKey = process.env.CLOVER_PRIVATE_KEY;

    const resp = await fetch("https://sandbox.dev.clover.com/api/checkout/v3/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secretKey}`
      },
      body: JSON.stringify({
        order: {
          total: Math.round(Number(total) * 100), // cents
          currency: "USD"
        },
        redirect: {
          success: "https://<YOUR-FRONTEND-DOMAIN>/SF-success.html",
          cancel:  "https://<YOUR-FRONTEND-DOMAIN>/SF-checkout.html"
        }
      })
    });

    // Read once, parse if JSON, otherwise return the raw text
    const raw = await resp.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = { nonJson: raw }; }

    // Log safely
    console.log("🔐 Using Clover key prefix:", (secretKey || "").slice(0,6));
    console.log("📡 Clover status:", resp.status);
    console.log("📦 Clover payload keys:", data && Object.keys(data));

    // Reply to client
    if (data && data._links && data._links.checkout && data._links.checkout.href) {
      return res.json({ href: data._links.checkout.href });
    } else {
      return res.status(500).json({ error: "Clover checkout not created", details: raw });
    }
  } catch (err) {
    console.error('❌ Clover error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;