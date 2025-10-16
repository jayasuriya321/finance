import { useEffect, useState } from "react";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";
import ButtonLoader from "../components/ButtonLoader";
import { User } from "lucide-react";

export default function Profile() {
  const { token, ready } = useAuth();
  const [user, setUser] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!ready) return;
    if (!token) return setLoading(false);

    const fetchUser = async () => {
      try {
        const res = await API.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
        setForm({ name: res.data.user.name, email: res.data.user.email });
      } catch (err) {
        console.error("Profile fetch error:", err);
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUser({ name: payload.name || "", email: payload.email || "" });
          setForm({ name: payload.name || "", email: payload.email || "" });
        } catch {
          setUser({ name: "", email: "" });
          setForm({ name: "", email: "" });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [ready, token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.put(
        "/users/me",
        { name: form.name, email: form.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setEditMode(false);
    } catch (err) {
      console.error("Update error:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  if (loading)
    return (
      <div className="max-w-md mx-auto p-6 animate-pulse space-y-4">
        <div className="h-24 w-24 bg-gray-300 rounded-full mx-auto"></div>
        <div className="h-6 bg-gray-300 rounded w-32 mx-auto"></div>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
      </div>
    );

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
            <User className="w-12 h-12" />
          </div>
        </div>
        <h3 className="text-2xl font-semibold mt-4 text-gray-800">My Profile</h3>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm border shadow-sm text-center ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border-green-300"
              : "bg-red-50 text-red-700 border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-6 space-y-5">
        {/* Name */}
        <div className="relative">
          <label className="absolute -top-3 left-3 text-gray-500 text-sm bg-white px-1">
            Name
          </label>
          {editMode ? (
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f45a57]"
            />
          ) : (
            <p className="text-gray-800 px-3 py-3 border border-gray-100 rounded-lg bg-gray-50">
              {user.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="relative">
          <label className="absolute -top-3 left-3 text-gray-500 text-sm bg-white px-1">
            Email
          </label>
          {editMode ? (
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f45a57]"
            />
          ) : (
            <p className="text-gray-800 px-3 py-3 border border-gray-100 rounded-lg bg-gray-50">
              {user.email}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-3 justify-center">
        {editMode ? (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-[#f45a57] transition flex items-center justify-center disabled:opacity-60 shadow"
            >
              {saving ? <ButtonLoader className="h-5 w-5" /> : "Save"}
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition shadow"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-[#f45a57] transition shadow"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
