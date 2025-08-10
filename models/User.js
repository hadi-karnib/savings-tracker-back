// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // bcrypt hash
    password: { type: String, required: true },

    emailVerified: { type: Boolean, default: false },

    // optional: bump when you want to invalidate sessions universally
    tokenVersion: { type: Number, default: 0 },

    spouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    spouseCode: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
