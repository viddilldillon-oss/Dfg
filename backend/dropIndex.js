// dropIndex.js
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI;

async function dropOldIndexes() {
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI not found in .env file!");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const collection = mongoose.connection.db.collection("suppliersheets");
    const result = await collection.dropIndexes();
    console.log("🗑️  Dropped all indexes:", result);

    const newIndexes = await collection.indexes();
    console.log("📋 Current indexes after drop:", newIndexes);
  } catch (err) {
    console.error("❌ Error dropping indexes:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

dropOldIndexes();