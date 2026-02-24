import { Routes, Route } from 'react-router-dom';

// Layouts & Guards
import MainLayout from '@/app/layouts/MainLayout';
import AdminLayout from '@/app/layouts/AdminLayout';
import ProtectLogin from '@/app/guards/ProtectLogin';
import ProtectProfile from '@/app/guards/ProtectProfile';
import ProtectAdmin from '@/app/guards/ProtectAdmin';

// Auth Pages
import Login from '@/features/auth/pages/Login';
import SignUp from '@/features/auth/pages/SignUp';
import UserProfile from '@/features/auth/pages/Profile';

// Products Pages
import Products from '@/features/products/pages/Products';
import ProductDetails from '@/features/products/pages/ProductDetails';

// Cart & Wishlist & Orders Pages
import CartPage from '@/features/cart/pages/CartPage';
import WishlistPage from '@/features/wishlist/pages/WishlistPage';
import Orders from '@/features/orders/pages/Orders';

// Marketing Pages
import Home from '@/features/marketing/pages/Home';
import ContactPage from '@/features/marketing/pages/ContactPage';
import About from '@/features/marketing/pages/About';

// Admin Pages
import Dashboard from '@/features/admin/pages/Dashboard';
import ManageProducts from '@/features/admin/pages/ManageProducts';
import ManageOrders from '@/features/admin/pages/ManageOrders';
import ManageUsers from '@/features/admin/pages/ManageUsers';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectLogin />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products/:category" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route element={<ProtectProfile />}>
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/orders" element={<Orders />} />
        </Route>
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<About />} />
      </Route>

      <Route element={<ProtectAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manageProducts" element={<ManageProducts />} />
          <Route path="/manageOrders" element={<ManageOrders />} />
          <Route path="/manageUsers" element={<ManageUsers />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
