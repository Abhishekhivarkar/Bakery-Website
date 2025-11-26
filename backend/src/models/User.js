// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: "" },
    password: { type: String, required: true, select: false }, // hide by default
    profilePicture: { type: String, default: "" },
    role: { type: String, default: "user", enum: ["user", "admin"] },
    emailVerified: { type: Boolean, default: false },
    wallet: { type: Number, default: 0 }, // store smallest currency unit OR consistently use decimal
    cart: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1, min: 1 },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    purchasedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: Date,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// hash password before save if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// compare password helper
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// generate JWT helper
userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || "default_jwt_secret",
    { expiresIn: process.env.JWT_EXPIRES || "7d" }
  );
};

// generate password reset token (store hashed token in DB)
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  // store hashed token in DB
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

  // return plain token (send this to user)
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
