import React, { useEffect, useMemo, useState } from "react";
import { Building2, Gauge, Layers3, SlidersHorizontal, Zap } from "lucide-react";
import Layout from "../../components/layout/Layout";
import Card, { CardHeader, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { roomApi, ruleApi } from "../../services";
import { buildRoomHierarchy, getRoomLabel } from "../../utils";
import type { Room } from "../../types";
import type { Rule, RulePayload } from "../../services/ruleApi";

const Settings: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [automationEnabled, setAutomationEnabled] = useState<Record<number, boolean>>({});
  const [thresholds, setThresholds] = useState({
    temperature: 30,
    humidity: 80,
    co2: 1000,
    level: "MEDIUM" as RulePayload["alert_level"],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRooms = async () => {
      setLoading(true);
      try {
        const data = await roomApi.getAll();
        setRooms(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Không thể tải danh sách phòng.");
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  const hierarchy = useMemo(() => buildRoomHierarchy(rooms), [rooms]);
  const building = hierarchy.find((item) => item.key === selectedBuilding) ?? null;
  const floor = building?.floors.find((item) => item.floor === selectedFloor) ?? null;
  const selectedRoom = floor?.rooms.find((room) => room.id === selectedRoomId) ?? null;
  const roomAutomationEnabled = selectedRoomId ? automationEnabled[selectedRoomId] !== false : true;

  useEffect(() => {
    if (!selectedBuilding && hierarchy[0]) {
      setSelectedBuilding(hierarchy[0].key);
    }
  }, [hierarchy, selectedBuilding]);

  useEffect(() => {
    if (!building) {
      return;
    }
    if (!building.floors.some((item) => item.floor === selectedFloor)) {
      setSelectedFloor(building.floors[0]?.floor ?? null);
    }
  }, [building, selectedFloor]);

  useEffect(() => {
    if (!floor) {
      return;
    }
    if (!floor.rooms.some((room) => room.id === selectedRoomId)) {
      setSelectedRoomId(floor.rooms[0]?.id ?? null);
    }
  }, [floor, selectedRoomId]);

  useEffect(() => {
    const loadRules = async () => {
      if (!selectedRoomId) {
        setRules([]);
        return;
      }

      try {
        const [roomData, ruleData] = await Promise.all([
          roomApi.getAll(),
          ruleApi.listByRoom(selectedRoomId),
        ]);

        setRooms(roomData);
        setRules(ruleData);

        const room = roomData.find((item) => item.id === selectedRoomId);
        setAutomationEnabled((prev) => ({
          ...prev,
          [selectedRoomId]: room?.auto_control_enabled !== false,
        }));

        const temperatureRule = ruleData.find((rule) => rule.metric === "temperature");
        const humidityRule = ruleData.find((rule) => rule.metric === "humidity");
        const co2Rule = ruleData.find((rule) => rule.metric === "co2");

        setThresholds({
          temperature: Number(temperatureRule?.threshold_value ?? 30),
          humidity: Number(humidityRule?.threshold_value ?? 80),
          co2: Number(co2Rule?.threshold_value ?? 1000),
          level: (temperatureRule?.alert_level as RulePayload["alert_level"]) ?? "MEDIUM",
        });
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Không thể tải cấu hình tự động.");
      }
    };

    loadRules();
  }, [selectedRoomId]);

  const handleThresholdChange = (metric: "temperature" | "humidity" | "co2", value: number) => {
    setThresholds((prev) => ({ ...prev, [metric]: value }));
  };

  const saveRule = async (existingRule: Rule | undefined, payload: RulePayload) => {
    if (existingRule) {
      return ruleApi.update(existingRule.id, payload);
    }
    return ruleApi.create(payload);
  };

  const syncRoomModeLocally = (enabled: boolean) => {
    if (!selectedRoomId) {
      return;
    }

    setAutomationEnabled((prev) => ({ ...prev, [selectedRoomId]: enabled }));
    setRooms((prev) =>
      prev.map((room) =>
        room.id === selectedRoomId ? { ...room, auto_control_enabled: enabled } : room,
      ),
    );
  };

  const handleSave = async () => {
    if (!selectedRoomId) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await roomApi.updateAutomationMode(selectedRoomId, roomAutomationEnabled);

      const currentRules = await ruleApi.listByRoom(selectedRoomId);
      const temperatureRule = currentRules.find((rule) => rule.metric === "temperature");
      const humidityRule = currentRules.find((rule) => rule.metric === "humidity");
      const co2Rule = currentRules.find((rule) => rule.metric === "co2");

      await Promise.all([
        saveRule(temperatureRule, {
          room_id: selectedRoomId,
          name: "Tự động bật quạt khi nhiệt độ cao",
          metric: "temperature",
          operator: ">",
          threshold_value: thresholds.temperature,
          target_device_id: null,
          action: "ON",
          alert_level: thresholds.level,
          alert_message: `Nhiệt độ vượt ${thresholds.temperature}°C`,
          is_active: roomAutomationEnabled,
        }),
        saveRule(humidityRule, {
          room_id: selectedRoomId,
          name: "Cảnh báo độ ẩm cao",
          metric: "humidity",
          operator: ">",
          threshold_value: thresholds.humidity,
          target_device_id: null,
          action: "ON",
          alert_level: thresholds.level,
          alert_message: `Độ ẩm vượt ${thresholds.humidity}%`,
          is_active: roomAutomationEnabled,
        }),
        saveRule(co2Rule, {
          room_id: selectedRoomId,
          name: "Tự động bật đèn khi CO2 cao",
          metric: "co2",
          operator: ">",
          threshold_value: thresholds.co2,
          target_device_id: null,
          action: "ON",
          alert_level: "HIGH",
          alert_message: `Nồng độ CO2 vượt ${thresholds.co2} ppm`,
          is_active: roomAutomationEnabled,
        }),
      ]);

      const refreshedRules = await ruleApi.listByRoom(selectedRoomId);
      setRules(refreshedRules);
      syncRoomModeLocally(refreshedRules.some((rule) => rule.is_active));
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Không thể lưu cấu hình.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRule = async (rule: Rule) => {
    try {
      setError(null);
      const updated = await ruleApi.update(rule.id, { is_active: !rule.is_active });
      const nextRules = rules.map((item) => (item.id === updated.id ? updated : item));
      setRules(nextRules);
      syncRoomModeLocally(nextRules.some((item) => item.is_active));
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Không thể cập nhật trạng thái quy tắc.");
    }
  };

  const sliders = [
    {
      key: "temperature" as const,
      label: "Ngưỡng nhiệt độ",
      value: thresholds.temperature,
      min: 20,
      max: 40,
      unit: "°C",
      description: "Khi vượt ngưỡng này, hệ thống có thể tự động bật quạt.",
    },
    {
      key: "humidity" as const,
      label: "Ngưỡng độ ẩm",
      value: thresholds.humidity,
      min: 40,
      max: 100,
      unit: "%",
      description: "Dùng để phát hiện môi trường quá ẩm và sinh cảnh báo.",
    },
    {
      key: "co2" as const,
      label: "Ngưỡng CO2",
      value: thresholds.co2,
      min: 600,
      max: 2000,
      unit: "ppm",
      description: "Khi CO2 vượt ngưỡng, hệ thống có thể kích hoạt cảnh báo.",
    },
  ];

  return (
    <Layout
      title="Cài đặt"
      subtitle={
        selectedRoom
          ? `${getRoomLabel(selectedRoom)} • ${building?.label} • Tầng ${selectedRoom.floor}`
          : "Chọn phòng để cấu hình tự động hóa"
      }
      isAdmin={true}
    >
      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[0.8fr_0.8fr_1.2fr]">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Tòa nhà</CardTitle>
          </CardHeader>
          {loading ? (
            <p className="text-sm text-slate-500">Đang tải tòa nhà...</p>
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
                  <p className="mt-1 text-xs text-slate-500">{room.location}</p>
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Cấu hình tự động hóa</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Kéo thanh để thay đổi ngưỡng, sau đó lưu cấu hình cho phòng đang chọn.
              </p>
            </div>
            <button
              onClick={() =>
                selectedRoomId &&
                setAutomationEnabled((prev) => ({
                  ...prev,
                  [selectedRoomId]: !(prev[selectedRoomId] !== false),
                }))
              }
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition ${
                roomAutomationEnabled ? "bg-indigo-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  roomAutomationEnabled ? "translate-x-9" : "translate-x-1"
                }`}
              />
            </button>
          </CardHeader>

          <div className="mb-5 rounded-3xl bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Zap className={`h-5 w-5 ${roomAutomationEnabled ? "text-indigo-600" : "text-slate-400"}`} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {roomAutomationEnabled ? "Chế độ tự động đang bật" : "Chế độ tự động đang tắt"}
                </p>
                <p className="text-sm text-slate-500">
                  {roomAutomationEnabled
                    ? "Room mode và toàn bộ rule đang đồng bộ ở trạng thái tự động."
                    : "Khi room mode tắt, toàn bộ rule tự động của phòng cũng sẽ dừng."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {sliders.map((slider) => (
              <div key={slider.key} className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{slider.label}</p>
                    <p className="text-sm text-slate-500">{slider.description}</p>
                  </div>
                  <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                    {slider.value} {slider.unit}
                  </div>
                </div>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  value={slider.value}
                  onChange={(event) => handleThresholdChange(slider.key, Number(event.target.value))}
                  className="h-3 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-indigo-100 via-sky-100 to-emerald-100"
                />
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>{slider.min}</span>
                  <span>{slider.max}</span>
                </div>
              </div>
            ))}

            <div className="rounded-3xl border border-slate-200 p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50">
                  <Gauge className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Mức ưu tiên cảnh báo</p>
                  <p className="text-sm text-slate-500">Chọn độ ưu tiên chung cho các cảnh báo ngưỡng.</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(["LOW", "MEDIUM", "HIGH"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setThresholds((prev) => ({ ...prev, level }))}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                      thresholds.level === level
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    {level === "LOW" ? "Thấp" : level === "MEDIUM" ? "Trung bình" : "Cao"}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} loading={saving} className="rounded-2xl px-6 py-3">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Lưu cấu hình cho phòng này
            </Button>
          </div>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Quy tắc hiện có</CardTitle>
          </CardHeader>
          {rules.length === 0 ? (
            <p className="text-sm text-slate-500">Phòng này chưa có quy tắc nào. Hãy lưu cấu hình để tạo mới.</p>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{rule.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {rule.metric} {rule.operator} {rule.threshold_value} • hành động {rule.action}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">{rule.alert_message}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={rule.is_active ? "secondary" : "primary"}
                      onClick={() => handleToggleRule(rule)}
                    >
                      {rule.is_active ? "Tạm tắt" : "Bật lại"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
