import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";

// GET all transactions for user + spouse
export const getTransactions = async (req, res) => {
  const userIds = [req.user._id];
  if (req.user.spouse) userIds.push(req.user.spouse);

  const transactions = await Transaction.find({ user: { $in: userIds } })
    .sort({ date: -1 })
    .populate("category");

  res.json(transactions);
};

// POST add a new transaction
export const addTransaction = async (req, res) => {
  const { amount, category: categoryId, note, date } = req.body;

  // Validate category belongs to this user
  const category = await Category.findOne({
    _id: categoryId,
    user: req.user._id,
  });
  if (!category) {
    return res.status(400).json({ message: "Invalid category" });
  }

  const transaction = await Transaction.create({
    user: req.user._id,
    amount,
    category: categoryId,
    note: note || "",
    date: date || Date.now(),
  });

  res.status(201).json(transaction);
};

// PATCH update an existing transaction
export const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { amount, category: categoryId, note, date } = req.body;

  const transaction = await Transaction.findOne({
    _id: id,
    user: req.user._id,
  });
  if (!transaction)
    return res.status(404).json({ message: "Transaction not found" });

  if (categoryId) {
    const category = await Category.findOne({
      _id: categoryId,
      user: req.user._id,
    });
    if (!category) return res.status(400).json({ message: "Invalid category" });
    transaction.category = categoryId;
  }
  if (amount != null) transaction.amount = amount;
  if (note != null) transaction.note = note;
  if (date != null) transaction.date = date;

  await transaction.save();
  res.json(transaction);
};

// DELETE a transaction
export const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  const transaction = await Transaction.findOne({
    _id: id,
    user: req.user._id,
  });
  if (!transaction)
    return res.status(404).json({ message: "Transaction not found" });

  await transaction.deleteOne();
  res.json({ message: "Transaction deleted successfully" });
};
