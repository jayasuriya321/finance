// src/components/charts/ForecastChart.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export default function ForecastChart() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/forecast", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setForecast(data.forecast);
        } else {
          setError("No forecast data available");
        }
      } catch (err) {
        console.error("Forecast fetch error:", err);
        setError("Failed to load forecast data.");
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  if (loading)
    return <p className="text-center text-gray-500">Loading forecast...</p>;
  if (error)
    return <p className="text-center text-gray-500">{error}</p>;
  if (!forecast)
    return <p className="text-center text-gray-500">No forecast data</p>;

  const data = [
    {
      name: forecast.nextMonth,
      Income: forecast.predictedIncome,
      Expense: forecast.predictedExpense,
      Savings: forecast.predictedSavings,
    },
  ];

  return (
    <div className="bg-white border border-gray-100 shadow-md rounded-2xl p-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        📈 Financial Forecast (Next Month)
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="Income"
            stroke="#22c55e"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="Expense"
            stroke="#ef4444"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="Savings"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 text-center space-y-1 text-gray-700">
        <p>
          <strong>Predicted Income:</strong>{" "}
          ₹{forecast.predictedIncome.toLocaleString()}
        </p>
        <p>
          <strong>Predicted Expense:</strong>{" "}
          ₹{forecast.predictedExpense.toLocaleString()}
        </p>
        <p>
          <strong>Predicted Savings:</strong>{" "}
          ₹{forecast.predictedSavings.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
