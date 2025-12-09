import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast"; // Add this import

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [animationStage, setAnimationStage] = useState("idle");
  const navigate = useNavigate();

  useEffect(() => {
    if (animationStage === "fading-out") {
      const timer = setTimeout(() => {
        setIsAdminLogin(!isAdminLogin);
        setAnimationStage("fading-in");
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    if (animationStage === "fading-in") {
      const timer = setTimeout(() => {
        setAnimationStage("idle");
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [animationStage, isAdminLogin]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const toggleLoginType = (type) => {
    if ((type === "admin" && isAdminLogin) || (type === "user" && !isAdminLogin)) {
      return;
    }
    
    setAnimationStage("fading-out");
    setForm({ email: "", password: "" });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let response;
      
      if (isAdminLogin) {
        // Admin login
        response = await axios.post(
          "http://localhost:5000/api/admin/login",
          {
            email: form.email,
            password: form.password,
          }
        );

        console.log("✅ Admin login response:", response.data);
        
        // Store admin tokens
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem("token", response.data.token); // For compatibility
        
        localStorage.setItem(
          "adminInfo",
          JSON.stringify({
            id: response.data.admin.id,
            email: response.data.admin.email,
            role: response.data.admin.role,
          })
        );

        toast.success("Admin login successful!");
        navigate("/admin/dashboard");
      } else {
        // User login
        response = await axios.post(
          "http://localhost:5000/api/auth/login",
          {
            email: form.email,
            password: form.password,
          }
        );

        console.log("✅ User login response:", response.data);
        
        // Store user tokens - CRITICAL FIX: Store with multiple keys
        localStorage.setItem("userToken", response.data.token);
        localStorage.setItem("token", response.data.token); // This is what OrderNow.jsx looks for
        localStorage.setItem("authToken", response.data.token); // Alternative key
        
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            id: response.data.user.id,
            username: response.data.user.username,
            email: response.data.user.email,
            name: response.data.user.name || response.data.user.username,
            phone: response.data.user.phone || ""
          })
        );

        // Also store as 'user' for compatibility
        localStorage.setItem("user", JSON.stringify({
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email,
          name: response.data.user.name || response.data.user.username,
          phone: response.data.user.phone || ""
        }));

        console.log("💾 Stored in localStorage:", {
          token: localStorage.getItem("token"),
          userToken: localStorage.getItem("userToken"),
          user: localStorage.getItem("user")
        });

        toast.success("Login successful!");
        
        // Check if there's a redirect path (e.g., from OrderNow)
        const fromPath = window.location.state?.from || "/home";
        navigate(fromPath);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Invalid email or password.";
      setMessage(errorMsg);
      toast.error(errorMsg);
      console.error("❌ Login error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <form
      onSubmit={handleSubmit}
      className={`bg-white p-8 rounded-b-2xl shadow-xl border border-gray-200 border-t-0 ${
        animationStage === "fading-out" ? "fade-out" : 
        animationStage === "fading-in" ? "fade-in" : ""
      }`}
    >
      <h1 className="text-3xl font-bold text-center text-[#c85a32] mb-2">
        {isAdminLogin ? "Admin Login" : "User Login"}
      </h1>
      
      <p className="text-center text-gray-500 mb-6">
        {isAdminLogin 
          ? "Access the admin dashboard" 
          : "Login to your account"}
      </p>

      {/* Email */}
      <div className="mb-4">
        <label
          htmlFor="email"
          className="font-semibold text-gray-700 block mb-1"
        >
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder={isAdminLogin ? "admin@example.com" : "user@example.com"}
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dfa26d] outline-none transition"
        />
      </div>

      {/* Password */}
      <div className="mb-6">
        <label
          htmlFor="password"
          className="font-semibold text-gray-700 block mb-1"
        >
          Password
        </label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dfa26d] outline-none transition"
          />

          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
          >
            <i
              className={`text-xl ${
                showPassword ? "bx bx-hide" : "bx bx-show"
              }`}
            ></i>
          </button>
        </div>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={loading || animationStage !== "idle"}
        className={`w-full font-semibold py-3 rounded-lg shadow-md transition-all duration-300 disabled:opacity-60 mb-3 ${
          isAdminLogin
            ? "bg-[#c85a32] hover:bg-[#b34a22] text-white"
            : "bg-[#dfa26d] hover:bg-[#e6b07c] text-white"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <i className="bx bx-loader-alt animate-spin text-xl mr-2"></i>
            {isAdminLogin ? "Logging in as Admin..." : "Logging in..."}
          </span>
        ) : (
          isAdminLogin ? "Login as Admin" : "Login as User"
        )}
      </button>

      {/* Switch Type Hint */}
      <div className="text-center mb-4">
        <button
          type="button"
          onClick={() => toggleLoginType(isAdminLogin ? "user" : "admin")}
          disabled={animationStage !== "idle"}
          className="text-sm text-gray-600 hover:text-[#c85a32] font-medium transition-colors disabled:opacity-50"
        >
          <i className={`bx bx-${isAdminLogin ? "user" : "crown"} mr-1`}></i>
          Switch to {isAdminLogin ? "User" : "Admin"} Login
        </button>
      </div>

      {/* Register Link (only for users) */}
      {!isAdminLogin && (
        <p className="text-center text-gray-600 mt-2">
          Don't have an account?{" "}
          <NavLink
            to="/register"
            className="text-[#c85a32] font-semibold hover:underline"
          >
            Register here
          </NavLink>
        </p>
      )}

      {/* Error Message */}
      {message && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-center text-red-600 font-semibold">
            <i className="bx bx-error-circle mr-2"></i>
            {message}
          </p>
        </div>
      )}
      
      {/* Debug info (remove in production) */}
      <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-500">
        <p>Debug: Storing token as "token" and "userToken"</p>
      </div>
    </form>
  );

  const renderLoadingAnimation = () => (
    <div className="bg-white p-8 rounded-b-2xl shadow-xl border border-gray-200 border-t-0 flex justify-center items-center h-96">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#dfa26d] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">
          Switching to {!isAdminLogin ? "Admin" : "User"} login...
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-pink-50 to-orange-100 px-4">
      <div className="w-full max-w-md">
        {/* Login Type Toggle */}
        <div className="flex bg-white rounded-t-2xl overflow-hidden shadow-md">
          <button
            type="button"
            onClick={() => toggleLoginType("user")}
            disabled={animationStage !== "idle"}
            className={`flex-1 py-4 font-semibold transition-all duration-300 disabled:opacity-50 ${
              !isAdminLogin 
                ? "bg-[#dfa26d] text-white shadow-inner" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-50"
            }`}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => toggleLoginType("admin")}
            disabled={animationStage !== "idle"}
            className={`flex-1 py-4 font-semibold transition-all duration-300 disabled:opacity-50 ${
              isAdminLogin 
                ? "bg-[#c85a32] text-white shadow-inner" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Admin Login
          </button>
        </div>

        {/* Render appropriate content based on animation stage */}
        {animationStage === "fading-out" ? renderLoadingAnimation() : renderForm()}
      </div>
    </div>
  );
};

export default Login;