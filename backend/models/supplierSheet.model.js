// backend/models/supplierSheet.model.js
const mongoose = require("mongoose");

/**
 * 🧹 TEMPORARY CLEANUP VERSION
 * This version allows empty names so you can delete the "(unnamed)" record(s).
 * After deleting, revert `required: false` back to `required: true`.
 */

const RowSchema = new mongoose.Schema({
  supplier: { type: String, default: "" },
  item: { type: String, default: "" },
  category: { type: String, default: "" },
  unitCost: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  notes: { type: String, default: "" },
}, { _id: false });

const SupplierSheetSchema = new mongoose.Schema({
  // ⚠️ temporarily not required to allow deletion of unnamed records
  name: { type: String, required: false, unique: true, default: "" },
  rows: { type: [RowSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.models.SupplierSheet || mongoose.model("SupplierSheet", SupplierSheetSchema);