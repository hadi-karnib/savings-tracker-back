import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["saving", "expense"], required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    color: { type: String, default: "#6366f1" }, // Indigo default
    icon: { type: String, default: "💸" },
    goal: { type: Number, default: 0 }, // For savings
    limit: { type: Number, default: 0 }, // For expenses
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
