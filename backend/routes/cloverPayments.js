// backend/routes/cloverPayments.js
const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.post('/start', async (req, res) => {
  try {
    const { total: amount } = req.body;
    const amountInCents = Math.round(amount * 100);

    const MERCHANT_ID = 'SJCPEXE0EJ111';
    const PRIVATE_TOKEN = '803fd96f-83cf-21da-5780-9411137269ee';
    const CLOVER_API_URL = `https://sandbox.dev.clover.com/v3/merchants/${MERCHANT_ID}/checkouts`;

    const response = await fetch(CLOVER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PRIVATE_TOKEN}`
      },
      body: JSON.stringify({
        "order": {
          "state": "open",
          "manualTransaction": true,
          "items": [
            { "name": "Cart Total", "price": amountInCents }
          ]
        },
        "redirectUrl": "https://yourdomain.com/checkout-success"
      })
    });

    const rawResponse = await response.text();
    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (e) {
      data = { rawResponse: rawResponse };
    }

    console.log('Clover response status:', response.status);
    console.log('Clover raw response (first 100 chars):', rawResponse.substring(0, 100));
    console.log('Clover parsed JSON:', data);

    if (response.ok && data.href) {
      console.log('✅ Clover Hosted Checkout session created:', data.href);
      res.json({ ok: true, href: data.href });
    } else {
      console.error('❌ Clover Hosted Checkout creation failed:', data);
      res.status(response.status).json({ ok: false, error: 'Failed to create Clover Hosted Checkout session', details: data });
    }
  } catch (err) {
    console.error('❌ Clover error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});
module.exports = router;