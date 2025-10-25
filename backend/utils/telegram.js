// backend/utils/telegram.js
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// Send a message to your group
function sendTelegramMessage(text) {
  return bot.sendMessage(process.env.TELEGRAM_CHAT_ID, text);
}

module.exports = { sendTelegramMessage };