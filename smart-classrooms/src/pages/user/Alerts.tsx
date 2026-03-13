import React from "react";
import Layout from "../../components/layout/Layout";
import Card, { CardHeader, CardTitle } from "../../components/ui/Card";
import AlertItem from "../../components/alerts/AlertItem";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useAlerts } from "../../hooks";
import { CheckCheck, Trash2 } from "lucide-react";

const UserAlerts: React.FC = () => {
  const { alerts, unreadCount, markAsRead, markAllAsRead, clearAlerts } =
    useAlerts();

  const criticalCount = alerts.filter((a) => a.level === "critical").length;
  const warningCount = alerts.filter((a) => a.level === "warning").length;

  return (
    <Layout title="Cảnh báo" subtitle="Thông báo cảnh báo" isAdmin={false}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng cảnh báo</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.length}
              </p>
            </div>
            <Badge variant="default">{unreadCount} mới</Badge>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Nghiêm trọng</p>
              <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
            </div>
            <div className="w-3 h-3 bg-red-500 rounded-full" />
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cảnh báo</p>
              <p className="text-2xl font-bold text-yellow-600">
                {warningCount}
              </p>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Lịch sử cảnh báo
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            Đánh dấu đã đọc
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAlerts}
            disabled={alerts.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Xóa tất cả
          </Button>
        </div>
      </div>

      {/* Alert List */}
      <Card padding="none">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Không có cảnh báo nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4">
                <AlertItem alert={alert} onMarkRead={markAsRead} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default UserAlerts;
