// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import CategoryManager from "./pages/CategoryManager";
import BudgetManager from "./pages/BudgetManager";
import RecurringExpenseManager from "./pages/RecurringExpenseManager";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import DashboardLayout from "./components/DashboardLayout";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="add-expense" element={<AddExpense />} />
        <Route path="categories" element={<CategoryManager />} />
        <Route path="budgets" element={<BudgetManager />} />
        <Route path="recurring-expenses" element={<RecurringExpenseManager />} />
        <Route path="goals" element={<Goals />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Redirect unknown paths */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
