const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "No token provided" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ 
      success: false,
      message: "Invalid token", 
      error: error.message 
    });
  }
  console.log("🔐 Auth Middleware - Checking token");
console.log("Authorization header:", req.headers.authorization);
console.log("Token:", req.headers.authorization?.replace('Bearer ', ''));
console.log("User from token:", req.user);
};
// In your authMiddleware.js

module.exports = authMiddleware;