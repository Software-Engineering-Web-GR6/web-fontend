import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Monitor,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigateByRole = (role: string | null) => {
    navigate(role === "admin" ? "/admin/dashboard" : "/user/dashboard");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();

    try {
      await login({ username, password });
      navigateByRole(localStorage.getItem("role"));
    } catch {
      // handled in store
    }
  };

  const handleDemoLogin = async () => {
    clearError();
    try {
      await login({ username: "admin@example.com", password: "admin123" });
      navigate("/admin/dashboard");
    } catch {
      // handled in store
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[linear-gradient(135deg,#e0f2fe_0%,#eef2ff_45%,#f8fafc_100%)]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-sky-200/45 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-100/50 blur-3xl" />
      </div>

      <div className="relative z-10 grid min-h-screen w-full grid-cols-1 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden xl:flex flex-col justify-between px-14 py-12">
          <div>
            <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/70 px-4 py-2 shadow-sm backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
                <Monitor className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">SmartClass</p>
                <p className="text-xs text-slate-500">
                  He thong quan ly lop hoc thong minh
                </p>
              </div>
            </div>

            <div className="max-w-xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
                Giao dien dieu hanh tap trung cho phong hoc thong minh
              </p>
              <h1 className="text-5xl font-bold leading-tight text-slate-900">
                Quan ly toa nha, phong hoc va thiet bi theo thoi gian thuc.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
                Dang nhap de theo doi du lieu cam bien, cau hinh tu dong hoa va
                van hanh phong hoc theo thoi khoa bieu tren cung mot he thong
                thong nhat.
              </p>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SmartClass</h1>
          <p className="text-gray-500 mt-1">
            Hệ thống quản lý phòng học thông minh
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-lg rounded-[32px] border border-white/75 bg-white/85 p-8 shadow-2xl shadow-slate-200/70 backdrop-blur">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">
                  Dang nhap he thong
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  Chao mung tro lai
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Nhap thong tin tai khoan de tiep tuc vao bang dieu khien.
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
                <Monitor className="h-7 w-7 text-white" />
              </div>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="admin@example.com"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Mat khau
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Nhap mat khau"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-indigo-600 px-4 py-3.5 font-semibold text-white transition hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Dang dang nhap..." : "Dang nhap"}
              </button>
            </form>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate-400">
                  Truy cap nhanh
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3.5 font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
            >
              <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              Dang nhap nhanh bang tai khoan admin demo
            </button>

            <div className="mt-7 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Tai khoan demo
              </p>
              <div className="space-y-1 text-sm text-slate-500">
                <p>Email: admin@example.com</p>
                <p>Mat khau: admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
