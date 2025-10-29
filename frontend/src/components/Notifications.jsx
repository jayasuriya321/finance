// src/components/Notifications.jsx
import React from "react";
import { BellIcon } from "lucide-react";

export default function Notifications({ messages }) {
  if (!messages || messages.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 w-80 space-y-2 z-50">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`p-3 rounded-lg shadow-md flex items-center gap-2 ${
            msg.type === "danger"
              ? "bg-red-100 text-red-700"
              : msg.type === "warning"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          <BellIcon className="w-5 h-5" />
          <span>{msg.message}</span>
        </div>
      ))}
    </div>
  );
}
