// backend/routes/orders.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// POST new order
router.post("/", orderController.createOrder);

// GET all orders
router.get("/", orderController.getOrders);

// GET single order by ID
router.get("/:id", orderController.getOrderById);

// PATCH update order status
router.patch("/:id/status", orderController.updateOrderStatus);

// DELETE order by ID
router.delete("/:id", orderController.deleteOrder);

module.exports = router;