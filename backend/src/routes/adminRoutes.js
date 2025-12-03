const express = require("express");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Product = require("../models/Product");

const adminAuth = require("../middlewares/adminMiddleware");
const superAdminAuth = require("../middlewares/superAdminAuth"); // super admin access

const router = express.Router();
/* ============================================================
   FIRST SUPER ADMIN REGISTER (ONE-TIME ONLY)
============================================================ */
router.post("/register-super-admin", async (req, res) => {
  console.log("🔥 Route hit: /register-super-admin");

  try {
    console.log("📥 Request Body:", req.body);
    const { name, email, password } = req.body;
    console.log("🔍 Checking for existing super admin...");
    const checkSuper = await Admin.findOne({ role: "super-admin" });
    console.log("🟡 checkSuper result:", checkSuper);
    if (checkSuper) {
      console.log("❌ Super Admin already exists!");
      return res.status(403).json({
        message: "Super Admin already exists",
      });
    }
    console.log("🛠 Creating new super admin...");
    const admin = await Admin.create({
      name,
      email,
      password,
      role: "super-admin",
    });
    console.log("✅ Super Admin created:", admin);
    res.status(201).json({
      success: true,
      message: "Super Admin registered successfully",
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.log("🔥 ERROR inside route:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   ADMIN LOGIN (For Admin + Super Admin)
============================================================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    const token = admin.generateToken();

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: { id: admin._id, email: admin.email, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   SUPER ADMIN → Create Admin
============================================================ */
router.post("/create", superAdminAuth, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Admin already exists" });

    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || "admin",
    });

    res.status(201).json({
      success: true,
      message: "New admin created successfully",
      admin: { id: admin._id, email: admin.email, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   SUPER ADMIN → Get All Admins
============================================================ */
router.get("/admins", superAdminAuth, async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json({ success: true, admins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   SUPER ADMIN → Delete Admin
============================================================ */
router.delete("/admins/:id", superAdminAuth, async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json({ success: true, message: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   SUPER ADMIN → Block / Unblock Admin
============================================================ */
router.patch("/admins/block/:id", superAdminAuth, async (req, res) => {
  try {
    const { blocked } = req.body;

    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.isBlocked = blocked;
    await admin.save();

    res.json({
      success: true,
      message: blocked ? "Admin blocked" : "Admin unblocked",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   ADMIN + SUPER ADMIN → Add Product
============================================================ */
router.post("/product", adminAuth, async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !price)
      return res.status(400).json({ message: "Name and price required" });

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   ADMIN + SUPER ADMIN → Update Product
============================================================ */
router.put("/product/:id", adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ success: true, message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   ADMIN + SUPER ADMIN → Delete Product
============================================================ */
router.delete("/product/:id", adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   ADMIN + SUPER ADMIN → Get All Products
============================================================ */
router.get("/products", adminAuth, async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   ADMIN + SUPER ADMIN → Get All Users
============================================================ */
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   ADMIN + SUPER ADMIN → Delete User
============================================================ */
router.delete("/user/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   ADMIN + SUPER ADMIN → Block / Unblock User
============================================================ */
router.patch("/user/block/:id", adminAuth, async (req, res) => {
  try {
    const { blocked } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = blocked;
    await user.save();

    res.json({
      success: true,
      message: blocked ? "User blocked" : "User unblocked",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   ADMIN DASHBOARD (Analytics)
============================================================ */
router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const users = await User.countDocuments();
    const products = await Product.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers: users,
        totalProducts: products,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
