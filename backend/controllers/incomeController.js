import Income from "../models/Income.js";

// Get all income for logged-in user
export const getIncome = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user.id }).sort({ date: -1 });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new income
export const addIncome = async (req, res) => {
  const { source, amount, date, description } = req.body;
  try {
    const income = await Income.create({
      user: req.user.id,
      source,
      amount,
      date,
      description,
    });
    res.status(201).json(income);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update income
export const updateIncome = async (req, res) => {
  const { id } = req.params;
  const { source, amount, date, description } = req.body;
  try {
    const income = await Income.findByIdAndUpdate(
      id,
      { source, amount, date, description },
      { new: true }
    );
    res.json(income);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete income
export const deleteIncome = async (req, res) => {
  const { id } = req.params;
  try {
    await Income.findByIdAndDelete(id);
    res.json({ message: "Income deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
