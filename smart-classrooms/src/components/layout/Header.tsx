import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ChevronRight, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAlerts } from "../../hooks";
import { useAuthStore } from "../../store/authStore";
import { formatRelativeTime } from "../../utils/formatters";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { unreadCount, markAsRead, getRecentAlerts } = useAlerts();
  const { user } = useAuthStore();

  const notifications = useMemo(() => getRecentAlerts(5), [getRecentAlerts]);
  const alertsPath = user?.role === "admin" ? "/admin/alerts" : "/user/alerts";
  const profilePath = user?.role === "admin" ? "/admin/profile" : "/user/profile";

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleOpenAlert = (alertId: string) => {
    markAsRead(alertId);
    setOpen(false);
    navigate(`${alertsPath}?alert=${alertId}`);
  };

  return (
    <header className="relative z-40 border-b border-slate-200 bg-white/85 px-6 py-5 backdrop-blur">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpen((current) => !current)}
              className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 z-30 mt-3 w-[360px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Thông báo</p>
                    <p className="text-xs text-slate-500">Cảnh báo mới nhất trong hệ thống</p>
                  </div>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate(alertsPath);
                    }}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Xem tất cả
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-slate-500">Chưa có cảnh báo nào.</div>
                ) : (
                  <div className="max-h-[420px] overflow-y-auto">
                    {notifications.map((alert) => (
                      <button
                        key={alert.id}
                        onClick={() => handleOpenAlert(alert.id)}
                        className={`flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50 ${
                          !alert.read ? "bg-indigo-50/50" : ""
                        }`}
                      >
                        <span
                          className={`mt-1 h-2.5 w-2.5 rounded-full ${
                            alert.level === "critical" ? "bg-rose-500" : "bg-amber-400"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {alert.roomId ? `Phòng ${alert.roomId}` : "Cảnh báo hệ thống"}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{alert.message}</p>
                          <p className="mt-2 text-xs text-slate-400">{formatRelativeTime(alert.timestamp)}</p>
                        </div>
                        <ChevronRight className="mt-1 h-4 w-4 text-slate-300" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate(profilePath)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-left transition hover:border-indigo-200 hover:bg-white"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                user?.role === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-sky-100 text-sky-700"
              }`}
            >
              <User className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{user?.fullName || user?.username || "Khách"}</p>
              <p className="text-xs text-slate-500">{user?.role === "admin" ? "Quản trị viên" : "Người dùng"}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
