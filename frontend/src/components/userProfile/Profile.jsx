import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingBag, FaTruck, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function Profile() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const navigate = useNavigate();

  // Function to generate custom cake image with circular shape
  const generateCustomCakeImage = (cake) => {
    if (!cake) return "/Image/custom-cake-default.jpg";
    
    // Create a canvas for custom cake image generation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    try {
      // Clear canvas with transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Cake center position
      const centerX = 100;
      const centerY = 100;
      
      // Cake dimensions
      const cakeRadius = 70; // Radius of the cake
      const layerHeight = 15; // Height of each layer
      
      // Draw cake base (main body) - Circular shape
      ctx.fillStyle = cake.baseColor || '#FFD1DC'; // Default pink
      
      // Draw circular cake base
      ctx.beginPath();
      ctx.arc(centerX, centerY, cakeRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw layers (if multiple layers)
      const layers = cake.layers || 1;
      for (let i = 1; i < layers; i++) {
        const layerY = centerY - (i * layerHeight);
        const layerRadius = cakeRadius - (i * 3); // Slightly smaller radius for each layer
        
        ctx.fillStyle = cake.layerColors?.[i] || cake.baseColor || '#FFD1DC';
        ctx.beginPath();
        ctx.arc(centerX, layerY, layerRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Frosting on top (circular border)
      if (cake.frosting) {
        ctx.fillStyle = cake.frostingColor || '#FFFFFF';
        const frostingRadius = cakeRadius + 2;
        const frostingY = centerY - ((layers - 1) * layerHeight) - 2;
        
        // Create frosting border
        ctx.beginPath();
        ctx.arc(centerX, frostingY, frostingRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add decorative frosting swirls
        ctx.fillStyle = cake.frostingColor || '#FFFFFF';
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
          const swirlX = centerX + Math.cos(angle) * (frostingRadius - 10);
          const swirlY = frostingY + Math.sin(angle) * (frostingRadius - 10);
          
          ctx.beginPath();
          ctx.arc(swirlX, swirlY, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Decorations (sprinkles/candies) - placed randomly on cake
      if (cake.decorations && cake.decorations.length > 0) {
        cake.decorations.forEach((decoration, index) => {
          ctx.fillStyle = decoration.color || getRandomColor();
          
          // Calculate position on circular cake
          const angle = (index / cake.decorations.length) * Math.PI * 2;
          const distance = cakeRadius * (0.3 + Math.random() * 0.5); // Random distance from center
          const decorationX = centerX + Math.cos(angle) * distance;
          const decorationY = centerY + Math.sin(angle) * distance;
          const size = 4 + Math.random() * 3; // Random size
          
          // Draw decoration as small circle
          ctx.beginPath();
          ctx.arc(decorationX, decorationY, size, 0, Math.PI * 2);
          ctx.fill();
          
          // Add small highlight for 3D effect
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.arc(decorationX - size/3, decorationY - size/3, size/2, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      
      // Text on cake (circular path)
      if (cake.message) {
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        
        // Split message if too long
        const maxLength = 15;
        const message = cake.message.length > maxLength 
          ? cake.message.substring(0, maxLength) + '...' 
          : cake.message;
        
        // Position text based on cake layers
        const textY = centerY - ((layers - 1) * layerHeight) + 5;
        ctx.fillText(message, centerX, textY);
      }
      
      // Add shadow/3D effect to cake
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Redraw border with shadow
      ctx.strokeStyle = cake.baseColor || '#FFD1DC';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, cakeRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Add plate/serving dish (circular plate)
      ctx.fillStyle = '#F0F0F0';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + cakeRadius + 5, cakeRadius + 15, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Add plate rim
      ctx.strokeStyle = '#D0D0D0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + cakeRadius + 5, cakeRadius + 15, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // Convert canvas to data URL
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generating custom cake image:', error);
      return "/Image/custom-cake-default.jpg";
    }
  };

  // Helper function to generate random colors for decorations
  const getRandomColor = () => {
    const colors = [
      '#FF0000', // Red
      '#00FF00', // Green
      '#0000FF', // Blue
      '#FFFF00', // Yellow
      '#FF00FF', // Magenta
      '#00FFFF', // Cyan
      '#FFA500', // Orange
      '#800080', // Purple
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Function to get image URL for item
  const getItemImage = (item) => {
    // Check if it's a custom cake
    const isCustomCake = item.isCustomCake || 
                        item.category === 'custom' || 
                        item.name?.toLowerCase().includes('custom');
    
    if (isCustomCake) {
      // Generate custom cake image
      return generateCustomCakeImage(item);
    }
    
    // For regular items, use the image URL with fallback
    return item.img || item.image || "/cake5.jpg";
  };

  // Fetch user data
  useEffect(() => {
    const token = localStorage.getItem("userToken");

    axios
      .get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch(err => console.error("Error fetching user:", err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        console.log("❌ No token found");
        setOrdersLoading(false);
        return;
      }

      try {
        console.log("📦 Fetching orders with token:", token.substring(0, 20) + "...");
        
        // First, let's check if the user exists
        const userRes = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("📦 User ID from /api/auth/me:", userRes.data.user?._id);
        
        // Now fetch orders
        const response = await axios.get("http://localhost:5000/api/orders/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log("📦 Orders API Response:", response.data);
        console.log("📦 Success status:", response.data.success);
        console.log("📦 Number of orders:", response.data.orders?.length || 0);
        
        if (response.data.success) {
          setOrders(response.data.orders);
          console.log("✅ Orders set in state:", response.data.orders);
        } else {
          console.error("❌ API returned success: false", response.data);
        }
      } catch (error) {
        console.error("❌ Error fetching orders:", error);
        console.error("❌ Error response:", error.response?.data);
        console.error("❌ Error status:", error.response?.status);
        console.error("❌ Error config URL:", error.config?.url);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // DELETE ACCOUNT
  const deleteAccount = async () => {
    const token = localStorage.getItem("userToken");

    try {
      await axios.delete("http://localhost:5000/api/user/delete-account", {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem("userToken");
      navigate("/login");
    } catch (err) {
      alert("Failed to delete account.", err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case "delivered":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          icon: <FaCheckCircle className="mr-1" />,
          label: "Delivered"
        };
      case "cancelled":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          icon: <FaTimesCircle className="mr-1" />,
          label: "Cancelled"
        };
      case "out-for-delivery":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          icon: <FaTruck className="mr-1" />,
          label: "Out for Delivery"
        };
      case "confirmed":
      case "preparing":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          icon: <FaClock className="mr-1" />,
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          icon: <FaClock className="mr-1" />,
          label: "Processing"
        };
    }
  };

  // CANCEL ORDER FUNCTION
  const handleCancelOrder = async (orderId) => {
    const token = localStorage.getItem("userToken");
    
    if (!token) {
      toast.error("Please login again");
      return;
    }

    // Confirm before cancelling
    const isConfirmed = window.confirm("Are you sure you want to cancel this order?");
    
    if (!isConfirmed) {
      return; // User clicked "Cancel"
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/cancel/${orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully!");
        
        // Update the orders in state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, orderStatus: "cancelled" }
              : order
          )
        );
      } else {
        toast.error(response.data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  // Get payment status badge
  const getPaymentBadge = (status) => {
    switch (status) {
      case "paid":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          label: "Paid"
        };
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          label: "Pending"
        };
      case "failed":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          label: "Failed"
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          label: status
        };
    }
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center text-xl">
        Loading Profile...
      </div>
    );

  // Fallback Initial Letter
  const initial = user?.username
    ? user.username.charAt(0).toUpperCase()
    : user?.name
    ? user.name.charAt(0).toUpperCase()
    : "U";

  const hasProfilePic = Boolean(user?.profilePicture);

  return (
    <div className="font-display bg-[#f8f7f6] min-h-screen text-[#181411] px-4 py-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* =========================================
              SIDEBAR
          ========================================== */}
          <aside className="w-full md:w-64 lg:w-72 h-[300px]">
            <div className="sticky top-10 flex h-full min-h-[650px] flex-col justify-between rounded-xl bg-white p-4 shadow-sm">
              {/* USER MINI HEADER */}
              <div className="flex flex-col gap-4 ">
                <div className="flex items-center gap-3">
                  {/* PROFILE PICTURE OR INITIAL */}
                  {hasProfilePic ? (
                    <div
                      className="bg-center bg-cover bg-no-repeat rounded-full size-12 border"
                      style={{
                        backgroundImage: `url("${user.profilePicture}")`,
                      }}
                    ></div>
                  ) : (
                    <div className="size-12 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg font-bold">
                      {initial}
                    </div>
                  )}

                  <div>
                    <h1 className="text-base font-bold">
                      {user?.name || "User"}
                    </h1>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                {/* MENU */}
                <div className="mt-4 flex flex-col gap-2">
                  <button className="flex items-center gap-3 rounded-lg bg-orange-200/40 text-orange-600 font-bold px-3 py-2">
                    My Profile
                  </button>

                  <a href="#order-history" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-orange-200/30">
                    Order History
                  </a>

                  <button className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-orange-200/30">
                    Setting
                  </button>
                  <Link to={"/admin-login"}>
                    <button className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-orange-200/30">
                      Admin Login
                    </button>
                  </Link>
                </div>
              </div>

              {/* LOGOUT AND DELETE ACCOUNT*/}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full bg-[#FFEFDC] text-[#FF6900] py-2 rounded-lg font-medium hover:bg-[#fbe3c5]"
                >
                  Logout
                </button>
                <button
                  onClick={() => setShowDeletePopup(true)}
                  className="w-full bg-red-600 text-white py-2 px-2 rounded-lg font-medium hover:bg-red-700"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </aside>

          {/* =========================================
              MAIN CONTENT
          ========================================== */}
          <section className="flex-1 flex flex-col gap-8">
            {/* PROFILE MAIN CARD */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              {/* LARGE PROFILE IMAGE OR INITIAL */}
              <div className="flex items-center gap-6 mb-6">
                {hasProfilePic ? (
                  <img
                    src={user.profilePicture}
                    className="w-28 h-28 rounded-full object-cover border"
                    alt="profile"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-orange-500 text-white flex items-center justify-center text-4xl font-bold">
                    {initial}
                  </div>
                )}

                <div>
                  <h1 className="text-xl font-semibold">{user?.name}</h1>
                  <p className="text-gray-500">@{user?.username}</p>
                </div>
              </div>

              {/* PERSONAL INFO */}
              <h2 className="text-2xl font-bold mb-1">My Profile</h2>
              <p className="text-gray-500 mb-6">
                Your personal information is shown below.
              </p>

              {/* ⭐ Replaced Input Fields with Read-Only Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Full Name</p>
                  <p className="text-base font-semibold mt-1">{user?.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="text-base font-semibold mt-1">{user?.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Phone Number
                  </p>
                  <p className="text-base font-semibold mt-1">
                    {user?.phone || "Not Added"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Delivery Address
                  </p>
                  <p className="text-base font-semibold mt-1">
                    {user?.address
                      ? `${user.address.street || ""}, ${
                          user.address.city || ""
                        }, ${user.address.state || ""}, ${
                          user.address.pincode || ""
                        }`
                      : "Not Added"}
                  </p>
                </div>
              </div>

              {/* EDIT PROFILE BUTTON */}
              <div className="flex justify-end mt-6">
                <Link to="/edit-profile">
                  <button
                    className="px-6 py-2 rounded-lg text-white font-semibold bg-[#dfa26d] hover:bg-[#c98f5f] transition"
                    type="button"
                  >
                    Edit Profile
                  </button>
                </Link>
              </div>
            </div>

            {/* ORDER HISTORY */}
            <div id="order-history" className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Order History</h2>
                  <p className="text-gray-500">
                    Review your past purchases with us.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const token = localStorage.getItem("userToken");
                    try {
                      const response = await axios.get("http://localhost:5000/api/orders/my", {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      setOrders(response.data.orders);
                      toast.success("Orders refreshed!");
                    } catch (error) {
                      console.error("Refresh error:", error);
                      toast.error("Failed to refresh orders");
                    }
                  }}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                >
                  Refresh Orders
                </button>
              </div>

              {ordersLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#dda56a] mb-4"></div>
                  <p className="text-gray-500">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-gray-400 text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
                  <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                  <Link to="/menu">
                    <button className="px-6 py-3 bg-[#dda56a] text-white rounded-lg hover:bg-[#c8955f] transition font-semibold">
                      Start Shopping
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const statusBadge = getStatusBadge(order.orderStatus);
                    const paymentBadge = getPaymentBadge(order.paymentStatus);
                    
                    return (
                      <div
                        key={order._id}
                        className="border rounded-xl p-5 hover:shadow-md transition-shadow"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <FaShoppingBag className="text-[#dda56a]" />
                              <h3 className="font-bold text-lg">
                                Order #{order._id.toString().slice(-8).toUpperCase()}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-500">
                              Placed on {formatDate(order.createdAt)}
                            </p>
                            {order.deliveredAt && (
                              <p className="text-sm text-gray-500">
                                Delivered on {formatDate(order.deliveredAt)}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${statusBadge.bg} ${statusBadge.text}`}>
                              {statusBadge.icon} {statusBadge.label}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${paymentBadge.bg} ${paymentBadge.text}`}>
                              {paymentBadge.label}
                            </span>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {order.items.slice(0, 3).map((item, index) => {
                              const isCustomCake = item.isCustomCake || 
                                                  item.category === 'custom' || 
                                                  item.name?.toLowerCase().includes('custom');
                              
                              return (
                                <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                                  <img 
                                    src={getItemImage(item)} 
                                    alt={item.name} 
                                    className="w-10 h-10 rounded object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = isCustomCake 
                                        ? "/Image/custom-cake-default.jpg" 
                                        : "/cake5.jpg";
                                    }}
                                  />
                                  <div>
                                    <p className="text-sm font-medium">
                                      {item.name}
                                      {isCustomCake && (
                                        <span className="ml-1 text-xs text-rose-500 font-medium">(Custom)</span>
                                      )}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {item.qty} × ₹{item.price}
                                      {isCustomCake && item.message && (
                                        <span className="block truncate">"{item.message}"</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                            {order.items.length > 3 && (
                              <div className="bg-gray-50 rounded-lg px-3 py-2 flex items-center">
                                <span className="text-sm text-gray-600">
                                  +{order.items.length - 3} more items
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t">
                          <div>
                            <p className="text-sm text-gray-600">
                              Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                                       order.paymentMethod === 'razorpay' ? 'Online Payment' : 
                                       order.paymentMethod}
                            </p>
                            <p className="text-sm text-gray-600">
                              Delivery to: {order.shippingAddress.city}, {order.shippingAddress.state}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-[#dda56a]">
                              ₹{order.totalAmount.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Includes ₹{order.tax.toFixed(2)} tax + ₹{order.deliveryCharge} delivery
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-4">
                          <Link to={`/order-details/${order._id}`}>
                            <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                              View Details
                            </button>
                          </Link>
                          
                          {order.orderStatus === "delivered" && (
                            <button className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">
                              Rate Order
                            </button>
                          )}
                          
                          {["created", "confirmed", "preparing"].includes(order.orderStatus) && (
                            <button 
                              onClick={() => handleCancelOrder(order._id)}
                              className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Order Statistics */}
              {orders.length > 0 && (
                <div className="mt-8 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <p className="text-sm text-green-600 font-medium">Total Spent</p>
                    <p className="text-2xl font-bold">
                      ₹{orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <p className="text-sm text-purple-600 font-medium">Avg. Order Value</p>
                    <p className="text-2xl font-bold">
                      ₹{orders.length > 0 ? (orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* LOGOUT POPUP ANIMATION */}
          {showLogoutModal && (
            <div className="fixed inset-0 flex justify-center items-center bg-black/20 backdrop-blur-sm px-4 z-50 transition-all duration-300">
              <div className="bg-white p-6 rounded-xl shadow-xl w-80 animate-fadeIn">
                <h2 className="text-xl font-semibold mb-2 text-[#181411]">
                  Logout
                </h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to logout?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await axios.post(
                          "http://localhost:5000/api/auth/logout"
                        );

                        localStorage.removeItem("userToken");
                        localStorage.removeItem("userInfo");
                        window.dispatchEvent(new Event("storage"));

                        window.location.href = "/home";
                      } catch (error) {
                        console.error("Logout Error:", error);
                      }
                    }}
                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DELETE ACCOUNT POPUP ANIMATION */}
          {showDeletePopup && (
            <div className="fixed inset-0 flex justify-center items-center bg-black/20 backdrop-blur-sm px-4 z-50 transition-all duration-300">
              <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl animate-[fadeIn_0.2s_ease-out]">
                <h2 className="text-xl font-semibold mb-2 text-[#181411]">
                  Delete Account?
                </h2>

                <p className="text-gray-600 mb-6">
                  Are you sure you want to permanently delete your account? This
                  action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeletePopup(false)}
                    className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={deleteAccount}
                    className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}