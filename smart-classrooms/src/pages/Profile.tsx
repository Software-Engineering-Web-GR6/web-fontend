import React, { useMemo, useState } from "react";
import { CheckCircle2, KeyRound, Mail, Shield, UserRound } from "lucide-react";
import Layout from "../components/layout/Layout";
import Card, { CardHeader, CardTitle } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { authApi } from "../services";
import { useAuthStore } from "../store";

interface ProfilePageProps {
  isAdmin: boolean;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ isAdmin }) => {
  const { user, setUser } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const initials = useMemo(
    () =>
      (user?.fullName || user?.username || "U")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join(""),
    [user?.fullName, user?.username],
  );

  const handleRefreshProfile = async () => {
    try {
      const latestUser = await authApi.getMe();
      setUser(latestUser);
    } catch (err) {
      console.error("Failed to refresh profile", err);
    }
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin mật khẩu.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      await authApi.changeMyPassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Đổi mật khẩu thành công.");
      await handleRefreshProfile();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Không thể đổi mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title="Tài khoản"
      subtitle="Xem thông tin đăng nhập và cập nhật mật khẩu của bạn"
      isAdmin={isAdmin}
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>

          <div className="rounded-3xl bg-slate-50 p-5">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-3xl text-2xl font-bold text-white ${
                  isAdmin ? "bg-indigo-600" : "bg-sky-600"
                }`}
              >
                {initials}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{user?.fullName || user?.username}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {isAdmin ? "Quản trị viên hệ thống" : "Người dùng được phân quyền"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
              <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tên hiển thị</p>
                <p className="font-semibold text-slate-900">{user?.fullName || user?.username}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
              <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Email đăng nhập</p>
                <p className="font-semibold text-slate-900">{user?.email || "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
              <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Vai trò</p>
                <p className="font-semibold text-slate-900">{isAdmin ? "Quản trị viên" : "Người dùng"}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Đổi mật khẩu</CardTitle>
          </CardHeader>

          <form className="space-y-4" onSubmit={handleChangePassword}>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Dùng mật khẩu hiện tại để xác nhận trước khi cập nhật mật khẩu mới.
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </div>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Mật khẩu hiện tại</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                placeholder="Nhập mật khẩu hiện tại"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Mật khẩu mới</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                placeholder="Tối thiểu 6 ký tự"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                placeholder="Nhập lại mật khẩu mới"
              />
            </label>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Cập nhật bảo mật</p>
                  <p className="text-sm text-slate-500">Mật khẩu mới sẽ có hiệu lực ngay sau khi lưu.</p>
                </div>
              </div>
              <Button type="submit" loading={loading}>
                Lưu mật khẩu
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfilePage;
