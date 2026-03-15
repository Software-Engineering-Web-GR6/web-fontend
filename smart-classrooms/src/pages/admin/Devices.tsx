import React from "react";
import Layout from "../../components/layout/Layout";
import Card, { CardHeader, CardTitle } from "../../components/ui/Card";
import FanControl from "../../components/devices/FanControl";
import WindowControl from "../../components/devices/WindowControl";
import AcControl from "../../components/devices/AcControl";
import { Fan, DoorOpen, Lightbulb, AirVent, Power } from "lucide-react";
import Badge from "../../components/ui/Badge";

const Devices: React.FC = () => {
  const devices = [
    { id: "1", name: "Quạt trần", type: "fan", status: true, icon: Fan },
    { id: "2", name: "Quạt đứng", type: "fan", status: false, icon: Fan },
    {
      id: "3",
      name: "Cửa sổ chính",
      type: "window",
      status: false,
      icon: DoorOpen,
    },
    {
      id: "4",
      name: "Cửa sổ phụ",
      type: "window",
      status: true,
      icon: DoorOpen,
    },
    { id: "5", name: "Đèn trần", type: "light", status: true, icon: Lightbulb },
    { id: "6", name: "Điều hòa", type: "ac", status: false, icon: AirVent },
  ];

  const onlineCount = devices.filter((device) => device.status).length;

  return (
    <Layout
      title="Thiết bị"
      subtitle="Quản lý thiết bị phòng học"
      isAdmin={true}
    >
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng thiết bị</p>
              <p className="text-2xl font-bold text-gray-900">
                {devices.length}
              </p>
            </div>
            <Power className="w-6 h-6 text-gray-400" />
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
            </div>
            <Badge variant="success">
              {onlineCount}/{devices.length}
            </Badge>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Chế độ chờ</p>
              <p className="text-2xl font-bold text-gray-600">
                {devices.length - onlineCount}
              </p>
            </div>
            <Badge variant="default">
              {devices.length - onlineCount} thiết bị
            </Badge>
          </div>
        </Card>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Điều khiển nhanh</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <FanControl />
            <WindowControl />
            <AcControl />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trạng thái thiết bị</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {devices.map((device) => {
              const Icon = device.icon;
              return (
                <div
                  key={device.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 ${device.status ? "text-indigo-600" : "text-gray-400"}`}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {device.name}
                    </span>
                  </div>
                  <Badge
                    variant={device.status ? "success" : "default"}
                    size="sm"
                  >
                    {device.status ? "Hoạt động" : "Tắt"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Tất cả thiết bị
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {devices.map((device) => {
          const Icon = device.icon;
          return (
            <Card key={device.id} hover>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      device.status ? "bg-indigo-100" : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${device.status ? "text-indigo-600" : "text-gray-400"}`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {device.name}
                    </h3>
                    <p className="text-xs capitalize text-gray-500">
                      {device.type}
                    </p>
                  </div>
                </div>
                <div
                  className={`h-3 w-3 rounded-full ${
                    device.status ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </Layout>
  );
};

export default Devices;
