import { ProductProvider } from '@/features/products/hooks/ProductContext';
import { AuthProvider } from '@/features/auth/hooks/AuthContext';
import { WishlistProvider } from '@/features/wishlist/hooks/WishlistContext';
import { CartProvider } from '@/features/cart/hooks/CartContext';
import { ToastContainer } from 'react-toastify';
import ScrollToTop from '@/shared/components/ScrollToTop';
import AppRoutes from './app/routes';

function App() {
  return (
    <ProductProvider>
      <AuthProvider>
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
      </AuthProvider>
    </ProductProvider>
  );
}

export default App;
