import { Toaster } from "@/components/ui/sonner";
import ScrollToTop from '@/shared/components/ScrollToTop';
import AppRoutes from './app/routes';
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect } from 'react';
import { loadUser } from "@/features/auth/authSlice";
import { fetchWishlist, resetWishlist } from "@/features/wishlist/wishlistSlice";
import { fetchCart, resetCart } from "@/features/cart/cartSlice";
import { fetchNotifications } from "@/features/notifications/notificationSlice";
import { connectNotificationSocket, disconnectNotificationSocket } from "@/services/notificationSocket";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  // Handle WebSocket connection based on authentication
  useEffect(() => {
    if (isAuthenticated) {
      console.log("App: User authenticated, connecting WebSocket...");
      connectNotificationSocket(dispatch);
    } else {
      console.log("App: User not authenticated, disconnecting WebSocket...");
      disconnectNotificationSocket();
    }

    return () => {
      disconnectNotificationSocket();
    };
  }, [isAuthenticated, dispatch]);

  // Sync wishlist, cart & notifications with authentication state
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
      dispatch(fetchCart());
      dispatch(fetchNotifications());
    } else {
      dispatch(resetWishlist());
      dispatch(resetCart());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <ScrollToTop />
      <AppRoutes />
    </>
  );
}

export default App;
