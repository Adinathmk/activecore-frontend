import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import wishlistReducer from "@/features/wishlist/wishlistSlice";
import cartReducer from "@/features/cart/cartSlice";
import notificationReducer from "@/features/notifications/notificationSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    wishlist: wishlistReducer,
    cart: cartReducer,
    notifications: notificationReducer,
  },
});

export default store;
