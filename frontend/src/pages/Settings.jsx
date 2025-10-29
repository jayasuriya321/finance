import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../context/ThemeContext";
import PreferencesForm from "../components/PreferencesForm";
import Loader from "../components/Loader";
import API from "../utils/api";
import { useEffect, useState } from "react";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    theme: "light",
    currency: "INR",
    notifications: { email: true, push: true },
  });
  const [message, setMessage] = useState("");
  const { toggleTheme } = useTheme();
  const { currency, changeCurrency } = useCurrency(); // 👈 use global currency

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await API.get("/users/preferences");
        if (res.data?.data) {
          const userPrefs = res.data.data;
          setPreferences(userPrefs);
          toggleTheme(userPrefs.theme);
          changeCurrency(userPrefs.currency); // 👈 sync context
        }
      } catch (err) {
        console.error("Failed to fetch preferences:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleChange = (field, value) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));

    if (field === "theme") toggleTheme(value);
    if (field === "currency") changeCurrency(value); // 👈 update global context
  };

  const handleNotificationChange = (type) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [type]: !prev.notifications[type] },
    }));
  };

  const handleSubmit = async () => {
    try {
      await API.patch("/users/preferences", preferences);
      setMessage("Preferences updated successfully!");
    } catch (err) {
      console.error("Failed to update preferences:", err);
      setMessage("Failed to update preferences");
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) return <Loader />;

  return (
    <div
      className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 dark:text-gray-100 
                 rounded-2xl shadow-xl border border-gray-100 mt-6 transition-colors duration-500"
    >
      {message && (
        <div
          className="mb-4 p-3 text-center rounded-lg border shadow-sm text-sm 
                     bg-green-50 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-100"
        >
          {message}
        </div>
      )}

      <PreferencesForm
        preferences={preferences}
        onChange={handleChange}
        onNotificationChange={handleNotificationChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
