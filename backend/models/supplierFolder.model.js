// backend/models/supplierFolder.model.js
const mongoose = require("mongoose");

const supplierFolderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.SupplierFolder ||
  mongoose.model("SupplierFolder", supplierFolderSchema);   