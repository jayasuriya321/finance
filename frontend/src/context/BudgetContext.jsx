import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import API from "../utils/api";
import { useAuth } from "./AuthContext";

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const { token, ready } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auto-clear messages
  const showMessage = (type, message) => {
    if (type === "error") setError(message);
    else setSuccess(message);
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  /** 📦 Fetch budgets */
  const fetchBudgets = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/budgets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      // Optional: sort by creation date
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBudgets(data);
    } catch (err) {
      console.error("Error fetching budgets:", err.response?.data?.message || err.message);
      showMessage("error", err.response?.data?.message || "Failed to fetch budgets");
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  /** ➕ Add budget */
  const addBudget = async (budgetData) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.post("/budgets", budgetData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newBudget = res.data.data;
      setBudgets((prev) => [newBudget, ...prev]);
      showMessage("success", "Budget added successfully!");
      return newBudget;
    } catch (err) {
      console.error("Error adding budget:", err.response?.data?.message || err.message);
      showMessage("error", err.response?.data?.message || "Failed to add budget");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** ✏️ Update budget */
  const updateBudget = async (id, updatedData) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.put(`/budgets/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedBudget = res.data.data;
      setBudgets((prev) =>
        prev.map((b) => (b._id === id ? updatedBudget : b))
      );
      showMessage("success", "Budget updated successfully!");
      return updatedBudget;
    } catch (err) {
      console.error("Error updating budget:", err.response?.data?.message || err.message);
      showMessage("error", err.response?.data?.message || "Failed to update budget");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** ❌ Delete budget */
  const deleteBudget = async (id) => {
    if (!token) return;
    setLoading(true);
    try {
      await API.delete(`/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets((prev) => prev.filter((b) => b._id !== id));
      showMessage("success", "Budget deleted successfully!");
    } catch (err) {
      console.error("Error deleting budget:", err.response?.data?.message || err.message);
      showMessage("error", err.response?.data?.message || "Failed to delete budget");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Computed values for dashboard/chart usage
  const totalBudgeted = useMemo(
    () => budgets.reduce((acc, b) => acc + Number(b.amount || 0), 0),
    [budgets]
  );
  const overBudgetCount = useMemo(
    () => budgets.filter((b) => Number(b.spent || 0) > Number(b.amount || 0)).length,
    [budgets]
  );

  // Auto-fetch on auth ready
  useEffect(() => {
    if (ready && token) fetchBudgets();
  }, [ready, token, fetchBudgets]);

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        loading,
        error,
        success,
        fetchBudgets,
        addBudget,
        updateBudget,
        deleteBudget,
        totalBudgeted,
        overBudgetCount,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

// Custom hook
export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (!context) throw new Error("useBudgets must be used within BudgetProvider");
  return context;
};
