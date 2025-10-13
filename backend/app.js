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

// ✅ Middleware
app.use(express.json());

// ✅ CORS configuration (very important for Netlify + Render)
const allowedOrigins = [
  "http://localhost:5173", // for local dev
  "https://financeapp08.netlify.app/", // ✅ replace with your actual Netlify domain
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ✅ Health check route (to confirm Render deployment)
app.get("/", (req, res) => {
  res.send("✅ Personal Finance Manager backend is live!");
});

// ✅ Route mounting
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

// ✅ Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
