import { NavLink } from 'react-router-dom';

interface SidebarProps {
  role: 'admin' | 'user';
}

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/admin/devices', label: 'Thiết bị', icon: '🔌' },
  { to: '/admin/alerts', label: 'Cảnh báo', icon: '🔔' },
  { to: '/admin/settings', label: 'Cài đặt', icon: '⚙️' },
  { to: '/admin/users', label: 'Người dùng', icon: '👥' },
  { to: '/admin/kaggle', label: 'Kaggle Dataset', icon: '📊' },
  { to: '/admin/api-guide', label: 'Real-time & API', icon: '🔗' },
];

const userLinks = [
  { to: '/user/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/user/history', label: 'Lịch sử', icon: '📈' },
  { to: '/user/alerts', label: 'Cảnh báo', icon: '🔔' },
];

export function Sidebar({ role }: SidebarProps) {
  const links = role === 'admin' ? adminLinks : userLinks;

  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-bold">Smart Classroom</h1>
        <p className="text-xs text-gray-400 capitalize">{role}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
