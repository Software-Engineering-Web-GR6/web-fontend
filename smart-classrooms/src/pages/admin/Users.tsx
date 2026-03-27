import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  Check,
  Clock3,
  Layers3,
  Mail,
  MapPin,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card, { CardHeader, CardTitle } from "../../components/ui/Card";
import { authApi, roomApi } from "../../services";
import {
  buildRoomHierarchy,
  DAYS,
  getDayLabel,
  getRoomLabel,
  getShiftLabel,
  getShiftTime,
  normalizeRoom,
  SHIFTS,
} from "../../utils";
import type { Room, UserScheduleEntry } from "../../types";

type AdminUserRow = {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
};

const accessKey = (roomId: number, day: number, shift: number) => `${roomId}-${day}-${shift}`;

const Users: React.FC = () => {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [accesses, setAccesses] = useState<UserScheduleEntry[]>([]);
  const [roomOccupancy, setRoomOccupancy] = useState<UserScheduleEntry[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedShift, setSelectedShift] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const normalUsers = useMemo(() => users.filter((user) => user.role === "user"), [users]);

  const getApiErrorMessage = (err: any, fallback: string) => {
    const detail = err?.response?.data?.detail;
    if (Array.isArray(detail)) {
      return detail.map((item: any) => item?.msg).filter(Boolean).join(", ");
    }
    return typeof detail === "string" ? detail : fallback;
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userData, roomData] = await Promise.all([authApi.listUsers(), roomApi.getAll()]);
      setUsers(userData);
      setRooms(roomData);
      if (!selectedUserId && userData.some((user) => user.role === "user")) {
        setSelectedUserId(userData.find((user) => user.role === "user")?.id ?? null);
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Không thể tải dữ liệu người dùng."));
    } finally {
      setLoading(false);
    }
  };

  const fetchAccesses = async (userId: number) => {
    try {
      const data = await authApi.getUserSchedule(userId);
      setAccesses(data);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Không thể tải thời khóa biểu của người dùng."));
    }
  };

  const fetchRoomOccupancy = async (roomId: number) => {
    try {
      const data = await authApi.getRoomSchedule(roomId);
      setRoomOccupancy(data);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Không thể tải thời khóa biểu hiện có của phòng."));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchAccesses(selectedUserId);
    } else {
      setAccesses([]);
    }
  }, [selectedUserId]);

  const hierarchy = useMemo(() => buildRoomHierarchy(rooms), [rooms]);
  const building = hierarchy.find((item) => item.key === selectedBuilding) ?? null;
  const floor = building?.floors.find((item) => item.floor === selectedFloor) ?? null;
  const selectedRoom = floor?.rooms.find((room) => room.id === selectedRoomId) ?? null;
  const selectedUser = normalUsers.find((user) => user.id === selectedUserId) ?? null;

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
    if (selectedRoomId) {
      fetchRoomOccupancy(selectedRoomId);
    } else {
      setRoomOccupancy([]);
    }
  }, [selectedRoomId]);

  const myAccessSet = useMemo(
    () => new Set(accesses.map((access) => accessKey(access.room_id, access.day_of_week, access.shift_number))),
    [accesses],
  );

  const occupiedSet = useMemo(
    () =>
      new Set(
        roomOccupancy
          .filter((access) => access.user_id !== selectedUserId)
          .map((access) => accessKey(access.room_id, access.day_of_week, access.shift_number)),
      ),
    [roomOccupancy, selectedUserId],
  );

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await authApi.createUser({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });
      setFullName("");
      setEmail("");
      setPassword("");
      await fetchUsers();
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Tạo tài khoản thất bại."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      return;
    }

    setDeletingId(userId);
    setError(null);
    try {
      await authApi.deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      if (selectedUserId === userId) {
        setSelectedUserId(null);
        setAccesses([]);
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Xóa tài khoản thất bại."));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSlotToggle = async (dayOfWeek: number, shiftNumber: number) => {
    if (!selectedUserId || !selectedRoomId) {
      return;
    }

    const key = accessKey(selectedRoomId, dayOfWeek, shiftNumber);
    if (occupiedSet.has(key)) {
      return;
    }

    const currentAccess = accesses.find(
      (access) =>
        access.room_id === selectedRoomId &&
        access.day_of_week === dayOfWeek &&
        access.shift_number === shiftNumber,
    );

    setSubmitting(true);
    setError(null);
    try {
      if (currentAccess) {
        await authApi.removeScheduleSlot(selectedUserId, selectedRoomId, shiftNumber, dayOfWeek);
      } else {
        await authApi.assignSchedule(selectedUserId, {
          room_id: selectedRoomId,
          shifts: [shiftNumber],
          days_of_week: [dayOfWeek],
        });
      }

      await Promise.all([fetchAccesses(selectedUserId), fetchRoomOccupancy(selectedRoomId)]);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Không thể cập nhật thời khóa biểu."));
    } finally {
      setSubmitting(false);
    }
  };

  const roomMap = useMemo(() => new Map(rooms.map((room) => [room.id, room])), [rooms]);

  const scheduleEntriesBySlot = useMemo(
    () =>
      new Map(
        accesses.map((access) => [
          `${access.day_of_week}-${access.shift_number}`,
          { access, room: roomMap.get(access.room_id) ?? null },
        ]),
      ),
    [accesses, roomMap],
  );

  const selectedSlotOccupied = useMemo(() => {
    if (!selectedRoomId || selectedDay === null || selectedShift === null) {
      return false;
    }
    return occupiedSet.has(accessKey(selectedRoomId, selectedDay, selectedShift));
  }, [occupiedSet, selectedDay, selectedRoomId, selectedShift]);

  const selectedSlotMine = useMemo(() => {
    if (!selectedRoomId || selectedDay === null || selectedShift === null) {
      return false;
    }
    return myAccessSet.has(accessKey(selectedRoomId, selectedDay, selectedShift));
  }, [myAccessSet, selectedDay, selectedRoomId, selectedShift]);

  const selectedSlotEntry = useMemo(() => {
    if (selectedDay === null || selectedShift === null) {
      return null;
    }
    return scheduleEntriesBySlot.get(`${selectedDay}-${selectedShift}`) ?? null;
  }, [scheduleEntriesBySlot, selectedDay, selectedShift]);

  const handleAssignSelectedSlot = async () => {
    if (selectedDay === null || selectedShift === null) {
      setError("Hãy chọn một ô trên lịch trước.");
      return;
    }

    if (!selectedRoomId) {
      setError("Hãy chọn phòng học để xếp lịch.");
      return;
    }

    if (!selectedUserId) {
      return;
    }

    const currentSlot = scheduleEntriesBySlot.get(`${selectedDay}-${selectedShift}`) ?? null;

    if (currentSlot && currentSlot.access.room_id === selectedRoomId) {
      setError("Ô này đã đang dùng đúng phòng bạn chọn.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (currentSlot) {
        await authApi.removeScheduleSlot(
          selectedUserId,
          currentSlot.access.room_id,
          currentSlot.access.shift_number,
          currentSlot.access.day_of_week,
        );
      }

      await authApi.assignSchedule(selectedUserId, {
        room_id: selectedRoomId,
        shifts: [selectedShift],
        days_of_week: [selectedDay],
      });

      await Promise.all([fetchAccesses(selectedUserId), fetchRoomOccupancy(selectedRoomId)]);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Không thể cập nhật thời khóa biểu."));
    } finally {
      setSubmitting(false);
    }
  };

  const syncSelectionToRoom = (roomId: number) => {
    const room = rooms.find((item) => item.id === roomId);
    if (!room) {
      return;
    }

    const normalized = normalizeRoom(room);
    setSelectedBuilding(normalized.building);
    setSelectedFloor(normalized.floor);
    setSelectedRoomId(room.id);
  };

  return (
    <Layout
      title="Người dùng"
      subtitle="Mỗi người dùng có thời khóa biểu riêng, và quyền sử dụng phòng sẽ tự mở đúng theo ca đang diễn ra"
      isAdmin={true}
    >
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card padding="sm" className="rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Tổng tài khoản</p>
              <p className="text-3xl font-bold text-slate-900">{users.length}</p>
            </div>
            <UserRound className="h-6 w-6 text-slate-400" />
          </div>
        </Card>
        <Card padding="sm" className="rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Quản trị viên</p>
              <p className="text-3xl font-bold text-indigo-600">
                {users.filter((user) => user.role === "admin").length}
              </p>
            </div>
            <Badge variant="info">Admin</Badge>
          </div>
        </Card>
        <Card padding="sm" className="rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Người dùng thường</p>
              <p className="text-3xl font-bold text-emerald-600">{normalUsers.length}</p>
            </div>
            <Badge variant="success">User</Badge>
          </div>
        </Card>
      </div>

      <Card className="mb-6 rounded-3xl">
        <CardHeader>
          <CardTitle>Tạo tài khoản mới</CardTitle>
        </CardHeader>
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Họ và tên"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mật khẩu"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            minLength={6}
            required
          />
          <Button type="submit" loading={submitting} className="w-full rounded-2xl">
            <Plus className="mr-1 h-4 w-4" />
            Tạo tài khoản
          </Button>
        </form>
      </Card>

      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.45fr]">
        <Card padding="none" className="rounded-3xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Danh sách người dùng</h2>
            <Button size="sm" variant="secondary" onClick={fetchUsers} loading={loading}>
              Làm mới
            </Button>
          </div>
          <div className="space-y-3 p-4">
            {normalUsers.map((user) => (
              <div
                key={user.id}
                className={`rounded-3xl border p-4 transition ${
                  selectedUserId === user.id
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button className="flex flex-1 items-start gap-3 text-left" onClick={() => setSelectedUserId(user.id)}>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{user.full_name}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => setSelectedUserId(user.id)}>
                      Xem TKB
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteUser(user.id)}
                      loading={deletingId === user.id}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>
              {selectedUser ? `Thời khóa biểu của ${selectedUser.full_name}` : "Thời khóa biểu người dùng"}
            </CardTitle>
          </CardHeader>

          {!selectedUser ? (
            <p className="text-sm text-slate-500">Chọn một tài khoản ở bên trái để bắt đầu sắp lịch học hoặc lịch dạy.</p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.85fr]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_45%,#ffffff_100%)] p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">Lịch cá nhân theo tuần</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Bấm vào từng ô để chọn ca học, sau đó gán phòng ở bảng bên phải.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                          <CalendarDays className="h-4 w-4" />
                          Tuần chuẩn
                        </div>
                        <p className="mt-1 text-xs text-slate-500">T2 đến Chủ nhật</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <div className="grid min-w-[860px] grid-cols-[110px_repeat(7,minmax(100px,1fr))] overflow-hidden rounded-3xl border border-slate-200 bg-white">
                        <div className="border-b border-r border-slate-200 bg-slate-50 px-4 py-4">
                          <p className="text-sm font-semibold text-slate-900">Khung giờ</p>
                          <p className="mt-1 text-xs text-slate-500">GMT+7</p>
                        </div>
                        {DAYS.map((day) => (
                          <div
                            key={day.value}
                            className={`border-b border-slate-200 px-3 py-4 text-center ${
                              selectedDay === day.value ? "bg-indigo-50" : "bg-slate-50"
                            }`}
                          >
                            <p className="font-semibold text-slate-900">{day.label}</p>
                            <p className="mt-1 text-xs text-slate-500">{day.shortLabel}</p>
                          </div>
                        ))}

                        {SHIFTS.map((shift) => (
                          <React.Fragment key={shift.value}>
                            <div className="border-r border-slate-200 px-4 py-4">
                              <div className="flex items-start gap-3">
                                <Clock3 className="mt-0.5 h-4 w-4 text-slate-400" />
                                <div>
                                  <p className="font-semibold text-slate-900">{getShiftLabel(shift.value)}</p>
                                  <p className="mt-1 text-xs text-slate-500">{shift.time}</p>
                                </div>
                              </div>
                            </div>

                            {DAYS.map((day) => {
                              const slot = scheduleEntriesBySlot.get(`${day.value}-${shift.value}`);
                              const isSelected = selectedDay === day.value && selectedShift === shift.value;
                              const room = slot?.room ?? null;

                              return (
                                <button
                                  key={`${day.value}-${shift.value}`}
                                  type="button"
                                  onClick={() => {
                                    setSelectedDay(day.value);
                                    setSelectedShift(shift.value);
                                    if (room?.id) {
                                      syncSelectionToRoom(room.id);
                                    }
                                  }}
                                  className={`min-h-[136px] border-t border-slate-100 px-3 py-3 text-left align-top transition ${
                                    isSelected
                                      ? "bg-indigo-50 ring-2 ring-inset ring-indigo-300"
                                      : slot
                                        ? "bg-emerald-50/70 hover:bg-emerald-50"
                                        : "bg-white hover:bg-slate-50"
                                  }`}
                                >
                                  {slot ? (
                                    <div className="flex h-full flex-col rounded-2xl border border-emerald-200 bg-white px-3 py-3 shadow-sm">
                                      <div className="mb-2 rounded-xl bg-indigo-700 px-3 py-2 text-white">
                                        <p className="text-sm font-semibold">{room ? getRoomLabel(room) : `Phòng ${slot.access.room_id}`}</p>
                                        <p className="mt-1 text-[11px] text-indigo-100">{shift.time}</p>
                                      </div>
                                      <p className="line-clamp-2 text-sm font-medium text-slate-800">
                                        {room?.location ?? "Đã xếp trong thời khóa biểu"}
                                      </p>
                                      <div className="mt-auto flex items-center justify-between pt-3 text-xs text-slate-500">
                                        <span>{day.shortLabel}</span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
                                          <Check className="h-3 w-3" />
                                          Đã xếp
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-center">
                                      <p className="text-sm font-semibold text-slate-500">Trống</p>
                                      <p className="mt-1 text-xs text-slate-400">Chọn ô để xếp lịch</p>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">Ô đang chọn</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {selectedDay !== null && selectedShift !== null
                        ? `${getDayLabel(selectedDay)} • ${getShiftLabel(selectedShift)}`
                        : "Chưa chọn ô nào trên lịch"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedShift !== null ? getShiftTime(selectedShift) : "Hãy bấm vào một ô trong bảng lịch tuần."}
                    </p>
                    {selectedSlotEntry && (
                      <div className="mt-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-600">
                        Đang có lịch tại {selectedSlotEntry.room ? getRoomLabel(selectedSlotEntry.room) : `Phòng ${selectedSlotEntry.access.room_id}`}.
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Chọn tòa</p>
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
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Chọn tầng</p>
                    {!building ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-400">
                        Chưa chọn tòa.
                      </div>
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
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Chọn phòng học</p>
                    {!floor ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-400">
                        Chưa chọn tầng.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {floor.rooms.map((room) => (
                          <button
                            key={room.id}
                            onClick={() => setSelectedRoomId(room.id)}
                            className={`w-full rounded-2xl border px-4 py-3 text-left ${
                              selectedRoomId === room.id
                                ? "border-sky-300 bg-sky-50"
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <p className="font-semibold text-slate-900">{getRoomLabel(room)}</p>
                            <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                              <MapPin className="h-3.5 w-3.5" />
                              {room.location}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#eef2ff_0%,#f8fafc_100%)] p-4">
                    <p className="text-sm font-semibold text-slate-700">Gán lịch cho ô đang chọn</p>
                    <p className="mt-2 text-sm text-slate-500">
                      {selectedRoom
                        ? `Phòng đang chọn: ${getRoomLabel(selectedRoom)}`
                        : "Hãy chọn phòng học trước khi gán lịch."}
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <Button
                        onClick={handleAssignSelectedSlot}
                        loading={submitting}
                        disabled={!selectedRoomId || selectedDay === null || selectedShift === null || selectedSlotOccupied}
                        className="rounded-2xl"
                      >
                        {selectedSlotMine
                          ? "Thay đổi lịch TKB"
                          : selectedSlotEntry
                            ? "Thay đổi lịch TKB"
                            : "Thêm vào TKB"}
                      </Button>
                    </div>
                    <div className="mt-4 space-y-2 text-xs text-slate-500">
                      <p>
                        {selectedSlotOccupied
                          ? "Khung giờ này của phòng đang chọn đã thuộc về người khác."
                          : selectedSlotEntry
                            ? "Ô đang chọn đã có lịch. Chọn phòng khác rồi bấm nút trên để cập nhật lịch."
                            : "Ô đang chọn chưa có lịch. Chọn phòng rồi bấm nút trên để thêm vào thời khóa biểu."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Users;
