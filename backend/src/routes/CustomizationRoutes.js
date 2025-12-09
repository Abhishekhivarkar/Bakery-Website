const express = require("express");
const router = express.Router();

const customizationController = require("../controllers/CustomizationController");
const protect = require("../middlewares/authMiddleware"); // your existing authMiddleware
const designUpload = require("../middlewares/designUploadMiddleware");

// Public Routes
router.get("/customizations", customizationController.getAllCustomizations);
router.get("/customizations/:category", customizationController.getCustomizationsByCategory);
router.get("/customizations/base-cakes", customizationController.getBaseCakes);
router.post("/custom-cake/calculate-price", customizationController.calculateCustomCakePrice);

// Protected User Routes
router.post("/custom-cake/order", protect, customizationController.createCustomCakeOrder);
router.get("/custom-cake/orders", protect, customizationController.getUserCustomCakeOrders);
router.get("/custom-cake/orders/:orderId", protect, customizationController.getCustomCakeOrderById);

router.post(
  "/custom-cake/upload-design/:orderId",
  protect,
  designUpload.single("designImage"),
  customizationController.uploadCustomerDesign
);

module.exports = router;
