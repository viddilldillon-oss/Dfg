const cloudinary = require("cloudinary").v2;

// ✅ Cloudinary will auto-detect CLOUDINARY_URL from your .env
// Example .env line:
// CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@dmbdlblpx
cloudinary.config({
  secure: true, // always use https
});

module.exports = cloudinary;