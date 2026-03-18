import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { UserDashboard } from '../pages/user/Dashboard';
import { UserHistory } from '../pages/user/History';
import { UserAlerts } from '../pages/user/Alerts';

export function UserRoutes() {
  return (
    <Routes>
      <Route element={<Layout role="user" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="history" element={<UserHistory />} />
        <Route path="alerts" element={<UserAlerts />} />
      </Route>
    </Routes>
  );
}
