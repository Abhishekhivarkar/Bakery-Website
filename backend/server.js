const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const Razorpay = require("razorpay");
const crypto = require("crypto");

dotenv.config();

const app = express();

// Debug middleware for all requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("📦 Request Body:", JSON.stringify(req.body, null, 2));
  }
  next();
});

// Middleware
app.use(cors({ 
  origin: ["http://localhost:3000", "http://localhost:5173"], 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== STATIC FILE SERVING ==================
const uploadsRoot = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });

app.use("/uploads", express.static(uploadsRoot));
app.use("/uploads/products", express.static(path.join(uploadsRoot, "products")));
app.use("/uploads/designs", express.static(path.join(uploadsRoot, "designs")));

// ================== DATABASE CONNECTION ==================
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bakery")
  .then(() => {
    console.log("✅ MongoDB connected to DB:", mongoose.connection.name);
    console.log("📊 MongoDB host:", mongoose.connection.host);
    console.log("📊 MongoDB readyState:", mongoose.connection.readyState);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("❌ Please ensure MongoDB is running on your system");
    console.error("❌ Start MongoDB with: mongod (or sudo systemctl start mongod)");
  });

// ================== RAZORPAY SETUP ==================
console.log("🔑 Razorpay Key ID:", process.env.RAZORPAY_KEY_ID || "Not configured");
console.log("🔑 Razorpay Secret:", process.env.RAZORPAY_SECRET ? "Configured" : "Not configured");

let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_Rn3xa74qiaEekq",
    key_secret: process.env.RAZORPAY_SECRET || "test_secret"
  });
  console.log("✅ Razorpay instance created");
} catch (error) {
  console.error("❌ Razorpay initialization error:", error.message);
  razorpay = null;
}

// ================== ROUTES ==================
const userRoutes = require("./src/routes/userRoutes");
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const productRoutes = require("./src/routes/productRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const customizationRoutes = require('./src/routes/CustomizationRoutes');

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/product", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", customizationRoutes);

// ================== RAZORPAY ROUTES ==================
app.post("/api/payment/create-order", async (req, res) => {
  try {
    console.log("💳 Creating Razorpay order:", req.body);
    const { amount, currency = "INR", receipt } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    if (!razorpay) {
      return res.status(500).json({ success: false, message: "Payment service unavailable" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    });
    
    console.log("✅ Razorpay order created:", order.id);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Razorpay order creation error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create payment order",
      error: error.message 
    });
  }
});

app.post("/api/payment/verify", async (req, res) => {
  try {
    console.log("🔍 Verifying payment:", req.body);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing payment details" 
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET || "test_secret")
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Invalid payment signature");
      return res.status(400).json({ 
        success: false, 
        message: "Invalid payment signature" 
      });
    }

    if (!razorpay) {
      return res.status(500).json({ 
        success: false, 
        message: "Payment service unavailable" 
      });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    console.log("✅ Payment verified:", payment.id);
    res.status(200).json({ success: true, payment });
  } catch (error) {
    console.error("❌ Payment verification error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Payment verification failed",
      error: error.message 
    });
  }
});

// ================== DIAGNOSTIC ROUTES ==================
app.get("/api/check-files", (req, res) => {
  const paths = [ 
    path.join(__dirname, "uploads", "products"), 
    path.join(__dirname, "uploads", "designs") 
  ];
  
  const results = paths.map(p => ({ 
    path: p, 
    exists: fs.existsSync(p), 
    files: fs.existsSync(p) ? fs.readdirSync(p) : [] 
  }));
  
  res.json(results);
});

app.get("/api/test-image", (req, res) => {
  const filename = "1765105914744-banana.jpeg";
  const filePath = path.join(__dirname, "uploads", "products", filename);
  const exists = fs.existsSync(filePath);
  
  res.json({ 
    exists: exists,
    path: filePath,
    absolute: path.resolve(filePath),
    url: `http://localhost:5000/uploads/products/${filename}`,
    testUrl: exists ? `http://localhost:5000/uploads/products/${filename}` : null
  });
});

// Test image access route
app.get("/api/test-image-access", async (req, res) => {
  try {
    // Import Product model
    const Product = require("./src/models/Product");
    const product = await Product.findOne();
    
    if (!product) {
      return res.json({ 
        success: false, 
        message: "No products found in database" 
      });
    }
    
    // Test if images exist
    const imageTests = [];
    
    if (product.images && product.images.length > 0) {
      for (const imgPath of product.images.slice(0, 3)) {
        // Remove leading slash if present for file system check
        const cleanPath = imgPath.startsWith('/') ? imgPath.substring(1) : imgPath;
        const fullPath = path.join(__dirname, cleanPath);
        const exists = fs.existsSync(fullPath);
        
        imageTests.push({
          path: imgPath,
          cleanPath: cleanPath,
          fullPath: fullPath,
          exists: exists,
          url: `http://localhost:5000${imgPath}`,
          accessible: false
        });
        
        // Test if file is readable
        if (exists) {
          try {
            fs.readFileSync(fullPath);
            imageTests[imageTests.length - 1].accessible = true;
          } catch (error) {
            imageTests[imageTests.length - 1].accessible = false;
            imageTests[imageTests.length - 1].error = error.message;
          }
        }
      }
    }
    
    res.json({
      success: true,
      product: {
        name: product.name,
        _id: product._id,
        images: product.images
      },
      imageTests,
      summary: {
        totalTests: imageTests.length,
        exists: imageTests.filter(test => test.exists).length,
        accessible: imageTests.filter(test => test.accessible).length,
        message: imageTests.some(test => test.accessible) 
          ? "✅ Images should work!" 
          : "❌ Images not accessible"
      }
    });
    
  } catch (error) {
    console.error("❌ Error in test-image-access:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Debug: List all products with their image paths
app.get("/api/debug-products", async (req, res) => {
  try {
    const Product = require("./src/models/Product");
    const products = await Product.find().limit(10);
    
    const debugInfo = products.map(product => {
      const prod = product.toObject();
      const imageTests = [];
      
      if (prod.images && prod.images.length > 0) {
        prod.images.forEach((img, index) => {
          const cleanPath = img.startsWith('/') ? img.substring(1) : img;
          const fullPath = path.join(__dirname, cleanPath);
          const exists = fs.existsSync(fullPath);
          
          imageTests.push({
            index: index,
            path: img,
            cleanPath: cleanPath,
            fullUrl: `http://localhost:5000${img}`,
            exists: exists,
            accessible: false
          });
          
          if (exists) {
            try {
              fs.readFileSync(fullPath);
              imageTests[index].accessible = true;
            } catch (error) {
              imageTests[index].accessible = false;
              imageTests[index].error = error.message;
            }
          }
        });
      }
      
      return {
        _id: prod._id,
        name: prod.name,
        category: prod.category,
        images: prod.images,
        imageTests: imageTests
      };
    });
    
    res.json({
      success: true,
      count: debugInfo.length,
      products: debugInfo
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Simple test for any image
app.get("/api/test-any-image", (req, res) => {
  try {
    const { path: imagePath } = req.query;
    
    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: "Please provide ?path= parameter, e.g., /api/test-any-image?path=uploads/products/filename.jpg"
      });
    }
    
    let cleanPath = imagePath;
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    
    const fullPath = path.join(__dirname, cleanPath);
    const exists = fs.existsSync(fullPath);
    
    const result = {
      requestedPath: imagePath,
      cleanPath: cleanPath,
      fullPath: fullPath,
      exists: exists,
      url: `http://localhost:5000/${cleanPath}`
    };
    
    if (exists) {
      try {
        const stats = fs.statSync(fullPath);
        result.stats = {
          size: stats.size,
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory(),
          modified: stats.mtime
        };
        
        // Try to read file
        fs.readFileSync(fullPath, { encoding: null });
        result.accessible = true;
        result.message = "✅ File is accessible";
      } catch (err) {
        result.accessible = false;
        result.error = err.message;
        result.message = "❌ File exists but cannot be read";
      }
    } else {
      result.message = "❌ File does not exist";
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

app.get("/api/debug-structure", (req, res) => {
  const getStructure = (dir, depth = 0) => {
    if (depth > 3 || !fs.existsSync(dir)) return '...';
    const items = fs.readdirSync(dir, { withFileTypes: true });
    const structure = {};
    for (const item of items) {
      const itemName = item.name + (item.isDirectory() ? '/' : '');
      structure[itemName] = item.isDirectory() 
        ? getStructure(path.join(dir, item.name), depth + 1) 
        : 'file';
    }
    return structure;
  };
  res.json({ structure: getStructure(__dirname) });
});

// Manual file serving fallback
app.get('/uploads/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', folder, filename);
  
  if (fs.existsSync(filePath)) {
    console.log(`📤 Serving file: ${filePath}`);
    return res.sendFile(filePath);
  }
  
  console.log(`❌ File not found: ${filePath}`);
  res.status(404).json({ 
    error: 'File not found', 
    path: filePath,
    absolute: path.resolve(filePath)
  });
});

// ================== TEST / HEALTH ROUTES ==================
app.get("/health", (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const statusText = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting"
  }[mongoStatus] || "Unknown";
  
  res.json({ 
    success: true, 
    message: "Server running",
    timestamp: new Date().toISOString(),
    mongo: {
      status: statusText,
      readyState: mongoStatus,
      db: mongoose.connection.name
    },
    razorpay: razorpay ? "Available" : "Unavailable",
    uploadsDir: uploadsRoot,
    exists: fs.existsSync(uploadsRoot),
    diagnostics: {
      testImageAccess: "http://localhost:5000/api/test-image-access",
      debugProducts: "http://localhost:5000/api/debug-products",
      checkFiles: "http://localhost:5000/api/check-files",
      testAnyImage: "http://localhost:5000/api/test-any-image?path=uploads/products/filename.jpg"
    }
  });
});

app.get("/", (req, res) => {
  console.log("🌐 Root request");
  res.json({ 
    message: "Bakery Store API running 🚀",
    version: "1.0.0",
    endpoints: [
      "/api/auth/* - Authentication",
      "/api/user/* - User management",
      "/api/product/* - Products",
      "/api/orders/* - Orders",
      "/api/cart/* - Cart",
      "/api/admin/* - Admin",
      "/health - Health check",
      "/api/payment/create-order - Create Razorpay order",
      "/api/payment/verify - Verify payment",
      "/api/test-image-access - Test image accessibility",
      "/api/debug-products - Debug product images",
      "/api/check-files - Check uploaded files",
      "/api/test-any-image - Test any image path (use ?path=)"
    ],
    documentation: "See /health for system status"
  });
});

// ================== ERROR HANDLING ==================
app.use((err, req, res, next) => {
  console.error("🚨 Server Error:", err.message);
  console.error("🚨 Error Stack:", err.stack);
  
  res.status(500).json({ 
    success: false, 
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  console.error("❌ Endpoint not found:", req.method, req.url);
  res.status(404).json({ 
    success: false, 
    message: "Endpoint not found",
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🌐 CORS enabled for: http://localhost:3000, http://localhost:5173`);
  console.log(`📁 Uploads directory: ${uploadsRoot}`);
  console.log(`📊 MongoDB URI: ${process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bakery"}`);
  console.log(`🔑 Razorpay: ${process.env.RAZORPAY_KEY_ID ? "Configured" : "Using test key"}`);
  console.log(`🔍 Diagnostic endpoints:`);
  console.log(`   • http://localhost:${PORT}/api/test-image-access`);
  console.log(`   • http://localhost:${PORT}/api/debug-products`);
  console.log(`   • http://localhost:${PORT}/api/check-files`);
  console.log(`   • http://localhost:${PORT}/api/test-any-image?path=uploads/products/filename.jpg`);
  console.log(`   • http://localhost:${PORT}/health`);
  
  // Check MongoDB connection
  const db = mongoose.connection;
  
  db.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });
  
  db.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
  });
  
  db.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
  });
  
  db.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
  });
});