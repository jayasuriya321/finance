// server.js
import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import startRecurringJob from "./scheduler/recurringJob.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // ✅ Start recurring job after server launch
  startRecurringJob();
});
