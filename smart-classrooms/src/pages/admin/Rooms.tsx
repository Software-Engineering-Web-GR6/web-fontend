import React, { useEffect, useMemo, useState } from "react";
import { Building2, DoorOpen, MapPin, PlusSquare } from "lucide-react";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import Card, { CardHeader, CardTitle } from "../../components/ui/Card";
import { roomApi } from "../../services";
import { buildRoomHierarchy, getRoomLabel } from "../../utils";
import type { Room } from "../../types";

const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [building, setBuilding] = useState("");
  const [roomName, setRoomName] = useState("");
  const [location, setLocation] = useState("");

  const loadRooms = async () => {
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

  useEffect(() => {
    loadRooms();
  }, []);

  const hierarchy = useMemo(() => buildRoomHierarchy(rooms), [rooms]);

  const handleCreateRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const normalizedBuilding = building.trim().toUpperCase();
    const normalizedRoomName = roomName.trim();
    const normalizedLocation = location.trim();

    if (!normalizedBuilding) {
      setError("Vui lòng nhập mã tòa.");
      return;
    }

    if (!normalizedRoomName) {
      setError("Vui lòng nhập tên phòng.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        building: normalizedBuilding,
        name: normalizedRoomName.startsWith("Room ") ? normalizedRoomName : `Room ${normalizedRoomName}`,
        location: normalizedLocation || null,
      };
      await roomApi.create(payload);
      setBuilding("");
      setRoomName("");
      setLocation("");
      setSuccessMessage("Tạo phòng học thành công.");
      await loadRooms();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Không thể tạo phòng học.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      title="Phòng học"
      subtitle="Thêm phòng mới. Nếu mã tòa chưa tồn tại, hệ thống sẽ tự tạo nhóm tòa mới."
      isAdmin={true}
    >
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card padding="sm" className="rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Tổng phòng</p>
              <p className="text-3xl font-bold text-slate-900">{rooms.length}</p>
            </div>
            <DoorOpen className="h-6 w-6 text-slate-400" />
          </div>
        </Card>
        <Card padding="sm" className="rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Tổng tòa</p>
              <p className="text-3xl font-bold text-slate-900">{hierarchy.length}</p>
            </div>
            <Building2 className="h-6 w-6 text-slate-400" />
          </div>
        </Card>
        <Card padding="sm" className="rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Trạng thái tải</p>
              <p className="text-3xl font-bold text-slate-900">{loading ? "..." : "OK"}</p>
            </div>
            <PlusSquare className="h-6 w-6 text-slate-400" />
          </div>
        </Card>
      </div>

      <Card padding="none" className="mb-6 overflow-hidden rounded-3xl">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_15%_20%,#dbeafe_0%,#f8fafc_45%,#ffffff_100%)] p-6 lg:border-b-0 lg:border-r">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <Building2 className="h-5 w-5" />
            </div>
            <p className="mt-5 text-xl font-semibold text-slate-900">Thêm tòa nhà và phòng học</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Tòa được xác định theo mã tòa của phòng. Ví dụ: nhập tòa <span className="font-semibold">C</span> và
              phòng <span className="font-semibold">C301</span> thì giao diện sẽ tự có nhóm tòa C.
            </p>
          </div>

          <form onSubmit={handleCreateRoom} className="space-y-4 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Mã tòa</span>
                <input
                  value={building}
                  onChange={(event) => setBuilding(event.target.value)}
                  placeholder="A"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Tên phòng</span>
                <input
                  value={roomName}
                  onChange={(event) => setRoomName(event.target.value)}
                  placeholder="C301 hoặc Room C301"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Vị trí</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Building C - Floor 3"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <div className="flex items-center justify-end">
              <Button type="submit" loading={submitting} className="rounded-2xl px-5">
                <PlusSquare className="mr-1.5 h-4 w-4" />
                Tạo phòng
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {error && (
        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {hierarchy.map((buildingGroup) => (
          <Card key={buildingGroup.key} className="rounded-3xl">
            <CardHeader>
              <CardTitle>{buildingGroup.label}</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {buildingGroup.floors.map((floor) => (
                <div key={floor.floor} className="rounded-2xl border border-slate-200 p-4">
                  <p className="mb-3 font-semibold text-slate-900">{floor.label}</p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {floor.rooms.map((room) => (
                      <div key={room.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="font-semibold text-slate-900">{getRoomLabel(room)}</p>
                        <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {room.location || "Chưa có vị trí"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default RoomsPage;
