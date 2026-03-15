import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authApi } from "../services";

const UserRoutes: React.FC = () => {
  const location = useLocation();
  const session = authApi.getStoredSession();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (session.user.role !== "user") {
    return <Navigate to={authApi.getDefaultRoute("admin")} replace />;
  }

  return <Outlet />;
};

export default UserRoutes;
