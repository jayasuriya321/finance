import { useState, useMemo } from "react";
import { useIncome } from "../context/IncomeContext";
import { useCurrency } from "../context/CurrencyContext";
import { formatCurrency } from "../utils/formatCurrency";
import Confirm from "../components/Confirm";
import ButtonLoader from "../components/ButtonLoader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { exportToCSV, exportToPDF } from "../utils/exportUtils";
import { FileText, Download } from "lucide-react";

export default function IncomeManager() {
  const {
    incomes,
    addIncome,
    editIncome,
    deleteIncome,
    loading: contextLoading,
  } = useIncome();

  const { currency } = useCurrency(); // 👈 use selected currency

  const [form, setForm] = useState({ amount: "", source: "", date: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ amount: "", source: "", date: "" });

  const today = new Date().toISOString().split("T")[0];
  if (!form.date) form.date = today;

  // ===== Form Handlers =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.source)
      return setMessage({
        type: "error",
        text: "Amount and source are required",
      });
    setLoading(true);
    try {
      await addIncome({ ...form, amount: Number(form.amount) });
      setForm({ amount: "", source: "", date: today });
      setMessage({ type: "success", text: "Income added successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editForm.amount || !editForm.source)
      return setMessage({
        type: "error",
        text: "Amount and source are required",
      });
    setLoading(true);
    try {
      await editIncome(id, { ...editForm, amount: Number(editForm.amount) });
      setEditingId(null);
      setMessage({ type: "success", text: "Income updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteIncome(id);
      setMessage({ type: "success", text: "Income deleted successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  // ===== Chart Data =====
  const chartData = useMemo(() => {
    const sorted = [...incomes].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    return sorted.map((i) => ({
      date: new Date(i.date).toLocaleDateString("en-IN"),
      amount: Number(i.amount),
    }));
  }, [incomes]);

  // ===== Monthly Report =====
  const monthlyData = useMemo(() => {
    const data = {};
    incomes.forEach((i) => {
      const month = new Date(i.date).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      data[month] = (data[month] || 0) + Number(i.amount);
    });
    return Object.entries(data).map(([month, total]) => ({ month, total }));
  }, [incomes]);

  const handleExportMonthlyCSV = () =>
    exportToCSV(
      monthlyData.map((d) => ({
        amount: `${formatCurrency(d.total, currency)}`,
        category: "Monthly Total",
        description: "",
        date: d.month,
      })),
      "Monthly_Income_Report"
    );

  const handleExportMonthlyPDF = () =>
    exportToPDF(
      monthlyData.map((d) => ({
        amount: `${formatCurrency(d.total, currency)}`,
        category: "Monthly Total",
        description: "",
        date: d.month,
      })),
      "Monthly Income Report"
    );

  return (
    <div className="p-6 w-full font-outfit space-y-6 transition-colors duration-300">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Income Manager
      </h1>

      {message.text && (
        <div
          className={`p-3 rounded text-sm border transition-all ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
              : "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Income Form */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-md rounded-2xl p-6 transition-colors duration-300">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
          {editingId ? "Edit Income" : "Add New Income"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            editingId ? handleEdit(editingId) : handleSubmit(e);
          }}
          className="grid md:grid-cols-3 gap-4"
        >
          <input
            type="number"
            placeholder={`Amount (${currency})`}
            value={editingId ? editForm.amount : form.amount}
            onChange={(e) =>
              editingId
                ? setEditForm({ ...editForm, amount: e.target.value })
                : setForm({ ...form, amount: e.target.value })
            }
            className="p-2 border rounded-lg focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            required
          />
          <input
            type="text"
            placeholder="Source"
            value={editingId ? editForm.source : form.source}
            onChange={(e) =>
              editingId
                ? setEditForm({ ...editForm, source: e.target.value })
                : setForm({ ...form, source: e.target.value })
            }
            className="p-2 border rounded-lg focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            required
          />
          <input
            type="date"
            value={editingId ? editForm.date : form.date}
            onChange={(e) =>
              editingId
                ? setEditForm({ ...editForm, date: e.target.value })
                : setForm({ ...form, date: e.target.value })
            }
            className="p-2 border rounded-lg focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          />
          <button
            type="submit"
            disabled={loading || contextLoading}
            className="col-span-full bg-black dark:bg-[#f45a57] text-white py-2 rounded-lg hover:bg-[#f45a57] dark:hover:bg-[#f45a57]/80 flex justify-center items-center disabled:opacity-60"
          >
            {loading || contextLoading ? (
              <ButtonLoader className="h-5 w-5" />
            ) : editingId ? (
              "Save Changes"
            ) : (
              "Add Income"
            )}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="col-span-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      {/* Income Trend Chart */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-md rounded-2xl p-4 transition-colors duration-300">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Income Trend
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="date" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip
              formatter={(value) => formatCurrency(value, currency)}
              contentStyle={{
                backgroundColor: "#1F2937",
                color: "#fff",
                borderRadius: "8px",
                border: "none",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#10B981"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Report Export */}
      <div className="flex gap-2 flex-wrap justify-end sm:justify-end">
        <button
          onClick={handleExportMonthlyCSV}
          className="flex items-center gap-1 bg-indigo-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-600 transition text-sm sm:text-base"
        >
          <FileText className="w-4 h-4" /> CSV
        </button>
        <button
          onClick={handleExportMonthlyPDF}
          className="flex items-center gap-1 bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm sm:text-base"
        >
          <Download className="w-4 h-4" /> PDF
        </button>
      </div>

      {/* Income List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {incomes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center col-span-full">
            No income records yet
          </p>
        ) : (
          incomes.map((i) => (
            <div
              key={i._id}
              className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between ${
                editingId === i._id ? "ring-2 ring-blue-400" : ""
              }`}
            >
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Amount</p>
                <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {formatCurrency(i.amount, currency)}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Source
                </p>
                <p className="text-gray-800 dark:text-gray-100">{i.source}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Date
                </p>
                <p className="text-gray-800 dark:text-gray-100">
                  {new Date(i.date).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setEditingId(i._id);
                    setEditForm({
                      ...i,
                      date: new Date(i.date).toISOString().split("T")[0], // ✅ FIXED DATE FORMAT
                    });
                  }}
                  className="bg-blue-500 text-white py-1.5 px-3 rounded-lg hover:bg-blue-600"
                >
                  Edit
                </button>
                <Confirm
                  message={`Delete income of ${formatCurrency(
                    i.amount,
                    currency
                  )}?`}
                  onConfirm={() => handleDelete(i._id)}
                >
                  <button className="bg-red-500 text-white py-1.5 px-3 rounded-lg hover:bg-red-600">
                    Delete
                  </button>
                </Confirm>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
