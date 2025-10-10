import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import API from "../utils/api";
import { useAuth } from "./AuthContext";

const GoalContext = createContext();

export const GoalProvider = ({ children }) => {
  const { token, ready } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const showMessage = (type, message) => {
    if (type === "error") setError(message);
    else setSuccess(message);
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  const normalizeGoal = (g) => ({
    ...g,
    title: g.title || g.name || "Untitled Goal",
    currentAmount: Number(g.currentAmount || 0),
    targetAmount: Number(g.targetAmount || 0),
    progressPercent: g.targetAmount
      ? Math.min((Number(g.currentAmount || 0) / Number(g.targetAmount)) * 100, 100)
      : 0,
  });

  const fetchGoals = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/goals", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setGoals(data.map(normalizeGoal));
    } catch (err) {
      console.error("Error fetching goals:", err.response?.data?.message || err.message);
      showMessage("error", err.response?.data?.message || "Failed to fetch goals");
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addGoal = async (goalData) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.post("/goals", goalData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newGoal = normalizeGoal(res.data?.data || res.data);
      setGoals((prev) => [newGoal, ...prev]);
      showMessage("success", "Goal added successfully!");
      return newGoal;
    } catch (err) {
      console.error("Error adding goal:", err.response?.data?.message || err.message);
      showMessage("error", err.response?.data?.message || "Failed to add goal");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (id, updatedData) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.put(`/goals/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedGoal = normalizeGoal(res.data?.data || res.data);
      setGoals((prev) => prev.map((g) => (g._id === id ? updatedGoal : g)));
      showMessage("success", "Goal updated successfully!");
      return updatedGoal;
    } catch (err) {
      console.error("Error updating goal:", err.response?.data?.message || err.message);
      showMessage("error", err.response?.data?.message || "Failed to update goal");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id) => {
    if (!token) return;
    setLoading(true);
    try {
      await API.delete(`/goals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoals((prev) => prev.filter((g) => g._id !== id));
      showMessage("success", "Goal deleted successfully!");
    } catch (err) {
      console.error("Error deleting goal:", err.response?.data?.message || err.message);
      showMessage("error", err.response?.data?.message || "Failed to delete goal");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Computed fields for dashboard
  const totalTarget = useMemo(() => goals.reduce((acc, g) => acc + g.targetAmount, 0), [goals]);
  const totalSaved = useMemo(() => goals.reduce((acc, g) => acc + g.currentAmount, 0), [goals]);
  const completedGoalsCount = useMemo(() => goals.filter((g) => g.progressPercent >= 100).length, [goals]);

  useEffect(() => {
    if (ready && token) fetchGoals();
  }, [ready, token, fetchGoals]);

  return (
    <GoalContext.Provider
      value={{
        goals,
        loading,
        error,
        success,
        fetchGoals,
        addGoal,
        updateGoal,
        deleteGoal,
        totalTarget,
        totalSaved,
        completedGoalsCount,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (!context) throw new Error("useGoals must be used within GoalProvider");
  return context;
};
