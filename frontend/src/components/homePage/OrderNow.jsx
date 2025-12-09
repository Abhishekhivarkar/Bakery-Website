import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCart } from "../redux/Slice";
import { clearCart } from "../redux/Slice";
import { toast } from "react-hot-toast";

const OrderNow = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, taxRate, delivery } = useSelector(selectCart);
  const [loading, setLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  // Razorpay key - hardcoded for now
  const RAZORPAY_KEY_ID = "rzp_test_Rn3xa74qiaEekq";

  useEffect(() => {
    const checkAuth = () => {
      setIsCheckingAuth(true);
      
      // Check all possible token storage locations
      const token = 
        localStorage.getItem("token") || 
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("authToken");
      
      console.log("🔍 Checking authentication - Token found:", token ? "Yes" : "No");
      
      if (!token) {
        toast.error("Please login to place an order");
        setTimeout(() => {
          navigate("/login", { 
            state: { 
              from: "/order",
              message: "Please login to complete your order" 
            } 
          });
        }, 1000);
        return;
      }
      
      setUserToken(token);
      setIsCheckingAuth(false);
      
      // Try to get user info for pre-filling
      try {
        const user = 
          JSON.parse(localStorage.getItem("user") || "null") ||
          JSON.parse(localStorage.getItem("userData") || "null") ||
          JSON.parse(sessionStorage.getItem("user") || "null") ||
          {};
        
        if (user) {
          setShippingAddress(prev => ({
            ...prev,
            name: user.name || user.fullName || user.username || "",
            phone: user.phone || user.mobile || user.phoneNumber || ""
          }));
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax + delivery;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = async () => {
    // Check token again
    const token = 
      localStorage.getItem("token") || 
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("authToken");
    
    if (!token) {
      toast.error("Session expired. Please login again.");
      navigate("/login", { state: { from: "/order" } });
      return;
    }

    // Validate shipping address
    const requiredFields = ["name", "phone", "addressLine1", "city", "state", "postalCode"];
    for (const field of requiredFields) {
      if (!shippingAddress[field]?.trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`);
        return;
      }
    }

    if (shippingAddress.phone.length !== 10 || !/^\d+$/.test(shippingAddress.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    
    try {
      console.log("🔄 Creating order with token:", token.substring(0, 20) + "...");

      // First create order in backend using create-simple endpoint
      const orderRes = await fetch("http://localhost:5000/api/orders/create-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map(item => ({
            name: item.name,
            price: item.price,
            qty: item.qty,
            img: item.image || item.img || ""
          })),
          shippingAddress,
          paymentMethod: "razorpay"
        }),
      });

      const orderData = await orderRes.json();
      console.log("📦 Order creation response:", orderData);

      if (!orderData.success) {
        // Handle token expiration
        if (orderData.message?.includes("token") || orderData.message?.includes("auth") || orderData.message?.includes("unauthorized") || orderRes.status === 401) {
          // Clear all auth data
          localStorage.removeItem("token");
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          localStorage.removeItem("userData");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("user");
          
          toast.error("Session expired. Please login again.");
          navigate("/login", { state: { from: "/order" } });
          return;
        }
        throw new Error(orderData.message || "Order creation failed");
      }

      // Get Razorpay order from response
      const razorpayOrder = orderData.razorpayOrder;
      if (!razorpayOrder) {
        throw new Error("Payment order not created");
      }

      // Get user email for prefill
      let userEmail = "";
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        userEmail = user.email || "";
      } catch (e) {
        console.error("Error getting user email:", e);
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      // Razorpay options - FIXED: Using hardcoded key
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        order_id: razorpayOrder.id,
        name: "My Bakery Store",
        description: "Order Payment",
        image: "https://cdn.razorpay.com/logos/7K3b6d18wHwKzL_medium.png",
        prefill: {
          name: shippingAddress.name,
          contact: shippingAddress.phone,
          email: userEmail
        },
        notes: {
          orderId: orderData.order._id,
          address: `${shippingAddress.addressLine1}, ${shippingAddress.city}`
        },
        theme: {
          color: "#c43b52"
        },
        handler: async function (response) {
          console.log("✅ Payment successful, response:", response);
          setLoading(true); // Show loading again during verification

          try {
            const verifyRes = await fetch(
              "http://localhost:5000/api/orders/verify-payment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: orderData.order._id
                }),
              }
            );

            const verifyData = await verifyRes.json();
            console.log("🔍 Payment verification response:", verifyData);

            if (verifyData.success) {
              toast.success("Payment Successful! Order confirmed.");
              dispatch(clearCart());

              const orderDetails = {
                orderId: orderData.order._id,
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                amount: grandTotal,
                items: items,
                timestamp: new Date().toISOString()
              };

              localStorage.setItem('lastOrder', JSON.stringify(orderDetails));

              navigate(`/order-success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}&amount=${grandTotal}&db_order_id=${orderData.order._id}`, {
                replace: true
              });

            } else {
              toast.error("Payment verification failed: " + (verifyData.message || "Unknown error"));
              setLoading(false);
            }

          } catch (verifyError) {
            console.error("❌ Verification error:", verifyError);
            toast.error("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal dismissed");
            toast.error("Payment cancelled");
            setLoading(false);
          }
        }
      };

      // Add error handling for payment
      options.modal.ondismiss = function() {
        toast.error("Payment cancelled");
        setLoading(false);
      };

      const rzp = new window.Razorpay(options);
      
      // Handle payment failure
      rzp.on('payment.failed', function(response) {
        console.error("❌ Payment failed:", response.error);
        toast.error(`Payment failed: ${response.error.description || response.error.reason || "Unknown error"}`);
        setLoading(false);
      });

      rzp.open();

    } catch (err) {
      console.error("❌ Payment error:", err);
      toast.error(err.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  // Function to load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log("✅ Razorpay script loaded");
        resolve();
      };
      script.onerror = () => {
        console.error("❌ Failed to load Razorpay script");
        toast.error("Failed to load payment gateway. Please refresh and try again.");
        resolve();
      };
      document.body.appendChild(script);
    });
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700">Your cart is empty</h2>
          <p className="text-gray-500 mt-2">Add items to your cart first</p>
          <button
            onClick={() => navigate("/menu")}
            className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  if (!userToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700">Authentication Required</h2>
          <p className="text-gray-500 mt-2">Please login to place an order</p>
          <div className="mt-4 flex gap-4 justify-center">
            <button
              onClick={() => navigate("/login", { state: { from: "/order" } })}
              className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register", { state: { from: "/order" } })}
              className="px-6 py-2 border-2 border-rose-600 text-rose-600 rounded-lg hover:bg-rose-50"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Complete Your Order</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Details */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  value={shippingAddress.name}
                  onChange={handleInputChange}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number *"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
                <input
                  type="text"
                  name="addressLine1"
                  placeholder="Address Line 1 *"
                  value={shippingAddress.addressLine1}
                  onChange={handleInputChange}
                  className="p-3 border rounded-lg md:col-span-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
                <input
                  type="text"
                  name="addressLine2"
                  placeholder="Address Line 2 (Optional)"
                  value={shippingAddress.addressLine2}
                  onChange={handleInputChange}
                  className="p-3 border rounded-lg md:col-span-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City *"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State *"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code *"
                  value={shippingAddress.postalCode}
                  onChange={handleInputChange}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-3">* Required fields</p>
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">Order Items ({items.length})</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-gray-600">Quantity: {item.qty}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.price * item.qty}</p>
                      <p className="text-sm text-gray-500">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({items.length} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span>₹{delivery}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-rose-600">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full py-3 rounded-lg text-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-rose-600 hover:bg-rose-700 text-white"
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  `Pay ₹${grandTotal.toFixed(2)}`
                )}
              </button>

              <p className="text-sm text-gray-500 mt-4 text-center">
                🔒 Secure payment powered by Razorpay
              </p>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">⚠️ Test Mode:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Card: 4111 1111 1111 1111</li>
                  <li>• Expiry: Any future date</li>
                  <li>• CVV: 123</li>
                  <li>• UPI: success@razorpay</li>
                </ul>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  Logged in as: <span className="font-medium">
                    {JSON.parse(localStorage.getItem("user") || "{}").name || "User"}
                  </span>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Using token: {userToken ? "✓ Valid" : "✗ Invalid"}
                </p>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  💡 Tip: Make sure Razorpay script is loaded. If payment doesn't open, refresh the page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderNow;