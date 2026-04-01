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
                response.message || "Neu email ton tai, ma xac nhan da duoc gui den hop thu cua ban.",
            );
            setStep("code");
            clearAllErrors();
        } catch (error: any) {
            setErrorMessage(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Khong the gui ma xac nhan. Vui long thu lai.",
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
            setSuccessMessage(response.message || "Ma xac nhan hop le. Hay dat mat khau moi.");
            setStep("reset");
            clearAllErrors();
        } catch (error: any) {
            setErrorMessage(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Khong xac minh duoc ma. Vui long thu lai.",
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
            custom: (value) => (value === newPassword ? null : "Mat khau xac nhan khong trung khop"),
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
            setSuccessMessage(response.message || "Dat lai mat khau thanh cong.");
            setStep("done");
        } catch (error: any) {
            setErrorMessage(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Khong dat lai duoc mat khau. Vui long thu lai.",
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
                    Quay lai dang nhap
                </button>

                <div className="mb-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Khoi phuc tai khoan</p>
                    <h1 className="mt-2 text-2xl font-bold text-slate-900">Quen mat khau</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Nhap email de nhan ma OTP, xac minh ma va dat lai mat khau moi.
                    </p>
                </div>

                <div className="mb-6 grid grid-cols-3 gap-2 text-xs font-medium">
                    <div
                        className={`rounded-xl px-3 py-2 text-center ${step === "email" ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-500"
                            }`}
                    >
                        1. Email
                    </div>
                    <div
                        className={`rounded-xl px-3 py-2 text-center ${step === "code" ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-500"
                            }`}
                    >
                        2. OTP
                    </div>
                    <div
                        className={`rounded-xl px-3 py-2 text-center ${step === "reset" || step === "done"
                            ? "bg-cyan-600 text-white"
                            : "bg-slate-100 text-slate-500"
                            }`}
                    >
                        3. Mat khau moi
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
                                    className={`w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:ring-4 ${errors.email
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
                                    Dang gui ma...
                                </>
                            ) : (
                                <>
                                    <Mail className="h-4 w-4" />
                                    Gui ma xac nhan
                                </>
                            )}
                        </button>
                    </form>
                )}

                {step === "code" && (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Ma OTP</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(event) => setCode(event.target.value)}
                                    placeholder="Nhap ma xac nhan"
                                    className={`w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:ring-4 ${errors.code
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
                                Doi email
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner size="sm" className="text-white" />
                                        Dang xac minh...
                                    </>
                                ) : (
                                    "Xac minh ma"
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {step === "reset" && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Mat khau moi</label>
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    placeholder="Nhap mat khau moi"
                                    className={`w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:ring-4 ${errors.newPassword
                                        ? "border-rose-300 focus:border-rose-300 focus:ring-rose-100"
                                        : "border-slate-200 focus:border-cyan-400 focus:ring-cyan-100"
                                        }`}
                                />
                            </div>
                            {errors.newPassword && (
                                <p className="mt-1 text-xs text-rose-600">{errors.newPassword}</p>
                            )}
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
                                Xac nhan mat khau moi
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Nhap lai mat khau moi"
                                className={`w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-4 ${errors.confirmPassword
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
                                    Dang cap nhat...
                                </>
                            ) : (
                                "Dat lai mat khau"
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
                                <h2 className="text-base font-semibold">Dat lai mat khau thanh cong</h2>
                                <p className="mt-1 text-sm">Ban co the dang nhap lai bang mat khau moi ngay bay gio.</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Quay lai dang nhap
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;