// backend/controllers/checkoutController.js
const dotenv = require("dotenv");

dotenv.config();

// @desc   Create Checkout Session
// @route  POST /api/checkout
// @access Public
exports.createCheckoutSession = async (req, res) => {
  try {
    console.log("⚙️ Checkout Session Request Body:", req.body);

    const { items, customerEmail } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("❌ No items in checkout request");
      return res.status(400).json({ message: "No items in checkout." });
    }

    // TODO: Replace with Clover integration endpoint
    console.log("✅ Checkout session created (simulation)");
    return res.json({ id: "simulated-session-id", url: "/SF-success.html" });
    
  } catch (err) {
    console.error("❌ Checkout Error:", err);
    return res.status(500).json({
      message: "Session creation failed",
      error: err.message,
    });
  }
};
