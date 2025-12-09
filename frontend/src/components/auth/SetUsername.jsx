import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

const SetUsername = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get user info from localStorage or location state
    const saved = localStorage.getItem("userInfo");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserInfo(parsed);
    } else if (location.state) {
      setUserInfo(location.state);
      // Also save to localStorage
      localStorage.setItem("userInfo", JSON.stringify(location.state));
    } else {
      toast.error("Session expired. Please register again.");
      setTimeout(() => navigate("/register"), 2000);
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username) {
      toast.error("Username is required");
      return;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: username.toLowerCase().replace(/\s/g, ""),
        email: userInfo.email,
        phone: userInfo.phone,
      };

      console.log("🔄 Setting username for:", userInfo.email);
      
      const res = await axios.post(
        `http://localhost:5000/api/auth/set-username`,
        payload
      );

      console.log("✅ Username set response:", res.data);

      if (res.data.success && res.data.token) {
        // STORE TOKENS - CRITICAL STEP!
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userToken", res.data.token);
        localStorage.setItem("authToken", res.data.token);
        
        // Store user info
        localStorage.setItem("userInfo", JSON.stringify(res.data.user));
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        console.log("💾 Tokens stored after username set:", {
          token: localStorage.getItem("token"),
          user: localStorage.getItem("user")
        });

        toast.success("Account created successfully! Welcome!");
        
        // Redirect to home or wherever
        setTimeout(() => navigate("/home"), 1000);
      } else {
        toast.error("Failed to create account");
      }

    } catch (err) {
      console.error("❌ Failed to set username:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || "Something went wrong";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const input = e.target.value;
    // Transform to lowercase and remove spaces
    const filtered = input.toLowerCase().replace(/\s/g, "");
    setUsername(filtered);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md border border-gray-200"
      >
        <h2 className="text-3xl font-bold text-center text-[#c85a32] mb-2">
          Set Your Username
        </h2>
        
        <p className="text-center text-gray-600 mb-6">
          Choose a unique username for your account
        </p>

        {/* Username Input */}
        <div className="mb-6">
          <label
            htmlFor="username"
            className="block text-gray-700 font-medium mb-2"
          >
            Username
          </label>

          <input
            type="text"
            name="username"
            id="username"
            value={username}
            onChange={handleChange}
            minLength={3}
            maxLength={20}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfa26d] focus:border-[#dfa26d] focus:outline-none transition-colors"
            placeholder="e.g., john_doe123"
          />
          
          <p className="text-sm text-gray-500 mt-2">
            • Only lowercase letters, numbers, and underscores<br/>
            • No spaces or special characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || username.length < 3}
          className="w-full bg-[#dfa26d] text-white font-semibold py-3 rounded-lg shadow-md hover:bg-[#e6b07c] transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Creating Account...
            </>
          ) : (
            "Complete Registration"
          )}
        </button>

        {/* Debug info */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
          <p className="font-medium mb-1">Current User:</p>
          <p>Email: {userInfo.email}</p>
          <p>Name: {userInfo.name}</p>
          <p className="mt-2">
            After submitting, you will receive a token and be redirected to home page.
          </p>
        </div>
      </form>
    </div>
  );
};

export default SetUsername;