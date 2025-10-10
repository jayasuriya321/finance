import { useState, useEffect, useMemo } from "react";
import { useBudgets } from "../context/BudgetContext";
import Confirm from "../components/Confirm";
import ButtonLoader from "../components/ButtonLoader";
import { Search, Edit2, Check, X } from "lucide-react";

export default function BudgetManager() {
  const { budgets, loading, fetchBudgets, addBudget, updateBudget, deleteBudget } = useBudgets();

  const [form, setForm] = useState({ name: "", limit: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", limit: "" });

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.limit || Number(form.limit) <= 0) {
      setMessage({ type: "error", text: "Please fill in all fields with valid values" });
      return;
    }
    try {
      await addBudget({ name: form.name.trim(), limit: Number(form.limit) });
      setForm({ name: "", limit: "" });
      setMessage({ type: "success", text: "Budget added successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to add budget" });
    }
  };

  const handleEdit = async (id) => {
    if (!editForm.name.trim() || !editForm.limit || Number(editForm.limit) <= 0) {
      setMessage({ type: "error", text: "Please fill in all fields with valid values" });
      return;
    }
    try {
      await updateBudget(id, { name: editForm.name.trim(), limit: Number(editForm.limit) });
      setEditingId(null);
      setMessage({ type: "success", text: "Budget updated successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update budget" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      setMessage({ type: "success", text: "Budget deleted successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to delete budget" });
    }
  };

  const filteredBudgets = useMemo(
    () => budgets.filter(b => b.name.toLowerCase().includes(search.toLowerCase())),
    [budgets, search]
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto font-outfit space-y-6">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center sm:text-left">
        Manage Budgets
      </h1>

      {/* Messages */}
      {message.text && (
        <div className={`p-3 rounded text-sm border ${message.type === "success" ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}`}>
          {message.text}
        </div>
      )}

      {/* Add Budget Form */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 flex flex-col sm:flex-row gap-3 items-center p-4 sm:p-6">
        <input
          type="text"
          placeholder="Budget Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="p-3 border rounded-lg flex-1 focus:ring-2 focus:ring-indigo-500 w-full"
        />
        <input
          type="number"
          placeholder="Limit (₹)"
          value={form.limit}
          onChange={(e) => setForm({ ...form, limit: e.target.value })}
          className="p-3 border rounded-lg w-full sm:w-40 focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center disabled:opacity-60 w-full sm:w-auto"
        >
          {loading ? <ButtonLoader className="h-5 w-5" /> : "Add Budget"}
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Search className="text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search budgets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* Budgets List */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBudgets.length === 0 ? (
          <p className="text-gray-500 text-center col-span-full py-6">No budgets found</p>
        ) : (
          filteredBudgets.map(b => {
            const spent = b.spent || 0;
            const overBudget = spent > b.limit;
            const progressPercent = Math.min((spent / b.limit) * 100, 100);

            return (
              <div key={b._id} className="bg-white shadow-lg border border-gray-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-2xl transition">
                {editingId === b._id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="number"
                      value={editForm.limit}
                      onChange={(e) => setEditForm({ ...editForm, limit: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleEdit(b._id)} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2">
                        <Check className="w-4 h-4" /> Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center gap-2">
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-gray-800 font-semibold text-lg">{b.name}</p>
                        <p className={`text-sm ${overBudget ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                          Limit: ₹{b.limit.toLocaleString()} | Spent: ₹{spent.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingId(b._id); setEditForm({ name: b.name, limit: b.limit }); }}
                          className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-600 flex items-center gap-1"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <Confirm message={`Delete budget "${b.name}"?`} onConfirm={() => handleDelete(b._id)}>
                          <button className="bg-red-500 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-red-600">
                            Delete
                          </button>
                        </Confirm>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-3 rounded-full transition-all duration-300 ${overBudget ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
