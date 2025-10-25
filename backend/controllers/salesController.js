const Sale = require("../models/Sale");

exports.createSale = async (req, res, next) => {
  try {
    const { product, quantity, totalPrice, customerName, date } = req.body;
    const sale = new Sale({ product, quantity, totalPrice, customerName, date });
    await sale.save();
    res.json(sale);
  } catch (err) {
    next(err);
  }
};

exports.getSales = async (req, res, next) => {
  try {
    const sales = await Sale.find().populate("product").sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) {
    next(err);
  }
};

exports.deleteSale = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Sale.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Sale not found" });
    res.json({ message: "Sale deleted" });
  } catch (err) {
    next(err);
  }
};