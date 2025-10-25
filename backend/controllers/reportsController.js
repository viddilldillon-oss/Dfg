// FILE: backend/controllers/reportsController.js
const Sale = require('../models/Sale');
const Order = require('../models/Order');

// 🎯 STAGE 10 — GENERATE SALES REPORT
exports.generateReport = async (req, res) => {
  try {
    const { from, to, type = 'daily' } = req.query;
    
    console.log('📊 Generating report:', { from, to, type });
    
    // Calculate date range based on type
    let startDate, endDate;
    endDate = to ? new Date(to) : new Date();
    
    switch (type) {
      case 'daily':
        startDate = from ? new Date(from) : new Date(endDate.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = from ? new Date(from) : new Date(endDate.setDate(endDate.getDate() - 7));
        break;
      case 'monthly':
        startDate = from ? new Date(from) : new Date(endDate.setMonth(endDate.getMonth() - 1));
        break;
      default:
        startDate = from ? new Date(from) : new Date(endDate.setDate(endDate.getDate() - 1));
    }
    
    const query = {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    console.log('📅 Date range:', { startDate, endDate });
    
    // Fetch sales and orders
    const [sales, orders] = await Promise.all([
      Sale.find(query).populate('product', 'name price').lean(),
      Order.find(query).lean()
    ]);
    
    // Calculate totals
    const salesRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const ordersRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalRevenue = salesRevenue + ordersRevenue;
    
    // Payment breakdown (POS only)
    const cashSales = sales.filter(s => s.customerName === 'Cash');
    const cardSales = sales.filter(s => s.customerName === 'Card');
    const cashRevenue = cashSales.reduce((sum, s) => sum + s.totalPrice, 0);
    const cardRevenue = cardSales.reduce((sum, s) => sum + s.totalPrice, 0);
    
    // Product breakdown
    const productMap = {};
    sales.forEach(sale => {
      const name = sale.product?.name || 'Unknown';
      if (!productMap[name]) {
        productMap[name] = { quantity: 0, revenue: 0 };
      }
      productMap[name].quantity += sale.quantity;
      productMap[name].revenue += sale.totalPrice;
    });
    
    const topProducts = Object.entries(productMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    console.log('✅ Report generated:', {
      totalSales: sales.length,
      totalOrders: orders.length,
      totalRevenue
    });
    
    res.json({
      period: {
        from: startDate,
        to: endDate,
        type
      },
      summary: {
        totalTransactions: sales.length + orders.length,
        posTransactions: sales.length,
        onlineOrders: orders.length,
        totalRevenue: totalRevenue.toFixed(2),
        posRevenue: salesRevenue.toFixed(2),
        onlineRevenue: ordersRevenue.toFixed(2),
        averageTransaction: ((totalRevenue / (sales.length + orders.length)) || 0).toFixed(2)
      },
      paymentBreakdown: {
        cash: {
          count: cashSales.length,
          revenue: cashRevenue.toFixed(2)
        },
        card: {
          count: cardSales.length,
          revenue: cardRevenue.toFixed(2)
        },
        online: {
          count: orders.length,
          revenue: ordersRevenue.toFixed(2)
        }
      },
      topProducts,
      transactions: [...sales, ...orders].sort((a, b) => new Date(b.date) - new Date(a.date))
    });
    
  } catch (err) {
    console.error('❌ Report generation error:', err);
    res.status(500).json({ message: 'Failed to generate report', error: err.message });
  }
};
