// backend/routes/upload.js
const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary"); // ✅ fixed path
const Product = require("../models/Product");

const router = express.Router();

// ✅ Cloudinary storage config
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "supadillie/uploads", // you can rename this folder in Cloudinary if you like
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

// ✅ Upload + Create Product route
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category, unitType, stock } = req.body;

    // ✅ Validate file
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // ✅ Create product in MongoDB
    const product = await Product.create({
      name,
      price,
      description,
      category,
      unitType: unitType || "quantity",
      stock: stock ? Number(stock) : 0,
      imageUrl: req.file.path,
    });

    // ✅ Success response
    res.json({
      message: "✅ Product uploaded successfully",
      product,
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ message: "Failed to upload or save product" });
  }
});

module.exports = router;