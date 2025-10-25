const mongoose = require('mongoose');
const Sale = require('../models/Sale');

exports.recordSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log('🛒 POS SALE REQUEST RECEIVED');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

    const { items, total, paymentType } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('❌ No items provided in request');
      return res.status(400).json({ message: 'No items provided' });
    }
    
    console.log(`✅ Processing ${items.length} items, total: $${total}`);
    
    const saleDocuments = items.map(item => {
      if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
        throw new Error(`Invalid productId: ${item.productId}`);
      }
      return {
        product: item.productId,
        quantity: item.qty,
        totalPrice: item.price * item.qty,
        date: new Date(),
        paymentMethod: paymentType || 'N/A', // 🎯 FIX: Use paymentMethod field
      };
    });

    const savedSales = await Sale.insertMany(saleDocuments, { session });
    
    console.log(`✅ Successfully saved ${savedSales.length} sales to database`);
    console.log(`💾 Sale IDs:`, savedSales.map(s => s._id));
    console.log(`🗄️  Collection:`, Sale.collection.name);
    console.log(`🌐 Database:`, mongoose.connection.name);
    
    // Verify the sales were actually written to the database
    const verifyCount = await Sale.countDocuments({ _id: { $in: savedSales.map(s => s._id) } });
    console.log(`✅ Verification: ${verifyCount}/${savedSales.length} sales confirmed in database`);

    // If all operations were successful, commit the transaction
    await session.commitTransaction();
    
    // 🎯 NEW CODE BEGIN — Emit real-time update
    try {
      const io = req.app.get("io");
      if (io) {
        io.emit("stats_update", {
          count: savedSales.length,
          type: paymentType, // 🎯 FIX: Send paymentType for the live feed
          total,
          timestamp: Date.now()
        });
        console.log("📡 Emitted stats_update event via Socket.IO");
      } else {
        console.log("⚠️ Socket.IO instance not found on app");
      }
    } catch (emitErr) {
      console.error("⚠️ Socket.IO emit error:", emitErr);
    }
    // 🎯 NEW CODE END
    
    res.status(201).json({
      message: 'Sales recorded successfully',
      count: savedSales.length,
      total: total,
      paymentType: paymentType,
      sales: savedSales
    });
  } catch (err) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    console.error('❌ ERROR RECORDING SALE:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    session.endSession();
  }
};

// 🎯 STAGE 9 — LIST SALES WITH FILTERS
exports.listSales = async (req, res) => {
  try {
    const { from, to, paymentType, minTotal, maxTotal, page = 1, limit = 50 } = req.query;
    
    // Build query object
    const query = {};
    
    // Filter by payment type (stored in customerName field)
    if (paymentType) {
      query.paymentMethod = paymentType; // 🎯 FIX: Filter by the correct 'paymentMethod' field
    }
    
    // Filter by price range
    if (minTotal || maxTotal) {
      query.totalPrice = {};
      if (minTotal) query.totalPrice.$gte = Number(minTotal);
      if (maxTotal) query.totalPrice.$lte = Number(maxTotal);
    }
    
    // Filter by date range
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    
    // Pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(500, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    
    console.log('📜 Fetching sales history with query:', query);
    console.log('📄 Pagination: page', pageNum, 'limit', limitNum);
    
    // Execute query with population
    const [items, count] = await Promise.all([
      Sale.find(query)
        .populate('product', 'name price imageUrl')
        .sort({ date: -1, _id: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Sale.countDocuments(query)
    ]);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limitNum) || 1;
    
    console.log(`✅ Found ${items.length} sales (total: ${count})`);
    
    res.json({
      items,
      total: count,
      page: pageNum,
      pages: totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1
    });
    
  } catch (err) {
    console.error('❌ List sales error:', err);
    res.status(500).json({ message: 'Failed to fetch sales history', error: err.message });
  }
};
