// backend/routes/supplierFolders.js
const express = require("express");
const mongoose = require("mongoose");
const SupplierFolder = require("../models/supplierFolder.model");
const SupplierSheet = require("../models/supplierSheet.model");

const router = express.Router();

/* ===== Folder Operations ===== */

// ✅ Create new supplier folder
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Folder name required" });
    const folder = await SupplierFolder.create({ name });
    res.json(folder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Get all folders
router.get("/", async (req, res) => {
  try {
    const folders = await SupplierFolder.find().sort({ createdAt: -1 });
    res.json(folders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch folders" });
  }
});

// ✅ Delete a folder and its sheets
router.delete("/:folderId", async (req, res) => {
  try {
    const { folderId } = req.params;
    await SupplierSheet.deleteMany({ supplierFolder: folderId });
    await SupplierFolder.findByIdAndDelete(folderId);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ===== Sheet Operations ===== */

// ✅ Create or update a supplier sheet
router.put("/:folderId/sheets/:sheetName", async (req, res) => {
  try {
    const { folderId, sheetName } = req.params;
    const { rows } = req.body;
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ message: "Rows must be an array" });
    }

    const updated = await SupplierSheet.findOneAndUpdate(
      { supplierFolder: folderId, sheetName },
      { rows },
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Get all sheets under a folder
router.get("/:folderId/sheets", async (req, res) => {
  try {
    const { folderId } = req.params;
    const sheets = await SupplierSheet.find({ supplierFolder: folderId });
    res.json(sheets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sheets" });
  }
});

// ✅ Get one sheet by name
router.get("/:folderId/sheets/:sheetName", async (req, res) => {
  try {
    const { folderId, sheetName } = req.params;
    const sheet = await SupplierSheet.findOne({
      supplierFolder: folderId,
      sheetName,
    });
    if (!sheet)
      return res.status(404).json({ message: "Sheet not found" });
    res.json(sheet);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sheet" });
  }
});

module.exports = router;