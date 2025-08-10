import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { generateSpouseCode } from "../utils/generateSpouseCode.js";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already in use" });

  const hashed = await bcrypt.hash(password, 10);

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
  });

  generateToken(res, user._id);
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    spouseCode: user.spouseCode,
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: "Invalid email or password" });

  generateToken(res, user._id);
  res.status(200).json({ _id: user._id, name: user.name, email: user.email });
};

export const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out" });
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select("_id name email spouse spouseCode");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    spouse: user.spouse,
    spouseCode: user.spouseCode,
    
  });
};

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
