import { useState } from "react";
import API from "../utils/api";

export default function RequestReset() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/users/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 font-outfit">
          Reset Password
        </h2>

        {!sent ? (
          <form onSubmit={handle} className="space-y-4">
            {error && <p className="text-red-600 text-center text-sm">{error}</p>}
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none border-gray-300"
            />
            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition">
              Send Reset Email
            </button>
          </form>
        ) : (
          <p className="text-green-600 text-center text-sm">
            Reset link sent. Check your inbox (and spam folder).
          </p>
        )}
      </div>
    </div>
  );
}
