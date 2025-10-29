import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../utils/api";
import { useAuth } from "./AuthContext";

const IncomeContext = createContext();

export const useIncome = () => useContext(IncomeContext);

export const IncomeProvider = ({ children }) => {
  const { token, ready } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch incomes
  const fetchIncomes = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/income", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data?.data) ? res.data.data : res.data;
      setIncomes(data);
    } catch (err) {
      console.error("Failed to fetch incomes:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (ready && token) fetchIncomes();
  }, [ready, token, fetchIncomes]);

  // ✅ Add income
  const addIncome = async (incomeData) => {
    try {
      const res = await API.post("/income", incomeData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncomes((prev) => [res.data.data, ...prev]);
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  };

  // ✅ Edit income
  const editIncome = async (id, updatedData) => {
    try {
      const res = await API.put(`/income/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncomes((prev) => prev.map((i) => (i._id === id ? res.data.data : i)));
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  };

  // ✅ Delete income
  const deleteIncome = async (id) => {
    try {
      await API.delete(`/income/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncomes((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  };

  const totalIncome = incomes.reduce((acc, i) => acc + Number(i.amount || 0), 0);

  return (
    <IncomeContext.Provider
      value={{
        incomes,
        loading,
        error,
        totalIncome,
        fetchIncomes,
        addIncome,
        editIncome,
        deleteIncome, 
      }}
    >
      {children}
    </IncomeContext.Provider>
  );
};
