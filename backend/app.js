// app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// Import routes
import authRoutes from "./routes/authRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import recurringExpenseRoutes from "./routes/recurringExpenseRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Import error middleware
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// Middleware
app.use(express.json());

// ✅ CORS configuration (works for local dev and Netlify frontend)
const allowedOrigins = [
  "http://localhost:5173",               // Local dev frontend
  "https://financeapp09.netlify.app"    // Deployed frontend
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Allow requests like Postman
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Allow cookies if you use them
}));

// Health check
app.get("/", (req, res) => {
  res.send("✅ Backend is live!");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/recurrings", recurringExpenseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
