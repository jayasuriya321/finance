import { useState } from "react";
import API from "../utils/api";

export default function RequestReset() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    try {
      await API.post("/users/forgot-password", { email });
      setSent(true);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-8 shadow rounded w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Reset password</h2>
        {!sent ? (
          <form onSubmit={handle} className="space-y-3">
            <input required type="email" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded" />
            <button className="w-full bg-blue-600 text-white py-2 rounded">Send reset email</button>
          </form>
        ) : (
          <p>Reset link sent (check your inbox). If you don't receive it, check spam.</p>
        )}
      </div>
    </div>
  );
}
