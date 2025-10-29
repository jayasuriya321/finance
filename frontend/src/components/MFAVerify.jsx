// src/components/MFAVerify.jsx
import { useState } from "react";
import axios from "axios";

export default function MFAVerify({ email, onSuccess }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!otp) return setError("Enter OTP");
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post("/api/auth/mfa/verify", { email, otp });
      onSuccess(data.token); // Save JWT in localStorage or context
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Enter OTP sent to {email}</h2>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full border p-2 rounded mb-3"
        placeholder="6-digit OTP"
      />
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600 transition"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
    </div>
  );
}
