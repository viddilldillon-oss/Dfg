const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const User = require("../models/User");

// Combined Stats Endpoint
router.get("/", async (req, res) => {
  try {
    console.log("✅ Combined stats route active - fetching data...");
    console.log("🔍 Sale model collection name:", Sale.collection.name);
    console.log("🔍 Order model collection name:", Order.collection.name);
    
    const [orders, sales] = await Promise.all([
      Order.find({}, "total"),
      Sale.find({}, "totalPrice"),
    ]);

    console.log(`📊 Found ${orders.length} orders, ${sales.length} sales`);
    if (sales.length > 0) {
      console.log("📝 First sale sample:", sales[0]);
    }
    
    const orderTotal = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const saleTotal = sales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
    const totalRevenue = orderTotal + saleTotal;
    
    console.log(`💰 Order total: $${orderTotal}, Sale total: $${saleTotal}, Combined: $${totalRevenue}`);

    const [productCount, userCount] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
    ]);

    const responseData = {
      products: productCount,
      sales: totalRevenue,
      users: userCount,
    };
    
    console.log("📤 Sending response:", responseData);
    res.json(responseData);
  } catch (err) {
    console.error("Stats aggregation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;