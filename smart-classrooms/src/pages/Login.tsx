import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Cpu,
  Eye,
  EyeOff,
  Gauge,
  Leaf,
  Lock,
  Monitor,
  ShieldCheck,
  User,
  Building2,
  Zap,
  TrendingUp,
  Star,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useFormValidation } from "../hooks/useFormValidation";
import { Spinner } from "../components/ui/Spinner";
import { PasswordStrengthMeter } from "../components/ui/PasswordStrengthMeter";

const highlights = [
  {
    title: "Giám sát tức thời",
    description:
      "Theo dõi nhiệt độ, độ ẩm và CO2 theo thời gian thực cho từng phòng học.",
    icon: Gauge,
    color: "from-cyan-500 to-sky-500",
  },
  {
    title: "Tự động hóa thiết bị",
    description:
      "Điều khiển đèn, quạt, điều hòa theo lịch học và ngưỡng cảm biến.",
    icon: Cpu,
    color: "from-teal-500 to-emerald-500",
  },
  {
    title: "Vận hành bền vững",
    description:
      "Giảm lãng phí năng lượng và nâng cao trải nghiệm lớp học thông minh.",
    icon: Leaf,
    color: "from-amber-500 to-orange-500",
  },
];

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
      // Handled in the auth store.
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
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(140deg,#ecf7f3_0%,#f8fbfa_45%,#edf6f2_100%)]">
      <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-teal-200/60 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-amber-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-200/45 blur-3xl" />

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
        <motion.section
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="hidden px-10 py-12 lg:flex lg:flex-col lg:justify-between xl:px-16"
        >
          <div>
            {/* Enhanced Badge */}
            <motion.div
              className="group relative inline-flex"
              whileHover={{ scale: 1.05 }}
            >
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 opacity-20 blur-md transition-opacity group-hover:opacity-40" />
              <div className="relative flex items-center gap-2 rounded-full border-2 border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 px-5 py-2.5 text-sm font-bold text-teal-800 shadow-lg">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <ShieldCheck className="h-5 w-5 text-teal-600" />
                </motion.div>
                Smart Classroom Platform
                <span className="ml-1 rounded-full bg-teal-600 px-2 py-0.5 text-xs font-semibold text-white">
                  v2.0
                </span>
              </div>
            </motion.div>

            {/* Gradient Heading */}
            <h1 className="mt-6 max-w-xl bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 bg-clip-text text-5xl font-black leading-tight text-transparent xl:text-6xl">
              Trung tâm điều hành{" "}
              <span className="text-slate-900">lớp học thông minh</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
              Kết nối cảm biến, thiết bị và lịch vận hành trong một giao diện
              trực quan, ổn định và dễ sử dụng.
            </p>

            {/* Compact Stats Row */}
            <div className="mt-6 flex items-center gap-6">
              {[
                {
                  number: "24/7",
                  label: "Giám sát",
                  icon: Gauge,
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  number: "Real-time",
                  label: "Dữ liệu",
                  icon: Zap,
                  color: "from-amber-500 to-orange-500",
                },
                {
                  number: "100%",
                  label: "An toàn",
                  icon: ShieldCheck,
                  color: "from-emerald-500 to-teal-500",
                },
              ].map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xl font-black text-slate-900">
                        {stat.number}
                      </div>
                      <div className="text-xs text-slate-600">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature Badge */}
            <motion.div
              className="mt-5 flex items-center gap-3 rounded-xl border border-teal-100 bg-white/70 p-3.5 shadow-lg backdrop-blur"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-white">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">
                  Hệ thống quản lý thông minh
                </p>
                <p className="text-xs text-slate-600">
                  Điều khiển{" "}
                  <span className="font-bold text-teal-700">
                    cảm biến & thiết bị
                  </span>{" "}
                  tự động
                </p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group rounded-3xl border-2 border-white/90 bg-white/80 p-5 shadow-xl backdrop-blur transition-all hover:border-teal-200 hover:shadow-2xl"
                >
                  <div className="relative mb-4 inline-flex">
                    <motion.div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-30 blur-xl`}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.5,
                      }}
                    />
                    <div
                      className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-teal-700">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Hoạt động
                    </div>
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <section className="relative flex items-center justify-center px-4 py-8 sm:px-8 sm:py-12">
          <motion.div
            className="w-full max-w-xl rounded-[30px] border border-white/80 bg-white/80 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-9"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
                  Đăng nhập hệ thống
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  Chào mừng quay lại
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Sử dụng tài khoản của bạn để truy cập bảng điều khiển Smart
                  Classroom.
                </p>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-600 to-cyan-500 text-white shadow-lg shadow-teal-700/20">
                <Monitor className="h-7 w-7" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {loginSuccess && (
                <motion.div
                  key="success"
                  className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
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
                  <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    onBlur={() => handleBlur("username")}
                    placeholder="admin@example.com"
                    className={`w-full rounded-2xl border bg-white px-12 py-3.5 text-slate-900 outline-none transition focus:ring-4 ${
                      errors.username
                        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                        : "border-teal-100 focus:border-teal-400 focus:ring-teal-100"
                    }`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1.5 text-xs text-rose-600">
                    {errors.username}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    placeholder="Nhập mật khẩu"
                    className={`w-full rounded-2xl border bg-white px-12 py-3.5 text-slate-900 outline-none transition focus:ring-4 ${
                      errors.password
                        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                        : "border-teal-100 focus:border-teal-400 focus:ring-teal-100"
                    }`}
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

                {errors.password && (
                  <p className="mt-1.5 text-xs text-rose-600">
                    {errors.password}
                  </p>
                )}

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
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-500 px-4 py-3.5 font-semibold text-white shadow-lg shadow-cyan-700/20 transition hover:from-teal-700 hover:to-cyan-600 focus:ring-4 focus:ring-teal-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </button>

              <p className="text-center text-sm text-slate-600">
                Quên mật khẩu?{" "}
                <Link
                  to="/forgot-password"
                  className="font-semibold text-teal-700 transition hover:text-teal-800"
                >
                  Lấy lại tài khoản
                </Link>
              </p>
            </form>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Login;
