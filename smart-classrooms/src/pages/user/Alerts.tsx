import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useAlerts } from "../../hooks";

const UserAlerts: React.FC = () => {
  const [searchParams] = useSearchParams();
  const targetAlertId = searchParams.get("alert");
  const { alerts, unreadCount, markAsRead, markAllAsRead } = useAlerts();

  const criticalCount = alerts.filter((alert) => alert.level === "critical").length;
  const warningCount = alerts.filter((alert) => alert.level === "warning").length;

  useEffect(() => {
    if (!targetAlertId) {
      return;
    }

    const target = document.getElementById(`alert-${targetAlertId}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [targetAlertId, alerts.length]);

  return (
    <Layout title="Cảnh báo" subtitle="Thông báo theo phòng đang có trong thời khóa biểu hiện tại của bạn" isAdmin={false}>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card padding="sm" className="rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Tổng cảnh báo</p>
              <p className="text-3xl font-bold text-slate-900">{alerts.length}</p>
            </div>
            <Badge variant="default">{unreadCount} mới</Badge>
          </div>
        </Card>
        <Card padding="sm" className="rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Mức cao</p>
              <p className="text-3xl font-bold text-rose-600">{criticalCount}</p>
            </div>
            <div className="h-3 w-3 rounded-full bg-rose-500" />
          </div>
        </Card>
        <Card padding="sm" className="rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Mức trung bình</p>
              <p className="text-3xl font-bold text-amber-500">{warningCount}</p>
            </div>
            <div className="h-3 w-3 rounded-full bg-amber-400" />
          </div>
        </Card>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Danh sách cảnh báo</h2>
        <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
          Đánh dấu đã đọc
        </Button>
      </div>

      <Card padding="none" className="rounded-3xl">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Không có cảnh báo nào.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                id={`alert-${alert.id}`}
                className={`p-5 ${targetAlertId === alert.id ? "bg-indigo-50 ring-1 ring-indigo-200" : !alert.read ? "bg-slate-50/80" : ""}`}
                onClick={() => markAsRead(alert.id)}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={alert.level === "critical" ? "danger" : "warning"}>
                    {alert.level === "critical" ? "Mức cao" : "Cảnh báo"}
                  </Badge>
                  {alert.roomId && <span className="text-xs text-slate-500">Phòng {alert.roomId}</span>}
                </div>
                <p className="font-semibold text-slate-900">{alert.message}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {new Date(alert.timestamp).toLocaleString("vi-VN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default UserAlerts;
