import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authApi } from "../services";

const AdminRoutes: React.FC = () => {
  const location = useLocation();
  const session = authApi.getStoredSession();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (session.user.role !== "admin") {
    return <Navigate to={authApi.getDefaultRoute("user")} replace />;
  }

  return <Outlet />;
};

export default AdminRoutes;
