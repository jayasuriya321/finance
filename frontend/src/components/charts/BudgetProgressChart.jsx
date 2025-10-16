// src/components/charts/BudgetProgressChart.jsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function BudgetProgressChart({ budgets }) {
  if (!budgets || budgets.length === 0) {
    return (
      <div className="w-full h-72 flex items-center justify-center">
        <p className="text-gray-500 font-medium text-center">
          No budget data available
        </p>
      </div>
    );
  }

  const COLORS = ["#6366F1", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];
  const data = budgets.map((b) => ({
    name: b.name,
    value: b.spent || 0,
  }));

  return (
    <div className="w-full h-72">
      {/* <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-4 truncate font-outfit">
        Budget Usage
      </h3> */}
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={70}
            innerRadius={35}
            paddingAngle={3}
            cornerRadius={8}
            labelLine={false}
            label={({ name, percent }) =>
              percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ""
            }
            isAnimationActive
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`₹${value}`, "Spent"]} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
