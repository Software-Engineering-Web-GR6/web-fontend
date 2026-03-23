import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useAlerts } from "../../hooks";
import { alertApi } from "../../services/alertApi";

const Alerts: React.FC = () => {
  const [searchParams] = useSearchParams();
  const targetAlertId = searchParams.get("alert");
  const { alerts, unreadCount, markAsRead, markAllAsRead, resolveAlert } = useAlerts();
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const criticalCount = alerts.filter((alert) => alert.level === "critical").length;
  const warningCount = alerts.filter((alert) => alert.level === "warning").length;
  const openAlerts = useMemo(
    () => alerts.filter((alert) => alert.status !== "RESOLVED"),
    [alerts],
  );

  useEffect(() => {
    if (!targetAlertId) {
      return;
    }

    const target = document.getElementById(`alert-${targetAlertId}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [targetAlertId, openAlerts.length]);

  const handleResolve = async (alertId: string) => {
    setResolvingId(alertId);
    try {
      await alertApi.resolve(alertId);
      resolveAlert(alertId);
    } catch (error) {
      console.error("Failed to resolve alert", error);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <Layout title="Cảnh báo" subtitle="Theo dõi cảnh báo đang mở và xử lý nhanh theo từng phòng" isAdmin={true}>
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
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Cảnh báo đang mở</h2>
          <p className="text-sm text-slate-500">Bấm vào từng cảnh báo để đánh dấu đã đọc.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
          Đánh dấu đã đọc
        </Button>
      </div>

      <Card padding="none" className="rounded-3xl">
        {openAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Không có cảnh báo đang mở.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {openAlerts.map((alert) => {
              const isTarget = targetAlertId === alert.id;
              return (
                <div
                  key={alert.id}
                  id={`alert-${alert.id}`}
                  className={`flex items-start justify-between gap-4 p-5 transition ${
                    isTarget ? "bg-indigo-50 ring-1 ring-indigo-200" : !alert.read ? "bg-slate-50/80" : ""
                  }`}
                  onClick={() => markAsRead(alert.id)}
                >
                  <div className="max-w-3xl">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant={alert.level === "critical" ? "danger" : "warning"}>
                        {alert.level === "critical" ? "Mức cao" : "Cảnh báo"}
                      </Badge>
                      {alert.roomId && <span className="text-xs text-slate-500">Phòng {alert.roomId}</span>}
                      {isTarget && (
                        <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                          Đang xem
                        </span>
                      )}
                    </div>
                    <p className="text-base font-semibold text-slate-900">{alert.message}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Nguyên nhân: hệ thống phát hiện dữ liệu vượt ngưỡng an toàn hoặc quy tắc tự động đã được kích hoạt.
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {new Date(alert.timestamp).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleResolve(alert.id)}
                    loading={resolvingId === alert.id}
                  >
                    Xử lý
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default Alerts;
