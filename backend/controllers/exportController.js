// backend/controllers/exportController.js
const Product = require("../models/product");
const Order = require("../models/Order");
const Sale = require("../models/Sale");

// ===== Helper Function: Convert Array to CSV =====
function arrayToCSV(data, fields = null) {
  if (!data || data.length === 0) {
    return "No data available";
  }

  // If fields not specified, use all keys from first object
  const headers = fields || Object.keys(data[0]);
  
  // Create CSV header row
  const csvRows = [headers.join(",")];

  // Create CSV data rows
  for (const row of data) {
    const values = headers.map((header) => {
      let val = row[header];

      // Handle nested objects (like populated fields)
      if (typeof val === "object" && val !== null) {
        if (val.name) val = val.name;
        else if (val.email) val = val.email;
        else val = JSON.stringify(val);
      }

      // Escape quotes and wrap in quotes
      val = String(val || "").replace(/"/g, '""');
      return `"${val}"`;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

// ===== EXPORT PRODUCTS =====
exports.exportProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found to export" });
    }

    // Select specific fields for CSV
    const exportData = products.map((p) => ({
      ID: p._id,
      Name: p.name || "",
      Category: p.category || "",
      Price: p.price || 0,
      Stock: p.stock || 0,
      UnitType: p.unitType || "",
      UnitAmount: p.unitAmount || "",
      Description: p.description || "",
      ImageURL: p.imageUrl || "",
      CreatedAt: p.createdAt || ""
    }));

    const csv = arrayToCSV(exportData);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="products.csv"');
    res.send(csv);

    console.log("✅ Products exported successfully");
  } catch (err) {
    console.error("❌ Error exporting products:", err);
    res.status(500).json({ message: "Failed to export products", error: err.message });
  }
};

// ===== EXPORT ORDERS =====
exports.exportOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("product", "name price").lean();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found to export" });
    }

    // Select specific fields for CSV
    const exportData = orders.map((o) => ({
      OrderID: o._id,
      Product: o.product?.name || o.productName || "",
      Quantity: o.quantity || 0,
      TotalPrice: o.totalPrice || o.total || 0,
      CustomerName: o.customerName || "",
      CustomerEmail: o.customerEmail || "",
      Status: o.status || "pending",
      CreatedAt: o.createdAt || ""
    }));

    const csv = arrayToCSV(exportData);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="orders.csv"');
    res.send(csv);

    console.log("✅ Orders exported successfully");
  } catch (err) {
    console.error("❌ Error exporting orders:", err);
    res.status(500).json({ message: "Failed to export orders", error: err.message });
  }
};

// ===== EXPORT SALES =====
exports.exportSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate("product", "name price category").lean();

    if (!sales || sales.length === 0) {
      return res.status(404).json({ message: "No sales found to export" });
    }

    // Select specific fields for CSV
    const exportData = sales.map((s) => ({
      SaleID: s._id,
      Product: s.product?.name || s.productName || "",
      Category: s.product?.category || "",
      Quantity: s.quantity || 0,
      TotalPrice: s.totalPrice || s.total || 0,
      Customer: s.customerName || s.customer || "",
      Date: s.date || s.createdAt || ""
    }));

    const csv = arrayToCSV(exportData);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="sales.csv"');
    res.send(csv);

    console.log("✅ Sales exported successfully");
  } catch (err) {
    console.error("❌ Error exporting sales:", err);
    res.status(500).json({ message: "Failed to export sales", error: err.message });
  }
};
