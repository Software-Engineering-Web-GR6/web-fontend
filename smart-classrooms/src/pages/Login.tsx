import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Monitor,
  ShieldCheck,
  Sparkles,
  User,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useFormValidation } from "../hooks/useFormValidation";
import { Spinner } from "../components/ui/Spinner";
import { PasswordStrengthMeter } from "../components/ui/PasswordStrengthMeter";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { errors, validate, getPasswordStrength } = useFormValidation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });
  const [loginSuccess, setLoginSuccess] = useState(false);

  const passwordStrength = password ? getPasswordStrength(password) : null;

  const navigateByRole = (role: string | null) => {
    navigate(role === "admin" ? "/admin/dashboard" : "/user/dashboard");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();

    // Validate
    const isUsernameValid = validate("username", username, { required: true, email: true });
    const isPasswordValid = validate("password", password, { required: true, minLength: 6 });

    if (!isUsernameValid || !isPasswordValid) {
      return;
    }

    try {
      await login({ username, password });
      setLoginSuccess(true);
      setTimeout(() => {
        navigateByRole(localStorage.getItem("role"));
      }, 500);
    } catch {
      // handled in store
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (touched.username) {
      validate("username", value, { required: true, email: true });
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      validate("password", value, { required: true, minLength: 6 });
    }
  };

  const handleBlur = (field: "username" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "username") {
      validate("username", username, { required: true, email: true });
    } else {
      validate("password", password, { required: true, minLength: 6 });
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
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-sky-200/45 blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl"
          animate={{ 
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-100/50 blur-3xl"
          animate={{ 
            x: [0, 40, 0],
            y: [0, -40, 0],
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 grid min-h-screen w-full grid-cols-1 xl:grid-cols-[1.05fr_0.95fr]">
        <motion.div 
          className="hidden xl:flex flex-col justify-between px-14 py-12"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <motion.div 
              className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/70 px-4 py-2 shadow-sm backdrop-blur"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
                <Monitor className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">SmartClass</p>
                <p className="text-xs text-slate-500">
                  He thong quan ly lop hoc thong minh
                </p>
              </div>
            </motion.div>

            <div className="max-w-xl">
              <motion.p 
                className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Sparkles className="h-4 w-4" />
                Giao dien dieu hanh tap trung cho phong hoc thong minh
              </motion.p>
              <motion.h1 
                className="text-5xl font-bold leading-tight text-slate-900"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Quan ly toa nha, phong hoc va thiet bi theo thoi gian thuc.
              </motion.h1>
              <motion.p 
                className="mt-5 max-w-lg text-lg leading-8 text-slate-600"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Dang nhap de theo doi du lieu cam bien, cau hinh tu dong hoa va
                van hanh phong hoc theo thoi khoa bieu tren cung mot he thong
                thong nhat.
              </motion.p>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SmartClass</h1>
            <p className="text-gray-500 mt-1">
              Hệ thống quản lý phòng học thông minh
            </p>
          </div>
        </motion.div>

        <div className="relative z-10 flex items-center justify-center px-4 py-10 sm:px-8">
          <motion.div 
            className="w-full max-w-lg rounded-[32px] border border-white/75 bg-white/85 p-8 shadow-2xl shadow-slate-200/70 backdrop-blur"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm font-medium text-indigo-600">
                  Dang nhap he thong
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  Chao mung tro lai
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Nhap thong tin tai khoan de tiep tuc vao bang dieu khien.
                </p>
              </motion.div>
              <motion.div 
                className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-600 shadow-lg shadow-indigo-600/20"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <Monitor className="h-7 w-7 text-white" />
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
              {loginSuccess && (
                <motion.div 
                  className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">Đăng nhập thành công!</span>
                </motion.div>
              )}
            </AnimatePresence>

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
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    onBlur={() => handleBlur("username")}
                    placeholder="admin@example.com"
                    className={`w-full rounded-2xl border ${
                      errors.username
                        ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100"
                        : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
                    } bg-white px-12 py-3.5 text-slate-900 outline-none transition focus:ring-4`}
                  />
                </div>
                <AnimatePresence>
                  {errors.username && (
                    <motion.p
                      className="mt-1.5 text-xs text-rose-600"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {errors.username}
                    </motion.p>
                  )}
                </AnimatePresence>
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
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    placeholder="Nhap mat khau"
                    className={`w-full rounded-2xl border ${
                      errors.password
                        ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100"
                        : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
                    } bg-white px-12 py-3.5 text-slate-900 outline-none transition focus:ring-4`}
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
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      className="mt-1.5 text-xs text-rose-600"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
                {passwordStrength && !errors.password && (
                  <PasswordStrengthMeter
                    password={password}
                    strength={passwordStrength.strength}
                    score={passwordStrength.score}
                    feedback={passwordStrength.feedback}
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3.5 font-semibold text-white transition hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                    <span>Dang dang nhap...</span>
                  </>
                ) : (
                  "Dang nhap"
                )}
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

            <motion.button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3.5 font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div 
                className="h-2.5 w-2.5 rounded-full bg-indigo-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Dang nhap nhanh bang tai khoan admin demo
            </motion.button>

            <motion.div 
              className="mt-7 rounded-3xl border border-slate-200 bg-slate-50 p-5"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Tai khoan demo
              </p>
              <div className="space-y-1 text-sm text-slate-500">
                <p>Email: admin@example.com</p>
                <p>Mat khau: admin123</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
