import { useEffect, useState } from "react";
import API from "../utils/api";
import Confirm from "../components/Confirm";
import ButtonLoader from "../components/ButtonLoader";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

export default function Category() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch categories from API
  const fetchCategories = async () => {
    if (!token) return;
    setFetching(true);
    try {
      const res = await API.get("/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.categories || [];
      setCategories(data);
    } catch (err) {
      console.error("Fetch categories error:", err);
      setCategories([]);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load categories",
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchCategories();
  }, [token]);

  // Add or Update category
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: "error", text: "Category name is required" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (editingId) {
        await API.put(
          `/categories/${editingId}`,
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage({ type: "success", text: "Category updated successfully!" });
      } else {
        await API.post(
          "/categories",
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage({ type: "success", text: "Category added successfully!" });
      }

      setName("");
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save category",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
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

  // Edit category
  const startEditing = (cat) => {
    setName(cat.name);
    setEditingId(cat._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel editing
  const cancelEdit = () => {
    setName("");
    setEditingId(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Categories</h1>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`mb-4 p-3 rounded text-sm border transition ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-red-100 text-red-700 border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add/Edit Category Form */}
      <div className="bg-white border border-gray-100 shadow rounded-lg p-5 mb-8">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">
          {editingId ? "Edit Category" : "Add New Category"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border rounded flex-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition flex items-center justify-center disabled:opacity-60"
            >
              {loading ? <ButtonLoader className="h-5 w-5" /> : editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Category List */}
      {fetching ? (
        <p className="text-gray-500 text-center py-6">Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No categories added yet</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white shadow border border-gray-100 rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{cat.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Created: {new Date(cat.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => startEditing(cat)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition"
                >
                  <PencilSquareIcon className="w-4 h-4" /> Edit
                </button>
                <Confirm
                  message={`Delete category "${cat.name}"?`}
                  onConfirm={() => deleteCategory(cat._id)}
                >
                  <button className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition">
                    <TrashIcon className="w-4 h-4" /> Delete
                  </button>
                </Confirm>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
