// backend/routes/suppliers.js
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");

const Supplier = mongoose.models.Supplier || require("../models/supplier.model");
const { extractTextFromFile, parseTextToRows } = require("../utils/ocrParser");

const router = express.Router();

// ✅ Get all suppliers
router.get("/", async (req, res) => {
  try {
    const list = await Supplier.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch suppliers" });
  }
});

// ✅ Add one supplier
router.post("/", async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.json(supplier);
  } catch (e) {
    res.status(400).json({ message: e.message || "Failed to create supplier" });
  }
});

// ✅ Update supplier
router.put("/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (e) {
    res.status(400).json({ message: e.message || "Failed to update supplier" });
  }
});

// ✅ Delete supplier
router.delete("/:id", async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ message: e.message || "Failed to delete supplier" });
  }
});

// ✅ OCR / Scan Upload
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const dir = path.join(__dirname, "../tmp");
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `scan_${Date.now()}${ext}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const ok =
      file.mimetype.includes("pdf") ||
      file.mimetype.includes("word") ||
      file.mimetype.includes("officedocument") ||
      file.mimetype.startsWith("image/");
    cb(ok ? null : new Error("Unsupported file type"), ok);
  },
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// ✅ Scan route – extract text and preview
router.post("/scan", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  try {
    const text = await extractTextFromFile(req.file.path, req.file.mimetype);
    const rows = parseTextToRows(text);
    await fs.unlink(req.file.path).catch(() => {});
    res.json({ rows });
  } catch (err) {
    console.error("Scan error:", err);
    res.status(500).json({ message: "Failed to scan file" });
  }
});

// ✅ Bulk save route – save previewed suppliers
router.post("/bulk", async (req, res) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || !rows.length) {
      return res.status(400).json({ message: "No rows to save" });
    }

    const docs = rows.map(r => ({
      name: r.name || "",
      product: r.product || "",
      price: r.unitCost || r.total || 0,
      contact: r.contact || "",
      notes: r.category ? `Category: ${r.category}` : ""
    }));

    const inserted = await Supplier.insertMany(docs);
    res.json({ ok: true, inserted: inserted.length });
  } catch (err) {
    console.error("Bulk save error:", err);
    res.status(500).json({ message: "Failed to save supplier data" });
  }
});

module.exports = router;