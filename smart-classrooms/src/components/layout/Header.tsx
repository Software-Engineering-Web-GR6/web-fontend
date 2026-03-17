import React from "react";
import { useAlerts } from "../../hooks";
import { useAuthStore } from "../../store/authStore";
import { Bell, User } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { unreadCount } = useAlerts();
  const { user } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {/* Alerts Button */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                user?.role === "admin" ? "bg-purple-100" : "bg-blue-100"
              }`}
            >
              <User
                className={`w-5 h-5 ${
                  user?.role === "admin" ? "text-purple-600" : "text-blue-600"
                }`}
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.fullName || user?.username || "Guest"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role === "admin" ? "Quản trị viên" : "Người dùng"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
