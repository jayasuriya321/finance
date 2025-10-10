import { useEffect, useState } from "react";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { token, ready } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return; // wait until AuthContext is ready
    if (!token) return setLoading(false); // no token, stop loading

    const fetchUser = async () => {
      try {
        // Fetch user from backend
        const res = await API.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user); // ✅ use .user from response
      } catch (err) {
        console.error("Profile fetch error:", err);

        // fallback: decode JWT
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUser({ name: payload.name || "", email: payload.email || "" });
        } catch {
          setUser({ name: "", email: "" });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [ready, token]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user data found.</div>;

  return (
    <div className="bg-white p-4 rounded shadow max-w-md">
      <h3 className="font-semibold mb-2">Profile</h3>
      <div><strong>Name:</strong> {user.name}</div>
      <div><strong>Email:</strong> {user.email}</div>
    </div>
  );
}
