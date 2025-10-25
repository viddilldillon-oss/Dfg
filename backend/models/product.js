// backend/models/product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String }, // Category field for search
    imageUrl: { type: String },
    unitType: {
      type: String,
      enum: ["quantity", "pounds"],
      default: "quantity",
    },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Prevent Mongoose overwrite error
module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);