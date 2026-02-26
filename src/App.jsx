import { ProductProvider } from '@/features/products/hooks/ProductContext';
import { WishlistProvider } from '@/features/wishlist/hooks/WishlistContext';
import { CartProvider } from '@/features/cart/hooks/CartContext';
import { ToastContainer } from 'react-toastify';
import ScrollToTop from '@/shared/components/ScrollToTop';
import AppRoutes from './app/routes';
import { useDispatch } from "react-redux";
import React, {  useEffect } from 'react';
import { loadUser } from "@/features/auth/authSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
      console.log("App mounted");
    dispatch(loadUser())    ;
  }, [dispatch]);

  return (
    <ProductProvider>
        <CartProvider>
          <WishlistProvider>
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
          </WishlistProvider>
        </CartProvider>
    </ProductProvider>
  );
}

export default App;
