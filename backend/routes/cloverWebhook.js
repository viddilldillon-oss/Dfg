const express = require("express");
const router = express.Router();

router.post("/webhook", express.json(), async (req, res) => {
  console.log("🟢 Clover Webhook Received:", req.body);
  res.status(200).send("Webhook received");
});

module.exports = router;