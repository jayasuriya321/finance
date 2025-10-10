import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../utils/api";
import { useAuth } from "./AuthContext";

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const { token, ready } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===== Fetch Expenses =====
  const fetchExpenses = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const res = await API.get("/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // ✅ Handle both array or {data: []} format
      setExpenses(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching expenses:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Failed to fetch expenses");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Auto-fetch on auth ready
  useEffect(() => {
    if (ready && token) fetchExpenses();
  }, [ready, token, fetchExpenses]);

  // ===== Add Expense =====
  const addExpense = async (expenseData) => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/expenses", expenseData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newExpense = res.data?.data || res.data;
      setExpenses((prev) => [newExpense, ...prev]);
      return newExpense;
    } catch (err) {
      console.error("Error adding expense:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Failed to add expense");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===== Update Expense =====
  const updateExpense = async (id, updatedData) => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await API.put(`/expenses/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedExpense = res.data?.data || res.data;
      setExpenses((prev) => prev.map((e) => (e._id === id ? updatedExpense : e)));
      return updatedExpense;
    } catch (err) {
      console.error("Error updating expense:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Failed to update expense");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===== Delete Expense =====
  const deleteExpense = async (id) => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      await API.delete(`/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Error deleting expense:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Failed to delete expense");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===== Context Value =====
  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        fetchExpenses,
        addExpense,
        updateExpense,  // ✅ Added for full CRUD
        deleteExpense,
        loading,
        error,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

// ===== Custom Hook =====
export const useExpenses = () => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error("useExpenses must be used within ExpenseProvider");
  return ctx;
};
