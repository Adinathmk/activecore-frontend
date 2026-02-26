import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import wishlistReducer from "@/features/wishlist/wishlistSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    wishlist: wishlistReducer,
  },
});

export default store;
