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
  BarChart3,
  Thermometer,
  Lightbulb,
  Radio,
  BellRing,
  Zap,
  History,
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
    const isUsernameValid = validate("username", username, {
      required: true,
      email: true,
    });
    const isPasswordValid = validate("password", password, {
      required: true,
      minLength: 6,
    });

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
            ease: "easeInOut",
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
            ease: "easeInOut",
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
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Floating decorative icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Monitor - Top left */}
        <motion.div
          className="absolute left-[8%] top-[15%] text-indigo-200/25 hidden xl:block"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Monitor className="h-14 w-14" />
        </motion.div>

        {/* BarChart - Top right */}
        <motion.div
          className="absolute right-[15%] top-[25%] text-sky-200/30 hidden xl:block"
          animate={{
            y: [0, -12, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <BarChart3 className="h-16 w-16" />
        </motion.div>

        {/* Thermometer - Middle left */}
        <motion.div
          className="absolute left-[5%] top-[45%] text-emerald-200/25 hidden xl:block"
          animate={{
            y: [0, -10, 0],
            x: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <Thermometer className="h-12 w-12" />
        </motion.div>

        {/* Lightbulb - Bottom right */}
        <motion.div
          className="absolute right-[8%] bottom-[20%] text-amber-200/30 hidden xl:block"
          animate={{
            y: [0, -18, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        >
          <Lightbulb className="h-14 w-14" />
        </motion.div>

        {/* Radio/IoT - Middle right */}
        <motion.div
          className="absolute right-[25%] top-[50%] text-indigo-200/20 hidden xl:block"
          animate={{
            y: [0, -8, 0],
            rotate: [0, -8, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        >
          <Radio className="h-12 w-12" />
        </motion.div>

        {/* BellRing - Bottom left */}
        <motion.div
          className="absolute left-[15%] bottom-[15%] text-rose-200/25 hidden xl:block"
          animate={{
            y: [0, -12, 0],
            rotate: [0, 15, 0],
          }}
          transition={{
            duration: 4.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8,
          }}
        >
          <BellRing className="h-13 w-13" />
        </motion.div>
      </div>

      <div className="relative z-10 grid min-h-screen w-full grid-cols-1 xl:grid-cols-[1.5fr_1fr]">
        <motion.div
          className="hidden xl:flex flex-col justify-center px-12 py-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-2xl">
            {/* Badge */}

            {/* Headline */}
            <motion.h1
              className="text-4xl font-bold leading-tight text-slate-900 mb-3"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Hệ thống quản lý phòng học thông minh
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-base text-slate-600 mb-6"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Giám sát và điều khiển phòng học tự động và hiện cảnh báo
            </motion.p>

            {/* Illustration - Compact */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="relative w-full max-w-sm">
                {/* SVG Illustration - Smart Classroom Dashboard */}
                <svg
                  viewBox="0 0 500 400"
                  className="w-full h-auto drop-shadow-lg"
                >
                  {/* Background card */}
                  <rect
                    x="50"
                    y="50"
                    width="400"
                    height="300"
                    rx="24"
                    fill="url(#grad1)"
                    opacity="0.9"
                  />
                  <defs>
                    <linearGradient
                      id="grad1"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        style={{ stopColor: "#6366f1", stopOpacity: 0.2 }}
                      />
                      <stop
                        offset="100%"
                        style={{ stopColor: "#8b5cf6", stopOpacity: 0.3 }}
                      />
                    </linearGradient>
                    <linearGradient
                      id="grad2"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        style={{ stopColor: "#6366f1", stopOpacity: 1 }}
                      />
                      <stop
                        offset="100%"
                        style={{ stopColor: "#4f46e5", stopOpacity: 1 }}
                      />
                    </linearGradient>
                  </defs>

                  {/* Monitor/Screen */}
                  <rect
                    x="100"
                    y="100"
                    width="300"
                    height="200"
                    rx="12"
                    fill="white"
                    stroke="#e2e8f0"
                    strokeWidth="2"
                  />

                  {/* Dashboard elements */}
                  {/* Chart bars */}
                  <rect
                    x="120"
                    y="180"
                    width="40"
                    height="80"
                    rx="4"
                    fill="#6366f1"
                    opacity="0.7"
                  />
                  <rect
                    x="170"
                    y="160"
                    width="40"
                    height="100"
                    rx="4"
                    fill="#8b5cf6"
                    opacity="0.7"
                  />
                  <rect
                    x="220"
                    y="140"
                    width="40"
                    height="120"
                    rx="4"
                    fill="#6366f1"
                    opacity="0.7"
                  />
                  <rect
                    x="270"
                    y="170"
                    width="40"
                    height="90"
                    rx="4"
                    fill="#a78bfa"
                    opacity="0.7"
                  />
                  <rect
                    x="320"
                    y="150"
                    width="40"
                    height="110"
                    rx="4"
                    fill="#6366f1"
                    opacity="0.7"
                  />

                  {/* Info cards */}
                  <rect
                    x="120"
                    y="120"
                    width="80"
                    height="40"
                    rx="6"
                    fill="#f0f9ff"
                    stroke="#bfdbfe"
                    strokeWidth="1"
                  />
                  <rect
                    x="210"
                    y="120"
                    width="80"
                    height="40"
                    rx="6"
                    fill="#fef3c7"
                    stroke="#fde68a"
                    strokeWidth="1"
                  />
                  <rect
                    x="300"
                    y="120"
                    width="80"
                    height="40"
                    rx="6"
                    fill="#dcfce7"
                    stroke="#bbf7d0"
                    strokeWidth="1"
                  />

                  {/* Temperature icon */}
                  <circle cx="150" cy="135" r="8" fill="#3b82f6" />
                  <rect
                    x="148"
                    y="138"
                    width="4"
                    height="10"
                    fill="#3b82f6"
                    rx="2"
                  />

                  {/* Light bulb icon */}
                  <circle cx="250" cy="135" r="8" fill="#f59e0b" />
                  <path
                    d="M 245 140 L 255 140"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />

                  {/* Bell icon */}
                  <path
                    d="M 340 128 Q 340 125 343 125 Q 346 125 346 128 L 346 138 Q 346 142 343 142 Q 340 142 340 138 Z"
                    fill="#10b981"
                  />

                  {/* Floating data points */}
                  <motion.circle
                    cx="420"
                    cy="80"
                    r="6"
                    fill="#6366f1"
                    opacity="0.6"
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.circle
                    cx="80"
                    cy="200"
                    r="5"
                    fill="#8b5cf6"
                    opacity="0.6"
                    animate={{ y: [0, 10, 0] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  />
                  <motion.circle
                    cx="440"
                    cy="280"
                    r="7"
                    fill="#10b981"
                    opacity="0.6"
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                  />

                  {/* Stand */}
                  <rect
                    x="230"
                    y="310"
                    width="40"
                    height="8"
                    rx="4"
                    fill="url(#grad2)"
                  />
                  <rect
                    x="200"
                    y="318"
                    width="100"
                    height="12"
                    rx="6"
                    fill="#cbd5e1"
                  />
                </svg>
              </div>
            </motion.div>

            {/* Features - Horizontal Grid */}
            <motion.div
              className="grid grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {/* Feature 1 */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                <div className="flex h-12 w-12 mx-auto mb-2 items-center justify-center rounded-xl bg-sky-100">
                  <Thermometer className="h-6 w-6 text-sky-600" />
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  Giám sát cảm biến
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Theo dõi nhiệt độ, ánh sáng thời gian thực
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex h-12 w-12 mx-auto mb-2 items-center justify-center rounded-xl bg-amber-100">
                  <Zap className="h-6 w-6 text-amber-600" />
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  Điều khiển tự động
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bật tắt thiết bị thông minh theo lịch
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
              >
                <div className="flex h-12 w-12 mx-auto mb-2 items-center justify-center rounded-xl bg-emerald-100">
                  <History className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  Lịch sử sử dụng
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Báo cáo hoạt động và tiêu thụ năng lượng
                </p>
              </motion.div>
            </motion.div>
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
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
