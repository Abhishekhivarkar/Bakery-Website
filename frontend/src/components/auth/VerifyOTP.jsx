import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VerifyOTP = () => {
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState({ email: "" });

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("userInfo");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserDetails({ email: parsed.email, phone: parsed.phone });
    } else {
      setMessage("⚠️ User info missing. Please register again.");
    }
  }, []);

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        email: userDetails.email || undefined,
        phone: userDetails.phone || undefined,
        otp,
      };

      const res = await axios.post(
        `http://localhost:5000/api/auth/verify-otp`,
        payload
      );
      console.log("✅ OTP Verified:", res.data.message);

      setMessage("✅ OTP verified. Redirecting...");
      setTimeout(() => navigate("/set-username"), 1000);
    } catch (err) {
      console.error(
        "❌ OTP verification failed:",
        err.response?.data?.message || err.message
      );
      setMessage("❌ OTP verification failed. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    try {
      await axios.post(`http://localhost:5000/api/auth/send-otp`, {
        email: userDetails.email || undefined,
        phone: userDetails.phone || undefined,
      });
      setMessage("🔁 OTP resent successfully.");
    } catch (err) {
      console.error("❌ Failed to resend OTP:", err);
      setMessage("❌ Could not resend OTP. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        id="verify-form"
        onSubmit={handleVerifyOtp}
        className="bg-white shadow-md rounded-xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Verify OTP
        </h2>

        {/* OTP Input */}
        <div className="mb-4">
          <label htmlFor="otp" className="block text-gray-700 font-medium mb-1">
            Enter OTP
          </label>
          <input
            type="number"
            name="otp"
            id="otp"
            value={otp}
            onChange={handleOtpChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Verify Button */}
        <button
          id="verifyBtn"
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium 
                  hover:bg-blue-700 transition"
        >
          Verify OTP
        </button>

        {/* Resend Button */}
        <button
          id="resendBtn"
          type="button"
          onClick={handleResendOtp}
          className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-medium mt-3 
                   hover:bg-gray-300 transition"
        >
          Resend OTP
        </button>

        {/* Message */}
        {message && (
          <p className="mt-4 text-center font-medium text-gray-700">
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default VerifyOTP;
