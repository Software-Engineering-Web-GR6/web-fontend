import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Building2, Check, Layers3, Mail, Plus, Trash2, UserRound } from "lucide-react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card, { CardHeader, CardTitle } from "../../components/ui/Card";
import { authApi, roomApi } from "../../services";
import { buildRoomHierarchy, DAYS, getDayLabel, getRoomLabel, getShiftLabel, getShiftTime, SHIFTS } from "../../utils";
import type { Room, UserRoomAccess } from "../../types";

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
  const [accesses, setAccesses] = useState<UserRoomAccess[]>([]);
  const [roomOccupancy, setRoomOccupancy] = useState<UserRoomAccess[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
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
      const data = await authApi.getUserRoomAccess(userId);
      setAccesses(data);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Không thể tải quyền phòng."));
    }
  };

  const fetchRoomOccupancy = async (roomId: number) => {
    try {
      const data = await authApi.getRoomOccupancy(roomId);
      setRoomOccupancy(data);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Không thể tải lịch sử dụng phòng."));
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
        await authApi.revokeRoomAccess(selectedUserId, selectedRoomId, shiftNumber, dayOfWeek);
      } else {
        await authApi.grantRoomAccess(selectedUserId, {
          room_id: selectedRoomId,
          shifts: [shiftNumber],
          days_of_week: [dayOfWeek],
        });
      }

      await Promise.all([fetchAccesses(selectedUserId), fetchRoomOccupancy(selectedRoomId)]);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Không thể cập nhật phân quyền."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeAccess = async (access: UserRoomAccess) => {
    if (!selectedUserId) {
      return;
    }
    setSubmitting(true);
    try {
      await authApi.revokeRoomAccess(
        selectedUserId,
        access.room_id,
        access.shift_number,
        access.day_of_week,
      );
      await Promise.all([fetchAccesses(selectedUserId), fetchRoomOccupancy(access.room_id)]);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Thu hồi quyền thất bại."));
    } finally {
      setSubmitting(false);
    }
  };

  const groupedAccesses = useMemo(() => {
    const roomMap = new Map(rooms.map((room) => [room.id, room]));
    return accesses
      .slice()
      .sort((left, right) =>
        left.room_id - right.room_id ||
        left.day_of_week - right.day_of_week ||
        left.shift_number - right.shift_number,
      )
      .map((access) => ({
        access,
        room: roomMap.get(access.room_id) ?? null,
      }));
  }, [accesses, rooms]);

  return (
    <Layout
      title="Người dùng"
      subtitle="Chọn từng tài khoản để xem và phân quyền phòng theo ngày, ca học"
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
                      Phân quyền
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
              {selectedUser ? `Phân quyền cho ${selectedUser.full_name}` : "Phân quyền phòng"}
            </CardTitle>
          </CardHeader>

          {!selectedUser ? (
            <p className="text-sm text-slate-500">Chọn một tài khoản ở bên trái để bắt đầu phân quyền.</p>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_0.9fr_1.1fr]">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Bước 1: Chọn tòa</p>
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

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Bước 2: Chọn tầng</p>
                  {!building ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-400">
                      Chưa chọn tòa.
                    </div>
                  ) : (
                    building.floors.map((item) => (
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
                    ))
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Bước 3: Chọn phòng</p>
                  {!floor ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-400">
                      Chưa chọn tầng.
                    </div>
                  ) : (
                    floor.rooms.map((room) => (
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
                        <p className="mt-1 text-xs text-slate-500">{room.location}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {!selectedRoom ? (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-400">
                  Chọn phòng để xem lịch ca.
                </div>
              ) : (
                <>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">
                      Phòng đang phân quyền: {getRoomLabel(selectedRoom)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Ô trắng: chưa phân quyền. Ô xanh: đã phân quyền cho người đang chọn. Ô đỏ: đã có người khác sử dụng.
                    </p>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-semibold text-slate-700">Bước 4: Chọn ngày</p>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
                      {DAYS.map((day) => {
                        const hasAnySelected = SHIFTS.some((shift) =>
                          myAccessSet.has(accessKey(selectedRoom.id, day.value, shift.value)),
                        );
                        return (
                          <button
                            key={day.value}
                            onClick={() => setSelectedDay(day.value)}
                            className={`rounded-2xl border px-4 py-3 text-left ${
                              selectedDay === day.value
                                ? "border-indigo-300 bg-indigo-50"
                                : hasAnySelected
                                  ? "border-emerald-200 bg-emerald-50/60"
                                  : "border-slate-200 bg-white"
                            }`}
                          >
                            <p className="font-semibold text-slate-900">{day.label}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {hasAnySelected ? "Đã có ca được cấp" : "Chưa có ca"}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedDay !== null && (
                    <div>
                      <p className="mb-3 text-sm font-semibold text-slate-700">
                        Bước 5: Chọn ca của {getDayLabel(selectedDay)}
                      </p>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {SHIFTS.map((shift) => {
                          const key = accessKey(selectedRoom.id, selectedDay, shift.value);
                          const isMine = myAccessSet.has(key);
                          const isOccupied = occupiedSet.has(key);

                          return (
                            <button
                              key={shift.value}
                              onClick={() => handleSlotToggle(selectedDay, shift.value)}
                              disabled={isOccupied || submitting}
                              className={`rounded-3xl border px-4 py-4 text-left transition ${
                                isOccupied
                                  ? "border-rose-200 bg-rose-50 text-rose-700"
                                  : isMine
                                    ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                                    : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50"
                              } ${submitting ? "opacity-60" : ""}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold">{getShiftLabel(shift.value)}</p>
                                  <p className="mt-1 text-sm">{getShiftTime(shift.value)}</p>
                                </div>
                                {isMine && <Check className="h-5 w-5" />}
                              </div>
                              <p className="mt-3 text-xs font-medium">
                                {isOccupied ? "Đã có người khác sử dụng" : isMine ? "Đã phân quyền, bấm lại để bỏ chọn" : "Chưa chọn"}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="border-t border-slate-200 pt-5">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Quyền hiện có của tài khoản này</h3>
                {groupedAccesses.length === 0 ? (
                  <p className="text-sm text-slate-500">Tài khoản này hiện chưa được phân quyền ca học nào.</p>
                ) : (
                  <div className="space-y-3">
                    {groupedAccesses.map(({ access, room }) => (
                      <div
                        key={access.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{getRoomLabel(room)}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {getDayLabel(access.day_of_week)} • {getShiftLabel(access.shift_number)} • {getShiftTime(access.shift_number)}
                          </p>
                        </div>
                        <Button size="sm" variant="danger" onClick={() => handleRevokeAccess(access)}>
                          Thu hồi
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Users;
