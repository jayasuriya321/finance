import { useEffect, useState } from "react";
import API from "../utils/api";
import Confirm from "../components/Confirm";
import ButtonLoader from "../components/ButtonLoader";
import { Edit2 } from "lucide-react";

export default function GoalManager() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ title: "", category: "", targetAmount: "", deadline: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", category: "", targetAmount: "", deadline: "" });

  // Current date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Set today's date for new goals
  useEffect(() => {
    setForm((prev) => ({ ...prev, deadline: today }));
  }, [today]);

  // Fetch all goals
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

  // Add new goal
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

  // Delete goal
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

  // Edit goal
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
      setMessage({ type: "success", text: "Goal updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update goal" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-outfit space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">Goal Tracker</h1>

      {message.text && (
        <div
          className={`p-3 rounded text-sm border transition-all ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-red-100 text-red-700 border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Goal Form */}
      <div className="bg-white border border-gray-100 shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          {editingId ? "Edit Goal" : "Add New Goal"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            editingId ? handleEdit(editingId) : handleSubmit(e);
          }}
          className="grid md:grid-cols-4 sm:grid-cols-2 gap-4"
        >
          <input
            type="text"
            placeholder="Goal Title"
            value={editingId ? editForm.title : form.title}
            onChange={(e) =>
              editingId
                ? setEditForm({ ...editForm, title: e.target.value })
                : setForm({ ...form, title: e.target.value })
            }
            className="p-2 border rounded-lg focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Category (optional)"
            value={editingId ? editForm.category : form.category}
            onChange={(e) =>
              editingId
                ? setEditForm({ ...editForm, category: e.target.value })
                : setForm({ ...form, category: e.target.value })
            }
            className="p-2 border rounded-lg focus:outline-none"
          />
          <input
            type="number"
            placeholder="Target Amount (₹)"
            value={editingId ? editForm.targetAmount : form.targetAmount}
            onChange={(e) =>
              editingId
                ? setEditForm({ ...editForm, targetAmount: e.target.value })
                : setForm({ ...form, targetAmount: e.target.value })
            }
            className="p-2 border rounded-lg focus:outline-none"
            required
          />
          <input
            type="date"
            min={today}
            value={editingId ? editForm.deadline : form.deadline}
            onChange={(e) =>
              editingId
                ? setEditForm({ ...editForm, deadline: e.target.value })
                : setForm({ ...form, deadline: e.target.value })
            }
            className="p-2 border rounded-lg focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="col-span-full bg-black text-white py-2 rounded-lg hover:bg-[#f45a57] flex justify-center items-center disabled:opacity-60"
          >
            {loading ? <ButtonLoader className="h-5 w-5" /> : editingId ? "Save Changes" : "Add Goal"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="col-span-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      {/* Goal List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <p className="text-gray-500 text-center col-span-full">No goals created yet</p>
        ) : (
          goals.map((g) => {
            const progress = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
            const progressColor =
              progress < 50 ? "bg-red-500" : progress < 100 ? "bg-yellow-500" : "bg-green-500";
            const isOverdue = g.deadline && new Date(g.deadline) < new Date();

            return (
              <div
                key={g._id}
                className={`bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between ${
                  isOverdue ? "border-red-300" : ""
                }`}
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{g.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{g.category || "No category"}</p>
                  <p className="text-gray-700">🎯 Target: ₹{g.targetAmount.toLocaleString()}</p>
                  <p className="text-gray-700">💰 Saved: ₹{g.currentAmount.toLocaleString()}</p>

                  <div className="mt-3 bg-gray-200 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-3 ${progressColor} rounded-full transition-all duration-300`}
                      style={{ width: `${progress}%` }}
                      title={`${Math.round(progress)}% completed`}
                    ></div>
                  </div>
                  <p className="text-sm mt-1 text-gray-600">{Math.round(progress)}% completed</p>

                  {g.deadline && (
                    <p className={`text-xs mt-1 ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
                      📅 Deadline: {new Date(g.deadline).toLocaleDateString("en-IN")}{" "}
                      {isOverdue && "(Overdue)"}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setEditingId(g._id);
                      setEditForm({ ...g });
                    }}
                    className="bg-blue-500 text-white py-1.5 px-3 rounded-lg hover:bg-blue-600 flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <Confirm message={`Delete goal "${g.title}"?`} onConfirm={() => handleDelete(g._id)}>
                    <button className="bg-red-500 text-white py-1.5 px-3 rounded-lg hover:bg-red-600">
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
