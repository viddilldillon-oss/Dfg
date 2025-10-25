// backend/routes/products.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");
const { protect } = require("../middleware/authMiddleware");
const productController = require("../controllers/productController");

// ✅ Cloudinary storage config for image uploads
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "supadillie/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

// GET all products (public)
router.get("/", productController.getProducts);

// POST create product with image upload (protected)
router.post("/", protect, upload.single("image"), productController.createProduct);

// PUT update product (protected)
router.put("/:id", protect, upload.single("image"), productController.updateProduct);

// DELETE product (protected)
router.delete("/:id", protect, productController.deleteProduct);

module.exports = router;
