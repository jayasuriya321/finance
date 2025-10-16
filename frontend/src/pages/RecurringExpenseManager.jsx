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
  const [editForm, setEditForm] = useState({
    name: "",
    amount: "",
    frequency: "monthly",
    startDate: "",
  });
  const [btnLoading, setBtnLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Fetch recurrings on mount
  useEffect(() => {
    fetchRecurrings();
  }, [fetchRecurrings]);

  // Auto clear messages
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ------------------- Add -------------------
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
      await addRecurring({
        ...form,
        amount: Number(form.amount),
        startDate: form.startDate || today,
      });
      setForm({ name: "", amount: "", frequency: "monthly", startDate: "" });
      setMessage({ type: "success", text: "Recurring expense added successfully!" });
    } catch {
      setMessage({ type: "error", text: "Failed to add recurring expense" });
    } finally {
      setBtnLoading(false);
    }
  };

  // ------------------- Edit -------------------
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
      await updateRecurring(id, {
        ...editForm,
        amount: Number(editForm.amount),
        startDate: editForm.startDate || today,
      });
      setEditingId(null);
      setMessage({ type: "success", text: "Recurring expense updated successfully!" });
    } catch {
      setMessage({ type: "error", text: "Failed to update recurring expense" });
    } finally {
      setBtnLoading(false);
    }
  };

  // ------------------- Delete -------------------
  const handleDelete = async (id) => {
    if (!id) return alert("Error: missing recurring ID!");
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

  // ------------------- Filter -------------------
  const filteredItems = recurrings
    .slice()
    .sort(
      (a, b) =>
        new Date(a.startDate || a.createdAt) - new Date(b.startDate || b.createdAt)
    )
    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  // ------------------- UI -------------------
  if (loading) return <p className="text-center mt-6">Loading...</p>;
  if (error) return <p className="text-red-600 text-center mt-6">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 font-outfit">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Recurring Expense Manager
      </h1>

      {/* Message Banner */}
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

      {/* Add Recurring Form */}
      <div className="bg-white border border-gray-100 shadow-md rounded-2xl p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Add Recurring Expense
        </h2>
        <form onSubmit={handleAdd} className="grid md:grid-cols-5 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Expense Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-2.5 border border-gray-300 rounded-lg focus:outline-none"
          />
          <input
            type="number"
            placeholder="Amount (₹)"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="p-2.5 border border-gray-300 rounded-lg focus:outline-none"
          />
          <select
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            className="p-2.5 border border-gray-300 rounded-lg focus:outline-none"
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
          </select>
          <input
            type="date"
            min={today}
            value={form.startDate || today}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="p-2.5 border border-gray-300 rounded-lg focus:outline-none"
          />
          <button
            type="submit"
            disabled={btnLoading}
            onClick={handleAdd}
            className="bg-black text-white py-2.5 rounded-lg hover:bg-[#f45a57] transition flex justify-center items-center disabled:opacity-60 shadow-sm"
          >
          {btnLoading ? <ButtonLoader className="h-5 w-5" /> : "Add"}
      </button>

        </form>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mb-5 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <Search className="text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search recurring expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border-none outline-none text-gray-700 placeholder-gray-400 bg-transparent"
        />
      </div>

      {/* Recurring List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="text-center text-gray-500 col-span-full py-8">
            <p className="flex flex-col items-center gap-2">
              <span className="text-4xl">💸</span>
              No recurring expenses found
            </p>
          </div>
        ) : (
          filteredItems.map((it) => {
            const id = it.id || it._id; // ✅ consistent ID handling
            const isEditing = editingId === String(id);
            return (
              <div
                key={id}
                className="bg-white border border-gray-100 rounded-2xl shadow-md p-5 hover:shadow-lg transition"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-lg outline-none"
                    />
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={(e) =>
                        setEditForm({ ...editForm, amount: e.target.value })
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-lg outline-none"
                    />
                    <select
                      value={editForm.frequency}
                      onChange={(e) =>
                        setEditForm({ ...editForm, frequency: e.target.value })
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-lg outline-none"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="daily">Daily</option>
                    </select>
                    <input
                      type="date"
                      min={today}
                      value={editForm.startDate || today}
                      onChange={(e) =>
                        setEditForm({ ...editForm, startDate: e.target.value })
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-lg outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition flex items-center gap-1"
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
                        ₹{Number(it.amount).toLocaleString()} —{" "}
                        <span className="capitalize">{it.frequency}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Start:{" "}
                        {new Date(it.startDate || it.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => {
                          setEditingId(String(id));
                          setEditForm({
                            name: it.name,
                            amount: it.amount,
                            frequency: it.frequency,
                            startDate: it.startDate || today,
                          });
                        }}
                        className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-600 transition flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>

                      <Confirm
                        message={`Delete recurring expense "${it.name}"?`}
                        onConfirm={() => handleDelete(id)}
                      >
                        <button className="bg-red-500 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-red-600 transition">
                          Delete
                        </button>
                      </Confirm>
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
