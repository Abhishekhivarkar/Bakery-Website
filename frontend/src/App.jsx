import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";

import Homepage from "./components/homePage/Homepage";
import About from "./components/About/About";
import Register from "./components/auth/Register";
import VerifyOTP from "./components/auth/VerifyOTP";
import SetUsername from "./components/auth/SetUsername";
import Login from "./components/auth/Login";
// import Profile from "./components/userProfile/Profile";
import Profile from "./components/userProfile/Profile"
import EditProfile from "./components/userProfile/EditProfile";

import ContactUs from "./components/ContactUs";
import ForgetPassword from "./components/auth/ForgetPassword";
import ResetPassword from "./components/auth/ResetPassword";
import VerifyForgetPasswordOTP from "./components/auth/VerifyForgetPasswordOTP";

export default function App() {
  return (
    <Routes>
      {/* Default route → Homepage */}
      <Route path="/" element={<Navigate to="/home" />} />

      {/* Public Pages */}
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
        path="/contact-us"
        element={
          <MainLayout>
            <ContactUs />
          </MainLayout>
        }
      />

      {/* Auth Pages */}
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

      {/* User profile */}
      <Route
        path="/update-profile"
        element={
          <AuthLayout>
            <EditProfile />
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
      <Route
        path="/profile"
        element={
          <MainLayout>
            <Profile />
          </MainLayout>
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
    </Routes>
  );
}
