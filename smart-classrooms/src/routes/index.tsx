import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminAlerts from "../pages/admin/Alerts";
import AdminDevices from "../pages/admin/Devices";
import AdminSettings from "../pages/admin/Settings";
import AdminUsers from "../pages/admin/Users";
import ProfilePage from "../pages/Profile";
import UserDashboard from "../pages/user/Dashboard";
import UserSchedule from "../pages/user/Schedule";
import UserHistory from "../pages/user/History";
import UserAlerts from "../pages/user/Alerts";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import { useAuthStore } from "../store/authStore";

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  // Redirect root to appropriate page
  const getDefaultRedirect = () => {
    if (!isAuthenticated) return "/login";
    return user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
  };

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRedirect()} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRedirect()} replace />
          ) : (
            <ForgotPassword />
          )
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/alerts"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminAlerts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/devices"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDevices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ProfilePage isAdmin={true} />
          </ProtectedRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/schedule"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <UserSchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/history"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <UserHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/alerts"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <UserAlerts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/profile"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <ProfilePage isAdmin={false} />
          </ProtectedRoute>
        }
      />

      {/* Default Redirect */}
      <Route
        path="*"
        element={<Navigate to={getDefaultRedirect()} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
