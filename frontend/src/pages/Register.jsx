import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../utils/api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    else if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const res = await API.post("/users/register", form);
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f45a5714] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800 font-outfit">
          Create Account
        </h2>

        <form onSubmit={handleRegister} className="space-y-4">
          {errors.api && (
            <p className="text-red-600 text-center text-sm">{errors.api}</p>
          )}

          <div>
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:outline-none ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

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
              placeholder="Password (min 8 characters)"
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-[#f45a57] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
