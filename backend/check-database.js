// Diagnostic script to check MongoDB collections
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Sale = require("./models/Sale");
const Order = require("./models/Order");

async function checkDatabase() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected!");

    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("\n📦 All collections in database:");
    collections.forEach(c => console.log(`  - ${c.name}`));

    // Check Sale model collection
    console.log("\n🔍 Sale model details:");
    console.log(`  Collection name: ${Sale.collection.name}`);
    const saleCount = await Sale.countDocuments();
    console.log(`  Document count: ${saleCount}`);
    
    if (saleCount > 0) {
      const sales = await Sale.find().limit(3);
      console.log(`\n  Sample sales:`);
      sales.forEach(s => {
        console.log(`    - ${s._id}: $${s.totalPrice} (qty: ${s.quantity})`);
      });
    }

    // Check Order model collection
    console.log("\n🔍 Order model details:");
    console.log(`  Collection name: ${Order.collection.name}`);
    const orderCount = await Order.countDocuments();
    console.log(`  Document count: ${orderCount}`);
    
    if (orderCount > 0) {
      const orders = await Order.find().limit(3);
      console.log(`\n  Sample orders:`);
      orders.forEach(o => {
        console.log(`    - ${o._id}: $${o.total}`);
      });
    }

    // Calculate totals
    console.log("\n💰 Revenue totals:");
    const orderTotal = (await Order.find()).reduce((sum, o) => sum + (o.total || 0), 0);
    const saleTotal = (await Sale.find()).reduce((sum, s) => sum + (s.totalPrice || 0), 0);
    console.log(`  Orders: $${orderTotal}`);
    console.log(`  Sales: $${saleTotal}`);
    console.log(`  Combined: $${orderTotal + saleTotal}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

checkDatabase();
