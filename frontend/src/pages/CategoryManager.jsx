import { useEffect, useState } from "react";
import API from "../utils/api";
import Confirm from "../components/Confirm";
import ButtonLoader from "../components/ButtonLoader";
import { Search, Edit2, Check, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function CategoryManager() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [fetching, setFetching] = useState(true);

  // =========================
  // Fetch categories
  // =========================
  const fetchCategories = async () => {
    if (!token) return;
    setFetching(true);
    try {
      const res = await API.get("/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // ✅ Use res.data.data because backend returns { success: true, data: [...] }
      const data = res.data?.data || [];
      setCategories(data);
    } catch (err) {
      console.error("Fetch categories error:", err);
      setMessage({ type: "error", text: "Failed to load categories" });
      setCategories([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  // =========================
  // Auto-clear messages
  // =========================
  useEffect(() => {
    if (!message.text) return;
    const timer = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  // =========================
  // Add new category
  // =========================
  const handleAdd = async () => {
    const name = newCategory.trim();
    if (!name) {
      setMessage({ type: "error", text: "Please enter a category name" });
      return;
    }
    setLoading(true);
    try {
      await API.post(
        "/categories",
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewCategory("");
      setMessage({ type: "success", text: "Category added successfully!" });
      fetchCategories();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to add category",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Delete category
  // =========================
  const handleDelete = async (id) => {
    try {
      await API.delete(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ type: "success", text: "Category deleted successfully!" });
      fetchCategories();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete category",
      });
    }
  };

  // =========================
  // Start editing
  // =========================
  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
  };

  // =========================
  // Cancel editing
  // =========================
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  // =========================
  // Submit edit
  // =========================
  const handleEdit = async () => {
    const name = editName.trim();
    if (!name) {
      setMessage({ type: "error", text: "Category name cannot be empty" });
      return;
    }
    setLoading(true);
    try {
      await API.put(
        `/categories/${editingId}`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      setEditName("");
      setMessage({ type: "success", text: "Category updated successfully!" });
      fetchCategories();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update category",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Filter categories
  // =========================
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // =========================
  // Render
  // =========================
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Categories</h1>

      {/* Message */}
      {message.text && (
        <div
          className={`mb-4 p-3 rounded text-sm border transition-all duration-300 ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-red-100 text-red-700 border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add / Edit Category */}
      <div className="bg-white shadow rounded-lg p-4 mb-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">
          {editingId ? "Edit Category" : "Add New Category"}
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter category name"
            value={editingId ? editName : newCategory}
            onChange={(e) =>
              editingId ? setEditName(e.target.value) : setNewCategory(e.target.value)
            }
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            onClick={editingId ? handleEdit : handleAdd}
            disabled={loading}
            className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition flex items-center justify-center disabled:opacity-60"
          >
            {loading ? <ButtonLoader className="h-5 w-5" /> : editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="bg-gray-300 text-gray-700 px-5 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center mb-5 gap-2">
        <Search className="text-gray-500 w-5 h-5" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* Category List */}
      <div className="bg-white shadow rounded-lg p-4 border border-gray-100 transition-all">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Your Categories</h2>

        {fetching ? (
          <p className="text-gray-500 text-center py-6">Loading categories...</p>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            <span className="text-4xl">📂</span>
            <p>No categories found</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredCategories.map((cat) => (
              <li
                key={cat._id}
                className="flex justify-between items-center p-3 rounded border hover:shadow-sm transition-all duration-200"
              >
                <span className="text-gray-800 font-medium">{cat.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(cat)}
                    className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded hover:bg-blue-600 transition flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <Confirm
                    message={`Are you sure you want to delete "${cat.name}"?`}
                    onConfirm={() => handleDelete(cat._id)}
                  >
                    <button className="bg-red-500 text-white px-3 py-1.5 text-sm rounded hover:bg-red-600 transition">
                      Delete
                    </button>
                  </Confirm>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
