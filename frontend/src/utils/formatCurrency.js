// src/utils/formatCurrency.js
const currencyLocaleMap = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  JPY: "ja-JP",
  AUD: "en-AU",
  CAD: "en-CA",
  CHF: "de-CH",
  CNY: "zh-CN",
};

export const formatCurrency = (amount, currency = "INR") => {
  try {
    const locale = currencyLocaleMap[currency] || "en-IN";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // fallback if invalid currency code
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
};
