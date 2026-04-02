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
import { authApi, deviceApi, roomApi } from "../../services";
import { useAuthStore, useSensorStore } from "../../store";
import {
  buildRoomHierarchy,
  getCurrentRoomAccess,
  getDayLabel,
  getRoomLabel,
  getShiftLabel,
} from "../../utils";
import type { Room, UserScheduleEntry } from "../../types";

const ActivityDot: React.FC<{ active: boolean }> = ({ active }) => (
  <span
    className={`inline-flex h-3 w-3 rounded-full border-2 border-white shadow-sm ${
      active ? "bg-emerald-500" : "bg-slate-200"
    }`}
  />
);

const UserDashboard: React.FC = () => {
  const { isConnected } = useSensorStore();
  const { setUser } = useAuthStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [accesses, setAccesses] = useState<UserScheduleEntry[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [roomActivityById, setRoomActivityById] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sync = async () => {
      setLoading(true);
      setError(null);
      try {
        const [latestUser, latestAccesses, accessibleRooms] = await Promise.all([
          authApi.getMe(),
          authApi.getMySchedule(),
          roomApi.getAll(),
        ]);
        setUser(latestUser);
        setAccesses(latestAccesses);
        setRooms(accessibleRooms);
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
    let isMounted = true;

    if (rooms.length === 0) {
      setRoomActivityById({});
      return () => {
        isMounted = false;
      };
    }

    const fetchRoomActivity = async () => {
      try {
        const results = await Promise.all(
          rooms.map(async (room) => {
            const devices = await deviceApi.getAll(room.id);
            return [room.id, devices.some((device) => device.status)] as const;
          }),
        );

        if (!isMounted) {
          return;
        }

        setRoomActivityById(Object.fromEntries(results));
      } catch (activityError) {
        console.error("Failed to fetch room activity", activityError);
      }
    };

    void fetchRoomActivity();
    const intervalId = window.setInterval(fetchRoomActivity, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [rooms]);

  useEffect(() => {
    if (!selectedBuilding && hierarchy[0]) {
      setSelectedBuilding(hierarchy[0].key);
    }
  }, [hierarchy, selectedBuilding]);

  const building = hierarchy.find((item) => item.key === selectedBuilding) ?? null;

  useEffect(() => {
    if (!building) {
      setSelectedFloor(null);
      return;
    }
    if (!building.floors.some((floor) => floor.floor === selectedFloor)) {
      setSelectedFloor(building.floors[0]?.floor ?? null);
    }
  }, [building, selectedFloor]);

  const floor = building?.floors.find((item) => item.floor === selectedFloor) ?? null;

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
  const activeRoomAccess = currentAccesses.find((access) => access.room_id === selectedRoomId) ?? null;
  const canControlDevices = Boolean(activeRoomAccess && selectedRoom);
  const selectedBuildingActive = useMemo(
    () => building?.rooms.some((room) => roomActivityById[room.id]) ?? false,
    [building, roomActivityById],
  );
  const selectedFloorActive = useMemo(
    () => floor?.rooms.some((room) => roomActivityById[room.id]) ?? false,
    [floor, roomActivityById],
  );

  useSensor(selectedRoom?.id ?? null);

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
          : "Hiện không có phòng nào trong quyền truy cập của bạn ở ca này"
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
                <div className="relative">
                  <Building2 className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1">
                    <ActivityDot active={item.rooms.some((room) => roomActivityById[room.id])} />
                  </span>
                </div>
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
            <p className="text-sm text-slate-500">Chưa có tầng khả dụng trong ca hiện tại.</p>
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
                  <div className="relative">
                    <Layers3 className="h-5 w-5" />
                    <span className="absolute -right-1 -top-1">
                      <ActivityDot active={item.rooms.some((room) => roomActivityById[room.id])} />
                    </span>
                  </div>
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
            <p className="text-sm text-slate-500">Không có phòng nào khả dụng ở thời điểm hiện tại.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {floor.rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`rounded-2xl border px-4 py-4 text-left ${
                    selectedRoomId === room.id
                      ? "border-sky-300 bg-sky-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-slate-900">{getRoomLabel(room)}</p>
                    <ActivityDot active={Boolean(roomActivityById[room.id])} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{room.location}</p>
                  <p className={`mt-2 text-xs font-medium ${roomActivityById[room.id] ? "text-emerald-600" : "text-slate-500"}`}>
                    {roomActivityById[room.id] ? "Phòng đang có thiết bị hoạt động" : "Có lịch ở ca hiện tại"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {selectedRoom && (
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Tòa hiện tại</span>
              <ActivityDot active={selectedBuildingActive} />
            </div>
            <p className="mt-2 font-semibold text-slate-900">{building?.label ?? "Chưa chọn"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Tầng hiện tại</span>
              <ActivityDot active={selectedFloorActive} />
            </div>
            <p className="mt-2 font-semibold text-slate-900">{floor ? `Tầng ${floor.floor}` : "Chưa chọn"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Phòng hiện tại</span>
              <ActivityDot active={Boolean(selectedRoomId && roomActivityById[selectedRoomId])} />
            </div>
            <p className="mt-2 font-semibold text-slate-900">{getRoomLabel(selectedRoom)}</p>
          </div>
        </div>
      )}

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
                : "Bạn chỉ có thể xem và điều khiển phòng khi có lịch ở ca hiện tại."}
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

      {selectedRoom ? (
        <>
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
        </>
      ) : (
        <Card className="mb-6 rounded-3xl border-dashed py-10 text-center text-slate-500">
          Hiện không có phòng nào trong khung lịch hiện tại để hiển thị cảm biến.
        </Card>
      )}

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
