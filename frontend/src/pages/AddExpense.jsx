// src/pages/AddExpense.jsx
import { useEffect, useState, useMemo } from "react";
import API from "../utils/api";
import ButtonLoader from "../components/ButtonLoader";
import { useExpenses } from "../context/ExpenseContext";
import { useCategories } from "../context/CategoryContext";
import { exportToCSV, exportToPDF } from "../utils/exportUtils";
import { FileText, Download, Search } from "lucide-react";

export default function AddExpense() {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    amount: "",
    category: "",
    description: "",
    date: today,
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");

  const { expenses, fetchExpenses } = useExpenses();
  const { categories, fetchCategories } = useCategories();

  // Fetch categories & expenses on mount
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
      setForm({ amount: "", category: "", description: "", date: today });
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 font-outfit space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">
        Add Expense
      </h1>

      {/* Messages */}
      {successMsg && (
        <div className="bg-green-100 text-green-700 px-5 py-3 rounded-xl shadow-md text-center text-sm sm:text-base">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-100 text-red-700 px-5 py-3 rounded-xl shadow-md text-center text-sm sm:text-base">
          {errorMsg}
        </div>
      )}

      {/* Expense Form */}
      <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 md:p-8">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:outline-none w-full text-sm sm:text-base"
            required
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:outline-none w-full text-sm sm:text-base"
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
            className="p-3 border rounded-lg focus:outline-none w-full text-sm sm:text-base"
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:outline-none w-full text-sm sm:text-base"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="col-span-full py-3 rounded-lg bg-black text-white font-semibold hover:bg-[#f45a57] transition flex justify-center items-center disabled:opacity-60 mt-2"
          >
            {loading ? <ButtonLoader /> : "Add Expense"}
          </button>
        </form>
      </div>

      {/* Search & Export Section */}
      <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Search className="text-gray-400 w-5 h-5 shrink-0" />
          <input
            type="text"
            placeholder="Search by category or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded-lg w-full md:w-64 focus:outline-none text-sm sm:text-base"
          />
        </div>
        <div className="flex gap-2 mt-2 md:mt-0 flex-wrap">
          <button
            onClick={() => exportToCSV(filteredExpenses, "expenses")}
            className="flex items-center gap-1 bg-indigo-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-600 transition text-sm sm:text-base"
          >
            <FileText className="w-4 h-4" /> CSV
          </button>
          <button
            onClick={() => exportToPDF(filteredExpenses, "Expenses Report")}
            className="flex items-center gap-1 bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm sm:text-base"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto p-4 sm:p-6">
        <table className="w-full text-left min-w-[600px] divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-gray-600 uppercase text-xs sm:text-sm">Amount</th>
              <th className="px-4 py-3 text-gray-600 uppercase text-xs sm:text-sm">Category</th>
              <th className="px-4 py-3 text-gray-600 uppercase text-xs sm:text-sm">Description</th>
              <th className="px-4 py-3 text-gray-600 uppercase text-xs sm:text-sm">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-500 text-sm sm:text-base"
                >
                  No expenses found
                </td>
              </tr>
            ) : (
              filteredExpenses.map((e) => (
                <tr key={e._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 font-medium text-sm sm:text-base">
                    ₹{Number(e.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm sm:text-base">
                    {e.category || "Uncategorized"}
                  </td>
                  <td className="px-4 py-2 text-sm sm:text-base">
                    {e.description || "-"}
                  </td>
                  <td className="px-4 py-2 text-sm sm:text-base">
                    {new Date(e.date).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
