import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCart } from "../redux/Slice";
import { toast } from "react-hot-toast";
import axios from "axios";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useSelector(selectCart);
  const [orderDetails, setOrderDetails] = useState({
    orderId: "",
    amount: 0,
    items: [],
    subtotal: 0,
    tax: 0,
    delivery: 40,
    total: 0,
    timestamp: new Date().toISOString(),
    paymentStatus: "Paid",
    orderStatus: "Confirmed"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const searchParams = new URLSearchParams(location.search);
        const paymentId = searchParams.get("payment_id");
        const razorpayOrderId = searchParams.get("order_id");
        const amount = searchParams.get("amount");
        const dbOrderId = searchParams.get("db_order_id");
        
        console.log("🔄 Initializing order with:", {
          paymentId,
          razorpayOrderId,
          amount,
          dbOrderId,
          cartItems: items
        });

        let orderId = razorpayOrderId || `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
        let orderItems = [];
        let paymentDetails = null;
        let orderTotal = amount || 0;

        // If we have a database order ID, try to fetch from backend
        if (dbOrderId) {
          try {
            const token = localStorage.getItem("token");
            const orderRes = await fetch(`http://localhost:5000/api/orders/${dbOrderId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (orderRes.ok) {
              const orderData = await orderRes.json();
              if (orderData.success) {
                console.log("✅ Loaded order from database:", orderData.order);
                orderId = orderData.order._id;
                orderItems = orderData.order.items || [];
                orderTotal = orderData.order.totalAmount || amount;
                paymentDetails = {
                  id: orderData.order.razorpay?.paymentId || paymentId,
                  order_id: orderData.order.razorpay?.orderId || razorpayOrderId,
                  amount: orderData.order.totalAmount || amount,
                  status: orderData.order.paymentStatus || "paid",
                  method: "razorpay",
                  created_at: orderData.order.paidAt || new Date().toISOString()
                };
              }
            }
          } catch (dbError) {
            console.warn("⚠️ Could not fetch order from database:", dbError.message);
          }
        }

        // If we don't have items from database, try other sources
        if (orderItems.length === 0) {
          if (items && items.length > 0) {
            orderItems = [...items];
            console.log("✅ Using items from Redux cart:", orderItems.length);
          } else {
            // Try localStorage as fallback
            try {
              const savedCart = localStorage.getItem('bakery_cart');
              if (savedCart) {
                const cartData = JSON.parse(savedCart);
                orderItems = cartData.items || [];
                console.log("📦 Using items from localStorage:", orderItems.length);
              }
            } catch (localStorageError) {
              console.error("Error reading localStorage:", localStorageError);
            }
          }
        }

        // Calculate totals if not from database
        const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const tax = subtotal * 0.10;
        const delivery = 40;
        const total = orderTotal || (subtotal + tax + delivery);

        // Set order details
        setOrderDetails({
          orderId: orderId,
          dbOrderId: dbOrderId,
          amount: total,
          items: orderItems,
          subtotal: subtotal,
          tax: tax,
          delivery: delivery,
          total: total,
          timestamp: new Date().toISOString(),
          paymentStatus: paymentId ? "Paid" : "Pending",
          orderStatus: "Confirmed",
          paymentId: paymentId,
          razorpayOrderId: razorpayOrderId,
          paymentDetails: paymentDetails
        });

        console.log("✅ Order details set successfully");

        // Save order to localStorage for persistence
        try {
          const orderData = {
            orderId: orderId,
            dbOrderId: dbOrderId,
            items: orderItems,
            total: total,
            timestamp: new Date().toISOString(),
            paymentId: paymentId,
            razorpayOrderId: razorpayOrderId
          };
          localStorage.setItem('lastOrder', JSON.stringify(orderData));
        } catch (saveError) {
          console.error("Error saving order to localStorage:", saveError);
        }

        // Show success toast
        toast.success(`Order #${orderId} confirmed!`);

      } catch (err) {
        console.error("❌ Error initializing order:", err);
        setError("Failed to load order details. Please check your order history.");
        toast.error("Failed to load order details");
        
        // Fallback: Try to get from localStorage
        try {
          const lastOrder = localStorage.getItem('lastOrder');
          if (lastOrder) {
            const orderData = JSON.parse(lastOrder);
            setOrderDetails(prev => ({
              ...prev,
              orderId: orderData.orderId,
              dbOrderId: orderData.dbOrderId,
              items: orderData.items || [],
              total: orderData.total,
              timestamp: orderData.timestamp,
              paymentId: orderData.paymentId,
              razorpayOrderId: orderData.razorpayOrderId
            }));
            setError(null);
            toast.success("Loaded order from saved data");
          }
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeOrder();
  }, [location.search, items]);

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4 pt-32">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 md:h-16 w-12 md:w-16 border-t-2 border-b-2 border-green-600 mb-4 md:mb-6"></div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Loading your order...</h2>
          <p className="text-gray-600 text-sm md:text-base">Please wait while we prepare your order details</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4 pt-32">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-full mb-4 md:mb-6">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-3">Unable to Load Order</h1>
          <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">{error}</p>
          <div className="space-y-2 md:space-y-3">
            <button
              onClick={() => navigate("/")}
              className="w-full py-2 md:py-3 bg-green-600 text-white rounded-lg md:rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm md:text-base"
            >
              Go to Homepage
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 md:py-3 bg-gray-200 text-gray-800 rounded-lg md:rounded-xl font-semibold hover:bg-gray-300 transition-colors text-sm md:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-3 sm:p-4 md:p-6 lg:p-8 pt-28 sm:pt-32">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-6 md:mb-8 lg:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-green-100 rounded-full mb-4 md:mb-6">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 md:mb-3">
            Order Successful! 🎉
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4 md:mb-6">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          <div className="inline-block bg-green-100 text-green-800 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base md:text-lg font-semibold">
            Order ID: {orderDetails.orderId.substring(0, 12)}...
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Left Column - Order Summary */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Order Confirmation Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-green-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Order Confirmed
              </h2>
              
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-green-50 rounded-lg gap-2">
                  <span className="text-gray-600 text-sm sm:text-base">Order Status</span>
                  <span className="px-2 py-1 sm:px-3 sm:py-1 bg-green-600 text-white text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap">
                    {orderDetails.orderStatus}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-blue-50 rounded-lg gap-2">
                  <span className="text-gray-600 text-sm sm:text-base">Payment Status</span>
                  <span className="px-2 py-1 sm:px-3 sm:py-1 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap">
                    {orderDetails.paymentStatus}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                  <span className="text-gray-600 text-sm sm:text-base">Estimated Delivery</span>
                  <span className="font-semibold text-gray-800 text-sm sm:text-base whitespace-nowrap">
                    {new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} Today
                  </span>
                </div>
              </div>
            </div>

            {/* Items Ordered */}
            {orderDetails.items && orderDetails.items.length > 0 ? (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Items Ordered ({orderDetails.items.length})</h2>
                
                <div className="space-y-3 sm:space-y-4">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex items-start p-3 sm:p-4 border border-gray-100 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors">
                      <img
                        src={item.image || item.img}
                        alt={item.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          console.error('❌ Image failed to load:', item.image || item.img);
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&auto=format";
                        }}
                      />
                      
                      <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.name}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-1 sm:mt-2 gap-1 sm:gap-0">
                          <div className="space-y-0.5">
                            <span className="text-gray-600 text-xs sm:text-sm block">Quantity: {item.qty || 1}</span>
                            <span className="text-gray-600 text-xs sm:text-sm">Price: ₹{item.price || 0} each</span>
                          </div>
                          <span className="font-bold text-gray-800 text-sm sm:text-base">
                            ₹{(item.price || 0) * (item.qty || 1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-center">
                <div className="text-gray-400 text-3xl sm:text-4xl mb-3 sm:mb-4">🛒</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-1 sm:mb-2">No items in this order</h3>
                <p className="text-gray-500 text-sm sm:text-base">The order details couldn't be loaded properly.</p>
              </div>
            )}

            {/* Order Timeline */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Order Timeline</h2>
              
              <div className="relative">
                <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-green-200"></div>
                
                <div className="space-y-4 sm:space-y-6 md:space-y-8">
                  {[
                    { time: "Just now", status: "Order Confirmed", icon: "✓", color: "green" },
                    { time: "In 5 minutes", status: "Preparing your order", icon: "👨‍🍳", color: "blue" },
                    { time: "In 25 minutes", status: "Out for delivery", icon: "🚚", color: "yellow" },
                    { time: "In 30 minutes", status: "Delivered", icon: "🏠", color: "purple" }
                  ].map((step, index) => (
                    <div key={index} className="relative flex items-start">
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full ${
                        index === 0 ? 'bg-green-100' : 'bg-gray-100'
                      } border-2 sm:border-4 border-white flex-shrink-0`}>
                        <span className="text-sm sm:text-base md:text-lg">{step.icon}</span>
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <h3 className={`font-semibold text-sm sm:text-base ${index === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                          {step.status}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm">{step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Details & Actions */}
          <div className="space-y-4 sm:space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Order Summary</h2>
              
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Subtotal</span>
                  <span>₹{orderDetails.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Tax (10%)</span>
                  <span>₹{orderDetails.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Delivery Fee</span>
                  <span>₹{orderDetails.delivery}</span>
                </div>
                <hr className="my-1 sm:my-2 border-gray-200" />
                <div className="flex justify-between text-lg sm:text-xl font-bold">
                  <span>Total Amount</span>
                  <span className="text-green-600">₹{orderDetails.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 text-xs sm:text-sm mb-1">Order ID</h3>
                  <p className="text-gray-800 font-mono text-xs sm:text-sm truncate">{orderDetails.orderId}</p>
                </div>
                
                <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 text-xs sm:text-sm mb-1">Order Time</h3>
                  <p className="text-gray-800 text-xs sm:text-sm">
                    {new Date(orderDetails.timestamp).toLocaleDateString('en-IN', { 
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                {orderDetails.paymentId && (
                  <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-700 text-xs sm:text-sm mb-1">Payment ID</h3>
                    <p className="text-gray-800 font-mono text-xs truncate">{orderDetails.paymentId}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => navigate("/menu")}
                  className="w-full py-2 sm:py-3 bg-green-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Order Again
                </button>
                
                <button
                  onClick={() => navigate("/")}
                  className="w-full py-2 sm:py-3 bg-white text-gray-800 border border-gray-300 sm:border-2 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Back to Home
                </button>
                
                <button
                  onClick={() => {
                    toast.success("Invoice will be sent to your email shortly!");
                  }}
                  className="w-full py-2 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Get Invoice
                </button>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2 sm:mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Need Help?
              </h3>
              <p className="text-blue-700 text-sm sm:text-base mb-3 sm:mb-4">
                Having issues with your order? Our support team is here to help.
              </p>
              <div className="space-y-1 sm:space-y-2">
                <button
                  onClick={() => window.open('tel:+911234567890', '_blank')}
                  className="w-full py-1.5 sm:py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs sm:text-sm"
                >
                  📞 Call Support
                </button>
                <button
                  onClick={() => window.open('mailto:support@bakery.com', '_blank')}
                  className="w-full py-1.5 sm:py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs sm:text-sm"
                >
                  ✉️ Email Support
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 sm:mt-8 md:mt-10 text-center text-gray-500 text-xs sm:text-sm">
          <p>An order confirmation has been sent to your registered email address.</p>
          <p className="mt-1">Thank you for choosing our bakery! 🍰</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;