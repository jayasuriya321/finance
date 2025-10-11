import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../utils/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const res = await API.post("/users/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f45a5714] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800 font-outfit">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {errors.api && (
            <p className="text-red-600 text-center text-sm">{errors.api}</p>
          )}

          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:outline-none ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:outline-none ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-[#f45a57] transition font-medium disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <Link to="/forgot-password" className="text-[#f45a57] hover:underline">
            Forgot Password?
          </Link>
          <p className="mt-2">
            Don’t have an account?{" "}
            <Link to="/register" className="text-[#f45a57]  hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
