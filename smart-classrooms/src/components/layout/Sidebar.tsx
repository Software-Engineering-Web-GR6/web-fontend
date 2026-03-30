import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  Bell,
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
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin = true }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [expanded, setExpanded] = useState(false);

  const adminLinks = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Tong quan" },
    { path: "/admin/alerts", icon: Bell, label: "Canh bao" },
    { path: "/admin/devices", icon: Fan, label: "Thiet bi" },
    { path: "/admin/users", icon: Users, label: "Nguoi dung" },
    { path: "/admin/settings", icon: Settings, label: "Cai dat" },
  ];

  const userLinks = [
    { path: "/user/dashboard", icon: LayoutDashboard, label: "Tong quan" },
    { path: "/user/history", icon: History, label: "Lich su" },
    { path: "/user/alerts", icon: Bell, label: "Canh bao" },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={clsx(
        "flex h-full flex-col border-r border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] transition-all duration-300",
        expanded ? "w-72" : "w-24",
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={clsx(
          "border-b border-slate-200 px-4 py-6 text-left transition hover:bg-slate-50",
          expanded ? "w-full" : "flex justify-center",
        )}
      >
        <div className={clsx("flex items-center", expanded ? "gap-3" : "flex-col gap-3")}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
            <Monitor className="h-6 w-6 text-white" />
          </div>

          {expanded ? (
            <>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-slate-900">SmartClass</h1>
                <p className="text-xs text-slate-500">He thong lop hoc thong minh</p>
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

      {expanded && user && (
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
                  {user.role === "admin" ? "Quan tri vien" : "Nguoi dung"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className={clsx("flex-1 px-4 py-5", expanded ? "space-y-1" : "space-y-3")}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              title={expanded ? undefined : link.label}
              className={({ isActive }) =>
                clsx(
                  "rounded-2xl text-sm font-medium transition",
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  expanded
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

      <div className="border-t border-slate-200 p-4">
        <button
          onClick={handleLogout}
          title={expanded ? undefined : "Dang xuat"}
          className={clsx(
            "w-full rounded-2xl text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600",
            expanded
              ? "flex items-center gap-3 px-4 py-3"
              : "flex h-12 items-center justify-center px-0 py-0",
          )}
        >
          <LogOut className="h-5 w-5" />
          {expanded && "Dang xuat"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
