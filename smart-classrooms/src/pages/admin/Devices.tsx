import React, { useEffect, useMemo, useState } from "react";
import { AirVent, Building2, Fan, LampDesk, Layers3, Lightbulb, Power } from "lucide-react";
import Layout from "../../components/layout/Layout";
import Card, { CardHeader, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { deviceApi, roomApi } from "../../services";
import { useDeviceControl } from "../../hooks";
import { useDeviceStore } from "../../store";
import { buildRoomHierarchy, getRoomLabel } from "../../utils";
import type { DeviceType, Room } from "../../types";

const DEVICE_META: Record<
  DeviceType,
  { label: string; icon: React.ReactNode; accent: string }
> = {
  fan: { label: "Quạt", icon: <Fan className="h-5 w-5" />, accent: "text-indigo-600" },
  light: { label: "Đèn", icon: <Lightbulb className="h-5 w-5" />, accent: "text-amber-500" },
  ac: { label: "Điều hòa", icon: <AirVent className="h-5 w-5" />, accent: "text-cyan-600" },
};

const Devices: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [mode, setMode] = useState<"auto" | "manual">("manual");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { devices } = useDeviceStore();
  const { toggleFan, toggleLight, toggleAc, toggleDevice, loading } = useDeviceControl(selectedRoomId ?? 1);

  useEffect(() => {
    const loadRooms = async () => {
      setLoadingRooms(true);
      try {
        const data = await roomApi.getAll();
        setRooms(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Không thể tải danh sách phòng.");
      } finally {
        setLoadingRooms(false);
      }
    };

    loadRooms();
  }, []);

  useEffect(() => {
    const loadDevices = async () => {
      if (!selectedRoomId) {
        return;
      }

      try {
        const data = await deviceApi.getAll(selectedRoomId);
        useDeviceStore.getState().syncDevices(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Không thể tải danh sách thiết bị.");
      }
    };

    loadDevices();
  }, [selectedRoomId]);

  const hierarchy = useMemo(() => buildRoomHierarchy(rooms), [rooms]);

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

  useEffect(() => {
    if (selectedRoom) {
      setMode(selectedRoom.auto_control_enabled === false ? "manual" : "auto");
    }
  }, [selectedRoom]);

  const groupedDevices = useMemo(
    () => ({
      fan: devices.filter((device) => device.type === "fan").sort((a, b) => a.index - b.index),
      light: devices.filter((device) => device.type === "light").sort((a, b) => a.index - b.index),
      ac: devices.filter((device) => device.type === "ac").sort((a, b) => a.index - b.index),
    }),
    [devices],
  );

  const totalDevices = devices.length;
  const activeDevices = devices.filter((device) => device.status).length;

  const groupedActions: Record<DeviceType, () => Promise<void>> = {
    fan: toggleFan,
    light: toggleLight,
    ac: toggleAc,
  };

  const handleModeChange = async (nextMode: "auto" | "manual") => {
    if (!selectedRoomId || !selectedRoom) {
      return;
    }

    const previousMode = mode;
    const previousAutoFlag = selectedRoom.auto_control_enabled !== false;

    setError(null);
    setMode(nextMode);
    setRooms((prev) =>
      prev.map((room) =>
        room.id === selectedRoomId ? { ...room, auto_control_enabled: nextMode === "auto" } : room,
      ),
    );

    try {
      const updatedRoom = await roomApi.updateAutomationMode(selectedRoomId, nextMode === "auto");
      setRooms((prev) =>
        prev.map((room) =>
          room.id === updatedRoom.id
            ? { ...room, auto_control_enabled: updatedRoom.auto_control_enabled }
            : room,
        ),
      );
    } catch (err: any) {
      setMode(previousMode);
      setRooms((prev) =>
        prev.map((room) =>
          room.id === selectedRoomId ? { ...room, auto_control_enabled: previousAutoFlag } : room,
        ),
      );
      setError(err?.response?.data?.detail || "Không thể cập nhật chế độ điều khiển.");
    }
  };

  return (
    <Layout
      title="Thiết bị"
      subtitle={
        selectedRoom
          ? `${getRoomLabel(selectedRoom)} • ${building?.label} • Tầng ${selectedRoom.floor}`
          : "Chọn phòng để điều khiển thiết bị"
      }
      isAdmin={true}
    >
      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[0.8fr_0.8fr_1.2fr]">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Tòa nhà</CardTitle>
          </CardHeader>
          {loadingRooms ? (
            <p className="text-sm text-slate-500">Đang tải danh sách tòa nhà...</p>
          ) : (
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
          )}
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
            <p className="text-sm text-slate-500">Chọn tầng để xem danh sách phòng.</p>
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
                  <p className="font-semibold text-slate-900">{getRoomLabel(room)}</p>
                  <p className="mt-1 text-sm text-slate-500">{room.location}</p>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card padding="sm" className="rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Tổng thiết bị</p>
              <p className="text-3xl font-bold text-slate-900">{totalDevices}</p>
            </div>
            <Power className="h-6 w-6 text-slate-400" />
          </div>
        </Card>
        <Card padding="sm" className="rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Đang hoạt động</p>
              <p className="text-3xl font-bold text-emerald-600">{activeDevices}</p>
            </div>
            <Badge variant="success">
              {activeDevices}/{totalDevices}
            </Badge>
          </div>
        </Card>
        <Card padding="sm" className="rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Chế độ điều khiển</p>
              <p className="text-xl font-bold text-slate-900">
                {mode === "manual" ? "Thủ công" : "Tự động"}
              </p>
            </div>
            <div className="flex rounded-full bg-slate-100 p-1">
              <button
                onClick={() => handleModeChange("manual")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  mode === "manual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                Thủ công
              </button>
              <button
                onClick={() => handleModeChange("auto")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  mode === "auto" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                Tự động
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-3xl">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Điều khiển thiết bị</CardTitle>
            <p className="text-sm text-slate-500">
              {mode === "manual"
                ? "Có thể bật hoặc tắt từng thiết bị riêng lẻ."
                : "Chế độ tự động chỉ bật hoặc tắt theo nhóm thiết bị."}
            </p>
          </CardHeader>

          <div className="space-y-4">
            {(Object.keys(groupedDevices) as DeviceType[]).map((type) => {
              const meta = DEVICE_META[type];
              const items = groupedDevices[type];
              const active = items.filter((device) => device.status).length;

              return (
                <div key={type} className="rounded-3xl border border-slate-200 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 ${meta.accent}`}>
                        {meta.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{meta.label}</p>
                        <p className="text-sm text-slate-500">
                          {active}/{items.length} thiết bị đang bật
                        </p>
                      </div>
                    </div>
                    <Button variant="secondary" onClick={() => groupedActions[type]()} loading={loading}>
                      {items.every((device) => device.status) ? "Tắt cả nhóm" : "Bật cả nhóm"}
                    </Button>
                  </div>

                  {mode === "manual" ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {items.map((device) => (
                        <div
                          key={device.id}
                          className={`rounded-2xl border px-4 py-4 ${
                            device.status ? "border-emerald-200 bg-emerald-50/70" : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {meta.label} {device.index}
                              </p>
                              <p className="text-sm text-slate-500">
                                {device.status ? "Đang bật" : "Đang tắt"}
                              </p>
                            </div>
                            <LampDesk className={`h-5 w-5 ${device.status ? meta.accent : "text-slate-300"}`} />
                          </div>
                          <button
                            onClick={() => toggleDevice(type, device.index, !device.status)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                              device.status ? "bg-emerald-500" : "bg-slate-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                device.status ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                      Ở chế độ tự động, hệ thống chỉ quyết định bật hoặc tắt {meta.label.toLowerCase()} theo nhóm,
                      không phân biệt thiết bị số mấy.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Trạng thái từng nhóm</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {(Object.keys(groupedDevices) as DeviceType[]).map((type) => {
              const items = groupedDevices[type];
              const meta = DEVICE_META[type];

              return (
                <div key={type} className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="mb-2 flex items-center gap-3">
                    <div className={meta.accent}>{meta.icon}</div>
                    <p className="font-semibold text-slate-900">{meta.label}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((device) => (
                      <span
                        key={device.id}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          device.status ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-500"
                        }`}
                      >
                        {meta.label} {device.index}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Devices;
