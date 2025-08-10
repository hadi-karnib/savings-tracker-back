// services/otpService.js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import OtpToken from "../models/OtpToken.js";

const OTP_LENGTH = 6;
const OTP_MINUTES = Number(process.env.OTP_EXP_MINUTES || 10);
const LOCK_MINUTES = 15;
const RESEND_COOLDOWN_SECONDS = 45;

const minutesFromNow = (m) => new Date(Date.now() + m * 60 * 1000);
const secondsAgo = (s) => new Date(Date.now() - s * 1000);

function generateCode() {
  return String(crypto.randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH));
}

export async function requestOtp({ userId, purpose, ip, userAgent }) {
  const active = await OtpToken.findOne({
    userId,
    purpose,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  let code;
  if (active) {
    if (
      active.lastSentAt &&
      active.lastSentAt > secondsAgo(RESEND_COOLDOWN_SECONDS)
    ) {
      const wait = Math.ceil(
        (active.lastSentAt.getTime() +
          RESEND_COOLDOWN_SECONDS * 1000 -
          Date.now()) /
          1000
      );
      throw new Error(`Please wait ${wait}s before requesting another code.`);
    }
    code = generateCode();
    active.codeHash = await bcrypt.hash(code, 10); // rotate code
    active.resendCount += 1;
    active.lastSentAt = new Date();
    await active.save();
    return { code, expiresAt: active.expiresAt };
  }

  code = generateCode();
  const token = await OtpToken.create({
    userId,
    purpose,
    codeHash: await bcrypt.hash(code, 10),
    expiresAt: minutesFromNow(OTP_MINUTES),
    attempts: 0,
    maxAttempts: 5,
    lockedUntil: null,
    resendCount: 0,
    lastSentAt: new Date(),
    ip,
    userAgent,
  });

  return { code, expiresAt: token.expiresAt };
}

export async function verifyOtpAndConsume({ userId, purpose, code }) {
  const token = await OtpToken.findOne({
    userId,
    purpose,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!token) throw new Error("No active code or it expired.");
  if (token.lockedUntil && token.lockedUntil > new Date())
    throw new Error("Too many attempts. Try later.");

  const ok = await bcrypt.compare(String(code), token.codeHash);
  if (!ok) {
    token.attempts += 1;
    if (token.attempts >= token.maxAttempts)
      token.lockedUntil = minutesFromNow(LOCK_MINUTES);
    await token.save();
    throw new Error("Invalid code.");
  }

  token.consumedAt = new Date();
  await token.save();

  // Optional: clean other actives for same purpose
  await OtpToken.deleteMany({
    _id: { $ne: token._id },
    userId,
    purpose,
    consumedAt: null,
  });

  return true;
}

export async function invalidateAllOtpsFor({ userId, purpose }) {
  await OtpToken.deleteMany({ userId, purpose, consumedAt: null });
}
