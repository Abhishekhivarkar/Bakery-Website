// redux/Slice.js - Updated (remove localStorage functions)
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  taxRate: 0.10,
  delivery: 40,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      console.log('🛒 Adding to cart:', action.payload);
      const { id, name, price, image, qty = 1 } = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      
      if (existingItem) {
        existingItem.qty += qty;
        console.log('📈 Updated quantity for item:', existingItem);
      } else {
        state.items.push({ 
          id, 
          name, 
          price, 
          image, 
          qty 
        });
        console.log('➕ Added new item to cart');
      }
      console.log('🛒 Cart after add:', state);
    },
    
    increaseQty: (state, action) => {
      const item = state.items.find(item => item.id === action.payload);
      if (item) {
        item.qty++;
      }
    },
    
    decreaseQty: (state, action) => {
      const item = state.items.find(item => item.id === action.payload);
      if (item && item.qty > 1) {
        item.qty--;
      }
    },
    
    deleteItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { 
  addToCart, 
  increaseQty, 
  decreaseQty, 
  deleteItem, 
  clearCart 
} = cartSlice.actions;

// Export selector
export const selectCart = (state) => state.cart;
export default cartSlice.reducer;