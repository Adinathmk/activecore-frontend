import { CartProvider } from '@/features/cart/hooks/CartContext';
import { ToastContainer } from 'react-toastify';
import ScrollToTop from '@/shared/components/ScrollToTop';
import AppRoutes from './app/routes';
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect } from 'react';
import { loadUser } from "@/features/auth/authSlice";
import { fetchWishlist, resetWishlist } from "@/features/wishlist/wishlistSlice";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  // Sync wishlist with authentication state
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    } else {
      dispatch(resetWishlist());
    }
  }, [isAuthenticated, dispatch]);

  return (
        <CartProvider>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
            <ScrollToTop />
            <AppRoutes />
        </CartProvider>
  );
}

export default App;
