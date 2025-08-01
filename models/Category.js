// models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    enum: ["saving", "expense"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("Category", categorySchema);
