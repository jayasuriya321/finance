import { createContext, useContext, useEffect, useState } from "react";

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  // Default to INR or saved user preference
  const getInitialCurrency = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("currency");
      if (saved) return saved;
    }
    return "INR";
  };

  const [currency, setCurrency] = useState(getInitialCurrency);

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
