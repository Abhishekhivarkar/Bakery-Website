const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, default: 1 },
  img: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: {
      name: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,
    },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod", "wallet"],
      default: "razorpay",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    razorpay: {
      // store razorpay response minimally
      orderId: String,
      paymentId: String,
      signature: String,
    },
    orderStatus: {
      type: String,
      enum: [
        "created",
        "confirmed",
        "preparing",
        "out-for-delivery",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "created",
    },
    deliveredAt: Date,
    cancelledAt: Date,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
