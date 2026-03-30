import React, { useEffect, useMemo, useState } from "react";
import { Building2, ChevronRight, Layers3, Lightbulb, MapPin, Thermometer } from "lucide-react";
import Layout from "../../components/layout/Layout";
import AlertBanner from "../../components/alerts/AlertBanner";
import TempLineChart from "../../components/charts/TempLineChart";
import HumidityChart from "../../components/charts/HumidityChart";
import AcControl from "../../components/devices/AcControl";
import FanControl from "../../components/devices/FanControl";
import LightControl from "../../components/devices/LightControl";
import HumidityCard from "../../components/sensors/HumidityCard";
import ComfortIndex from "../../components/sensors/ComfortIndex";
import TempCard from "../../components/sensors/TempCard";
import Card, { CardHeader, CardTitle } from "../../components/ui/Card";
import { useSensor } from "../../hooks";
import { roomApi } from "../../services";
import { useDeviceStore, useSensorStore } from "../../store";
import { buildRoomHierarchy, getRoomLabel } from "../../utils";
import type { Room } from "../../types";

const RoomOverview: React.FC<{ roomId: number }> = ({ roomId }) => {
  useSensor(roomId);
  const { isConnected } = useSensorStore();
  const { fanOn, lightOn, acOn, acTemp } = useDeviceStore();

  return (
    <>
      <AlertBanner maxAlerts={2} />

      <div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
        <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
        {isConnected ? "Đã kết nối dữ liệu thời gian thực" : "Đang kết nối dữ liệu..."}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <TempCard />
        <HumidityCard />
        <ComfortIndex />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Biểu đồ nhiệt độ</CardTitle>
          </CardHeader>
          <TempLineChart height={280} />
        </Card>
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Biểu đồ độ ẩm</CardTitle>
          </CardHeader>
          <HumidityChart height={280} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Điều khiển nhanh</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <FanControl roomId={roomId} />
            <LightControl roomId={roomId} />
            <AcControl roomId={roomId} />
          </div>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Trạng thái hệ thống</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {[
              { label: "Quạt", active: fanOn, color: "text-indigo-600" },
              { label: "Đèn", active: lightOn, color: "text-amber-500" },
              { label: "Điều hòa", active: acOn, color: "text-cyan-600", suffix: acOn ? ` • ${acTemp}°C` : "" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className={`text-sm font-semibold ${item.active ? item.color : "text-slate-400"}`}>
                  {item.active ? `Đang bật${item.suffix ?? ""}` : "Đã tắt"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
};

const AdminDashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await roomApi.getAll();
        setRooms(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Không thể tải danh sách phòng.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const hierarchy = useMemo(() => buildRoomHierarchy(rooms), [rooms]);

  useEffect(() => {
    if (hierarchy.length === 0) {
      return;
    }
    if (!selectedBuilding) {
      setSelectedBuilding(hierarchy[0].key);
    }
  }, [hierarchy, selectedBuilding]);

  const building = useMemo(
    () => hierarchy.find((item) => item.key === selectedBuilding) ?? null,
    [hierarchy, selectedBuilding],
  );

  useEffect(() => {
    if (!building) {
      setSelectedFloor(null);
      return;
    }
    if (!building.floors.some((floor) => floor.floor === selectedFloor)) {
      setSelectedFloor(building.floors[0]?.floor ?? null);
    }
  }, [building, selectedFloor]);

  const floor = useMemo(
    () => building?.floors.find((item) => item.floor === selectedFloor) ?? null,
    [building, selectedFloor],
  );

  useEffect(() => {
    if (!floor) {
      setSelectedRoomId(null);
      return;
    }
    if (!floor.rooms.some((room) => room.id === selectedRoomId)) {
      setSelectedRoomId(floor.rooms[0]?.id ?? null);
    }
  }, [floor, selectedRoomId]);

  const selectedRoom = floor?.rooms.find((room) => room.id === selectedRoomId) ?? null;

  return (
    <Layout
      title="Tổng quan"
      subtitle={
        selectedRoom
          ? `${building?.label} • Tầng ${selectedRoom.floor} • ${getRoomLabel(selectedRoom)}`
          : "Chọn tòa, tầng và phòng để xem chi tiết"
      }
      isAdmin={true}
    >
      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_0.9fr_1.2fr]">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Danh sách tòa</CardTitle>
          </CardHeader>
          {loading ? (
            <p className="text-sm text-slate-500">Đang tải danh sách tòa...</p>
          ) : error ? (
            <p className="text-sm text-rose-600">{error}</p>
          ) : (
            <div className="space-y-3">
              {hierarchy.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSelectedBuilding(item.key)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                    selectedBuilding === item.key
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.rooms.length} phòng</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Danh sách tầng</CardTitle>
          </CardHeader>
          {!building ? (
            <p className="text-sm text-slate-500">Chọn một tòa để xem các tầng.</p>
          ) : (
            <div className="space-y-3">
              {building.floors.map((item) => (
                <button
                  key={item.floor}
                  onClick={() => setSelectedFloor(item.floor)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                    selectedFloor === item.floor
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <Layers3 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.rooms.length} phòng</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Danh sách phòng</CardTitle>
          </CardHeader>
          {!floor ? (
            <p className="text-sm text-slate-500">Chọn một tầng để xem danh sách phòng.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {floor.rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`rounded-3xl border p-4 text-left transition ${
                    selectedRoomId === room.id
                      ? "border-sky-300 bg-sky-50"
                      : "border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <Thermometer className="h-5 w-5 text-sky-600" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                      Tầng {room.floor}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900">{getRoomLabel(room)}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />
                    {room.location || `${building?.label} • Tầng ${room.floor}`}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <Lightbulb className="h-4 w-4" />
                    Chọn để xem cảm biến và thiết bị của phòng
                  </p>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {selectedRoom ? (
        <RoomOverview roomId={selectedRoom.id} />
      ) : (
        <Card className="rounded-3xl border-dashed py-12 text-center text-slate-500">
          Hãy chọn một phòng để xem chi tiết cảm biến và thiết bị.
        </Card>
      )}
    </Layout>
  );
};

export default AdminDashboard;
