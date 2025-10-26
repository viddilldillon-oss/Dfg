// backend/routes/cloverPayments.js
const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.post('/start', async (req, res) => {
  try {
    const { name, email, shippingAddress, total } = req.body;

    // 1. Select Clover credentials based on CLOVER_MODE
    const isLive = process.env.CLOVER_MODE === 'live';
    const SECRET_KEY = isLive ? process.env.CLOVER_LIVE_SECRET_KEY : process.env.CLOVER_SANDBOX_SECRET_KEY;
    const MERCHANT_ID = isLive ? process.env.CLOVER_LIVE_MERCHANT_ID : process.env.CLOVER_SANDBOX_MERCHANT_ID;
    const API_BASE_URL = isLive ? process.env.CLOVER_LIVE_API_BASE_URL : process.env.CLOVER_SANDBOX_API_BASE_URL;

    if (!SECRET_KEY || !MERCHANT_ID || !API_BASE_URL) {
      console.error('❌ Clover environment variables not set');
      return res.status(500).json({ ok: false, error: 'Clover configuration error.' });
    }

    const url = `https://sandbox.dev.clover.com/api/checkout/v3/checkouts`;

    // 2. Create the checkout payload
    const payload = {
      "order": {
        "total": Math.round(total * 100),
        "currency": "usd"
      },
      "redirect": {
        "success": "https://your-frontend-url.com/SF-success.html",
        "cancel": "https://your-frontend-url.com/SF-checkout.html"
      }
    };

    // 3. Make the API call to Clover
    console.log("🔐 Using Clover key prefix:", SECRET_KEY?.slice(0,8));
    const cloverRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let rawText = await cloverRes.text();
    let cloverData;

    try {
      cloverData = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ Clover non-JSON response:", rawText);
      return res.status(500).json({ error: "Invalid response from Clover", details: rawText });
    }

    // 4. Log the response and send the checkout URL to the frontend
    console.log('✅ Clover checkout response:', cloverData);

    if (cloverData.href) {
      res.json({ ok: true, href: cloverData.href });
    } else {
      console.error('❌ Clover API error:', cloverData);
      res.status(500).json({ ok: false, error: 'Could not create Clover checkout.', details: cloverData });
    }

  } catch (err) {
    console.error('❌ Clover error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;