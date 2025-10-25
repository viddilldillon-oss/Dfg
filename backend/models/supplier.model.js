// backend/models/supplier.model.js
const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    supplier: { type: String, required: true, trim: true },   // replaces "name"
    item: { type: String, required: true, trim: true },        // replaces "product"
    category: { type: String, default: "", trim: true },
    unitCost: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    notes: { type: String, default: "", trim: true },
    contact: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);