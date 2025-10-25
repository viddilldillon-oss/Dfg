const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createSale, getSales, deleteSale } = require("../controllers/salesController");

router.get("/", protect, getSales);
router.post("/", protect, createSale);
router.delete("/:id", protect, deleteSale);

module.exports = router;