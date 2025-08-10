// models/OtpToken.js
import mongoose from "mongoose";

export const OTP_PURPOSES = [
  "email_verification",
  "password_change",
  "password_reset",
];

const OtpTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    purpose: { type: String, enum: OTP_PURPOSES, required: true, index: true },

    codeHash: { type: String, required: true }, // store hash only
    expiresAt: { type: Date, required: true, index: true },
    consumedAt: { type: Date, default: null },

    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    lockedUntil: { type: Date, default: null },

    resendCount: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: null },

    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: true }
);

// One active not-yet-consumed token per user+purpose
OtpTokenSchema.index(
  { userId: 1, purpose: 1, consumedAt: 1, expiresAt: 1 },
  { partialFilterExpression: { consumedAt: null } }
);

// TTL cleanup at expiresAt
OtpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("OtpToken", OtpTokenSchema);
