import React, { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock, Mail, Monitor, Shield, User } from "lucide-react";
import { authApi } from "../../services";
import Button from "../../components/ui/Button";
import type { UserRole } from "../../types";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const session = authApi.getStoredSession();

  if (session) {
    return <Navigate to={authApi.getDefaultRoute(session.user.role)} replace />;
  }

  const from = location.state?.from?.pathname as string | undefined;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Vui long nhap email va mat khau.");
      return;
    }

    setLoading(true);

    try {
      const loginResponse = await authApi.login({
        email,
        password,
        role,
      });
      const fallbackPath = authApi.getDefaultRoute(loginResponse.user.role);
      navigate(from || fallbackPath, { replace: true });
    } catch (submitError) {
      setError("Dang nhap that bai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-100">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-10">
        <div className="w-full rounded-[32px] bg-slate-900 p-8 text-white shadow-2xl shadow-slate-300/40 sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500">
              <Monitor className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
                Smart Classroom
              </p>
              <h1 className="text-3xl font-semibold">Login</h1>
            </div>
          </div>

          <form
            className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.9fr]"
            onSubmit={handleSubmit}
          >
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@school.edu"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Mat khau
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Nhap mat khau"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full justify-center bg-indigo-500 hover:bg-indigo-400 focus:ring-indigo-300"
                loading={loading}
              >
                Dang nhap voi vai tro {role}
              </Button>
            </div>

            <div>
              <p className="mb-3 block text-sm font-medium text-slate-200">
                Vai tro
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`rounded-3xl border p-5 text-left transition-colors ${
                    role === "admin"
                      ? "border-indigo-400 bg-indigo-500/15"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <Shield className="mb-4 h-6 w-6 text-indigo-300" />
                  <p className="font-medium text-white">Admin</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Vao dashboard, thiet bi, nguoi dung va cai dat.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`rounded-3xl border p-5 text-left transition-colors ${
                    role === "user"
                      ? "border-emerald-400 bg-emerald-500/15"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <User className="mb-4 h-6 w-6 text-emerald-300" />
                  <p className="font-medium text-white">User</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Xem dashboard, lich su va canh bao.
                  </p>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
