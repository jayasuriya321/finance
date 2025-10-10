import { useEffect, useState, useMemo } from "react";
import API from "../utils/api";
import ButtonLoader from "../components/ButtonLoader";
import { useExpenses } from "../context/ExpenseContext";
import { useCategories } from "../context/CategoryContext";
import { exportToCSV, exportToPDF } from "../utils/exportUtils";
import { FileText, Download, Search } from "lucide-react";

const AddExpense = () => {
  const [form, setForm] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");

  const { expenses, fetchExpenses } = useExpenses();
  const { categories, fetchCategories } = useCategories();

  // Fetch categories and expenses on mount
  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, [fetchCategories, fetchExpenses]);

  // Auto-clear messages
  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg("");
        setErrorMsg("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) {
      setErrorMsg("Amount, category, and date are required.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await API.post(
        "/expenses",
        { ...form, amount: Number(form.amount) },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setForm({ amount: "", category: "", description: "", date: "" });
      setSuccessMsg("Expense added successfully!");
      fetchExpenses();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to add expense.");
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = useMemo(() => {
    if (!Array.isArray(expenses)) return [];
    return expenses.filter(
      (e) =>
        e.description?.toLowerCase().includes(search.toLowerCase()) ||
        e.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [expenses, search]);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 mt-6 font-outfit space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">
        Add Expense
      </h2>

      {/* Messages */}
      {successMsg && <p className="bg-green-100 text-green-700 px-4 py-2 rounded shadow">{successMsg}</p>}
      {errorMsg && <p className="bg-red-100 text-red-700 px-4 py-2 rounded shadow">{errorMsg}</p>}

      {/* Expense Form */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 md:grid-cols-4 sm:grid-cols-2 bg-white shadow-lg rounded-xl p-4 sm:p-6"
      >
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full"
          required
        >
          <option value="">Select Category</option>
          {Array.isArray(categories) &&
            categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
        </select>
        <input
          type="text"
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full"
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="col-span-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition flex justify-center items-center disabled:opacity-60"
        >
          {loading ? <ButtonLoader /> : "Add Expense"}
        </button>
      </form>

      {/* Search & Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by category or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => exportToCSV(filteredExpenses, "expenses")}
            className="flex items-center gap-1 bg-indigo-500 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-600 transition"
          >
            <FileText className="w-4 h-4" /> CSV
          </button>
          <button
            onClick={() => exportToPDF(filteredExpenses, "Expenses Report")}
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
        <table className="w-full text-left min-w-[600px] divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-gray-600 uppercase text-sm">Amount</th>
              <th className="px-4 py-3 text-gray-600 uppercase text-sm">Category</th>
              <th className="px-4 py-3 text-gray-600 uppercase text-sm">Description</th>
              <th className="px-4 py-3 text-gray-600 uppercase text-sm">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No expenses found
                </td>
              </tr>
            ) : (
              filteredExpenses.map((e) => (
                <tr key={e._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 font-medium">₹{Number(e.amount).toLocaleString()}</td>
                  <td className="px-4 py-2">{e.category || "Uncategorized"}</td>
                  <td className="px-4 py-2">{e.description || "-"}</td>
                  <td className="px-4 py-2">{new Date(e.date).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddExpense;
