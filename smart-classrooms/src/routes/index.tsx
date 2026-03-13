import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminAlerts from "../pages/admin/Alerts";
import AdminDevices from "../pages/admin/Devices";
import AdminSettings from "../pages/admin/Settings";
import AdminUsers from "../pages/admin/Users";
import UserDashboard from "../pages/user/Dashboard";
import UserHistory from "../pages/user/History";
import UserAlerts from "../pages/user/Alerts";

const AppRoutes: React.FC = () => {
  // Get role from localStorage or default to admin for demo
  const role = localStorage.getItem("role") || "admin";

  if (role === "user") {
    return (
      <Routes>
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/history" element={<UserHistory />} />
        <Route path="/user/alerts" element={<UserAlerts />} />
        <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/alerts" element={<AdminAlerts />} />
      <Route path="/admin/devices" element={<AdminDevices />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
