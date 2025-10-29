import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ===== State =====
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===== Auto-clear messages =====
  const showMessage = (type, message) => {
    if (type === "error") setError(message);
    else setSuccess(message);

    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  // ===== Fetch current user =====
  const fetchUser = useCallback(async () => {
    if (!token) {
      setReady(true);
      return;
    }

    try {
      const res = await API.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Set default auth header
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (err) {
      console.error("Fetch user error:", err);
      logout(true); // silent logout
      showMessage("error", "Session expired. Please login again.");
    } finally {
      setReady(true);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // ===== Login =====
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await API.post("/auth/login", { email, password });
      const { token: newToken, user: userData } = res.data;

      setUser(userData);
      setToken(newToken);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", newToken);

      API.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      showMessage("success", "Login successful!");
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      showMessage("error", err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===== Logout =====
  const logout = useCallback((silent = false) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete API.defaults.headers.common["Authorization"];
    if (!silent) showMessage("success", "Logged out successfully!");
  }, []);

  // ===== Refresh user manually =====
  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        ready,
        loading,
        error,
        success,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user && !!token,
      }}
    >
      {ready ? (
        children
      ) : (
        <div className="text-center py-20 font-outfit text-gray-600">
          Loading user...
        </div>
      )}
    </AuthContext.Provider>
  );
};

// ===== Hook to use auth context =====
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
