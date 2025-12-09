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

  return (
    <div className="bg-[#f7efe7] min-h-screen  p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#6f482a] mb-8">Your Cart</h1>
        
        {items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-[#6f482a] mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some delicious items to get started!</p>
            <button
              onClick={() => navigate("/menu")}
              className="px-6 py-3 bg-[#dda56a] text-white rounded-xl hover:bg-[#c8955f] transition-all font-semibold"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN - PRODUCTS */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-center sm:items-start bg-white p-6 rounded-2xl shadow-md border border-gray-200"
                  >
                    <img
                      src={item.image || item.img}
                      alt={item.name}
                      className="w-32 h-32 sm:w-28 sm:h-28 rounded-xl object-cover mb-4 sm:mb-0 sm:mr-6"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/cake5.jpg";
                      }}
                    />

                    <div className="flex-1 text-center sm:text-left mb-4 sm:mb-0">
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h4>
                      <p className="text-gray-600 mb-2">₹{item.price.toFixed(2)} each</p>
                      <p className="text-[#dda56a] font-bold text-lg">
                        Total: ₹{(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <button
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all hover:scale-105"
                        onClick={() => dispatch(decreaseQty(item.id))}
                        disabled={item.qty <= 1}
                      >
                        <span className="text-xl font-bold text-gray-700">−</span>
                      </button>
                      <span className="text-xl font-bold w-8 text-center">{item.qty}</span>
                      <button
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all hover:scale-105"
                        onClick={() => dispatch(increaseQty(item.id))}
                      >
                        <span className="text-xl font-bold text-gray-700">+</span>
                      </button>
                    </div>

                    <button
                      className="text-red-500 hover:text-red-700 text-2xl p-2 hover:bg-red-50 rounded-full transition-all"
                      onClick={() => dispatch(deleteItem(item.id))}
                      title="Remove item"
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>

              {/* Clear Cart Button */}
              <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={() => navigate("/menu")}
                  className="px-6 py-3 border-2 border-[#dda56a] text-[#dda56a] rounded-xl hover:bg-[#f8e9dd] transition-all font-semibold w-full sm:w-auto"
                >
                  ← Continue Shopping
                </button>
                
                <button
                  onClick={() => {
                    dispatch(clearCart());
                    toast.success("Cart cleared successfully");
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold w-full sm:w-auto"
                >
                  Clear All Items
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN - CHECKOUT BUTTON */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 sticky top-28">
                <h3 className="text-xl font-semibold text-[#6f482a] mb-6">Ready to Order?</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-600 pb-3 border-b">
                    <span>Items ({items.length})</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 pb-3 border-b">
                    <span>Tax (10%)</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 pb-3 border-b">
                    <span>Delivery</span>
                    <span className="font-medium">₹{delivery}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total Amount</span>
                    <span className="text-[#dda56a] text-xl">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToOrder}
                  className="w-full py-4 bg-gradient-to-r from-[#dda56a] to-[#e8b381] text-white rounded-xl text-lg font-semibold hover:from-[#c8955f] hover:to-[#dda56a] transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  Proceed to Checkout →
                </button>

                <p className="text-sm text-gray-500 text-center mt-6">
                  🔒 Secure checkout · Free delivery over ₹500
                </p>

                {/* Additional info */}
                <div className="mt-6 p-4 bg-[#f8e9dd] rounded-xl">
                  <p className="text-sm text-[#6f482a] font-medium mb-1">Estimated delivery time:</p>
                  <p className="text-sm text-gray-600">30-45 minutes</p>
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