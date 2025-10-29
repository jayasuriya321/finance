import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import API from "../utils/api";
import { useAuth } from "./AuthContext";

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const { token, ready } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🧭 Success / error messages
  const showMessage = (type, message) => {
    if (type === "error") setError(message);
    else setSuccess(message);
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  // 📦 Fetch budgets
  const fetchBudgets = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/budgets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBudgets(data);
    } catch (err) {
      console.error("Error fetching budgets:", err);
      showMessage("error", "Failed to fetch budgets");
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ✅ Fetch alerts
  const fetchAlerts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await API.get("/budgets/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setAlerts(res.data.data);
    } catch (err) {
      console.error("Error fetching budget alerts:", err);
    }
  }, [token]);

  // ➕ Add
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
      console.error("Error adding budget:", err);
      showMessage("error", "Failed to add budget");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Update
  const updateBudget = async (id, updatedData) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.put(`/budgets/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedBudget = res.data.data;
      setBudgets((prev) => prev.map((b) => (b._id === id ? updatedBudget : b)));
      showMessage("success", "Budget updated successfully!");
      return updatedBudget;
    } catch (err) {
      console.error("Error updating budget:", err);
      showMessage("error", "Failed to update budget");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete
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
      console.error("Error deleting budget:", err);
      showMessage("error", "Failed to delete budget");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 📊 Combine + remove duplicates
  const budgetInsights = useMemo(() => {
    const localInsights = budgets
      .map((b) => {
        const spent = Number(b.spent || 0);
        const limit = Number(b.limit || 0);
        const percent = limit > 0 ? (spent / limit) * 100 : 0;

        if (percent >= 100)
          return {
            category: b.name,
            type: "danger",
            message: `⚠️ You exceeded your ${b.name} budget by ₹${(spent - limit).toLocaleString()}.`,
          };
        else if (percent >= 80)
          return {
            category: b.name,
            type: "warning",
            message: `⚠️ You’ve used ${percent.toFixed(1)}% of your ${b.name} budget.`,
          };
        else return null;
      })
      .filter(Boolean);

    // Combine + remove duplicates by category + message
    const allAlerts = [...localInsights, ...alerts];
    const unique = [];
    const seen = new Set();

    for (const alert of allAlerts) {
      const key = `${alert.category}-${alert.message}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(alert);
      }
    }

    return unique;
  }, [budgets, alerts]);

  // 💰 Totals
  const totalBudgeted = useMemo(
    () => budgets.reduce((acc, b) => acc + Number(b.limit || 0), 0),
    [budgets]
  );
  const totalSpent = useMemo(
    () => budgets.reduce((acc, b) => acc + Number(b.spent || 0), 0),
    [budgets]
  );
  const totalRemaining = useMemo(
    () => totalBudgeted - totalSpent,
    [totalBudgeted, totalSpent]
  );
  const overBudgetCount = useMemo(
    () => budgets.filter((b) => Number(b.spent || 0) > Number(b.limit || 0)).length,
    [budgets]
  );

  // 🧩 Load
  useEffect(() => {
    if (ready && token) {
      fetchBudgets();
      fetchAlerts();
    }
  }, [ready, token, fetchBudgets, fetchAlerts]);

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
        totalSpent,
        totalRemaining,
        overBudgetCount,
        budgetInsights,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgets = () => useContext(BudgetContext);
