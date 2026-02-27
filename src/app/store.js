import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import wishlistReducer from "@/features/wishlist/wishlistSlice";
import cartReducer from "@/features/cart/cartSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    wishlist: wishlistReducer,
    cart: cartReducer,
  },
});

export default store;
