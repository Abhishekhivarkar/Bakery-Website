const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, index: true },
    description: { type: String },
    price: { type: Number, required: true },

    category: { type: String, index: true },

    images: [{ type: String }],

    stock: { type: Number, default: 0 },

    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // ⭐ New Fields Added
    weight: { type: String, default: "500g" },   // e.g., "500g", "1kg", "2kg"
    flavour: { type: String, default: "Vanilla" } // e.g., Chocolate, Strawberry
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
