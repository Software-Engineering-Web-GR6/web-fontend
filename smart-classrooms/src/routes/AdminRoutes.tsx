import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { AdminDashboard } from '../pages/admin/Dashboard';
import { AdminAlerts } from '../pages/admin/Alerts';
import { AdminSettings } from '../pages/admin/Settings';
import { AdminDevices } from '../pages/admin/Devices';
import { AdminUsers } from '../pages/admin/Users';
import { KagglePage } from '../pages/admin/KagglePage';
import { ApiGuidePage } from '../pages/admin/ApiGuidePage';

export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<Layout role="admin" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="alerts" element={<AdminAlerts />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="devices" element={<AdminDevices />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="kaggle" element={<KagglePage />} />
        <Route path="api-guide" element={<ApiGuidePage />} />
      </Route>
    </Routes>
  );
}
