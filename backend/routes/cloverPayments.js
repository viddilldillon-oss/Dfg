// backend/routes/cloverPayments.js
const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.post('/start', async (req, res) => {
  try {
    const { amount, currency, email } = req.body;
    const key = process.env.CLOVER_SECRET_KEY;

    // Clover API expects amount in cents
    const priceInCents = Math.round(amount * 100);

    const payload = {
      customer: {
        email: email
      },
      shoppingCart: {
        lineItems: [
          {
            name: 'Supa-Mart Purchase',
            price: priceInCents,
            unitQty: 1
          }
        ]
      }
    };

    const cloverRes = await fetch('https://sandbox.dev.clover.com/invoicingcheckoutservice/v1/checkouts', {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    // Gracefully handle non-OK responses before attempting to parse JSON
    if (!cloverRes.ok) {
      const errorText = await cloverRes.text();
      console.error('❌ Clover API error:', { status: cloverRes.status, text: errorText });
      return res.status(cloverRes.status).json({ 
        ok: false, 
        error: 'Could not create Clover checkout session.', 
        details: errorText 
      });
    }

    const data = await cloverRes.json();
    res.json(data);

  } catch (err) {
    console.error('❌ Clover error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
