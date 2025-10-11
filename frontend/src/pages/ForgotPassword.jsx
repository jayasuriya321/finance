import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import ButtonLoader from "../components/ButtonLoader";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await API.post("/users/forgot-password", { email });
      setMessage({ type: "success", text: res.data.message || "Reset link sent to your email!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to send reset link" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f45a5714] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800 font-outfit">
          Forgot Password
        </h2>

        {message.text && (
          <p className={`text-center mb-4 text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:outline-none border-gray-300"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-[#f45a57] transition flex justify-center items-center disabled:opacity-60"
          >
            {loading ? <ButtonLoader /> : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-4 text-center text-gray-600 text-sm">
          <Link to="/login" className="text-[#f45a57] hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
