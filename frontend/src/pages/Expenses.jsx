import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import ButtonLoader from "../components/ButtonLoader";
import Confirm from "../components/Confirm";
import { Search, FileText, Download } from "lucide-react";
import { exportToCSV, exportToPDF } from "../utils/exportUtils";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useExpenses } from "../context/ExpenseContext";
import { useCategories } from "../context/CategoryContext";
import { useBudgets } from "../context/BudgetContext";
import API from "../utils/api";

const COLORS = ["#6366F1", "#F59E0B", "#10B981", "#EF4444", "#3B82F6", "#8B5CF6"];

export default function Expenses() {
  const { expenses, addExpense, deleteExpense, fetchExpenses, loading: expLoading } = useExpenses();
  const { categories } = useCategories();
  const { budgets } = useBudgets();

  const [form, setForm] = useState({ amount: "", category: "", description: "", date: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [search, setSearch] = useState("");
  const [recurring, setRecurring] = useState([]);

  // Fetch recurring expenses
  const fetchRecurring = async () => {
    try {
      const res = await API.get("/recurring", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setRecurring(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      console.error("Failed to load recurring expenses");
      setRecurring([]);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchRecurring();
  }, [fetchExpenses]);

  // Auto-clear messages
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) {
      setMessage({ type: "error", text: "Amount, category, and date are required" });
      return;
    }
    setLoading(true);
    try {
      await addExpense({ ...form, amount: Number(form.amount) });
      setForm({ amount: "", category: "", description: "", date: "" });
      setMessage({ type: "success", text: "Expense added successfully!" });
      fetchExpenses();
    } catch {
      setMessage({ type: "error", text: "Failed to add expense" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      setMessage({ type: "success", text: "Expense deleted successfully!" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete expense" });
    }
  };

  // Safe filtered expenses
  const filteredExpenses = useMemo(
    () => Array.isArray(expenses)
      ? expenses.filter(
          (e) =>
            e.description?.toLowerCase().includes(search.toLowerCase()) ||
            e.category?.toLowerCase().includes(search.toLowerCase())
        )
      : [],
    [expenses, search]
  );

  // Charts data
  const categoryData = useMemo(() => {
    const data = {};
    filteredExpenses.forEach((e) => { if (!e.category) return; data[e.category] = (data[e.category] || 0) + Number(e.amount); });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  const recurringData = useMemo(() => {
    const data = {};
    recurring.forEach((r) => { if (!r.category) return; data[r.category] = (data[r.category] || 0) + Number(r.amount); });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [recurring]);

  const totalExpense = useMemo(() => filteredExpenses.reduce((acc, e) => acc + Number(e.amount), 0), [filteredExpenses]);

  const budgetComparison = useMemo(() => {
    return budgets.map((b) => {
      const total = filteredExpenses.filter(e => e.category === b.name).reduce((acc, e) => acc + Number(e.amount), 0);
      return { name: b.name, budget: b.limit, actual: total };
    });
  }, [budgets, filteredExpenses]);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6 text-gray-700">Expenses Dashboard</h1>

      {message.text && (
        <div className={`mb-4 p-3 rounded text-sm border ${message.type === "success" ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}`}>
          {message.text}
        </div>
      )}

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-600 text-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Expense</h3>
          <p className="text-2xl font-bold mt-2">₹{totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-green-500 text-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Categories</h3>
          <p className="mt-2">{categories.length}</p>
        </div>
        <div className="bg-yellow-500 text-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Entries</h3>
          <p className="mt-2">{filteredExpenses.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <ChartBox title="Expenses by Category" data={categoryData} />
        <ChartBox title="Recurring Expenses" data={recurringData} />
      </div>

      {/* Budget vs Actual */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">Budget vs Actual Expenses</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={budgetComparison}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="budget" fill="#10B981" />
            <Bar dataKey="actual" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Add Expense Form */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h2 className="font-bold text-gray-700 mb-4">Add New Expense</h2>
        <form onSubmit={handleAddExpense} className="grid md:grid-cols-4 sm:grid-cols-2 gap-4">
          <input type="number" name="amount" placeholder="Amount (₹)" value={form.amount} onChange={handleChange} className="p-2 border rounded focus:ring-2 focus:ring-indigo-500" required />
          <select name="category" value={form.category} onChange={handleChange} className="p-2 border rounded focus:ring-2 focus:ring-indigo-500" required>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
          <input type="text" name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} className="p-2 border rounded focus:ring-2 focus:ring-indigo-500" />
          <input type="date" name="date" value={form.date} onChange={handleChange} className="p-2 border rounded focus:ring-2 focus:ring-indigo-500" required />
          <button type="submit" disabled={loading || expLoading} className="col-span-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition flex justify-center items-center disabled:opacity-60">
            {loading ? <ButtonLoader /> : "Add Expense"}
          </button>
        </form>
      </div>

      {/* Search + Export */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="text-gray-500 w-5 h-5" />
          <input type="text" placeholder="Search by category or description..." value={search} onChange={(e) => setSearch(e.target.value)} className="p-2 border rounded w-full sm:w-64 focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button onClick={() => exportToCSV(filteredExpenses, "expenses")} className="flex items-center gap-1 bg-indigo-500 text-white px-3 py-1.5 rounded hover:bg-indigo-600 transition">
            <FileText className="w-4 h-4" /> CSV
          </button>
          <button onClick={() => exportToPDF(filteredExpenses, "Expenses Report")} className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 transition">
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">No expenses found</td>
              </tr>
            ) : filteredExpenses.map((e) => (
              <tr key={e._id} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-2">₹{Number(e.amount).toLocaleString()}</td>
                <td className="px-4 py-2">{e.category || "Uncategorized"}</td>
                <td className="px-4 py-2">{e.description || "-"}</td>
                <td className="px-4 py-2">{new Date(e.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-center">
                  <Confirm message={`Are you sure you want to delete this expense?`} onConfirm={() => handleDelete(e._id)}>
                    <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Delete</button>
                  </Confirm>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

// ===== ChartBox helper
function ChartBox({ title, data }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data.length ? data : [{ name: "No Data", value: 1 }]}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.length
              ? data.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)
              : <Cell fill="#E5E7EB" />}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
