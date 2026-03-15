import React from "react";
import Layout from "../../components/layout/Layout";
import TempCard from "../../components/sensors/TempCard";
import HumidityCard from "../../components/sensors/HumidityCard";
import ComfortIndex from "../../components/sensors/ComfortIndex";
import FanControl from "../../components/devices/FanControl";
import WindowControl from "../../components/devices/WindowControl";
import AcControl from "../../components/devices/AcControl";
import AlertBanner from "../../components/alerts/AlertBanner";
import TempLineChart from "../../components/charts/TempLineChart";
import HumidityChart from "../../components/charts/HumidityChart";
import Card, { CardHeader, CardTitle } from "../../components/ui/Card";
import { useSensor } from "../../hooks";
import { useDeviceStore, useSensorStore } from "../../store";

const AdminDashboard: React.FC = () => {
  useSensor();
  const { isConnected } = useSensorStore();
  const { fanOn, windowOpen, acOn } = useDeviceStore();

  return (
    <Layout
      title="Dashboard"
      subtitle="Quản lý phòng học thông minh"
      isAdmin={true}
    >
      <AlertBanner maxAlerts={2} />

      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
          />
          <span className="text-gray-500">
            {isConnected ? "Đã kết nối realtime" : "Đang kết nối..."}
          </span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <TempCard />
        <HumidityCard />
        <ComfortIndex />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ nhiệt độ</CardTitle>
          </CardHeader>
          <TempLineChart height={280} />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ độ ẩm</CardTitle>
          </CardHeader>
          <HumidityChart height={280} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Điều khiển thiết bị</CardTitle>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-sm text-gray-600">Quạt</span>
              <span
                className={`text-sm font-medium ${fanOn ? "text-green-600" : "text-gray-600"}`}
              >
                {fanOn ? "Hoạt động" : "Đã tắt"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-sm text-gray-600">Cửa sổ</span>
              <span
                className={`text-sm font-medium ${windowOpen ? "text-green-600" : "text-gray-600"}`}
              >
                {windowOpen ? "Mở" : "Đóng"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-sm text-gray-600">Điều hòa</span>
              <span
                className={`text-sm font-medium ${acOn ? "text-green-600" : "text-gray-600"}`}
              >
                {acOn ? "Hoạt động" : "Chờ"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
