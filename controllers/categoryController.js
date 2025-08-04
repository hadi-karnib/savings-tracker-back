import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";

// GET all categories for a user
export const getCategories = async (req, res) => {
  const categories = await Category.find({ user: req.user._id });
  res.json(categories);
};

// POST create a new category
export const createCategory = async (req, res) => {
  const { name, type, color, icon, goal, limit } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: "Name and type are required" });
  }

  const existing = await Category.findOne({ name, type, user: req.user._id });
  if (existing) {
    return res.status(400).json({ message: "You already have this category" });
  }

  const category = await Category.create({
    name,
    type,
    user: req.user._id,
    color: color || "#6366f1",
    icon: icon || "💸",
    goal: type === "saving" ? goal || 0 : 0,
    limit: type === "expense" ? limit || 0 : 0,
  });

  res.status(201).json(category);
};

// PATCH update a category
export const updateCategory = async (req, res) => {
  const { name, color, icon, goal, limit } = req.body;
  const { id } = req.params;

  const category = await Category.findOne({ _id: id, user: req.user._id });
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  category.name = name || category.name;
  category.color = color || category.color;
  category.icon = icon || category.icon;

  if (category.type === "saving") {
    category.goal = goal ?? category.goal;
  }

  if (category.type === "expense") {
    category.limit = limit ?? category.limit;
  }

  await category.save();
  res.json(category);
};

// DELETE a category (only if not used in transactions)
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  const category = await Category.findOne({ _id: id, user: req.user._id });
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const used = await Transaction.exists({ category: id });
  if (used) {
    return res.status(400).json({ message: "Cannot delete a category in use" });
  }

  await category.deleteOne();
  res.json({ message: "Category deleted successfully" });
};