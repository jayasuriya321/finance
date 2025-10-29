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
import { IncomeProvider } from "./context/IncomeContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { CurrencyProvider } from "./context/CurrencyContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <CurrencyProvider>
        <AuthProvider>
          <CategoryProvider>
            <ExpenseProvider>
              <BudgetProvider>
                <GoalProvider>
                  <RecurringProvider>
                    <IncomeProvider>
                      <App />
                    </IncomeProvider>
                  </RecurringProvider>
                </GoalProvider>
              </BudgetProvider>
            </ExpenseProvider>
          </CategoryProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </BrowserRouter>
</React.StrictMode>
);
