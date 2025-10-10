import { createContext, useContext, useEffect, useState, useCallback } from "react";
import API from "../utils/api";
import { useAuth } from "./AuthContext";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const { token, ready } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auto-clear message helper
  const showMessage = (type, message) => {
    if (type === "error") setError(message);
    else setSuccess(message);
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  /** 📦 Fetch all categories */
  const fetchCategories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err.response?.data?.message || err.message);
      showMessage("error", err.response?.data?.message || "Failed to fetch categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  /** ➕ Add a new category */
  const addCategory = async (categoryData) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.post("/categories", categoryData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newCategory = res.data.data;
      setCategories((prev) => [newCategory, ...prev]);
      showMessage("success", "Category added successfully!");
      return newCategory;
    } catch (err) {
      console.error("Error adding category:", err.response?.data?.message || err.message);
      showMessage("error", err.response?.data?.message || "Failed to add category");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** ✏️ Update a category */
  const updateCategory = async (id, updatedData) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.put(`/categories/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = res.data.data;
      setCategories((prev) =>
        prev.map((cat) => (cat._id === id ? updated : cat))
      );
      showMessage("success", "Category updated successfully!");
      return updated;
    } catch (err) {
      console.error("Error updating category:", err.response?.data?.message || err.message);
      showMessage("error", err.response?.data?.message || "Failed to update category");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** ❌ Delete a category */
  const deleteCategory = async (id) => {
    if (!token) return;
    setLoading(true);
    try {
      await API.delete(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      showMessage("success", "Category deleted successfully!");
    } catch (err) {
      console.error("Error deleting category:", err.response?.data?.message || err.message);
      showMessage("error", err.response?.data?.message || "Failed to delete category");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when auth is ready
  useEffect(() => {
    if (ready && token) fetchCategories();
  }, [ready, token, fetchCategories]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        error,
        success,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);
