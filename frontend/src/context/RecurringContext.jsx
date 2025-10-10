import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import API from "../utils/api";
import { useAuth } from "./AuthContext";

const RecurringContext = createContext();

export const RecurringProvider = ({ children }) => {
  const { token, ready } = useAuth();
  const [recurrings, setRecurrings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔔 Auto-clear messages after delay
  const showMessage = useCallback((type, message) => {
    if (type === "error") setError(message);
    else setSuccess(message);

    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  }, []);

  /** 📦 Fetch recurring expenses */
  const fetchRecurrings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.get("/recurrings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setRecurrings(data);
    } catch (err) {
      console.error("Error fetching recurrings:", err);
      showMessage("error", err.response?.data?.message || "Failed to fetch recurring expenses");
      setRecurrings([]);
    } finally {
      setLoading(false);
    }
  }, [token, showMessage]);

  /** ➕ Add recurring expense */
  const addRecurring = useCallback(async (data) => {
    if (!token) return null;
    setLoading(true);
    try {
      const res = await API.post("/recurrings", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecurrings((prev) => [res.data.data, ...prev]);
      showMessage("success", "Recurring expense added successfully!");
      return res.data.data;
    } catch (err) {
      console.error("Error adding recurring:", err);
      showMessage("error", err.response?.data?.message || "Failed to add recurring expense");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, showMessage]);

  /** ✏️ Update recurring expense */
  const updateRecurring = useCallback(async (id, data) => {
    if (!token) return null;
    setLoading(true);
    try {
      const res = await API.put(`/recurrings/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecurrings((prev) =>
        prev.map((r) => (r._id === id ? res.data.data : r))
      );
      showMessage("success", "Recurring expense updated successfully!");
      return res.data.data;
    } catch (err) {
      console.error("Error updating recurring:", err);
      showMessage("error", err.response?.data?.message || "Failed to update recurring expense");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, showMessage]);

  /** ❌ Delete recurring expense */
  const deleteRecurring = useCallback(async (id) => {
    if (!token) return;
    setLoading(true);
    try {
      await API.delete(`/recurrings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecurrings((prev) => prev.filter((r) => r._id !== id));
      showMessage("success", "Recurring expense deleted successfully!");
    } catch (err) {
      console.error("Error deleting recurring:", err);
      showMessage("error", err.response?.data?.message || "Failed to delete recurring expense");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, showMessage]);

  // 🧠 Memoized context value for optimization
  const value = useMemo(
    () => ({
      recurrings,
      loading,
      error,
      success,
      fetchRecurrings,
      addRecurring,
      updateRecurring,
      deleteRecurring,
    }),
    [recurrings, loading, error, success, fetchRecurrings, addRecurring, updateRecurring, deleteRecurring]
  );

  // 🚀 Auto-fetch recurrings on auth ready
  useEffect(() => {
    if (ready && token) fetchRecurrings();
  }, [ready, token, fetchRecurrings]);

  return (
    <RecurringContext.Provider value={value}>
      {children}
    </RecurringContext.Provider>
  );
};

// 🪝 Custom Hook
export const useRecurring = () => {
    const context = useContext(RecurringContext);
    if (!context)
      throw new Error("useRecurring must be used within a RecurringProvider");
    return context;
};
