import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell, LabelList } from "recharts";

export default function GoalProgressChart({ goals }) {
  if (!goals || goals.length === 0) {
    return (
      <div className="w-full h-72 flex items-center justify-center bg-white rounded-2xl shadow-lg">
        <p className="text-gray-500 font-medium text-center">
          No goal data available
        </p>
      </div>
    );
  }

  const COLORS = {
    progress: "#10B981",
    target: "#3B82F6",
    completed: "#EF4444",
  };

  // Prepare data with percentage
  const data = goals.map((g) => ({
    name: g.title || g.name,
    progress: g.currentAmount || 0,
    target: g.targetAmount || 0,
    percentage: g.targetAmount ? ((g.currentAmount || 0) / g.targetAmount) * 100 : 0,
  }));

  return (
    <div className="w-full h-72 bg-white p-5 rounded-2xl shadow-lg hover:shadow-2xl transition-all">
      <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-700 truncate font-outfit">
        Goal Progress
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#4B5563" }}
            interval={0}
            angle={-35}
            textAnchor="end"
            tickFormatter={(text) => (text.length > 12 ? text.slice(0, 12) + "..." : text)}
          />
          <YAxis />
          <Tooltip formatter={(value, name) => [`₹${value}`, name === "progress" ? "Progress" : "Target"]} />
          <Legend verticalAlign="top" />
          
          {/* Target Bar */}
          <Bar dataKey="target" name="Target" fill={COLORS.target} />

          {/* Progress Bar */}
          <Bar dataKey="progress" name="Progress">
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.percentage >= 100 ? COLORS.completed : COLORS.progress} />
            ))}
            <LabelList
              dataKey="percentage"
              position="top"
              formatter={(val) => `${val.toFixed(0)}%`}
              style={{ fill: "#4B5563", fontSize: 12, fontWeight: 500 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
