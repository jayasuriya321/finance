// backend/controllers/index.js

// Auth/User Controllers
import * as authController from "./authController.js";
import * as userController from "./userController.js";

// Expense Controllers
import * as expenseController from "./expenseController.js";
import * as recurringExpenseController from "./recurringExpenseController.js";

// Goal & Budget Controllers
import * as goalController from "./goalController.js";
import * as budgetController from "./budgetController.js";

// Category Controller
import * as categoryController from "./categoryController.js";

// Dashboard & Reports
import * as dashboardController from "./dashboardController.js";
import * as reportController from "./reportController.js";

export {
  authController,
  userController,
  expenseController,
  recurringExpenseController,
  goalController,
  budgetController,
  categoryController,
  dashboardController,
  reportController,
};
