// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useExpenses } from "../context/ExpenseContext";
import { useBudgets } from "../context/BudgetContext";
import { useGoals } from "../context/GoalContext";
import { useRecurring } from "../context/RecurringContext";
import Loader from "../components/Loader";

import BudgetProgressChart from "../components/charts/BudgetProgressChart.jsx";
import GoalProgressChart from "../components/charts/GoalProgressChart.jsx";
import RecurringExpensesChart from "../components/charts/RecurringExpensesChart.jsx";

export default function Dashboard() {
  const { expenses, fetchExpenses, loading: expLoading, error: expError } = useExpenses();
  const { budgets, totalBudgeted, fetchBudgets, loading: budLoading, error: budError } = useBudgets();
  const { goals, fetchGoals, loading: goalLoading, error: goalError } = useGoals();
  const { recurrings, fetchRecurrings, loading: recLoading, error: recError } = useRecurring();

  const [loadingData, setLoadingData] = useState(true);

  // Fetch all data on mount
  useEffect(() => {
    const fetchAll = async () => {
      try {
        await Promise.all([fetchExpenses(), fetchBudgets(), fetchGoals(), fetchRecurrings()]);
      } finally {
        setLoadingData(false);
      }
    };
    fetchAll();
  }, [fetchExpenses, fetchBudgets, fetchGoals, fetchRecurrings]);

  const loading = expLoading || budLoading || goalLoading || recLoading || loadingData;
  const errors = [expError, budError, goalError, recError].filter(Boolean);

  const totalExpense = expenses?.reduce((acc, e) => acc + Number(e.amount || 0), 0) || 0;

  if (loading) return <Loader />;
  if (errors.length) return <p className="text-red-600 text-center mt-6">{errors.join(", ")}</p>;

  return (
    <div className="space-y-10 p-6 font-outfit">
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-800">Dashboard</h1>

      {/* ===== Summary Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card label="Total Expenses" value={`₹${totalExpense.toLocaleString()}`} color="text-red-500" />
        <Card label="Total Budgeted" value={`₹${totalBudgeted.toLocaleString()}`} color="text-blue-500" />
        <Card label="Goals" value={goals.length} color="text-green-500" />
        <Card label="Recurring Expenses" value={recurrings.length} color="text-yellow-500" />
      </div>

      {/* ===== Charts ===== */}
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
    </div>
  );
}

// ======= Card Component (Static) =======
function Card({ label, value, color }) {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between">
      <span className="text-gray-500 font-medium text-sm md:text-base">{label}</span>
      <h2 className={`text-2xl font-semibold mt-2 truncate ${color}`}>{value}</h2>
    </div>
  );
}

// ======= Chart Wrapper Component (Static) =======
function ChartWrapper({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>
      {children}
    </div>
  );
}
