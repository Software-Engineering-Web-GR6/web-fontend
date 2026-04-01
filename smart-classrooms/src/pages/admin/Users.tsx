import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  Clock3,
  Layers3,
  Mail,
  MapPin,
  Search,
  Trash2,
  UserPlus,
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
  formatDateTime,
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isScheduleViewOpen, setIsScheduleViewOpen] = useState(false);

  const normalUsers = useMemo(() => users.filter((user) => user.role === "user"), [users]);
  const filteredUsers = useMemo(() => {
    const keyword = userSearchQuery.trim().toLowerCase();
    if (!keyword) {
      return normalUsers;
    }

    return normalUsers.filter((user) => {
      const name = user.full_name.toLowerCase();
      const userEmail = user.email.toLowerCase();
      return name.includes(keyword) || userEmail.includes(keyword);
    });
  }, [normalUsers, userSearchQuery]);

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
      setError(getApiErrorMessage(err, "Khong the tai du lieu nguoi dung."));
    } finally {
      setLoading(false);
    }
  };

  const fetchAccesses = async (userId: number) => {
    try {
      const data = await authApi.getUserSchedule(userId);
      setAccesses(data);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Khong the tai thoi khoa bieu cua nguoi dung."));
    }
  };

  const fetchRoomOccupancy = async (roomId: number) => {
    try {
      const data = await authApi.getRoomSchedule(roomId);
      setRoomOccupancy(data);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Khong the tai lich hien co cua phong."));
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
    if (!hierarchy.length) {
      setSelectedBuilding(null);
      setSelectedFloor(null);
      setSelectedRoomId(null);
      return;
    }

    const nextBuilding = hierarchy.find((item) => item.key === selectedBuilding) ?? hierarchy[0];
    const nextFloor =
      nextBuilding.floors.find((item) => item.floor === selectedFloor) ?? nextBuilding.floors[0] ?? null;
    const nextRoom =
      nextFloor?.rooms.find((room) => room.id === selectedRoomId) ?? nextFloor?.rooms[0] ?? null;

    if (selectedBuilding !== nextBuilding.key) {
      setSelectedBuilding(nextBuilding.key);
    }
    if (selectedFloor !== (nextFloor?.floor ?? null)) {
      setSelectedFloor(nextFloor?.floor ?? null);
    }
    if (selectedRoomId !== (nextRoom?.id ?? null)) {
      setSelectedRoomId(nextRoom?.id ?? null);
    }
  }, [hierarchy, selectedBuilding, selectedFloor, selectedRoomId]);

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

  const selectedSlotEntry = useMemo(() => {
    if (selectedDay === null || selectedShift === null) {
      return null;
    }
    return scheduleEntriesBySlot.get(`${selectedDay}-${selectedShift}`) ?? null;
  }, [scheduleEntriesBySlot, selectedDay, selectedShift]);

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

  const selectedSlotAlreadyMatchesRoom =
    selectedSlotEntry !== null && selectedRoomId !== null && selectedSlotEntry.access.room_id === selectedRoomId;

  const selectBuildingAndRoom = (
    buildingKey: string,
    preferredFloor: number | null = null,
    preferredRoomId: number | null = null,
  ) => {
    const nextBuilding = hierarchy.find((item) => item.key === buildingKey);
    if (!nextBuilding) {
      return;
    }

    const nextFloor =
      nextBuilding.floors.find((item) => item.floor === preferredFloor) ?? nextBuilding.floors[0] ?? null;
    const nextRoom =
      nextFloor?.rooms.find((room) => room.id === preferredRoomId) ?? nextFloor?.rooms[0] ?? null;

    setSelectedBuilding(nextBuilding.key);
    setSelectedFloor(nextFloor?.floor ?? null);
    setSelectedRoomId(nextRoom?.id ?? null);
    setError(null);
  };

  const selectFloorAndRoom = (floorNumber: number) => {
    if (!building) {
      return;
    }

    const nextFloor = building.floors.find((item) => item.floor === floorNumber) ?? null;
    const nextRoom = nextFloor?.rooms[0] ?? null;

    setSelectedFloor(nextFloor?.floor ?? null);
    setSelectedRoomId(nextRoom?.id ?? null);
    setError(null);
  };

  const syncSelectionToRoom = (roomId: number) => {
    const room = rooms.find((item) => item.id === roomId);
    if (!room) {
      return;
    }

    const normalized = normalizeRoom(room);
    selectBuildingAndRoom(normalized.building, normalized.floor, room.id);
  };

  const openScheduleView = (userId: number) => {
    setSelectedUserId(userId);
    setIsScheduleViewOpen(true);
    setError(null);
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (fullName.trim().length < 3) {
      setError("Ho ten nguoi dung phai co it nhat 3 ky tu.");
      return;
    }

    if (password.length < 8) {
      setError("Mat khau tam thoi phai co it nhat 8 ky tu.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Xac nhan mat khau khong khop.");
      return;
    }

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
      setConfirmPassword("");
      await fetchUsers();
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Tao tai khoan that bai."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Ban co chac chan muon xoa tai khoan nay?")) {
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
        setIsScheduleViewOpen(false);
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Xoa tai khoan that bai."));
    } finally {
      setDeletingId(null);
    }
  };

  const handleAssignSelectedSlot = async () => {
    if (selectedDay === null || selectedShift === null) {
      setError("Hay chon mot o tren lich truoc.");
      return;
    }

    if (!selectedRoomId) {
      setError("Hay chon phong hoc de xep lich.");
      return;
    }

    if (!selectedUserId) {
      return;
    }

    const currentSlot = scheduleEntriesBySlot.get(`${selectedDay}-${selectedShift}`) ?? null;

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

        if (currentSlot.access.room_id === selectedRoomId) {
          await Promise.all([fetchAccesses(selectedUserId), fetchRoomOccupancy(selectedRoomId)]);
          return;
        }
      }

      await authApi.assignSchedule(selectedUserId, {
        room_id: selectedRoomId,
        shifts: [selectedShift],
        days_of_week: [selectedDay],
      });

      await Promise.all([fetchAccesses(selectedUserId), fetchRoomOccupancy(selectedRoomId)]);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Khong the cap nhat thoi khoa bieu."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      title="Nguoi dung"
      subtitle="Moi nguoi dung co thoi khoa bieu rieng, va quyen su dung phong se tu mo dung theo ca dang dien ra"
      isAdmin={true}
    >
      {!isScheduleViewOpen && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card padding="sm" className="rounded-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Tong tai khoan</p>
                  <p className="text-3xl font-bold text-slate-900">{users.length}</p>
                </div>
                <UserRound className="h-6 w-6 text-slate-400" />
              </div>
            </Card>
            <Card padding="sm" className="rounded-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Quan tri vien</p>
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
                  <p className="text-sm text-slate-500">Nguoi dung thuong</p>
                  <p className="text-3xl font-bold text-emerald-600">{normalUsers.length}</p>
                </div>
                <Badge variant="success">User</Badge>
              </div>
            </Card>
          </div>

          <Card padding="none" className="mb-6 overflow-hidden rounded-3xl">
            <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_15%_20%,#dbeafe_0%,#f8fafc_45%,#ffffff_100%)] p-6 lg:border-b-0 lg:border-r">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                  <UserPlus className="h-5 w-5" />
                </div>
                <p className="mt-5 text-xl font-semibold text-slate-900">Tao tai khoan nguoi dung</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Su dung mau tao tai khoan chuan cho lop hoc thong minh: day du thong tin, mat khau tam thoi ro rang va de ban giao.
                </p>
                <div className="mt-5 rounded-2xl border border-indigo-100 bg-white/90 px-4 py-3 text-xs text-slate-600">
                  Goi y: Sau khi tao, hay yeu cau nguoi dung dang nhap va doi mat khau ngay trong lan dau su dung.
                </div>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4 p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Ho va ten</span>
                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Nguyen Van A"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="giaovien@truong.edu.vn"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Mat khau tam thoi</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="It nhat 8 ky tu"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                      minLength={8}
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Xac nhan mat khau</span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Nhap lai mat khau"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                      minLength={8}
                      required
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-600">
                    Tai khoan moi duoc tao voi quyen user. Lich hoc va quyen phong duoc phan o ben duoi.
                  </p>
                  <Button type="submit" loading={submitting} className="rounded-2xl px-5">
                    <UserPlus className="mr-1.5 h-4 w-4" />
                    Tao tai khoan
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </>
      )}

      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {isScheduleViewOpen ? (
        <Card className="rounded-3xl">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>
                {selectedUser ? `Thoi khoa bieu cua ${selectedUser.full_name}` : "Thoi khoa bieu nguoi dung"}
              </CardTitle>
              <Button variant="secondary" onClick={() => setIsScheduleViewOpen(false)}>
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Quay lai quan ly nguoi dung
              </Button>
            </div>
          </CardHeader>

          {!selectedUser ? (
            <p className="text-sm text-slate-500">Chon mot tai khoan o ben trai de bat dau sap lich hoc hoac lich day.</p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_45%,#ffffff_100%)] p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">Lich ca nhan theo tuan</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Bam vao tung o de chon ca hoc, sau do gan phong o bang ben phai.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                          <CalendarDays className="h-4 w-4" />
                          Tuan chuan
                        </div>
                        <p className="mt-1 text-xs text-slate-500">T2 den Chu nhat</p>
                      </div>
                    </div>

                    <div>
                      <div className="grid w-full grid-cols-[88px_repeat(7,minmax(0,1fr))] overflow-hidden rounded-3xl border border-slate-200 bg-white">
                        <div className="border-b border-r border-slate-200 bg-slate-50 px-2 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-900">Khung gio</p>
                          <p className="mt-1 text-xs text-slate-500">GMT+7</p>
                        </div>
                        {DAYS.map((day) => (
                          <div
                            key={day.value}
                            className={`border-b border-slate-200 px-2 py-3 text-center ${selectedDay === day.value ? "bg-indigo-50" : "bg-slate-50"
                              }`}
                          >
                            <p className="text-sm font-semibold text-slate-900">{day.label}</p>
                            <p className="mt-1 text-xs text-slate-500">{day.shortLabel}</p>
                          </div>
                        ))}

                        {SHIFTS.map((shift) => (
                          <React.Fragment key={shift.value}>
                            <div className="border-r border-slate-200 px-2 py-3">
                              <div className="flex items-start gap-3">
                                <Clock3 className="mt-0.5 h-4 w-4 text-slate-400" />
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{getShiftLabel(shift.value)}</p>
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
                                    setError(null);
                                    if (room?.id) {
                                      syncSelectionToRoom(room.id);
                                    }
                                  }}
                                  className={`min-h-[112px] border-t border-slate-100 px-2 py-2 text-left align-top transition ${isSelected
                                    ? "bg-indigo-50 ring-2 ring-inset ring-indigo-300"
                                    : slot
                                      ? "bg-emerald-50/70 hover:bg-emerald-50"
                                      : "bg-white hover:bg-slate-50"
                                    }`}
                                >
                                  {slot ? (
                                    <div className="flex h-full flex-col rounded-2xl border border-emerald-200 bg-white px-2 py-2 shadow-sm">
                                      <div className="mb-2 rounded-xl bg-indigo-700 px-2 py-1.5 text-white">
                                        <p className="text-xs font-semibold leading-tight">{room ? getRoomLabel(room) : `Phong ${slot.access.room_id}`}</p>
                                        <p className="mt-1 text-[11px] text-indigo-100">{shift.time}</p>
                                      </div>
                                      <p className="line-clamp-2 text-xs font-medium text-slate-800">
                                        {room?.location ?? "Da xep trong thoi khoa bieu"}
                                      </p>
                                      <div className="mt-auto flex items-center justify-between pt-2 text-[11px] text-slate-500">
                                        <span>{day.shortLabel}</span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                                          <Check className="h-2.5 w-2.5" />
                                          Da xep
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-center">
                                      <p className="text-xs font-semibold text-slate-500">Trong</p>
                                      <p className="mt-1 text-[11px] text-slate-400">Chon o de xep lich</p>
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
                    <p className="text-sm font-semibold text-slate-700">O dang chon</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {selectedDay !== null && selectedShift !== null
                        ? `${getDayLabel(selectedDay)} • ${getShiftLabel(selectedShift)}`
                        : "Chua chon o nao tren lich"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedShift !== null ? getShiftTime(selectedShift) : "Hay bam vao mot o trong bang lich tuan."}
                    </p>
                    {selectedSlotEntry && (
                      <div className="mt-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-600">
                        Dang co lich tai {selectedSlotEntry.room ? getRoomLabel(selectedSlotEntry.room) : `Phong ${selectedSlotEntry.access.room_id}`}.
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Chon toa</p>
                    <div className="space-y-3">
                      {hierarchy.map((item) => (
                        <button
                          key={item.key}
                          onClick={() => selectBuildingAndRoom(item.key)}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${selectedBuilding === item.key
                            ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                          <Building2 className="h-5 w-5" />
                          <div>
                            <p className="font-semibold">{item.label}</p>
                            <p className="text-xs text-slate-500">{item.rooms.length} phong</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Chon tang</p>
                    {!building ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-400">
                        Chua chon toa.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {building.floors.map((item) => (
                          <button
                            key={item.floor}
                            onClick={() => selectFloorAndRoom(item.floor)}
                            className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${selectedFloor === item.floor
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 hover:bg-slate-50"
                              }`}
                          >
                            <Layers3 className="h-5 w-5" />
                            <div>
                              <p className="font-semibold">Tang {item.floor}</p>
                              <p className="text-xs text-slate-500">{item.rooms.length} phong</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Chon phong hoc</p>
                    {!floor ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-400">
                        Chua chon tang.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {floor.rooms.map((room) => (
                          <button
                            key={room.id}
                            onClick={() => {
                              setSelectedRoomId(room.id);
                              setError(null);
                            }}
                            className={`w-full rounded-2xl border px-4 py-3 text-left ${selectedRoomId === room.id
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
                    <p className="text-sm font-semibold text-slate-700">Gan lich cho o dang chon</p>
                    <p className="mt-2 text-sm text-slate-500">
                      {selectedRoom
                        ? `Phong dang chon: ${getRoomLabel(selectedRoom)}`
                        : "Hay chon phong hoc truoc khi gan lich."}
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <Button
                        onClick={handleAssignSelectedSlot}
                        loading={submitting}
                        disabled={!selectedRoomId || selectedDay === null || selectedShift === null || selectedSlotOccupied}
                        className="rounded-2xl"
                      >
                        {selectedSlotAlreadyMatchesRoom
                          ? "Go khoi TKB"
                          : selectedSlotMine
                            ? "Thay doi lich TKB"
                            : selectedSlotEntry
                              ? "Thay doi lich TKB"
                              : "Them vao TKB"}
                      </Button>
                    </div>
                    <div className="mt-4 space-y-2 text-xs text-slate-500">
                      <p>
                        {selectedSlotOccupied
                          ? "Khung gio nay cua phong dang chon da thuoc ve nguoi khac."
                          : selectedSlotEntry
                            ? "O dang chon da co lich. Chon phong khac roi bam nut tren de cap nhat lich."
                            : "O dang chon chua co lich. Chon phong roi bam nut tren de them vao thoi khoa bieu."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <Card padding="none" className="rounded-3xl">
            <div className="space-y-4 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Danh sach nguoi dung</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Hien thi {filteredUsers.length}/{normalUsers.length} tai khoan user
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={fetchUsers} loading={loading}>
                  Lam moi
                </Button>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={userSearchQuery}
                  onChange={(event) => setUserSearchQuery(event.target.value)}
                  placeholder="Tim theo ten hoac email de xem lich nhanh hon"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>
            <div className="space-y-3 p-4">
              {filteredUsers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-slate-700">Khong tim thay nguoi dung phu hop</p>
                  <p className="mt-1 text-xs text-slate-500">Thu doi tu khoa tim kiem hoac bam Lam moi danh sach.</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`rounded-3xl border p-4 transition ${selectedUserId === user.id
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        className="flex flex-1 items-start gap-3 text-left"
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                          <UserRound className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">{user.full_name}</p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </p>
                          <p className="mt-2 text-xs text-slate-400">Tao luc: {formatDateTime(user.created_at)}</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => openScheduleView(user.id)}>
                          Xem TKB
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteUser(user.id)}
                          loading={deletingId === user.id}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Xoa
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default Users;
