import { useState } from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { AlertItem } from '../../components/alerts/AlertItem';
import { demoAlerts } from '../../utils/demoData';
import type { Alert } from '../../types/alert';

export function AdminAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(demoAlerts);

  function acknowledge(id: string) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'acknowledged' } : a)),
    );
  }

  function resolve(id: string) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'resolved' } : a)));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Quản lý cảnh báo</h1>
      <Card>
        <CardHeader title="Danh sách cảnh báo" subtitle={`${alerts.length} cảnh báo`} />
        <div>
          {alerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onAcknowledge={() => acknowledge(alert.id)}
              onResolve={() => resolve(alert.id)}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
