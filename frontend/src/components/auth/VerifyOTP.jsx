import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userDetails, setUserDetails] = useState({ email: "", phone: "", name: "" });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = React.useRef([]);

  useEffect(() => {
    const saved = localStorage.getItem("userInfo");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserDetails({ 
        email: parsed.email, 
        phone: parsed.phone,
        name: parsed.name 
      });
    } else {
      toast.error("User info missing. Please register again.");
      setTimeout(() => navigate("/register"), 2000);
    }
  }, [navigate]);

  // Timer for resend OTP
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const otpArray = pastedData.split("");
      const newOtp = [...otp];
      otpArray.forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });
      setOtp(newOtp);
      
      // Focus last input
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: userDetails.email || undefined,
        phone: userDetails.phone || undefined,
        otp: otpString,
      };

      console.log("🔄 Verifying OTP for:", userDetails.email);
      
      const res = await axios.post(
        `http://localhost:5000/api/auth/verify-otp`,
        payload
      );
      
      console.log("✅ OTP Verification Response:", res.data);

      if (res.data.success) {
        toast.success("OTP verified successfully! Please set your username.");
        
        // Store verification success in localStorage for set-username
        localStorage.setItem("otpVerified", "true");
        
        // Navigate to set-username with user data
        navigate("/set-username", { 
          state: { 
            email: userDetails.email,
            phone: userDetails.phone,
            name: userDetails.name
          } 
        });
      } else {
        toast.error(res.data.message || "OTP verification failed");
      }

    } catch (err) {
      console.error("❌ OTP verification failed:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || "OTP verification failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      await axios.post(`http://localhost:5000/api/auth/send-otp`, {
        email: userDetails.email || undefined,
        phone: userDetails.phone || undefined,
      });
      
      toast.success("OTP resent successfully!");
      setOtp(["", "", "", "", "", ""]);
      setTimer(60);
      setCanResend(false);
      
      // Focus first input
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      console.error("❌ Failed to resend OTP:", err);
      const errorMsg = err.response?.data?.message || "Could not resend OTP. Try again.";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-100 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-[#c85a32] mb-2">
          Verify OTP
        </h2>
        
        <p className="text-center text-gray-600 mb-6">
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold">{userDetails.email || "your email"}</span>
        </p>

        {/* OTP Input Grid */}
        <div className="mb-6">
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#dfa26d] focus:ring-2 focus:ring-[#dfa26d] outline-none transition-all"
              />
            ))}
          </div>
          
          {/* Timer/Resend */}
          <div className="text-center mt-4">
            {timer > 0 ? (
              <p className="text-gray-600">
                Resend OTP in{" "}
                <span className="font-bold text-[#c85a32]">{timer}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend}
                className="text-[#c85a32] font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerifyOtp}
          disabled={loading || otp.join("").length !== 6}
          className="w-full bg-[#dfa26d] text-white font-semibold py-3 rounded-lg shadow-md hover:bg-[#e6b07c] transition-all duration-300 disabled:opacity-60 mb-3 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </button>

        {/* Debug info */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
          <p className="font-medium mb-1">Registration Flow:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Register → Store user info in localStorage</li>
            <li>Verify OTP → Confirm email/phone</li>
            <li>Set Username → Create account + Get token</li>
            <li>Login successful → Access protected pages</li>
          </ol>
        </div>

        {/* Back to Register */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-gray-600 hover:text-[#c85a32] font-medium"
          >
            ← Back to Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;