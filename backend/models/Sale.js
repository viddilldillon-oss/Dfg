const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  customerName: { type: String, trim: true, default: "" },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

const SaleModel = mongoose.models.Sale || mongoose.model("Sale", saleSchema);

// 🧮 Log collection name on first require
console.log("🔍 Sale model collection name:", SaleModel.collection.name);

module.exports = SaleModel;