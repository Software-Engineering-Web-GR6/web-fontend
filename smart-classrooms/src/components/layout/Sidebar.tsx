import React from "react";
import { NavLink, useLocation } from "react-router-dom";
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

interface SidebarProps {
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin = true }) => {
  const location = useLocation();

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
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
