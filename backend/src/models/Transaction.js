const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit','debit'], required: true },
  amount: { type: Number, required: true },
  method: { type: String }, // e.g., 'razorpay', 'wallet', 'admin-adjust'
  reference: { type: String }, // orderId or payment id
  note: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
