import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "@/app/layouts/MainLayout";
import AdminLayout from "@/app/layouts/AdminLayout";

// Guards
import ProtectedRoute from "@/app/guards/ProtectedRoute";
import RoleProtectedRoute from "@/app/guards/RoleProtectedRoute";
import PublicOnlyRoute from "@/app/guards/PublicOnlyRoute";

// Auth Pages
import Login from "@/features/auth/pages/Login";
import SignUp from "@/features/auth/pages/SignUp";
import UserProfile from "@/features/auth/pages/Profile";
import VerifyOtp from "@/features/auth/pages/VerifyOtp";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import ResetPassword from "@/features/auth/pages/ResetPassword";

// Products
import Products from "@/features/products/pages/Products";
import ProductDetails from "@/features/products/pages/ProductDetails";

// Cart & Wishlist & Orders
import CartPage from "@/features/cart/pages/CartPage";
import WishlistPage from "@/features/wishlist/pages/WishlistPage";
import Orders from "@/features/orders/pages/Orders";
import PaymentPage from "@/features/orders/pages/Payment";

// Marketing
import Home from "@/features/marketing/pages/Home";
import ContactPage from "@/features/marketing/pages/ContactPage";
import About from "@/features/marketing/pages/About";

// Admin
import Dashboard from "@/features/admin/pages/Dashboard";
import ManageProducts from "@/features/admin/pages/ManageProducts";
import ManageOrders from "@/features/admin/pages/ManageOrders";
import ManageUsers from "@/features/admin/pages/ManageUsers";
import ManageInventory from "@/features/admin/pages/ManageInventory";

const AppRoutes = () => {
  return (
    <Routes>

      {/* ================= PUBLIC ONLY (Login Pages) ================= */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* ================= MAIN LAYOUT ================= */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products/:category" element={<Products />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<About />} />

        {/* ===== Auth Required ===== */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/payment/:orderId" element={<PaymentPage />} />
        </Route>
      </Route>

      {/* ================= ADMIN SECTION ================= */}
      <Route
        element={
          <RoleProtectedRoute allowedRoles={["admin"]} />
        }
      >
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manageProducts" element={<ManageProducts />} />
          <Route path="/manageInventory" element={<ManageInventory />} />
          <Route path="/manageOrders" element={<ManageOrders />} />
          <Route path="/manageUsers" element={<ManageUsers />} />
        </Route>
      </Route>

    </Routes>
  );
};

export default AppRoutes;