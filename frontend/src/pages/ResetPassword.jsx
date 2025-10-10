import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/users/reset-password/${token}`, { password });
      alert("Password reset successful");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Set new password</h2>
        <form onSubmit={submit} className="space-y-3">
          <input required type="password" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 border rounded" />
          <button className="w-full bg-green-600 text-white py-2 rounded">Reset password</button>
        </form>
      </div>
    </div>
  );
}
