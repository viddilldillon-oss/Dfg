// test-telegram.js
require("dotenv").config({ path: "../.env" });
const TelegramBot = require("node-telegram-bot-api");

// Load from .env
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

console.log("🔎 ENV values loaded:", {
  TELEGRAM_BOT_TOKEN: token ? "✅ (loaded)" : "❌ (missing)",
  TELEGRAM_CHAT_ID: chatId || "❌ (missing)"
});

if (!token || !chatId) {
  console.error("❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: false });

// Test message
bot.sendMessage(chatId, "✅ Test: Telegram integration is working!")
  .then(() => console.log("✅ Telegram message sent"))
  .catch(err => console.error("❌ Telegram error:", err));