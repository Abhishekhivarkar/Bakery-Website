import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./components/redux/Store";

import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoutes from "./components/ProtectedRoutes";

// ---------- PUBLIC PAGES ----------
import Homepage from "./components/homePage/Homepage";
import About from "./components/About/About";
import ContactUs from "./components/ContactUs";

// ---------- USER AUTH ----------
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import VerifyOTP from "./components/auth/VerifyOTP";
import SetUsername from "./components/auth/SetUsername";
import ForgetPassword from "./components/auth/ForgetPassword";
import ResetPassword from "./components/auth/ResetPassword";
import VerifyForgetPasswordOTP from "./components/auth/VerifyForgetPasswordOTP";

// ---------- USER PROFILE ----------
import Profile from "./components/userProfile/Profile";
import EditProfile from "./components/userProfile/EditProfile";

// ---------- USER PRODUCTS ----------
import AllProducts from "./components/user/AllProducts";
import ProductDetails from "./components/user/ProductDetails";

// ---------- USER CART & ORDER ----------
import Cart from "./components/homePage/Cart";
import OrderNow from "./components/homePage/OrderNow";
import OrderSuccess from "./components/homePage/OrderSuccess";
import FilterPage from "./components/homePage/Filter";

// ---------- CAKE CUSTOMIZATION ----------
import CustomizeCake from "./components/homePage/CakeCustomize"; // Your existing component
import CustomizeBuilder from "./components/homePage/CustomizeBuilder"; // New cake builder component

// ---------- ADMIN ----------
import AdminLogin from "./components/admin/AdminLogin";
import DashboardHome from "./components/admin/Dashboard";
import CreateProduct from "./components/admin/CreateProduct";
import UpdateProduct from "./components/admin/UpdateProduct";
import Products from "./components/admin/Products";
import Orders from "./components/admin/Orders";
import OffersPage from "./components/admin/OffersPage";
import Delivery from "./components/admin/Delivery";
import Customers from "./components/admin/CustomerDetail";
import CreateAdmin from "./components/admin/CreateAdmin";
import AdminList from "./components/admin/AdminList";
import AllUsers from "./components/admin/AllUsers";

export default function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
          loading: {
            duration: Infinity,
          },
        }}
      />
      
      <Routes>
        {/* ====================== DEFAULT ====================== */}
        <Route path="/" element={<Navigate to="/home" />} />

        {/* ====================== PUBLIC PAGES ====================== */}
        <Route
          path="/home"
          element={
            <MainLayout>
              <Homepage />
            </MainLayout>
          }
        />

        <Route
          path="/about"
          element={
            <MainLayout>
              <About />
            </MainLayout>
          }
        />

        <Route
          path="/contact"
          element={
            <MainLayout>
              <ContactUs />
            </MainLayout>
          }
        />

        {/* ====================== USER AUTH ====================== */}
        <Route
          path="/register"
          element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          }
        />

        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />

        <Route
          path="/verify-otp"
          element={
            <AuthLayout>
              <VerifyOTP />
            </AuthLayout>
          }
        />

        <Route
          path="/set-username"
          element={
            <AuthLayout>
              <SetUsername />
            </AuthLayout>
          }
        />

        <Route
          path="/forget-password"
          element={
            <AuthLayout>
              <ForgetPassword />
            </AuthLayout>
          }
        />

        <Route
          path="/reset-password"
          element={
            <AuthLayout>
              <ResetPassword />
            </AuthLayout>
          }
        />

        <Route
          path="/otp-verify"
          element={
            <AuthLayout>
              <VerifyForgetPasswordOTP />
            </AuthLayout>
          }
        />

        {/* ====================== USER PROFILE ====================== */}
        <Route
          path="/profile"
          element={
            <AuthLayout>
              <Profile />
            </AuthLayout>
          }
        />

        <Route
          path="/edit-profile"
          element={
            <MainLayout>
              <EditProfile />
            </MainLayout>
          }
        />

        {/* ====================== MENU & FILTERING ====================== */}
        <Route
          path="/menu"
          element={
            <MainLayout>
              <FilterPage />
            </MainLayout>
          }
        />

        {/* ====================== USER PRODUCTS ====================== */}
        <Route
          path="/products"
          element={
            <MainLayout>
              <AllProducts />
            </MainLayout>
          }
        />

        <Route
          path="/product/:id"
          element={
            <MainLayout>
              <ProductDetails />
            </MainLayout>
          }
        />

        {/* ====================== CART & CHECKOUT ====================== */}
        <Route
          path="/cart"
          element={
            <MainLayout>
              <Cart />
            </MainLayout>
          }
        />

        <Route
          path="/order"
          element={
            <ProtectedRoutes>
              <MainLayout>
                <OrderNow />
              </MainLayout>
            </ProtectedRoutes>
          }
        />

        <Route
          path="/order-success"
          element={
            <ProtectedRoutes>
              <MainLayout>
                <OrderSuccess />
              </MainLayout>
            </ProtectedRoutes>
          }
        />

        {/* ====================== CAKE CUSTOMIZATION ====================== */}
        <Route
          path="/customize"
          element={
            <MainLayout>
              <CustomizeCake />
            </MainLayout>
          }
        />

        <Route
          path="/customize-builder"
          element={
            <ProtectedRoutes>
              <MainLayout>
                <CustomizeBuilder />
              </MainLayout>
            </ProtectedRoutes>
          }
        />

        {/* ====================== ADMIN LOGIN ONLY ====================== */}
        <Route
          path="/admin-login"
          element={
            <AuthLayout>
              <AdminLogin />
            </AuthLayout>
          }
        />

        {/* ====================== ADMIN DASHBOARD ====================== */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="products/create" element={<CreateProduct />} />
          <Route path="products/update/:id" element={<UpdateProduct />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="delivery" element={<Delivery />} />
          <Route path="customer-detail" element={<Customers />} />
          <Route path="create-admin" element={<CreateAdmin />} />
          <Route path="all-admins" element={<AdminList />} />
          <Route path="all-users" element={<AllUsers />} />
        </Route>

        {/* ====================== 404 ====================== */}
        <Route
          path="*"
          element={
            <MainLayout>
              <h1 className="text-3xl text-center mt-20">404 — Page Not Found</h1>
            </MainLayout>
          }
        />
      </Routes>
    </>
  );
}