import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  Bell,
  Fan,
  History,
  LayoutDashboard,
  LogOut,
  Monitor,
  Settings,
  Users,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

interface SidebarProps {
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin = true }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const adminLinks = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { path: "/admin/alerts", icon: Bell, label: "Cảnh báo" },
    { path: "/admin/devices", icon: Fan, label: "Thiết bị" },
    { path: "/admin/users", icon: Users, label: "Người dùng" },
    { path: "/admin/settings", icon: Settings, label: "Cài đặt" },
  ];

  const userLinks = [
    { path: "/user/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { path: "/user/history", icon: History, label: "Lịch sử" },
    { path: "/user/alerts", icon: Bell, label: "Cảnh báo" },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
      <div className="border-b border-slate-200 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
            <Monitor className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">SmartClass</h1>
            <p className="text-xs text-slate-500">Hệ thống lớp học thông minh</p>
          </div>
        </div>
      </div>

      {user && (
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-base font-semibold text-white">
                {(user.fullName || user.username).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user.fullName || user.username}
                </p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
                <span
                  className={clsx(
                    "mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium",
                    user.role === "admin"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-sky-100 text-sky-700",
                  )}
                >
                  {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-4 py-5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )
              }
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut className="h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
