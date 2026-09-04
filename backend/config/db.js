const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error("❌ Fatal: MONGO_URI environment variable is not defined.");
    console.error("👉 Please set MONGO_URI in your .env file or hosting provider environment variables.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000 // 10s timeout for cloud clusters like MongoDB Atlas
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} [DB: ${conn.connection.name}]`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    if (mongoURI.includes("mongodb+srv://")) {
      console.error("💡 Atlas Hosting Tip: Make sure your current IP address or '0.0.0.0/0' (anywhere) is allowed in MongoDB Atlas > Network Access.");
      console.error("💡 Atlas Hosting Tip: Double check your MongoDB Atlas database username, password, and cluster name in MONGO_URI.");
    }
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB connection disconnected.");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB connection re-established.");
});

module.exports = connectDB;