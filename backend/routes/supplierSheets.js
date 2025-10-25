// backend/routes/supplierSheets.js
const express = require("express");
const SupplierSheet = require("../models/supplierSheet.model");
const router = express.Router();

/**
 * GET all supplier sheets
 */
router.get("/", async (req, res) => {
  try {
    const list = await SupplierSheet.find()
      .select("name createdAt updatedAt")
      .sort({ name: 1 });

    const clean = list.map((d) => ({
      name: d.name || "(unnamed)",
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));

    res.json(clean);
  } catch (err) {
    console.error("❌ Fetch list error:", err);
    res.status(500).json({ message: "Failed to fetch supplier sheets" });
  }
});

/**
 * GET one supplier sheet by name
 */
router.get("/:name", async (req, res) => {
  try {
    const name = (req.params.name || "").trim();
    if (!name)
      return res.status(400).json({ message: "Missing supplier name" });

    const sheet = await SupplierSheet.findOne({ name });
    if (!sheet)
      return res.status(404).json({ message: "Sheet not found" });

    res.json(sheet);
  } catch (err) {
    console.error("❌ GET sheet error:", err);
    res.status(500).json({ message: "Failed to load supplier sheet" });
  }
});

/**
 * PUT create or update supplier sheet
 */
router.put("/:name?", async (req, res) => {
  try {
    let name = (req.params.name || req.body.name || "").trim();

    if (!name) {
      return res.status(400).json({ message: "Supplier name is required" });
    }

    name = name.charAt(0).toUpperCase() + name.slice(1);
    const rows = Array.isArray(req.body.rows) ? req.body.rows : [];

    let sheet = await SupplierSheet.findOne({ name });
    if (!sheet) {
      sheet = new SupplierSheet({ name, rows });
    } else {
      sheet.rows = rows;
    }

    await sheet.save();
    res.json({
      ok: true,
      message: `✅ Folder "${name}" saved successfully.`,
      name,
    });
  } catch (err) {
    console.error("❌ PUT sheet error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Duplicate name detected. Try a different folder name.",
      });
    }

    res.status(500).json({ message: "Failed to create or update supplier sheet" });
  }
});

/**
 * DELETE supplier sheet by name
 * ✅ Fully handles "(unnamed)", null, missing, or blank folders
 */
router.delete("/:name", async (req, res) => {
  try {
    let name = (req.params.name || "").trim();

    // If the frontend sends "(unnamed)", treat it as empty
    if (name === "(unnamed)" || name.toLowerCase() === "unnamed") {
      name = "";
    }

    const query = name
      ? { name }
      : { $or: [{ name: "" }, { name: null }, { name: { $exists: false } }] };

    console.log("🧹 Deleting supplier sheet(s) with query:", query);

    const result = await SupplierSheet.deleteMany(query);

    if (result.deletedCount === 0) {
      console.warn("⚠️ No matching documents deleted for:", query);
      return res.status(404).json({
        message: `No matching folder found for "${req.params.name}".`,
      });
    }

    res.json({
      ok: true,
      message: `🗑️ Folder "${req.params.name}" deleted successfully (${result.deletedCount} record(s)).`,
    });
  } catch (err) {
    console.error("❌ DELETE sheet error:", err);
    res.status(500).json({ message: "Failed to delete supplier folder" });
  }
});

module.exports = router;