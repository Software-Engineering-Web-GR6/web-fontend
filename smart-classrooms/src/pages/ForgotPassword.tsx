import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { authApi } from "../services/authApi";
import { useFormValidation } from "../hooks/useFormValidation";
import { PasswordStrengthMeter } from "../components/ui/PasswordStrengthMeter";
import { Spinner } from "../components/ui/Spinner";

type Step = "email" | "code" | "reset" | "done";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { errors, validate, getPasswordStrength, clearAllErrors } = useFormValidation();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordStrength = newPassword ? getPasswordStrength(newPassword) : null;

  const resetNotice = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSendCode = async (event: React.FormEvent) => {
    event.preventDefault();
    resetNotice();

    const validEmail = validate("email", email, { required: true, email: true });
    if (!validEmail) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.forgotPassword({ email });
      setSuccessMessage(
        response.message || "Nếu email tồn tại, mã xác nhận đã được gửi đến hộp thư của bạn.",
      );
      setStep("code");
      clearAllErrors();
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Không thể gửi mã xác nhận. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    resetNotice();

    const validCode = validate("code", code, {
      required: true,
      minLength: 4,
      maxLength: 12,
    });
    if (!validCode) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.verifyResetCode({ email, code: code.trim() });
      setSuccessMessage(response.message || "Mã xác nhận hợp lệ. Hãy đặt mật khẩu mới.");
      setStep("reset");
      clearAllErrors();
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Không xác minh được mã. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    resetNotice();

    const validNewPassword = validate("newPassword", newPassword, {
      required: true,
      minLength: 6,
    });
    const validConfirmPassword = validate("confirmPassword", confirmPassword, {
      required: true,
      custom: (value) => (value === newPassword ? null : "Mật khẩu xác nhận không trùng khớp"),
    });

    if (!validNewPassword || !validConfirmPassword) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.resetPassword({
        email,
        code: code.trim(),
        new_password: newPassword,
      });
      setSuccessMessage(response.message || "Đặt lại mật khẩu thành công.");
      setStep("done");
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Không đặt lại được mật khẩu. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#ecfeff_38%,#f8fafc_100%)] px-4 py-10">
      <motion.div
        className="w-full max-w-xl rounded-3xl border border-cyan-100 bg-white p-7 shadow-xl shadow-cyan-100/60 sm:p-9"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại đăng nhập
        </button>

        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Khôi phục tài khoản
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Quên mật khẩu</h1>
          <p className="mt-2 text-sm text-slate-600">
            Nhập email để nhận mã OTP, xác minh mã và đặt lại mật khẩu mới.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2 text-xs font-medium">
          <div
            className={`rounded-xl px-3 py-2 text-center ${
              step === "email" ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            1. Email
          </div>
          <div
            className={`rounded-xl px-3 py-2 text-center ${
              step === "code" ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            2. OTP
          </div>
          <div
            className={`rounded-xl px-3 py-2 text-center ${
              step === "reset" || step === "done" ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            3. Mật khẩu mới
          </div>
        </div>

        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.div
              key="error"
              className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {successMessage && (
            <motion.div
              key="success"
              className="mb-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {step === "email" && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className={`w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:ring-4 ${
                    errors.email
                      ? "border-rose-300 focus:border-rose-300 focus:ring-rose-100"
                      : "border-slate-200 focus:border-cyan-400 focus:ring-cyan-100"
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Đang gửi mã...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Gửi mã xác nhận
                </>
              )}
            </button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Mã OTP</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Nhập mã xác nhận"
                  className={`w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:ring-4 ${
                    errors.code
                      ? "border-rose-300 focus:border-rose-300 focus:ring-rose-100"
                      : "border-slate-200 focus:border-cyan-400 focus:ring-cyan-100"
                  }`}
                />
              </div>
              {errors.code && <p className="mt-1 text-xs text-rose-600">{errors.code}</p>}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  resetNotice();
                }}
                className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Đổi email
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                    Đang xác minh...
                  </>
                ) : (
                  "Xác minh mã"
                )}
              </button>
            </div>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Mật khẩu mới</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className={`w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:ring-4 ${
                    errors.newPassword
                      ? "border-rose-300 focus:border-rose-300 focus:ring-rose-100"
                      : "border-slate-200 focus:border-cyan-400 focus:ring-cyan-100"
                  }`}
                />
              </div>
              {errors.newPassword && <p className="mt-1 text-xs text-rose-600">{errors.newPassword}</p>}
              {passwordStrength && !errors.newPassword && (
                <PasswordStrengthMeter
                  password={newPassword}
                  strength={passwordStrength.strength}
                  score={passwordStrength.score}
                  feedback={passwordStrength.feedback}
                />
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className={`w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-4 ${
                  errors.confirmPassword
                    ? "border-rose-300 focus:border-rose-300 focus:ring-rose-100"
                    : "border-slate-200 focus:border-cyan-400 focus:ring-cyan-100"
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Đang cập nhật...
                </>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </button>
          </form>
        )}

        {step === "done" && (
          <motion.div
            className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3 text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <h2 className="text-base font-semibold">Đặt lại mật khẩu thành công</h2>
                <p className="mt-1 text-sm">Bạn có thể đăng nhập lại bằng mật khẩu mới ngay bây giờ.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Quay lại đăng nhập
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
