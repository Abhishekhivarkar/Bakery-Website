import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  increaseQty,
  decreaseQty,
  deleteItem,
  clearCart,
  selectCart,
} from "../redux/Slice";
import { toast } from "react-hot-toast";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, taxRate, delivery } = useSelector(selectCart);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax + delivery;

  const handleProceedToOrder = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/order");
  };

  // Function to check if item is a custom cake
  const isCustomCake = (item) => {
    return (
      item.type === "custom-cake" ||
      item.name?.toLowerCase().includes("custom") ||
      (item.details && Object.keys(item.details).length > 0)
    );
  };

  // Function to render custom cake details
  const renderCustomCakeDetails = (item) => {
    if (!item.details) return null;

    return (
      <div className="mt-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 w-full">
        <p className="text-sm font-semibold text-amber-800 mb-1 flex items-center gap-1">
          <span className="text-amber-600">🎂</span> Custom Cake Details:
        </p>
        <div className="text-xs text-amber-700 space-y-1">
          {item.details.baseCake && (
            <p>
              <span className="font-medium">Base:</span> {item.details.baseCake}
            </p>
          )}
          {item.details.shape && (
            <p>
              <span className="font-medium">Shape:</span> {item.details.shape}
            </p>
          )}
          {item.details.size && (
            <p>
              <span className="font-medium">Size:</span> {item.details.size}
            </p>
          )}
          {item.details.flavor && (
            <p>
              <span className="font-medium">Flavor:</span> {item.details.flavor}
            </p>
          )}
          {item.details.frosting && (
            <p>
              <span className="font-medium">Frosting:</span>{" "}
              {item.details.frosting}
            </p>
          )}
          {item.details.toppings && item.details.toppings !== "None" && (
            <p>
              <span className="font-medium">Toppings:</span>{" "}
              {item.details.toppings}
            </p>
          )}
          {item.details.message &&
            item.details.message !== "No custom message" && (
              <p>
                <span className="font-medium">Message:</span> "
                {item.details.message}"
              </p>
            )}
        </div>
      </div>
    );
  };

  // Function to render custom cake badge
  const renderCustomCakeBadge = () => {
    return (
      <div className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
        <span className="text-xs">🎂</span>
        <span className="text-xs">Custom</span>
      </div>
    );
  };

  // Function to render the custom cake visual display
  const renderCustomCakeDisplay = (item) => {
    const cakeShape = item.details?.shape || "Round";
    const cakeFlavor = item.details?.flavor || "Chocolate";
    
    // Color based on flavor
    const flavorColors = {
      "chocolate": "bg-gradient-to-r from-amber-900 to-brown-800",
      "vanilla": "bg-gradient-to-r from-amber-50 to-yellow-50",
      "strawberry": "bg-gradient-to-r from-pink-200 to-rose-300",
      "red velvet": "bg-gradient-to-r from-red-800 to-pink-700",
      "butterscotch": "bg-gradient-to-r from-amber-400 to-orange-300",
      "default": "bg-gradient-to-r from-amber-300 to-orange-400"
    };

    const bgColor = flavorColors[cakeFlavor.toLowerCase()] || flavorColors.default;

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-2">
        {/* Visual Cake Representation */}
        <div className="relative mb-2">
          {/* Cake Shape */}
          <div className={`w-16 h-12 ${bgColor} rounded-full ${
            cakeShape.toLowerCase() === "square" ? "rounded-lg" : "rounded-full"
          } shadow-lg border border-amber-200 flex items-center justify-center`}>
            {/* Cake Layers */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-white/30 rounded-full"></div>
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-2 bg-white/30 rounded-full"></div>
            
            {/* Decorative dots */}
            <div className="absolute top-2 left-3 w-1.5 h-1.5 bg-white/50 rounded-full"></div>
            <div className="absolute top-2 right-3 w-1.5 h-1.5 bg-white/50 rounded-full"></div>
          </div>
          
          {/* Cake Plate */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
        </div>
        
        {/* Flavor Tag */}
        <div className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[8px] font-semibold rounded-full border border-amber-300">
          {cakeFlavor}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-[#f7efe7] to-[#f0e6d8] min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#6f482a] mb-2">Your Cart</h1>
          <p className="text-gray-600">Review your delicious selection</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="text-gray-400 text-5xl md:text-6xl mb-4">🛒</div>
            <h2 className="text-xl md:text-2xl font-semibold text-[#6f482a] mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6 px-4">
              Add some delicious items to get started!
            </p>
            <button
              onClick={() => navigate("/menu")}
              className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-[#dda56a] to-[#e8b381] text-white rounded-xl hover:from-[#c8955f] hover:to-[#dda56a] transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* LEFT COLUMN - PRODUCTS */}
            <div className="lg:w-2/3">
              <div className="space-y-4 md:space-y-6">
                {items.map((item) => {
                  const isCustom = isCustomCake(item);

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-center justify-center sm:justify-between bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow gap-4"
                    >
                      {/* Image/Custom Cake Display - Centered for mobile, left for desktop */}
                      <div className="relative w-full sm:w-32 md:w-40 h-32 md:h-40 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                        {isCustom ? (
                          <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col items-center justify-center p-2 md:p-4">
                            {renderCustomCakeDisplay(item)}
                            
                            {/* Custom Cake Label */}
                            <div className="absolute top-2 right-2">
                              {renderCustomCakeBadge()}
                            </div>
                            
                            {/* Decorative corner */}
                            <div className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 border-t-2 border-l-2 border-amber-300 rounded-tl-xl"></div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 border-b-2 border-r-2 border-amber-300 rounded-br-xl"></div>
                          </div>
                        ) : (
                          <>
                            <img
                              src={item.image || item.img || "/cake5.jpg"}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/Image/default.avif";
                              }}
                            />
                            {/* Decorative corner for regular items */}
                            <div className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 border-t-2 border-l-2 border-[#dda56a]/30 rounded-tl-xl"></div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 border-b-2 border-r-2 border-[#dda56a]/30 rounded-br-xl"></div>
                          </>
                        )}
                      </div>

                      {/* Product Info - Centered for mobile, left for desktop */}
                      <div className="flex-1 text-center sm:text-left w-full">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-3 gap-2">
                          <div className="text-center sm:text-left">
                            <h4 className="text-lg md:text-xl font-bold text-gray-800">
                              {item.name}
                            </h4>
                            {isCustom && (
                              <div className="mt-1 flex items-center justify-center sm:justify-start gap-1">
                                <span className="px-2 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
                                  🎂 CUSTOM
                                </span>
                                <span className="text-xs text-amber-600">(Unique)</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Price Display */}
                          <div className="text-center sm:text-right">
                            <p className="text-gray-600 text-sm">
                              ₹{item.price.toFixed(2)} each
                            </p>
                            <p className="text-[#dda56a] font-bold text-base md:text-md">
                              Total: ₹{(item.price * item.qty).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Custom Cake Details */}
                        {isCustom && renderCustomCakeDetails(item)}
                        
                        {/* For non-custom items */}
                        {!isCustom && (
                          <p className="text-gray-500 text-sm mt-2 text-center sm:text-left">
                            Ready for immediate delivery
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls - Centered */}
                      <div className="flex items-center justify-center gap-3 md:gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2 md:gap-4 bg-gray-50 p-2 rounded-xl">
                          <button
                            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 transition-all hover:scale-105 shadow-sm border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => dispatch(decreaseQty(item.id))}
                            disabled={item.qty <= 1}
                            title="Decrease quantity"
                          >
                            <span className="text-lg md:text-xl font-bold text-gray-700">
                              −
                            </span>
                          </button>
                          <span className="text-lg md:text-xl font-bold w-6 md:w-8 text-center text-gray-800">
                            {item.qty}
                          </span>
                          <button
                            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 transition-all hover:scale-105 shadow-sm border border-gray-300"
                            onClick={() => dispatch(increaseQty(item.id))}
                            title="Increase quantity"
                          >
                            <span className="text-lg md:text-xl font-bold text-gray-700">
                              +
                            </span>
                          </button>
                        </div>

                        <button
                          className="text-red-500 hover:text-red-700 text-xl md:text-2xl p-2 md:p-3 hover:bg-red-50 rounded-full transition-all border border-red-100 hover:border-red-200"
                          onClick={() => dispatch(deleteItem(item.id))}
                          title="Remove item from cart"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons - Responsive */}
              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
                <button
                  onClick={() => navigate("/menu")}
                  className="px-6 py-3 border-2 border-[#dda56a] text-[#dda56a] rounded-xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all font-semibold w-full sm:w-auto shadow-sm hover:shadow text-center"
                >
                  ← Continue Shopping
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => navigate("/customize")}
                    className="px-5 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-xl hover:from-purple-200 hover:to-indigo-200 transition-all font-semibold border border-purple-200 shadow-sm w-full sm:w-auto text-center"
                  >
                    + Create Custom Cake
                  </button>
                  
                  <button
                    onClick={() => {
                      dispatch(clearCart());
                      toast.success("Cart cleared successfully");
                    }}
                    className="px-5 py-2.5 md:px-8 md:py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all font-semibold shadow-md hover:shadow-lg w-full sm:w-auto text-center"
                  >
                    Clear All Items
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - CHECKOUT SUMMARY */}
            <div className="lg:w-1/3">
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-gray-200 lg:sticky lg:top-28">
                <div className="mb-4 md:mb-6">
                  <h3 className="text-xl md:text-2xl font-bold text-[#6f482a] mb-2 text-center sm:text-left">
                    Order Summary
                  </h3>
                  <div className="w-12 md:w-16 h-1 bg-gradient-to-r from-[#dda56a] to-[#e8b381] rounded-full mx-auto sm:mx-0"></div>
                </div>

                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  <div className="flex justify-between text-gray-600 pb-2 md:pb-3 border-b">
                    <span>Items ({items.length})</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 pb-2 md:pb-3 border-b">
                    <span>Tax (10%)</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 pb-2 md:pb-3 border-b">
                    <span>Delivery</span>
                    <span className="font-medium">₹{delivery}</span>
                  </div>
                  <div className="flex justify-between text-base md:text-lg font-bold pt-2 md:pt-4 border-t-2 border-gray-300">
                    <span>Total Amount</span>
                    <span className="text-xl md:text-2xl bg-gradient-to-r from-[#dda56a] to-[#e8b381] bg-clip-text text-transparent">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Custom Cake Information Box */}
                {items.some((item) => isCustomCake(item)) && (
                  <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="text-xl md:text-2xl">🎂</div>
                      <div>
                        <p className="text-amber-800 font-semibold mb-1 text-sm md:text-base">
                          Custom Cake Order
                        </p>
                        <p className="text-xs text-amber-600">
                          Your custom cake requires 2-3 days for preparation. 
                          Our team will contact you shortly to confirm delivery timing.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToOrder}
                  className="w-full py-3 md:py-4 bg-gradient-to-r from-[#dda56a] to-[#e8b381] text-white rounded-xl text-base md:text-lg font-bold hover:from-[#c8955f] hover:to-[#dda56a] transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <span className="text-lg md:text-xl">→</span>
                </button>

                <div className="mt-4 md:mt-6 space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                    <div className="text-green-500 text-sm">🔒</div>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                    <div className="text-blue-500 text-sm">🚚</div>
                    <span>Free delivery above ₹500</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                    <div className="text-purple-500 text-sm">🔄</div>
                    <span>Easy returns within 24h</span>
                  </div>
                </div>

                {/* Delivery Estimate */}
                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-r from-[#f8e9dd] to-[#f5e2d0] rounded-xl">
                  <div className="flex items-center gap-2 mb-1 md:mb-2">
                    <div className="text-amber-600 text-sm">⏰</div>
                    <p className="text-sm font-semibold text-[#6f482a]">
                      Estimated Delivery Time:
                    </p>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600">
                    {items.some((item) => isCustomCake(item))
                      ? "2-3 days for custom cakes"
                      : "30-45 minutes for ready items"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;