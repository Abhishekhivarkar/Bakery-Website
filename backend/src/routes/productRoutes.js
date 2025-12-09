const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
} = require("../controllers/productController");

const adminMiddleware = require("../middlewares/adminMiddleware");

/* =====================================================
   MULTER STORAGE CONFIG
===================================================== */

// Create upload directory if missing
const uploadDir = path.join(__dirname, "../uploads/products");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created uploads directory:", uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* =====================================================
   PUBLIC ROUTES
===================================================== */

// GET ALL PRODUCTS
router.get("/", getAllProducts);

// GET SINGLE PRODUCT
router.get("/single/:id", getProduct);

/* =====================================================
   ADMIN ROUTES
===================================================== */

// CREATE PRODUCT
router.post("/create", adminMiddleware, upload.array("images", 5), createProduct);

// UPDATE PRODUCT
router.put("/update/:id", adminMiddleware, upload.array("images", 5), updateProduct);

// DELETE PRODUCT
router.delete("/delete/:id", adminMiddleware, deleteProduct);

module.exports = router;
