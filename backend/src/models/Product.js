const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, index: true }, // optional SEO-friendly slug
    description: { type: String },
    price: { type: Number, required: true }, // store in paise/ cents or float
    category: { type: String, index: true }, // denormalized category name e.g., 'cake'
    images: [{ type: String }], // array of URLs/paths
    stock: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin who created
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
