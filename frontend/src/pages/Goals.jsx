import { useEffect, useState } from "react";
import API from "../utils/api";
import Confirm from "../components/Confirm";
import ButtonLoader from "../components/ButtonLoader";
import { Edit2 } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import { formatCurrency } from "../utils/formatCurrency";

export default function GoalManager() {
  const { currency } = useCurrency();
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ title: "", category: "", targetAmount: "", deadline: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", category: "", targetAmount: "", deadline: "" });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    setForm((prev) => ({ ...prev, deadline: today }));
  }, [today]);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await API.get("/goals", { headers: { Authorization: `Bearer ${token}` } });
      const goalsData = Array.isArray(res.data?.data) ? res.data.data : [];
      const sorted = goalsData.sort(
        (a, b) => new Date(a.deadline || Infinity) - new Date(b.deadline || Infinity)
      );
      setGoals(sorted);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to load goals" });
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.targetAmount || Number(form.targetAmount) <= 0)
      return setMessage({ type: "error", text: "Title and valid target amount are required" });

    if (form.deadline && new Date(form.deadline) < new Date().setHours(0, 0, 0, 0))
      return setMessage({ type: "error", text: "Deadline cannot be in the past" });

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        "/goals",
        { ...form, targetAmount: Number(form.targetAmount), currentAmount: 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newGoal = res.data?.data || res.data;
      if (newGoal) setGoals((prev) => [newGoal, ...prev]);
      setForm({ title: "", category: "", targetAmount: "", deadline: today });
      setMessage({ type: "success", text: "Goal added successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to add goal" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/goals/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setGoals((prev) => prev.filter((g) => g._id !== id));
      setMessage({ type: "success", text: "Goal deleted successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to delete goal" });
    }
  };

  const handleEdit = async (id) => {
    if (!editForm.title.trim() || !editForm.targetAmount || Number(editForm.targetAmount) <= 0)
      return setMessage({ type: "error", text: "Title and valid target amount are required" });

    if (editForm.deadline && new Date(editForm.deadline) < new Date().setHours(0, 0, 0, 0))
      return setMessage({ type: "error", text: "Deadline cannot be in the past" });

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: editForm.title,
        category: editForm.category || "",
        targetAmount: Number(editForm.targetAmount),
        deadline: editForm.deadline,
      };
      const res = await API.put(`/goals/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      const updated = res.data?.data || res.data;
      setGoals((prev) => prev.map((g) => (g._id === id ? updated : g)));
      setEditingId(null);
      setEditForm({ title: "", category: "", targetAmount: "", deadline: "" });
      setMessage({ type: "success", text: "Goal updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update goal" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full font-outfit space-y-6 min-h-screen transition-colors">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Goal Tracker</h1>

      {message.text && (
        <div
          className={`p-3 rounded text-sm border transition-all ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
              : "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ✅ Add/Edit Goal Form */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
          {editingId ? "Edit Goal" : "Add New Goal"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            editingId ? handleEdit(editingId) : handleSubmit(e);
          }}
          className="grid md:grid-cols-4 sm:grid-cols-2 gap-4"
        >
          {["title", "category", "targetAmount", "deadline"].map((field, i) => (
            <input
              key={i}
              type={field === "targetAmount" ? "number" : field === "deadline" ? "date" : "text"}
              placeholder={
                field === "title"
                  ? "Goal Title"
                  : field === "category"
                  ? "Category (optional)"
                  : field === "targetAmount"
                  ? `Target Amount (${currency})`
                  : ""
              }
              min={field === "deadline" ? today : undefined}
              value={editingId ? editForm[field] || "" : form[field] || ""}
              onChange={(e) =>
                editingId
                  ? setEditForm({ ...editForm, [field]: e.target.value })
                  : setForm({ ...form, [field]: e.target.value })
              }
              required={["title", "targetAmount"].includes(field)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
            />
          ))}

          <button
            type="submit"
            disabled={loading}
            className="col-span-full bg-black dark:bg-[#f45a57] text-white py-2 rounded-lg hover:bg-[#f45a57] dark:hover:bg-[#e14b49] flex justify-center items-center disabled:opacity-60 transition"
          >
            {loading ? <ButtonLoader className="h-5 w-5" /> : editingId ? "Save Changes" : "Add Goal"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setEditForm({ title: "", category: "", targetAmount: "", deadline: "" });
              }}
              className="col-span-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-100 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      {/* ✅ Goals List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center col-span-full">No goals created yet</p>
        ) : (
          goals.map((g) => {
            const progress = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
            const progressColor =
              progress < 50 ? "bg-red-500" : progress < 100 ? "bg-yellow-500" : "bg-green-500";
            const isOverdue = g.deadline && new Date(g.deadline) < new Date();

            return (
              <div
                key={g._id}
                className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between ${
                  isOverdue ? "border-red-300 dark:border-red-500" : ""
                }`}
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{g.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{g.category || "No category"}</p>

                  <p className="text-gray-700 dark:text-gray-300">
                    🎯 Target: {formatCurrency(g.targetAmount, currency)}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    💰 Saved: {formatCurrency(g.currentAmount, currency)}
                  </p>

                  <div className="mt-3 bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-3 ${progressColor} rounded-full transition-all duration-300`}
                      style={{ width: `${progress}%` }}
                      title={`${Math.round(progress)}% completed`}
                    ></div>
                  </div>
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">{Math.round(progress)}% completed</p>

                  {g.deadline && (
                    <p
                      className={`text-xs mt-1 ${
                        isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      📅 Deadline: {new Date(g.deadline).toLocaleDateString("en-IN")}{" "}
                      {isOverdue && "(Overdue)"}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setEditingId(g._id);
                      setEditForm({
                        title: g.title || "",
                        category: g.category || "",
                        targetAmount: g.targetAmount || "",
                        // ✅ Convert deadline to yyyy-mm-dd for input type="date"
                        deadline: g.deadline ? new Date(g.deadline).toISOString().split("T")[0] : "",
                      });
                    }}
                    className="bg-blue-500 text-white py-1.5 px-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-400 flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>

                  <Confirm message={`Delete goal "${g.title}"?`} onConfirm={() => handleDelete(g._id)}>
                    <button className="bg-red-500 text-white py-1.5 px-3 rounded-lg hover:bg-red-600 dark:hover:bg-red-400">
                      Delete
                    </button>
                  </Confirm>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
