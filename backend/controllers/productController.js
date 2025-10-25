// backend/controllers/productController.js
const Product = require("../models/product");

exports.createProduct = async (req, res, next) => {
  try {
    const { name, price, description } = req.body;

    // ✅ When using multer-storage-cloudinary, req.file.path is the CDN URL
    const imageUrl =
      (req.file && (req.file.path || req.file.secure_url)) ||
      req.body.imageUrl ||
      "";

    const product = new Product({ name, price, description, imageUrl });
    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, description } = req.body;
    const update = { name, price, description };

    if (req.file) {
      // ✅ Cloudinary URL again
      update.imageUrl = req.file.path || req.file.secure_url;
    } else if (req.body.imageUrl) {
      update.imageUrl = req.body.imageUrl;
    }

    const product = await Product.findByIdAndUpdate(id, update, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};