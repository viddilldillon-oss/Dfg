const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const { changePassword } = require("../controllers/authController");

router.get("/test", (req, res) => res.json({ message: "User routes file is working!" }));
router.get("/profile", protect, (req, res) => res.json({ message: "User profile", user: req.user }));
router.get("/admin-dashboard", protect, admin, (req, res) => res.json({ message: "Welcome Admin", user: req.user }));

// ===== Password Change Route =====
router.put("/password", protect, changePassword);

module.exports = router;