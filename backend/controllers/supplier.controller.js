// backend/controllers/supplier.controller.js
const Supplier = require("../models/supplier.model");

// GET /api/suppliers
exports.getAll = async (req, res) => {
  try {
    const list = await Supplier.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Failed to load suppliers" });
  }
};

// POST /api/suppliers
exports.create = async (req, res) => {
  try {
    const { name, product, price, contact, notes } = req.body;
    const s = await Supplier.create({ name, product, price, contact, notes });
    res.json(s);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to create supplier" });
  }
};

// PUT /api/suppliers/:id
exports.update = async (req, res) => {
  try {
    const s = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!s) return res.status(404).json({ message: "Supplier not found" });
    res.json(s);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to update supplier" });
  }
};

// DELETE /api/suppliers/:id
exports.remove = async (req, res) => {
  try {
    const s = await Supplier.findByIdAndDelete(req.params.id);
    if (!s) return res.status(404).json({ message: "Supplier not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to delete supplier" });
  }
};