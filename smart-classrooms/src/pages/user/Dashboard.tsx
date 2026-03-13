import React from "react";
import Layout from "../../components/layout/Layout";
import TempCard from "../../components/sensors/TempCard";
import HumidityCard from "../../components/sensors/HumidityCard";
import ComfortIndex from "../../components/sensors/ComfortIndex";
import TempLineChart from "../../components/charts/TempLineChart";
import HumidityChart from "../../components/charts/HumidityChart";
import Card, { CardHeader, CardTitle } from "../../components/ui/Card";
import { useSensor } from "../../hooks";
import { useSensorStore } from "../../store";
import { Eye, EyeOff } from "lucide-react";

const UserDashboard: React.FC = () => {
  // Initialize sensor connection
  useSensor();
  const { isConnected } = useSensorStore();

  return (
    <Layout title="Dashboard" subtitle="Xem dữ liệu phòng học" isAdmin={false}>
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

      {/* Notice for non-admin */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Chế độ xem</h3>
            <p className="text-sm text-blue-700 mt-1">
              Bạn đang xem dữ liệu theo thời gian thực. Liên hệ quản trị viên để
              điều khiển thiết bị.
            </p>
          </div>
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <TempCard showTrend={false} />
        <HumidityCard showTrend={false} />
        <ComfortIndex />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
    </Layout>
  );
};

export default UserDashboard;
