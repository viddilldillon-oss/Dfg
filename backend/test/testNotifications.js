// testNotifications.js
require("dotenv").config();
const nodemailer = require("nodemailer");
const TelegramBot = require("node-telegram-bot-api");

// Load from .env
const INTERAC_EMAIL = process.env.INTERAC_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

console.log("🔎 ENV values loaded:", {
  INTERAC_EMAIL: INTERAC_EMAIL || "❌ (missing)",
  GMAIL_APP_PASSWORD: GMAIL_APP_PASSWORD ? "✅ (set)" : "❌ (missing)",
  TELEGRAM_BOT_TOKEN: TELEGRAM_BOT_TOKEN ? "✅ (set)" : "❌ (missing)",
  TELEGRAM_CHAT_ID: TELEGRAM_CHAT_ID ? "✅ (set)" : "❌ (missing)",
});

// ---------- EMAIL TEST ----------
if (INTERAC_EMAIL && GMAIL_APP_PASSWORD) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: INTERAC_EMAIL, pass: GMAIL_APP_PASSWORD },
    tls: { rejectUnauthorized: false }, // ✅ bypass self-signed cert error
  });

  transporter.sendMail(
    {
      from: `"Test Supa Dillie" <${INTERAC_EMAIL}>`,
      to: INTERAC_EMAIL, // send to yourself
      subject: "✅ Test Email",
      text: "If you see this, Gmail is working!",
    },
    (err, info) => {
      if (err) console.error("❌ Email failed:", err.message);
      else console.log("✅ Email sent:", info.response);
    }
  );
} else {
  console.error("❌ Email not configured correctly.");
}

// ---------- TELEGRAM TEST ----------
if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
  const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
  bot
    .sendMessage(
      TELEGRAM_CHAT_ID,
      "✅ Test: Telegram integration is working!"
    )
    .then(() => console.log("✅ Telegram message sent"))
    .catch((err) => console.error("❌ Telegram error:", err.message));
} else {
  console.error("❌ Telegram not configured correctly.");
}