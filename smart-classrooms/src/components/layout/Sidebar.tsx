import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  LayoutDashboard,
  Settings,
  Bell,
  Monitor,
  Users,
  Fan,
  History,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

interface SidebarProps {
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin = true }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const adminLinks = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/alerts", icon: Bell, label: "Cảnh báo" },
    { path: "/admin/devices", icon: Fan, label: "Thiết bị" },
    { path: "/admin/users", icon: Users, label: "Người dùng" },
    { path: "/admin/settings", icon: Settings, label: "Cài đặt" },
  ];

  const userLinks = [
    { path: "/user/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/user/history", icon: History, label: "Lịch sử" },
    { path: "/user/alerts", icon: Bell, label: "Cảnh báo" },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">SmartClass</h1>
            <p className="text-xs text-gray-500">Classroom Dashboard</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user.fullName?.charAt(0) ||
                user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.fullName || user.username}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <span
                className={clsx(
                  "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1",
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700",
                )}
              >
                {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-50",
              )}
            >
              <Icon
                className={clsx("w-5 h-5", isActive && "text-indigo-600")}
              />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
