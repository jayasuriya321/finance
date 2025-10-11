import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || password.length < 8) {
      return setError("Password must be at least 8 characters long.");
    }
    if (password !== confirm) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);
      await API.post(`/users/reset-password/${token}`, { password });
      alert("Password reset successful!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 font-outfit">
          Set New Password
        </h2>

        {error && <p className="text-red-600 text-center text-sm mb-3">{error}</p>}

        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            required
            placeholder="New Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none border-gray-300"
          />
          <input
            type="password"
            required
            placeholder="Confirm New Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none border-gray-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
