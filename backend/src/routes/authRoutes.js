const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const User = require("../models/User");
const Otp = require("../models/otp");

const { sendOTPEmail } = require("../utils/sendOTP");
const { sendWhatsAppOTP } = require("../utils/sendWhatsappOTP");
const generateOTP = require("../utils/generateOTP");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

/* --- Ensure uploads dir --- */
const notesDir = path.join(__dirname, "..", "uploads", "notes");
if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir, { recursive: true });

/* --- Multer config --- */
const blockedTypes = ["video/", "audio/"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/notes/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const fileFilter = (req, file, cb) => {
  if (blockedTypes.some((type) => file.mimetype.startsWith(type))) {
    return cb(new Error("Video & audio not allowed"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

/* ============================================================
   REGISTER → Sends OTP via Email + WhatsApp
============================================================ */
router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const existing = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existing)
      return res.status(400).json({
        success: false,
        message: "Email or phone already registered"
      });

    const otp = generateOTP();

    if (email) await sendOTPEmail(email, otp);
    if (phone) await sendWhatsAppOTP(`+91${phone}`, otp);

    await Otp.create({
      email,
      phone,
      name,
      password,
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "OTP failed",
      error: err.message
    });
  }
});

/* ============================================================
   SEND OTP AGAIN
============================================================ */
router.post("/send-otp", async (req, res) => {
  const { email, phone } = req.body;
  try {
    const otp = generateOTP();

    if (email) await sendOTPEmail(email, otp);
    if (phone) await sendWhatsAppOTP(`+91${phone}`, otp);

    await Otp.create({
      email,
      phone,
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: err.message
    });
  }
});

/* ============================================================
   VERIFY OTP
============================================================ */
router.post("/verify-otp", async (req, res) => {
  const { email, phone, otp, purpose } = req.body;

  if (!otp) {
    return res.status(400).json({
      success: false,
      message: "OTP required"
    });
  }

  // Build query
  const query = {};
  if (email) query.email = email;
  if (phone) query.phone = phone;
  if (purpose) query.purpose = purpose; // for forgot-password

  // Find latest OTP
  const record = await Otp.findOne(query).sort({ createdAt: -1 });

  if (!record) {
    return res.status(400).json({
      success: false,
      message: "OTP not found"
    });
  }

  if (String(record.code) !== String(otp)) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP"
    });
  }

  if (record.expiresAt < Date.now()) {
    return res.status(400).json({
      success: false,
      message: "OTP expired"
    });
  }

  return res.status(200).json({
    success: true,
    message: "OTP verified",
    purpose: record.purpose || "register", // default: registration
  });
});

/* ============================================================
   SET USERNAME → CREATE USER + RETURN TOKEN
============================================================ */
router.post("/set-username", async (req, res, next) => {
  try {
    const { username, email, phone } = req.body;

    if (!username || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: "Missing data"
      });
    }

    // check username
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({
      success: false,
      message: "Username taken"
    });

    // find OTP record
    const query = email ? { email } : { phone };
    const otpRecord = await Otp.findOne(query).sort({ createdAt: -1 });

    if (!otpRecord)
      return res.status(400).json({
        success: false,
        message: "Registration expired"
      });

    // hash the password properly
    const hashedPassword = await bcrypt.hash(otpRecord.password, 10);

    // create user
    const user = await User.create({
      name: otpRecord.name,
      email: otpRecord.email,
      phone: otpRecord.phone,
      password: hashedPassword,
      username,
      emailVerified: true,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // delete OTP record
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(201).json({
      success: true,
      message: "Registration complete",
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone
      },
    });
  } catch (err) {
    console.error("SET USERNAME ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Internal error",
      error: err.message
    });
  }
});

/* ============================================================
   LOGIN
============================================================ */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({
      success: false,
      message: "User not found"
    });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({
      success: false,
      message: "Invalid credentials"
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/* ============================================================
   GET LOGGED-IN USER DETAILS
============================================================ */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error",
      error: err.message
    });
  }
});

// ============================================================
// LOGOUT
// ============================================================
router.post("/logout", (req, res) => {
  // Frontend will delete the token
  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});

// ============================================================
// FORGET PASSWORD
// ============================================================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({
      success: false,
      message: "User not found"
    });

    // generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // store OTP with purpose
    await Otp.create({
      email,
      code: otp,
      purpose: "forgot-password",
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
    });

    // send OTP (reuse your existing email function)
    await sendOTPEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================================
// RESET PASSWORD
// ============================================================
router.put("/reset-password", async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword)
      return res.status(400).json({
        success: false,
        message: "Both password fields are required"
      });

    if (newPassword !== confirmPassword)
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({
      success: false,
      message: "User not found"
    });

    user.password = newPassword; // hashed automatically if you use pre-save hook
    await user.save();

    // delete old OTP so it can't be reused
    await Otp.deleteMany({ email, purpose: "forgot-password" });

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;