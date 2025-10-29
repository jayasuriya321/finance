import React, { useMemo } from "react";
import { useBudgets } from "../context/BudgetContext";
import { BellIcon, AlertTriangle, CircleAlert } from "lucide-react";

export default function BudgetAlerts() {
  const { budgetInsights } = useBudgets();

  // ✅ Remove duplicates based on the message text
  const uniqueAlerts = useMemo(() => {
    if (!budgetInsights) return [];
    const seen = new Set();
    return budgetInsights.filter((alert) => {
      const key = alert.message?.trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [budgetInsights]);

  if (!uniqueAlerts.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 mt-6 transition-colors duration-300">
      <h2 className="flex items-center text-lg font-semibold mb-4 text-gray-700 dark:text-gray-100">
        <BellIcon className="h-5 w-5 text-yellow-500 mr-2" /> Budget Alerts
      </h2>

      <ul className="space-y-2">
        {uniqueAlerts.map((alert, idx) => {
          // 🧹 Remove emoji symbols like ⚠️ or 🚨 from the start of messages
          const cleanMessage = alert.message?.replace(/^[⚠️🚨❗]+/g, "").trim();

          return (
            <li
              key={idx}
              className={`p-3 rounded-lg border flex items-center gap-2 transition-all hover:scale-[1.01] ${
                alert.type === "danger"
                  ? "bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  : alert.type === "warning"
                  ? "bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                  : "bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              }`}
            >
              {alert.type === "danger" ? (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              ) : alert.type === "warning" ? (
                <CircleAlert className="w-5 h-5 text-yellow-500" />
              ) : (
                <BellIcon className="w-5 h-5 text-green-500" />
              )}
              {cleanMessage}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
