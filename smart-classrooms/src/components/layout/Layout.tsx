import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  role: 'admin' | 'user';
}

export function Layout({ role }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
