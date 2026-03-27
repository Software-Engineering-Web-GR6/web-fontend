import React, { useEffect, useMemo, useState } from "react";
import { Building2, Layers3, Lock, Unlock } from "lucide-react";
import Layout from "../../components/layout/Layout";
import TempCard from "../../components/sensors/TempCard";
import HumidityCard from "../../components/sensors/HumidityCard";
import ComfortIndex from "../../components/sensors/ComfortIndex";
import TempLineChart from "../../components/charts/TempLineChart";
import HumidityChart from "../../components/charts/HumidityChart";
import Card, { CardHeader, CardTitle } from "../../components/ui/Card";
import FanControl from "../../components/devices/FanControl";
import LightControl from "../../components/devices/LightControl";
import AcControl from "../../components/devices/AcControl";
import { useSensor } from "../../hooks";
import { authApi, roomApi } from "../../services";
import { useAuthStore, useSensorStore } from "../../store";
import { buildRoomHierarchy, DAYS, getCurrentRoomAccess, getDayLabel, getRoomLabel, getShiftLabel } from "../../utils";
import type { Room, UserScheduleEntry } from "../../types";

const UserDashboard: React.FC = () => {
  const { isConnected } = useSensorStore();
  const { setUser } = useAuthStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [accesses, setAccesses] = useState<UserScheduleEntry[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sync = async () => {
      setLoading(true);
      setError(null);
      try {
        const [latestUser, latestAccesses, allRooms] = await Promise.all([
          authApi.getMe(),
          authApi.getMySchedule(),
          roomApi.getAll(),
        ]);
        setUser(latestUser);
        setAccesses(latestAccesses);
        setRooms(allRooms);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Không thể tải thời khóa biểu hiện tại.");
      } finally {
        setLoading(false);
      }
    };

    sync();
  }, [setUser]);

  const hierarchy = useMemo(() => buildRoomHierarchy(rooms), [rooms]);
  const currentAccesses = useMemo(() => getCurrentRoomAccess(accesses), [accesses]);

  useEffect(() => {
    if (!selectedBuilding && hierarchy[0]) {
      setSelectedBuilding(hierarchy[0].key);
    }
  }, [hierarchy, selectedBuilding]);

  const building = hierarchy.find((item) => item.key === selectedBuilding) ?? null;

  useEffect(() => {
    if (!building) {
      return;
    }
    if (!building.floors.some((floor) => floor.floor === selectedFloor)) {
      setSelectedFloor(building.floors[0]?.floor ?? null);
    }
  }, [building, selectedFloor]);

  const floor = building?.floors.find((item) => item.floor === selectedFloor) ?? null;

  useEffect(() => {
    if (!floor) {
      return;
    }
    if (!floor.rooms.some((room) => room.id === selectedRoomId)) {
      setSelectedRoomId(floor.rooms[0]?.id ?? null);
    }
  }, [floor, selectedRoomId]);

  const selectedRoom = floor?.rooms.find((room) => room.id === selectedRoomId) ?? null;
  const activeRoomAccess = currentAccesses.find((access) => access.room_id === selectedRoomId) ?? null;
  const canControlDevices = Boolean(activeRoomAccess && selectedRoom);

  useSensor(selectedRoom?.id ?? 1);

  const currentAccessLabels = currentAccesses
    .map((access) => {
      const room = rooms.find((item) => item.id === access.room_id);
      const roomLabel = room ? getRoomLabel(room) : `Phòng ${access.room_id}`;
      return `${roomLabel} • ${getDayLabel(access.day_of_week)} • ${getShiftLabel(access.shift_number)}`;
    })
    .slice(0, 4);

  if (loading) {
    return (
      <Layout title="Tổng quan" subtitle="Đang tải dữ liệu truy cập" isAdmin={false}>
        <Card className="rounded-3xl">
          <div className="py-10 text-center text-slate-500">Đang tải dữ liệu...</div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout
      title="Tổng quan"
      subtitle={
        selectedRoom
          ? `${getRoomLabel(selectedRoom)} • ${building?.label} • Tầng ${selectedRoom.floor}`
          : "Chọn tòa, tầng và phòng để xem dữ liệu"
      }
      isAdmin={false}
    >
      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[0.8fr_0.8fr_1.2fr]">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Tòa nhà</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {hierarchy.map((item) => (
              <button
                key={item.key}
                onClick={() => setSelectedBuilding(item.key)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${
                  selectedBuilding === item.key
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Building2 className="h-5 w-5" />
                <div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.rooms.length} phòng</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Tầng</CardTitle>
          </CardHeader>
          {!building ? (
            <p className="text-sm text-slate-500">Chọn tòa để xem tầng.</p>
          ) : (
            <div className="space-y-3">
              {building.floors.map((item) => (
                <button
                  key={item.floor}
                  onClick={() => setSelectedFloor(item.floor)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${
                    selectedFloor === item.floor
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Layers3 className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">Tầng {item.floor}</p>
                    <p className="text-xs text-slate-500">{item.rooms.length} phòng</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Phòng</CardTitle>
          </CardHeader>
          {!floor ? (
            <p className="text-sm text-slate-500">Chọn tầng để xem phòng.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {floor.rooms.map((room) => {
                const isAccessibleNow = currentAccesses.some((access) => access.room_id === room.id);
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`rounded-2xl border px-4 py-4 text-left ${
                      selectedRoomId === room.id
                        ? "border-sky-300 bg-sky-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-semibold text-slate-900">{getRoomLabel(room)}</p>
                    <p className="mt-1 text-xs text-slate-500">{room.location}</p>
                    <p className={`mt-2 text-xs font-medium ${isAccessibleNow ? "text-emerald-600" : "text-slate-400"}`}>
                      {isAccessibleNow ? "Có lịch ở ca hiện tại" : "Chỉ xem biểu đồ"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white px-5 py-4">
        <div className="flex items-start gap-3">
          {canControlDevices ? (
            <Unlock className="mt-0.5 h-5 w-5 text-emerald-600" />
          ) : (
            <Lock className="mt-0.5 h-5 w-5 text-amber-600" />
          )}
          <div>
            <p className="font-semibold text-slate-900">
              {canControlDevices
                ? "Bạn đang có lịch tại phòng này nên có thể điều khiển thiết bị."
                : "Bạn vẫn xem được biểu đồ, nhưng hiện chưa có lịch tại phòng này."}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {currentAccessLabels.length > 0
                ? `Ca hiện tại trong thời khóa biểu của bạn: ${currentAccessLabels.join(" | ")}`
                : "Hiện tại bạn chưa có tiết nào trong thời khóa biểu cho khung giờ này."}
            </p>
          </div>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}

      <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
        {isConnected ? "Đã kết nối dữ liệu thời gian thực" : "Đang kết nối dữ liệu..."}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <TempCard showTrend={false} />
        <HumidityCard showTrend={false} />
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

      {canControlDevices && selectedRoom ? (
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Thiết bị phòng học</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <FanControl roomId={selectedRoom.id} />
            <LightControl roomId={selectedRoom.id} />
            <AcControl roomId={selectedRoom.id} />
          </div>
        </Card>
      ) : (
        <Card className="rounded-3xl border-dashed py-10 text-center text-slate-500">
          Thiết bị sẽ chỉ hiển thị khi bạn có lịch ở phòng này trong ca hiện tại.
        </Card>
      )}
    </Layout>
  );
};

export default UserDashboard;
