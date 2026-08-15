import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import GlobalLoader from "../components/common/GlobalLoader";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

const Cart = lazy(() => import("../pages/Cart"));
const Catalog = lazy(() => import("../pages/Catalog"));
const Checkout = lazy(() => import("../pages/Checkout"));
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const ProductDetails = lazy(() => import("../pages/ProductDetails"));
const Profile = lazy(() => import("../pages/Profile"));
const Wishlist = lazy(() => import("../pages/Wishlist"));
const Orders = lazy(() => import("../pages/Orders"));
const OrderDetail = lazy(() => import("../pages/OrderDetail"));
const Notifications = lazy(() => import("../pages/Notifications"));
const NotFound = lazy(() => import("../pages/NotFound"));

const AdminDashboard = lazy(() => import("../pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("../pages/admin/Products"));
const AdminCategories = lazy(() => import("../pages/admin/Categories"));
const AdminOffers = lazy(() => import("../pages/admin/Offers"));
const AdminOrders = lazy(() => import("../pages/admin/Orders"));
const AdminCustomers = lazy(() => import("../pages/admin/Customers"));
const AdminReviews = lazy(() => import("../pages/admin/Reviews"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: "16px", padding: "12px 16px" } }} />
      <Suspense fallback={<GlobalLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductDetails />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="offers" element={<AdminOffers />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="reviews" element={<AdminReviews />} />
              </Route>
            </Route>
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
