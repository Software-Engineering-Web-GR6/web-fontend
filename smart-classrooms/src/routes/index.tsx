import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminRoutes } from './AdminRoutes';
import { UserRoutes } from './UserRoutes';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/user/*" element={<UserRoutes />} />
    </Routes>
  );
}
