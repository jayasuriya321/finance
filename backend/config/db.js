// backend/config/db.js

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  const connectWithRetry = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ MongoDB connected successfully");
    } catch (error) {
      retries += 1;
      console.error(`❌ MongoDB connection error: ${error.message}`);
      if (retries < maxRetries) {
        console.log(`🔄 Retrying MongoDB connection (${retries}/${maxRetries}) in 5 seconds...`);
        setTimeout(connectWithRetry, 5000);
      } else {
        console.error("❌ Could not connect to MongoDB after multiple attempts. Exiting...");
        process.exit(1);
      }
    }
  };

  await connectWithRetry();
};

// Optional: Handle graceful shutdown
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected!");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB reconnected");
});

export default connectDB;
