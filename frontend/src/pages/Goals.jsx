import { useEffect, useState } from "react";
import API from "../utils/api";
import Confirm from "../components/Confirm";
import ButtonLoader from "../components/ButtonLoader";
import { Edit2, Check, X } from "lucide-react";

export default function GoalManager() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ title: "", category: "", targetAmount: "", deadline: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", category: "", targetAmount: "", deadline: "" });

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await API.get("/goals", { headers: { Authorization: `Bearer ${token}` } });
      const goalsData = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      const sortedGoals = goalsData.sort((a, b) => new Date(a.deadline || Infinity) - new Date(b.deadline || Infinity));
      setGoals(sortedGoals);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to load goals" });
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.targetAmount || Number(form.targetAmount) <= 0) {
      setMessage({ type: "error", text: "Title and valid target amount are required" });
      return;
    }
    if (form.deadline && new Date(form.deadline) < new Date().setHours(0, 0, 0, 0)) {
      setMessage({ type: "error", text: "Deadline cannot be in the past" });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await API.post("/goals", { ...form, targetAmount: Number(form.targetAmount), currentAmount: 0 }, { headers: { Authorization: `Bearer ${token}` } });
      const newGoal = res.data?.data || res.data || null;
      if (newGoal) setGoals(prev => [newGoal, ...prev]);
      setForm({ title: "", category: "", targetAmount: "", deadline: "" });
      setMessage({ type: "success", text: "Goal added successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to add goal" });
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/goals/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setGoals(prev => prev.filter(g => g._id !== id));
      setMessage({ type: "success", text: "Goal deleted successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to delete goal" });
    }
  };

  const handleEdit = async (id) => {
    if (!editForm.title.trim() || !editForm.targetAmount || Number(editForm.targetAmount) <= 0) {
      setMessage({ type: "error", text: "Title and valid target amount are required" });
      return;
    }

    if (editForm.deadline && new Date(editForm.deadline) < new Date().setHours(0, 0, 0, 0)) {
      setMessage({ type: "error", text: "Deadline cannot be in the past" });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await API.put(`/goals/${id}`, { ...editForm, targetAmount: Number(editForm.targetAmount) }, { headers: { Authorization: `Bearer ${token}` } });
      const updatedGoal = res.data?.data || res.data;
      setGoals(prev => prev.map(g => g._id === id ? updatedGoal : g));
      setEditingId(null);
      setMessage({ type: "success", text: "Goal updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update goal" });
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-outfit space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Financial Goals</h1>

      {message.text && (
        <div className={`p-3 rounded text-sm border ${message.type === "success" ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}`}>
          {message.text}
        </div>
      )}

      {/* Add/Edit Goal Form */}
      <div className="bg-white shadow border border-gray-100 rounded-lg p-5 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{editingId ? "Edit Goal" : "Add New Goal"}</h2>
        <form onSubmit={(e) => { e.preventDefault(); editingId ? handleEdit(editingId) : handleSubmit(e); }} className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
          <input type="text" placeholder="Goal Title" value={editingId ? editForm.title : form.title} onChange={(e) => editingId ? setEditForm({ ...editForm, title: e.target.value }) : setForm({ ...form, title: e.target.value })} className="p-2 border rounded focus:ring-2 focus:ring-indigo-500" required />
          <input type="text" placeholder="Category (optional)" value={editingId ? editForm.category : form.category} onChange={(e) => editingId ? setEditForm({ ...editForm, category: e.target.value }) : setForm({ ...form, category: e.target.value })} className="p-2 border rounded focus:ring-2 focus:ring-indigo-500" />
          <input type="number" placeholder="Target Amount (₹)" value={editingId ? editForm.targetAmount : form.targetAmount} onChange={(e) => editingId ? setEditForm({ ...editForm, targetAmount: e.target.value }) : setForm({ ...form, targetAmount: e.target.value })} className="p-2 border rounded focus:ring-2 focus:ring-indigo-500" required />
          <input type="date" value={editingId ? editForm.deadline : form.deadline} onChange={(e) => editingId ? setEditForm({ ...editForm, deadline: e.target.value }) : setForm({ ...form, deadline: e.target.value })} className="p-2 border rounded focus:ring-2 focus:ring-indigo-500" />
          <button type="submit" disabled={loading} className="col-span-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 flex justify-center items-center disabled:opacity-60">
            {loading ? <ButtonLoader className="h-5 w-5" /> : editingId ? "Save Changes" : "Add Goal"}
          </button>
          {editingId && (
            <button type="button" onClick={() => setEditingId(null)} className="col-span-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      {/* Goals List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <p className="text-gray-500 text-center col-span-full">No goals created yet</p>
        ) : goals.map(g => {
          const progress = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
          const progressColor = progress < 50 ? "bg-red-500" : progress < 100 ? "bg-yellow-500" : "bg-green-500";
          const isOverdue = g.deadline && new Date(g.deadline) < new Date();
          return (
            <div key={g._id} className={`bg-white shadow border border-gray-100 rounded-lg p-5 flex flex-col justify-between transition hover:shadow-md ${isOverdue ? "border-red-300" : ""}`}>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{g.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{g.category || "No category"}</p>
                <p className="text-gray-700">🎯 Target: ₹{g.targetAmount.toLocaleString()}</p>
                <p className="text-gray-700">💰 Saved: ₹{g.currentAmount.toLocaleString()}</p>
                <div className="mt-3 bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div className={`h-3 rounded-full transition-all duration-300 ${progressColor}`} style={{ width: `${progress}%` }} title={`${Math.round(progress)}% completed`}></div>
                </div>
                <p className="text-sm mt-1 text-gray-600">{Math.round(progress)}% completed</p>
                {g.deadline && (
                  <p className={`text-xs mt-1 ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
                    📅 Deadline: {new Date(g.deadline).toLocaleDateString("en-IN")} {isOverdue && "(Overdue)"}
                  </p>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setEditingId(g._id); setEditForm({ ...g }); }} className="bg-blue-500 text-white py-1.5 px-3 rounded hover:bg-blue-600 flex items-center gap-1"><Edit2 className="w-4 h-4" /> Edit</button>
                <Confirm message={`Delete goal "${g.title}"?`} onConfirm={() => handleDelete(g._id)}>
                  <button className="bg-red-500 text-white py-1.5 px-3 rounded hover:bg-red-600 flex items-center gap-1">Delete</button>
                </Confirm>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
