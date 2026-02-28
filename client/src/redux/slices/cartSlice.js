// RTK Query
import { createSlice } from "@reduxjs/toolkit";

const getCartKey = () => {
  const userInfo = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;
  return userInfo ? `cart_${userInfo._id}` : "cart_guest";
};

const initialState = {
  items: localStorage.getItem(getCartKey())
    ? JSON.parse(localStorage.getItem(getCartKey()))
    : [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    loadUserCart: (state) => {
      const items = localStorage.getItem(getCartKey())
        ? JSON.parse(localStorage.getItem(getCartKey()))
        : [];
      state.items = items;
    },
    addToCart: (state, action) => {
      const existingItem = state.items.find(
        (item) => item._id === action.payload._id,
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      localStorage.setItem(getCartKey(), JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      localStorage.setItem(getCartKey(), JSON.stringify(state.items));
    },
    increaseQuantity: (state, action) => {
      const item = state.items.find((item) => item._id === action.payload);
      if (item) {
        item.quantity += 1;
      }
      localStorage.setItem(getCartKey(), JSON.stringify(state.items));
    },
    decreaseQuantity: (state, action) => {
      const item = state.items.find((item) => item._id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
      localStorage.setItem(getCartKey(), JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem(getCartKey());
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  loadUserCart,
} = cartSlice.actions;
export default cartSlice.reducer;
