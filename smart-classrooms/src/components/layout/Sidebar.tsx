import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  Bell,
  Building2,
  CalendarDays,
  Fan,
  History,
  LayoutDashboard,
  LogOut,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

interface SidebarProps {
  isAdmin?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isAdmin = true,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [expanded, setExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return true;
    }

    const stored = window.localStorage.getItem("smartclass.sidebar.expanded");
    if (stored === null) {
      return true;
    }
    return stored === "true";
  });

  useEffect(() => {
    window.localStorage.setItem("smartclass.sidebar.expanded", String(expanded));
  }, [expanded]);

  const adminLinks = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { path: "/admin/alerts", icon: Bell, label: "Cảnh báo" },
    { path: "/admin/rooms", icon: Building2, label: "Phòng học" },
    { path: "/admin/devices", icon: Fan, label: "Thiết bị" },
    { path: "/admin/users", icon: Users, label: "Người dùng" },
    { path: "/admin/settings", icon: Settings, label: "Cài đặt" },
  ];

  const userLinks = [
    { path: "/user/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { path: "/user/schedule", icon: CalendarDays, label: "Thời khóa biểu" },
    { path: "/user/history", icon: History, label: "Lịch sử" },
    { path: "/user/alerts", icon: Bell, label: "Cảnh báo" },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
    onCloseMobile?.();
  };

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col border-r border-teal-100 bg-[linear-gradient(180deg,#f7fcfa_0%,#f9fdfc_40%,#eff7f4_100%)] shadow-2xl shadow-teal-900/10 transition-all duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        expanded ? "lg:w-72" : "lg:w-24",
        "lg:static lg:z-20 lg:translate-x-0 lg:shadow-none",
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={clsx(
          "hidden border-b border-teal-100 px-4 py-6 text-left transition hover:bg-teal-50/60 lg:block",
          expanded ? "w-full" : "flex justify-center",
        )}
      >
        <div className={clsx("flex items-center", expanded ? "gap-3" : "flex-col gap-3")}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 shadow-lg shadow-teal-700/20">
            <Monitor className="h-6 w-6 text-white" />
          </div>

          {expanded ? (
            <>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-slate-900">SmartClass</h1>
                <p className="text-xs text-slate-500">Smart Classroom Center</p>
              </div>
              <PanelLeftClose className="h-5 w-5 flex-shrink-0 text-slate-400" />
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <PanelLeftOpen className="h-5 w-5 text-slate-400" />
              <span className="text-[11px] font-semibold text-slate-600">Menu</span>
            </div>
          )}
        </div>
      </button>

      <div className="border-b border-teal-100 px-5 py-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 shadow-lg shadow-teal-700/20">
            <Monitor className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-slate-900">SmartClass</h1>
            <p className="text-xs text-slate-500">Smart Classroom Center</p>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-xl border border-teal-200 bg-white px-3 py-1.5 text-xs font-medium text-teal-700"
          >
            Đóng
          </button>
        </div>
      </div>

      {(expanded || mobileOpen) && user && (
        <div className="border-b border-teal-100 px-5 py-5">
          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-500 text-base font-semibold text-white">
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
                    user.role === "admin" ? "bg-teal-100 text-teal-700" : "bg-sky-100 text-sky-700",
                  )}
                >
                  {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className={clsx("flex-1 px-4 py-5", expanded || mobileOpen ? "space-y-1" : "space-y-3")}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => onCloseMobile?.()}
              title={expanded || mobileOpen ? undefined : link.label}
              className={({ isActive }) =>
                clsx(
                  "rounded-2xl text-sm font-medium transition",
                  isActive
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-700/20"
                    : "text-slate-600 hover:bg-teal-50 hover:text-slate-900",
                  expanded || mobileOpen
                    ? "flex items-center gap-3 px-4 py-3"
                    : "flex h-12 items-center justify-center px-0 py-0",
                )
              }
            >
              <Icon className="h-5 w-5" />
              {expanded && link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-teal-100 p-4">
        <button
          onClick={handleLogout}
          title={expanded || mobileOpen ? undefined : "Đăng xuất"}
          className={clsx(
            "w-full rounded-2xl text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600",
            expanded || mobileOpen ? "flex items-center gap-3 px-4 py-3" : "flex h-12 items-center justify-center px-0 py-0",
          )}
        >
          <LogOut className="h-5 w-5" />
          {(expanded || mobileOpen) && "Đăng xuất"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
