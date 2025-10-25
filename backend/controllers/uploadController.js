const cloudinary = require("cloudinary").v2;

// ✅ Upload to Cloudinary
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Cloudinary automatically gives secure URL
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "supadillie/products",
    });

    res.json({
      message: "Image uploaded successfully",
      imageUrl: result.secure_url, // ✅ always return Cloudinary URL
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    next(err);
  }
};