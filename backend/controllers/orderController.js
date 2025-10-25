// backend/controllers/orderController.js
const Order = require("../models/Order");
const nodemailer = require("nodemailer");
const TelegramBot = require("node-telegram-bot-api");

// ✅ Telegram setup
const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// ✅ Configure Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.INTERAC_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password
  },
});

// Create new order
exports.createOrder = async (req, res, next) => {
  try {
    const { customerName, customerEmail, customerPhone, customerAddress, items, total } = req.body;

    const order = new Order({
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items,
      total,
    });

    await order.save();

    // ✅ Email to store
    const storeMail = {
      from: `"Supa Dillie-Cious Mart" <${process.env.INTERAC_EMAIL}>`,
      to: process.env.INTERAC_EMAIL,
      subject: `🛒 New Order from ${customerName}`,
      html: `
        <h2>New Order Received</h2>
        <p><b>Name:</b> ${customerName}</p>
        <p><b>Email:</b> ${customerEmail}</p>
        <p><b>Phone:</b> ${customerPhone}</p>
        <p><b>Address:</b> ${customerAddress}</p>
        <p><b>Total:</b> $${total.toFixed(2)}</p>
        <h3>Items:</h3>
        <ul>
          ${items.map(i => `<li>${i.qty} × ${i.name} ($${i.price})</li>`).join("")}
        </ul>
      `,
    };

    // ✅ Email to customer
    const customerMail = {
      from: `"Supa Dillie-Cious Mart" <${process.env.INTERAC_EMAIL}>`,
      to: customerEmail,
      subject: `✅ Order Confirmation — Supa Dillie-Cious Mart`,
      html: `
        <h2>Thank you for your order, ${customerName}!</h2>
        <p>We’ve received your order and will start preparing it soon.</p>
        <p><b>Total Paid:</b> $${total.toFixed(2)}</p>
        <h3>Items:</h3>
        <ul>
          ${items.map(i => `<li>${i.qty} × ${i.name} ($${i.price})</li>`).join("")}
        </ul>
        <p>We’ll contact you at <b>${customerPhone}</b> if needed.</p>
        <br/>
        <p>Thanks again for shopping with us! 🇯🇲</p>
      `,
    };

    // ✅ Send both emails
    transporter.sendMail(storeMail, (err, info) => {
      if (err) console.error("❌ Store email failed:", err);
      else console.log("✅ Store email sent:", info.response);
    });

    transporter.sendMail(customerMail, (err, info) => {
      if (err) console.error("❌ Customer email failed:", err);
      else console.log("✅ Customer email sent:", info.response);
    });

    // ✅ Telegram notification
    const tgMessage = `
🛒 *New Order Received*
👤 Name: ${customerName}
📧 Email: ${customerEmail || "N/A"}
📞 Phone: ${customerPhone || "N/A"}
🏠 Address: ${customerAddress}
💵 Total: $${total.toFixed(2)}

🛍️ Items:
${items.map(i => `- ${i.qty} × ${i.name} ($${i.price})`).join("\n")}
    `;

    if (TELEGRAM_CHAT_ID) {
      telegramBot.sendMessage(TELEGRAM_CHAT_ID, tgMessage, { parse_mode: "Markdown" })
        .then(() => console.log("✅ Telegram alert sent"))
        .catch(err => console.error("❌ Telegram failed:", err));
    } else {
      console.error("⚠️ TELEGRAM_CHAT_ID not set in .env");
    }

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// Get all orders
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// Get single order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// Update order status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = req.body.status || order.status;
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// Delete order
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (err) {
    next(err);
  }
};