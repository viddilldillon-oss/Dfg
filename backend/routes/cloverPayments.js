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
    const CLOVER_API_URL = `https://sandbox.dev.clover.com/invoicingcheckoutservice/v1/checkouts`;

    const response = await fetch(CLOVER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PRIVATE_TOKEN}`
      },
      body: JSON.stringify({
        "total": amountInCents,
        "currency": "usd",
        "redirect": {
          "success": "https://dfg-qq0j.onrender.com/checkout-success.html",
          "cancel": "https://dfg-qq0j.onrender.com/checkout-cancel.html",
          "failure": "https://dfg-qq0j.onrender.com/checkout-failed.html"
        }
      })
    });

    const rawResponse = await response.text();
    console.log('Clover response status:', response.status);
    console.log('Clover raw response (first 200 chars):', rawResponse.substring(0, 200));

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (e) {
      console.error('❌ Failed to parse Clover response as JSON:', rawResponse);
      return res.status(500).json({ ok: false, error: 'Failed to parse Clover response' });
    }

    if (response.ok && data.checkoutPageUrl) {
      console.log('✅ Clover checkout created successfully');
      console.log("✅ Clover Hosted Checkout Created:", data.checkoutPageUrl);
      res.json({ ok: true, href: data.checkoutPageUrl });
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