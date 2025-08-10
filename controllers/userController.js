// controllers/userController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { generateSpouseCode } from "../utils/generateSpouseCode.js";
import {
  requestOtp,
  verifyOtpAndConsume,
  invalidateAllOtpsFor,
} from "./emailController.js"; // if these live in services/otpService.js, update the path
import { sendEmail } from "../utils/sendEmail.js";
import { otpEmailHTML } from "../utils/emailTemplates.js";

const OTP_MINUTES = Number(process.env.OTP_EXP_MINUTES || 10);

/* ------------------------- helpers ------------------------- */
const isBlank = (v) =>
  v === undefined ||
  v === null ||
  (typeof v === "string" && v.trim().length === 0);

function requireFields(res, body, fields) {
  const missing = fields.filter((f) => isBlank(body?.[f]));
  if (missing.length) {
    res.status(400).json({
      message: "Missing required fields",
      missing, // e.g. ["name","email","password"]
    });
    return false;
  }
  return true;
}

const normalizeEmail = (e) =>
  typeof e === "string" ? e.trim().toLowerCase() : e;

/* ------------------------- auth: register/login/logout ------------------------- */

// REGISTER (do NOT log in; send email verification code)
export const registerUser = async (req, res) => {
  // validate
  if (!requireFields(res, req.body, ["name", "email", "password"])) return;

  const name = req.body.name.trim();
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already in use" });

  const hashed = await bcrypt.hash(password, 10);

  // unique spouse code
  let code;
  let duplicate;
  do {
    code = generateSpouseCode();
    duplicate = await User.findOne({ spouseCode: code });
  } while (duplicate);

  const user = await User.create({
    name,
    email,
    password: hashed,
    spouseCode: code,
    emailVerified: false,
    tokenVersion: 0,
  });

  // Create & email OTP
  const { code: otp } = await requestOtp({
    userId: user._id,
    purpose: "email_verification",
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    text: `Your verification code is ${otp}. It expires in ${OTP_MINUTES} minutes.`,
    html: otpEmailHTML({
      appName: process.env.APP_NAME || "Savings Tracker",
      code: otp,
      minutes: OTP_MINUTES,
      ctaHref: "https://stashly-kappa.vercel.app/",
      ctaLabel: "Open App",
    }),
  });

  // Strict policy: don't sign in yet
  res.status(201).json({
    message: "Account created. Check your email for the verification code.",
  });
};

// RESEND EMAIL VERIFICATION CODE
export const verifyEmailRequest = async (req, res) => {
  if (!requireFields(res, req.body, ["email"])) return;

  const email = normalizeEmail(req.body.email);
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.emailVerified)
    return res.json({ message: "Email already verified" });

  const { code } = await requestOtp({
    userId: user._id,
    purpose: "email_verification",
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    text: `Your verification code is ${code}. It expires in ${OTP_MINUTES} minutes.`,
    html: otpEmailHTML({
      appName: process.env.APP_NAME || "Savings Tracker",
      code,
      minutes: OTP_MINUTES,
      ctaHref: "https://stashly-kappa.vercel.app/",
    }),
  });

  res.json({ message: "Verification code sent" });
};

// CONFIRM EMAIL VERIFICATION (logs user in after success)
export const verifyEmailConfirm = async (req, res) => {
  if (!requireFields(res, req.body, ["email", "otp"])) return;

  const email = normalizeEmail(req.body.email);
  const otp = String(req.body.otp);

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.emailVerified) {
    generateToken(res, user._id);
    return res.json({ _id: user._id, name: user.name, email: user.email });
  }

  await verifyOtpAndConsume({
    userId: user._id,
    purpose: "email_verification",
    code: otp,
  });

  user.emailVerified = true;
  await user.save();
  await invalidateAllOtpsFor({
    userId: user._id,
    purpose: "email_verification",
  });

  // Now log in (set cookie)
  generateToken(res, user._id);
  res.json({ _id: user._id, name: user.name, email: user.email });
};

// LOGIN (block if not verified)
export const loginUser = async (req, res) => {
  if (!requireFields(res, req.body, ["email", "password"])) return;

  const email = normalizeEmail(req.body.email);
  const password = req.body.password;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: "Invalid email or password" });

  if (!user.emailVerified) {
    return res
      .status(403)
      .json({ message: "Please verify your email to continue." });
  }

  generateToken(res, user._id);
  res.status(200).json({ _id: user._id, name: user.name, email: user.email });
};

// LOGOUT
export const logoutUser = (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logged out" });
};

// Me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "_id name email spouse spouseCode"
  );
  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    spouse: user.spouse,
    spouseCode: user.spouseCode,
  });
};

/* ------------------------- spouse features ------------------------- */

export const refreshSpouseCode = async (req, res) => {
  let newCode;
  let duplicate;
  do {
    newCode = generateSpouseCode();
    duplicate = await User.findOne({ spouseCode: newCode });
  } while (duplicate);

  const user = await User.findById(req.user._id);
  user.spouseCode = newCode;
  await user.save();

  res.json({ newCode });
};

export const linkSpouseByCode = async (req, res) => {
  if (!requireFields(res, req.body, ["code"])) return;

  const { code } = req.body;

  const spouse = await User.findOne({ spouseCode: code });
  if (!spouse) return res.status(404).json({ message: "Invalid spouse code" });

  const currentUser = await User.findById(req.user._id);

  if (currentUser._id.equals(spouse._id)) {
    return res.status(400).json({ message: "You cannot link to yourself" });
  }

  if (currentUser.spouse || spouse.spouse) {
    return res
      .status(400)
      .json({ message: "One of you already has a spouse linked" });
  }

  currentUser.spouse = spouse._id;
  spouse.spouse = currentUser._id;

  await currentUser.save();
  await spouse.save();

  res.json({ message: "Spouse linked successfully!" });
};

export const unlinkSpouse = async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  if (!currentUser.spouse)
    return res.status(400).json({ message: "No spouse linked" });

  const spouse = await User.findById(currentUser.spouse);
  currentUser.spouse = null;
  spouse.spouse = null;
  await currentUser.save();
  await spouse.save();
  res.json({ message: "Spouse unlinked successfully!" });
};

export const getSpouseCode = async (req, res) => {
  const user = await User.findById(req.user._id).select("spouseCode");
  res.status(200).json({ spouseCode: user.spouseCode });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: "Missing user id in URL" });

  // only allow deleting your own account
  if (req.user._id.toString() !== id) {
    return res
      .status(403)
      .json({ message: "Forbidden: you can only delete your own account" });
  }

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // If linked, unlink spouse on the other side
  if (user.spouse) {
    const spouse = await User.findById(user.spouse);
    if (spouse) {
      spouse.spouse = null;
      await spouse.save();
    }
  }

  // Delete the user
  await User.findByIdAndDelete(id);

  // Clear auth cookie
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });

  return res.json({ message: "Account deleted" });
};
