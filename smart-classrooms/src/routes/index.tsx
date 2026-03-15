import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { authApi } from "../services";
import Login from "../pages/auth/Login";
import AdminRoutes from "./AdminRoutes";
import UserRoutes from "./UserRoutes";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminAlerts from "../pages/admin/Alerts";
import AdminDevices from "../pages/admin/Devices";
import AdminSettings from "../pages/admin/Settings";
import AdminUsers from "../pages/admin/Users";
import UserDashboard from "../pages/user/Dashboard";
import UserHistory from "../pages/user/History";
import UserAlerts from "../pages/user/Alerts";

const AppRoutes: React.FC = () => {
  const session = authApi.getStoredSession();
  const defaultPath = authApi.getDefaultRoute(session?.user.role);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<AdminRoutes />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/alerts" element={<AdminAlerts />} />
        <Route path="/admin/devices" element={<AdminDevices />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      <Route element={<UserRoutes />}>
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/history" element={<UserHistory />} />
        <Route path="/user/alerts" element={<UserAlerts />} />
      </Route>

      <Route
        path="/"
        element={<Navigate to={session ? defaultPath : "/login"} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={session ? defaultPath : "/login"} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
