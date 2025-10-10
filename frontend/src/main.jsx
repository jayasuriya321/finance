// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CategoryProvider } from "./context/CategoryContext.jsx";
import { ExpenseProvider } from "./context/ExpenseContext.jsx";
import { BudgetProvider } from "./context/BudgetContext.jsx";
import { GoalProvider } from "./context/GoalContext.jsx";
import { RecurringProvider } from "./context/RecurringContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CategoryProvider>
          <ExpenseProvider>
            <BudgetProvider>
              <GoalProvider>
                <RecurringProvider>
                <App />
                </RecurringProvider>
              </GoalProvider>
            </BudgetProvider>
          </ExpenseProvider>
        </CategoryProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
