import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LabelList,
} from "recharts";

export default function RecurringExpensesChart({ expenses }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="w-full h-72 flex items-center justify-center">
        <p className="text-gray-500 font-medium text-center">
          No recurring expenses data
        </p>
      </div>
    );
  }

  // Group by month-year
  const grouped = expenses.reduce((acc, exp) => {
    let dateObj = exp.date ? new Date(exp.date) : exp.createdAt ? new Date(exp.createdAt) : new Date();
    if (isNaN(dateObj)) dateObj = new Date();
    const month = dateObj.toLocaleString("default", { month: "short" });
    const year = dateObj.getFullYear();
    const key = `${month} ${year}`;
    acc[key] = (acc[key] || 0) + Number(exp.amount || 0);
    return acc;
  }, {});

  // Sort months chronologically
  const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const data = Object.keys(grouped)
    .map((key) => {
      const [month, year] = key.split(" ");
      return { month, year: Number(year), amount: grouped[key] };
    })
    .sort((a, b) => a.year - b.year || monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month))
    .map(({ month, year, amount }) => ({ month: `${month} ${year}`, amount }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#4B5563" }}
            interval={0}
            angle={-35}
            textAnchor="end"
            tickFormatter={(text) => (text.length > 6 ? text.slice(0, 6) + "..." : text)}
          />
          <YAxis />
          <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#EF4444"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: "#EF4444" }}
            activeDot={{ r: 6, strokeWidth: 3, fill: "#F87171" }}
          >
            <LabelList dataKey="amount" position="top" formatter={(val) => `₹${val}`} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
