const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  identifier: { type: String, required: true }, // phone or email
  code: { type: String, required: true }, // store hashed ideally
  purpose: { type: String, enum: ['signup','forgot-password','2fa'], required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index if using expiresAt

module.exports = mongoose.model('Otp', otpSchema);
