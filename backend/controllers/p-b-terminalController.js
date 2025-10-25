// backend/controllers/p-b-terminalController.js

// Create a POS Terminal connection token
// POST /api/terminal/connection_token
exports.createConnectionToken = async (req, res) => {
  try {
    // TODO: Replace with Clover integration endpoint
    res.status(200).json({ secret: "simulated-token" });
  } catch (err) {
    console.error('Terminal connection token error:', err?.message || err);
    res.status(500).json({ error: 'terminal_connection_token_failed' });
  }
};

// Create a PaymentIntent for POS transactions
// POST /api/terminal/payment_intents
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', description, metadata } = req.body || {};
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'invalid_amount' });
    }

    // TODO: Replace with Clover integration endpoint
    res.status(201).json({
      client_secret: "simulated-client-secret",
      id: "simulated-payment-intent-id",
      status: "succeeded",
    });
  } catch (err) {
    console.error('Create PI error:', err?.message || err);
    res.status(500).json({ error: 'payment_intent_create_failed' });
  }
};

// Capture a PaymentIntent (for manual capture flows)
// POST /api/terminal/payment_intents/:id/capture
exports.capturePaymentIntent = async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Replace with Clover integration endpoint
    res.status(200).json({ id: id, status: "succeeded" });
  } catch (err) {
    console.error('Capture PI error:', err?.message || err);
    res.status(500).json({ error: 'payment_intent_capture_failed' });
  }
};