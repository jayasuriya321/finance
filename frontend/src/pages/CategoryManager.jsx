import { useEffect, useState } from "react";
import API from "../utils/api";
import Confirm from "../components/Confirm";
import ButtonLoader from "../components/ButtonLoader";
import { Search, Edit2 } from "lucide-react";
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

  useEffect(() => {
    if (!message.text) return;
    const timer = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  // =========================
  // Add Category
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
  // Delete Category
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
  // Edit Category
  // =========================
  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

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

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // =========================
  // Render
  // =========================
  return (
    <div className="max-w-7xl mx-auto p-6 font-outfit">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Manage Categories
      </h1>

      {/* Message */}
      {message.text && (
        <div
          className={`mb-5 p-3 rounded-lg text-sm border shadow-sm transition-all ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border-green-300"
              : "bg-red-50 text-red-700 border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add / Edit Category */}
      <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
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
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none"
          />
          <button
            onClick={editingId ? handleEdit : handleAdd}
            disabled={loading}
            className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-[#f45a57] transition flex items-center justify-center disabled:opacity-60 shadow-sm"
          >
            {loading ? <ButtonLoader className="h-5 w-5" /> : editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-300 transition shadow-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 mb-5 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <Search className="text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border-none outline-none text-gray-700 placeholder-gray-400 bg-transparent"
        />
      </div>

      {/* Category List */}
      <div className="bg-white shadow-md rounded-2xl border border-gray-100 p-5">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Your Categories</h2>

        {fetching ? (
          <p className="text-gray-500 text-center py-6">Loading categories...</p>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            <span className="text-4xl">📂</span>
            <p>No categories found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredCategories.map((cat) => (
              <li
                key={cat._id}
                className="flex justify-between items-center py-3 hover:bg-gray-50 px-2 rounded-lg transition-all"
              >
                <span className="text-gray-800 font-medium">{cat.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(cat)}
                    className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-600 transition flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <Confirm
                    message={`Are you sure you want to delete "${cat.name}"?`}
                    onConfirm={() => handleDelete(cat._id)}
                  >
                    <button className="bg-red-500 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-red-600 transition">
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
