// src/utils/helpers.js

// Format number as currency
export const formatCurrency = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);

// Calculate progress percentage
export const calculateProgress = (current, target) =>
  target > 0 ? Math.min(100, (current / target) * 100) : 0;

// Capitalize string
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
