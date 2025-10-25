const Product = require("../models/Product");
const Sale = require("../models/Sale");
const Order = require("../models/Order");
const User = require("../models/User");

exports.getStats = async (req, res, next) => {
  try {
    console.log("✅ Combined stats route active - fetching data...");
    console.log("🔍 Sale model collection name:", Sale.collection.name);
    console.log("🔍 Order model collection name:", Order.collection.name);
    
    // Get counts and totals from both collections
    const [products, salesTotal, ordersTotal, users, salesCount, ordersCount] = await Promise.all([
      Product.countDocuments(),
      Sale.aggregate([
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
      ]).then(result => result[0]?.total || 0),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]).then(result => result[0]?.total || 0),
      User.countDocuments(),
      Sale.countDocuments(),
      Order.countDocuments()
    ]);
    
    // Combine totals from both sources
    const combinedTotal = salesTotal + ordersTotal;
    
    console.log(`📊 Found ${ordersCount} orders, ${salesCount} sales`);
    console.log(`💰 Order total: $${ordersTotal}, Sale total: $${salesTotal}, Combined: $${combinedTotal}`);
    
    res.json({ 
      products, 
      sales: combinedTotal, 
      users,
      // Optional: Include breakdown for debugging
      breakdown: {
        salesTotal,
        ordersTotal,
        salesCount,
        ordersCount
      }
    });
  } catch (err) {
    console.error("❌ Error in stats controller:", err);
    next(err);
  }
};