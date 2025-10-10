import { useEffect, useState } from "react";
import { useRecurring } from "../context/RecurringContext";
import Confirm from "../components/Confirm";
import ButtonLoader from "../components/ButtonLoader";
import { Search, Edit2, Check, X } from "lucide-react";

export default function RecurringExpenseManager() {
  const {
    recurrings,
    fetchRecurrings,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    loading,
    error,
  } = useRecurring();

  const [form, setForm] = useState({
    name: "",
    amount: "",
    frequency: "monthly",
    startDate: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", amount: "", frequency: "monthly" });
  const [btnLoading, setBtnLoading] = useState(false);

  // Fetch recurrings when component mounts
  useEffect(() => {
    fetchRecurrings();
  }, [fetchRecurrings]);

  // Auto-clear messages
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.amount || !form.frequency) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }
    if (Number(form.amount) <= 0) {
      setMessage({ type: "error", text: "Amount must be greater than zero" });
      return;
    }

    setBtnLoading(true);
    try {
      await addRecurring({ ...form, amount: Number(form.amount) });
      setForm({ name: "", amount: "", frequency: "monthly", startDate: "" });
      setMessage({ type: "success", text: "Recurring expense added successfully!" });
    } catch {
      setMessage({ type: "error", text: "Failed to add recurring expense" });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editForm.name || !editForm.amount || !editForm.frequency) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }
    if (Number(editForm.amount) <= 0) {
      setMessage({ type: "error", text: "Amount must be greater than zero" });
      return;
    }

    setBtnLoading(true);
    try {
      await updateRecurring(id, { ...editForm, amount: Number(editForm.amount) });
      setEditingId(null);
      setMessage({ type: "success", text: "Recurring expense updated successfully!" });
    } catch {
      setMessage({ type: "error", text: "Failed to update recurring expense" });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setBtnLoading(true);
    try {
      await deleteRecurring(id);
      setMessage({ type: "success", text: "Recurring expense deleted successfully!" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete recurring expense" });
    } finally {
      setBtnLoading(false);
    }
  };

  const filteredItems = recurrings
    .slice()
    .sort((a, b) => new Date(a.startDate || a.createdAt) - new Date(b.startDate || b.createdAt))
    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <p className="text-center mt-6">Loading...</p>;
  if (error) return <p className="text-red-600 text-center mt-6">{error}</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Recurring Expense Manager</h1>

      {/* Message */}
      {message.text && (
        <div
          className={`mb-4 p-3 rounded text-sm border transition-all ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-red-100 text-red-700 border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add Form */}
      <div className="bg-white border border-gray-100 shadow rounded-lg p-5 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Add Recurring Expense</h2>
        <form onSubmit={handleAdd} className="grid md:grid-cols-5 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Expense Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Amount (₹)"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <select
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            className="p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
          </select>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={btnLoading}
            className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition flex justify-center items-center disabled:opacity-60"
          >
            {btnLoading ? <ButtonLoader className="h-5 w-5" /> : "Add"}
          </button>
        </form>
      </div>

      {/* Search */}
      <div className="flex items-center mb-5 gap-2">
        <Search className="text-gray-500 w-5 h-5" />
        <input
          type="text"
          placeholder="Search recurring expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="text-center text-gray-500 col-span-full py-6">
            <p className="flex flex-col items-center gap-2">
              <span className="text-4xl">💸</span>
              No recurring expenses found
            </p>
          </div>
        ) : (
          filteredItems.map((it) => (
            <div
              key={it._id}
              className="bg-white shadow border border-gray-100 rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition"
            >
              {editingId === it._id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <select
                    value={editForm.frequency}
                    onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(it._id)}
                      className="bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 transition flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-400 transition flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{it.name}</h3>
                    <p className="text-gray-600 mt-1">
                      ₹{it.amount.toLocaleString()} —{" "}
                      <span className="capitalize">{it.frequency}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Start: {new Date(it.startDate || it.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setEditingId(it._id);
                        setEditForm({
                          name: it.name,
                          amount: it.amount,
                          frequency: it.frequency,
                        });
                      }}
                      className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded hover:bg-blue-600 transition flex items-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>

                    <Confirm message={`Delete recurring expense "${it.name}"?`} onConfirm={() => handleDelete(it._id)}>
                      <button className="bg-red-500 text-white px-3 py-1.5 text-sm rounded hover:bg-red-600 transition">
                        Delete
                      </button>
                    </Confirm>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
