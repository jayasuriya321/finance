import { useEffect, useState, useMemo } from "react";
import { useExpenses } from "../context/ExpenseContext";
import { useBudgets } from "../context/BudgetContext";
import { useGoals } from "../context/GoalContext";
import { useRecurring } from "../context/RecurringContext";
import { useIncome } from "../context/IncomeContext";
import { useCurrency } from "../context/CurrencyContext";
import { formatCurrency } from "../utils/formatCurrency";
import Loader from "../components/Loader";

import BudgetProgressChart from "../components/charts/BudgetProgressChart.jsx";
import GoalProgressChart from "../components/charts/GoalProgressChart.jsx";
import RecurringExpensesChart from "../components/charts/RecurringExpensesChart.jsx";
import ForecastChart from "../components/charts/ForecastChart.jsx";
import BudgetAlerts from "../components/BudgetAlerts";
import { Wallet } from "lucide-react"; 

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import {
  TrendingUpIcon,
  PiggyBankIcon,
  WalletIcon,
  TargetIcon,
  RefreshCcwIcon,
  BarChart3Icon,
  CalendarIcon,
  RepeatIcon,
  CloudSunIcon,
  BanknoteIcon,
} from "lucide-react";

export default function Dashboard() {
  const { expenses, fetchExpenses, loading: expLoading, error: expError } = useExpenses();
  const { budgets, totalBudgeted, fetchBudgets, loading: budLoading, error: budError } = useBudgets();
  const { goals, fetchGoals, loading: goalLoading, error: goalError } = useGoals();
  const { recurrings, fetchRecurrings, loading: recLoading, error: recError } = useRecurring();
  const { incomes, totalIncome, fetchIncomes, loading: incomeLoading, error: incomeError } = useIncome();
  const { currency } = useCurrency(); // ✅ use selected currency

  const [loadingData, setLoadingData] = useState(true);
  const [viewMode, setViewMode] = useState("monthly");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        await Promise.all([
          fetchExpenses(),
          fetchBudgets(),
          fetchGoals(),
          fetchRecurrings(),
          fetchIncomes(),
        ]);
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchAll();
  }, []);

  const loading =
    expLoading || budLoading || goalLoading || recLoading || incomeLoading || loadingData;
  const errors = [expError, budError, goalError, recError, incomeError].filter(Boolean);

  const totalExpense = expenses?.reduce((acc, e) => acc + Number(e.amount || 0), 0) || 0;

  const incomeTrendData = useMemo(() => {
    if (!incomes || incomes.length === 0) return [];
    const grouped = {};
    incomes.forEach((i) => {
      const date = new Date(i.date);
      const month = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      grouped[month] = (grouped[month] || 0) + Number(i.amount || 0);
    });
    return Object.keys(grouped)
      .sort()
      .map((month) => ({
        month: new Date(month + "-01").toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        income: grouped[month],
      }));
  }, [incomes]);

  const weeklyIncomeReport = useMemo(() => {
    const grouped = {};
    incomes.forEach((i) => {
      const date = new Date(i.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().slice(0, 10);
      grouped[weekKey] = (grouped[weekKey] || 0) + Number(i.amount || 0);
    });
    return Object.keys(grouped)
      .sort()
      .map((week) => ({
        week: new Date(week).toLocaleDateString("default", {
          month: "short",
          day: "numeric",
        }),
        income: grouped[week],
      }));
  }, [incomes]);

  if (loading) return <Loader />;
  if (errors.length)
    return <p className="text-red-600 dark:text-red-400 text-center mt-6">{errors.join(", ")}</p>;

  return (
    <div className="space-y-10 p-6 font-outfit min-h-screen transition-colors duration-300">
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
        📊 Dashboard Overview
      </h1>

      {/* ===== Summary Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card
          icon={<WalletIcon className="w-6 h-6 text-red-500" />}
          label="Total Expenses"
          value={formatCurrency(totalExpense, currency)} // ✅ formatted
          gradient="from-red-100 to-red-200 dark:from-red-900 dark:to-red-700"
        />
        <Card
          icon={<PiggyBankIcon className="w-6 h-6 text-blue-500" />}
          label="Total Budgeted"
          value={formatCurrency(totalBudgeted, currency)} // ✅ formatted
          gradient="from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-700"
        />
        <Card
          icon={<TargetIcon className="w-6 h-6 text-green-500" />}
          label="Goals"
          value={goals.length}
          gradient="from-green-100 to-green-200 dark:from-green-900 dark:to-green-700"
        />
        <Card
          icon={<RefreshCcwIcon className="w-6 h-6 text-yellow-500" />}
          label="Recurring Expenses"
          value={recurrings.length}
          gradient="from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-700"
        />
        <Card
          icon={<TrendingUpIcon className="w-6 h-6 text-purple-500" />}
          label="Total Income"
          value={formatCurrency(totalIncome, currency)} // ✅ formatted
          gradient="from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-700"
        />
      </div>

      {/* ===== Charts Section ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartWrapper title="Budget Progress">
          <BudgetProgressChart budgets={budgets} />
        </ChartWrapper>
        <ChartWrapper title="Goals Progress">
          <GoalProgressChart goals={goals} />
        </ChartWrapper>
        <ChartWrapper title="Recurring Expenses">
          <RecurringExpensesChart expenses={recurrings} />
        </ChartWrapper>
      </div>

      {/* ===== Income Analytics Section ===== */}
      <div className="flex flex-wrap justify-between items-center mt-10 gap-3">
        <div className="flex items-center gap-2">
          <BarChart3Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
            Income Analytics
          </h2>
        </div>

        <button
          onClick={() => setViewMode((prev) => (prev === "monthly" ? "weekly" : "monthly"))}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all"
        >
          <RepeatIcon className="w-4 h-4" />
          {viewMode === "monthly" ? (
            <>
              <CalendarIcon className="w-4 h-4" /> <span>Weekly View</span>
            </>
          ) : (
            <>
              <BarChart3Icon className="w-4 h-4" /> <span>Monthly View</span>
            </>
          )}
        </button>
      </div>

      {/* ===== Income Chart ===== */}
      <ChartWrapper title={viewMode === "monthly" ? "Income Trend (Monthly)" : "Income Report (Weekly)"}>
        <ResponsiveContainer width="100%" height={300}>
          {viewMode === "monthly" ? (
            <LineChart data={incomeTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid stroke="#555" strokeOpacity={0.2} />
              <XAxis dataKey="month" stroke="#8884d8" />
              <YAxis stroke="#8884d8" />
              <Tooltip
                formatter={(value) => formatCurrency(value, currency)} // ✅ formatted tooltip
                contentStyle={{ backgroundColor: "#1f2937", color: "#fff" }}
              />
              <Line type="monotone" dataKey="income" stroke="#8b5cf6" strokeWidth={3} />
            </LineChart>
          ) : (
            <BarChart data={weeklyIncomeReport} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid stroke="#555" strokeOpacity={0.2} />
              <XAxis dataKey="week" stroke="#8884d8" />
              <YAxis stroke="#8884d8" />
              <Tooltip
                formatter={(value) => formatCurrency(value, currency)} // ✅ formatted tooltip
                contentStyle={{ backgroundColor: "#1f2937", color: "#fff" }}
              />
              <Bar dataKey="income" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </ChartWrapper>

      {/* ===== Forecast Section ===== */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 transition-colors duration-300">
        <div className="flex items-center gap-2 mb-2">
          <CloudSunIcon className="w-6 h-6 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
            Financial Forecast
          </h2>
        </div>
        <ForecastChart />
      </div>

      {/* ===== Budget Alerts ===== */}
      <BudgetAlerts />

      {/* ===== Recent Incomes ===== */}
<div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 mt-6 transition-colors duration-300">
  <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-100 flex items-center gap-2">
    <BanknoteIcon className="w-5 h-5 text-[#f45a57]" />
    Recent Incomes
  </h2>

  {incomes.length === 0 ? (
    <p className="text-gray-500 dark:text-gray-400 text-center">
      No income records found
    </p>
  ) : (
    <table className="w-full text-left border-collapse border border-gray-200 dark:border-gray-700">
      <thead>
        <tr className="bg-gray-100 dark:bg-gray-700">
          <th className="px-4 py-2 border dark:border-gray-700 text-gray-800 dark:text-gray-100">
            Amount
          </th>
          <th className="px-4 py-2 border dark:border-gray-700 text-gray-800 dark:text-gray-100">
            Source
          </th>
          <th className="px-4 py-2 border dark:border-gray-700 text-gray-800 dark:text-gray-100">
            Date
          </th>
        </tr>
      </thead>
      <tbody>
        {incomes.map((i) => (
          <tr key={i._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-4 py-2 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
              {formatCurrency(i.amount, currency)} {/* ✅ formatted */}
            </td>
            <td className="px-4 py-2 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
              {i.source}
            </td>
            <td className="px-4 py-2 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
              {new Date(i.date).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
    </div>
  );
}

// ======= Card Component =======
function Card({ icon, label, value, gradient }) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} shadow-md rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg transition-all dark:shadow-gray-800`}
    >
      <div className="flex items-center justify-between">
        <span className="text-gray-700 dark:text-gray-200 font-medium text-sm md:text-base">
          {label}
        </span>
        {icon}
      </div>
      <h2 className="text-2xl font-semibold mt-3 text-gray-800 dark:text-gray-100">
        {value}
      </h2>
    </div>
  );
}

// ======= Chart Wrapper Component =======
function ChartWrapper({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-colors duration-300">
      <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-100">
        {title}
      </h2>
      {children}
    </div>
  );
}
