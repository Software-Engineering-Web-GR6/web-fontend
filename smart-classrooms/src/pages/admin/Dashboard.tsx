import React from "react";
import Layout from "../../components/layout/Layout";
import TempCard from "../../components/sensors/TempCard";
import HumidityCard from "../../components/sensors/HumidityCard";
import ComfortIndex from "../../components/sensors/ComfortIndex";
import FanControl from "../../components/devices/FanControl";
import LightControl from "../../components/devices/LightControl";
import AcControl from "../../components/devices/AcControl";
import AlertBanner from "../../components/alerts/AlertBanner";
import TempLineChart from "../../components/charts/TempLineChart";
import HumidityChart from "../../components/charts/HumidityChart";
import Card, { CardHeader, CardTitle } from "../../components/ui/Card";
import { useSensor } from "../../hooks";
import { useSensorStore, useDeviceStore } from "../../store";

const AdminDashboard: React.FC = () => {
  // Initialize sensor connection
  useSensor();
  const { isConnected } = useSensorStore();
  const { fanOn, lightOn, acOn, acTemp } = useDeviceStore();

  return (
    <Layout
      title="Dashboard"
      subtitle="Quản lý phòng học thông minh"
      isAdmin={true}
    >
      {/* Alert Banner */}
      <AlertBanner maxAlerts={2} />

      {/* Connection Status */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
          />
          <span className="text-gray-500">
            {isConnected ? "Đã kết nối realtime" : "Đang kết nối..."}
          </span>
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <TempCard />
        <HumidityCard />
        <ComfortIndex />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
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

      {/* Device Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Điều khiển thiết bị</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <FanControl />
            <LightControl />
            <AcControl />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trạng thái thiết bị</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Quạt</span>
              <span
                className={`text-sm font-medium ${fanOn ? "text-green-600" : "text-gray-400"}`}
              >
                {fanOn ? "Đang chạy" : "Tắt"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Đèn</span>
              <span
                className={`text-sm font-medium ${lightOn ? "text-yellow-600" : "text-gray-400"}`}
              >
                {lightOn ? "Đang bật" : "Tắt"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Điều hòa</span>
              <span
                className={`text-sm font-medium ${acOn ? "text-cyan-600" : "text-gray-400"}`}
              >
                {acOn ? `Đang chạy - ${acTemp}°C` : "Tắt"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
