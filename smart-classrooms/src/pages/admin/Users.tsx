import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  Clock3,
  Download,
  FileSpreadsheet,
  Layers3,
  Mail,
  MapPin,
  Search,
  Trash2,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card, { CardHeader, CardTitle } from "../../components/ui/Card";
import { authApi, roomApi } from "../../services";
import type {
  BatchImportResponse,
  CreateUserPayload,
  ImportScheduleRow,
} from "../../services/authApi";
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
import { parseCsvText } from "../../utils/csv";
import type { Room, UserScheduleEntry } from "../../types";

type AdminUserRow = {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
};

type ImportPreviewKind = "users" | "schedule";
type CsvPreviewRow = Record<string, string>;

const accessKey = (roomId: number, day: number, shift: number) =>
  `${roomId}-${day}-${shift}`;

const CsvImportCard: React.FC<{
  title: string;
  formatHint: string;
  icon: React.ReactNode;
  fileId: string;
  fileName: string;
  disabled?: boolean;
  templateFileName: string;
  templateContent: string;
  onTemplateDownload: (filename: string, content: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({
  title,
  formatHint,
  icon,
  fileId,
  fileName,
  disabled = false,
  templateFileName,
  templateContent,
  onTemplateDownload,
  onFileChange,
}) => (
  <Card className="overflow-hidden rounded-[2rem] border border-cyan-100/80 bg-white/95 p-0 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
    <div className="flex items-start justify-between border-b border-teal-100 px-5 py-5">
      <div>
        <h3 className="text-[1.75rem] font-semibold leading-none tracking-tight text-slate-900">
          {title}
        </h3>
        <p className="mt-4 text-sm text-slate-500">
          Định dạng gợi ý: <code>{formatHint}</code>
        </p>
      </div>
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        {icon}
      </div>
    </div>

    <div className="space-y-5 px-5 py-5">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-slate-700 hover:bg-slate-200"
        onClick={() => onTemplateDownload(templateFileName, templateContent)}
      >
        <Download className="mr-1.5 h-4 w-4" />
        Tải CSV mẫu
      </Button>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Chọn file CSV</p>
        <label
          htmlFor={fileId}
          className="flex cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-7 text-center transition hover:border-sky-200 hover:bg-sky-50/40"
        >
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">
            {fileName || "Chọn file CSV"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Hỗ trợ tệp .csv, tối đa 10MB
          </p>
        </label>
        <input
          id={fileId}
          type="file"
          accept=".csv,text/csv"
          onChange={onFileChange}
          className="sr-only"
          disabled={disabled}
        />
      </div>
    </div>
  </Card>
);

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isScheduleViewOpen, setIsScheduleViewOpen] = useState(false);
  const [userImportFileName, setUserImportFileName] = useState("");
  const [scheduleImportFileName, setScheduleImportFileName] = useState("");
  const [importingUsers, setImportingUsers] = useState(false);
  const [importingSchedule, setImportingSchedule] = useState(false);
  const [importReport, setImportReport] = useState<BatchImportResponse | null>(
    null,
  );
  const [previewKind, setPreviewKind] = useState<ImportPreviewKind | null>(
    null,
  );
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<CsvPreviewRow[]>([]);
  const [pendingUserImportItems, setPendingUserImportItems] = useState<
    CreateUserPayload[]
  >([]);
  const [pendingScheduleImportItems, setPendingScheduleImportItems] = useState<
    ImportScheduleRow[]
  >([]);

  const normalUsers = useMemo(
    () => users.filter((user) => user.role === "user"),
    [users],
  );
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
      return detail
        .map((item: any) => item?.msg)
        .filter(Boolean)
        .join(", ");
    }
    return typeof detail === "string" ? detail : fallback;
  };

  const readCsvFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Không thể đọc file CSV."));
      reader.readAsText(file);
    });

  const clearImportPreview = () => {
    setPreviewKind(null);
    setPreviewFileName("");
    setPreviewHeaders([]);
    setPreviewRows([]);
    setPendingUserImportItems([]);
    setPendingScheduleImportItems([]);
  };

  const downloadCsvTemplate = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userData, roomData] = await Promise.all([
        authApi.listUsers(),
        roomApi.getAll(),
      ]);
      setUsers(userData);
      setRooms(roomData);
      if (!selectedUserId && userData.some((user) => user.role === "user")) {
        setSelectedUserId(
          userData.find((user) => user.role === "user")?.id ?? null,
        );
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
      setError(
        getApiErrorMessage(err, "Không thể tải thời khóa biểu của người dùng."),
      );
    }
  };

  const fetchRoomOccupancy = async (roomId: number) => {
    try {
      const data = await authApi.getRoomSchedule(roomId);
      setRoomOccupancy(data);
    } catch (err: any) {
      setError(
        getApiErrorMessage(err, "Không thể tải lịch hiện có của phòng."),
      );
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
  const building =
    hierarchy.find((item) => item.key === selectedBuilding) ?? null;
  const floor =
    building?.floors.find((item) => item.floor === selectedFloor) ?? null;
  const selectedRoom =
    floor?.rooms.find((room) => room.id === selectedRoomId) ?? null;
  const selectedUser =
    normalUsers.find((user) => user.id === selectedUserId) ?? null;

  useEffect(() => {
    if (!hierarchy.length) {
      setSelectedBuilding(null);
      setSelectedFloor(null);
      setSelectedRoomId(null);
      return;
    }

    const nextBuilding =
      hierarchy.find((item) => item.key === selectedBuilding) ?? hierarchy[0];
    const nextFloor =
      nextBuilding.floors.find((item) => item.floor === selectedFloor) ??
      nextBuilding.floors[0] ??
      null;
    const nextRoom =
      nextFloor?.rooms.find((room) => room.id === selectedRoomId) ??
      nextFloor?.rooms[0] ??
      null;

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
    () =>
      new Set(
        accesses.map((access) =>
          accessKey(access.room_id, access.day_of_week, access.shift_number),
        ),
      ),
    [accesses],
  );

  const occupiedSet = useMemo(
    () =>
      new Set(
        roomOccupancy
          .filter((access) => access.user_id !== selectedUserId)
          .map((access) =>
            accessKey(access.room_id, access.day_of_week, access.shift_number),
          ),
      ),
    [roomOccupancy, selectedUserId],
  );

  const roomMap = useMemo(
    () => new Map(rooms.map((room) => [room.id, room])),
    [rooms],
  );

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
    return occupiedSet.has(
      accessKey(selectedRoomId, selectedDay, selectedShift),
    );
  }, [occupiedSet, selectedDay, selectedRoomId, selectedShift]);

  const selectedSlotMine = useMemo(() => {
    if (!selectedRoomId || selectedDay === null || selectedShift === null) {
      return false;
    }
    return myAccessSet.has(
      accessKey(selectedRoomId, selectedDay, selectedShift),
    );
  }, [myAccessSet, selectedDay, selectedRoomId, selectedShift]);

  const selectedSlotAlreadyMatchesRoom =
    selectedSlotEntry !== null &&
    selectedRoomId !== null &&
    selectedSlotEntry.access.room_id === selectedRoomId;

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
      nextBuilding.floors.find((item) => item.floor === preferredFloor) ??
      nextBuilding.floors[0] ??
      null;
    const nextRoom =
      nextFloor?.rooms.find((room) => room.id === preferredRoomId) ??
      nextFloor?.rooms[0] ??
      null;

    setSelectedBuilding(nextBuilding.key);
    setSelectedFloor(nextFloor?.floor ?? null);
    setSelectedRoomId(nextRoom?.id ?? null);
    setError(null);
  };

  const selectFloorAndRoom = (floorNumber: number) => {
    if (!building) {
      return;
    }

    const nextFloor =
      building.floors.find((item) => item.floor === floorNumber) ?? null;
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
    setSuccessMessage(null);
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);

    if (fullName.trim().length < 3) {
      setError("Họ tên người dùng phải có ít nhất 3 ký tự.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu tạm thời phải có ít nhất 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp.");
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
      setSuccessMessage("Tạo tài khoản thành công.");
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Tạo tài khoản thất bại."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleImportUsersCsv = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImportingUsers(true);
    setError(null);
    setSuccessMessage(null);
    setImportReport(null);
    setUserImportFileName(file.name);

    try {
      const text = await readCsvFile(file);
      const rows = parseCsvText(text);
      const items = rows.map((row) => ({
        full_name: row.full_name || row.name || "",
        email: row.email || "",
        password: row.password || "",
      }));

      if (items.length === 0) {
        throw new Error("File CSV tài khoản không có dữ liệu hợp lệ.");
      }
      setPreviewKind("users");
      setPreviewFileName(file.name);
      setPreviewHeaders(["full_name", "email", "password"]);
      setPreviewRows(
        items.map((item) => ({
          full_name: item.full_name,
          email: item.email,
          password: item.password,
        })),
      );
      setPendingUserImportItems(items);
      setPendingScheduleImportItems([]);
      setSuccessMessage(
        `Đã đọc file ${file.name}. Kiểm tra preview rồi bấm import để tạo tài khoản.`,
      );
    } catch (err: any) {
      setError(
        err?.message ||
          getApiErrorMessage(err, "Không thể import tài khoản từ CSV."),
      );
    } finally {
      setImportingUsers(false);
      event.target.value = "";
    }
  };

  const handleImportScheduleCsv = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImportingSchedule(true);
    setError(null);
    setSuccessMessage(null);
    setImportReport(null);
    setScheduleImportFileName(file.name);

    try {
      const text = await readCsvFile(file);
      const rows = parseCsvText(text);
      const items: ImportScheduleRow[] = rows.map((row) => ({
        email: row.email || "",
        room_name: row.room_name || row.room || "",
        day_of_week: row.day_of_week || "",
        shift_number: row.shift_number || "",
      }));

      if (items.length === 0) {
        throw new Error("File CSV lịch dạy không có dữ liệu hợp lệ.");
      }
      setPreviewKind("schedule");
      setPreviewFileName(file.name);
      setPreviewHeaders(["email", "room_name", "day_of_week", "shift_number"]);
      setPreviewRows(
        items.map((item) => ({
          email: String(item.email ?? ""),
          room_name: String(item.room_name ?? ""),
          day_of_week: String(item.day_of_week ?? ""),
          shift_number: String(item.shift_number ?? ""),
        })),
      );
      setPendingScheduleImportItems(items);
      setPendingUserImportItems([]);
      setSuccessMessage(
        `Đã đọc file ${file.name}. Kiểm tra preview rồi bấm import để tạo lịch dạy.`,
      );
    } catch (err: any) {
      setError(
        err?.message ||
          getApiErrorMessage(err, "Không thể import lịch dạy từ CSV."),
      );
    } finally {
      setImportingSchedule(false);
      event.target.value = "";
    }
  };

  const handleConfirmImport = async () => {
    if (previewKind === "users") {
      if (pendingUserImportItems.length === 0) {
        setError("Không có dữ liệu tài khoản để import.");
        return;
      }

      setImportingUsers(true);
      setError(null);
      setImportReport(null);
      try {
        const result = await authApi.importUsers({
          items: pendingUserImportItems,
        });
        setImportReport(result);
        setSuccessMessage(
          `Import tài khoản hoàn tất: ${result.created_count} thành công, ${result.failed_count} thất bại.`,
        );
        clearImportPreview();
        await fetchUsers();
      } catch (err: any) {
        setError(getApiErrorMessage(err, "Không thể import tài khoản từ CSV."));
      } finally {
        setImportingUsers(false);
      }
      return;
    }

    if (previewKind === "schedule") {
      if (pendingScheduleImportItems.length === 0) {
        setError("Không có dữ liệu lịch dạy để import.");
        return;
      }

      setImportingSchedule(true);
      setError(null);
      setImportReport(null);
      try {
        const result = await authApi.importSchedule({
          items: pendingScheduleImportItems,
        });
        setImportReport(result);
        setSuccessMessage(
          `Import lịch dạy hoàn tất: ${result.created_count} thành công, ${result.failed_count} thất bại.`,
        );
        clearImportPreview();
        await fetchUsers();
      } catch (err: any) {
        setError(getApiErrorMessage(err, "Không thể import lịch dạy từ CSV."));
      } finally {
        setImportingSchedule(false);
      }
    }
  };

  const handleDeleteUser = async (userId: number) => {
    setSuccessMessage(null);
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
        setIsScheduleViewOpen(false);
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Xóa tài khoản thất bại."));
    } finally {
      setDeletingId(null);
    }
  };

  const handleAssignSelectedSlot = async () => {
    setSuccessMessage(null);
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

    const currentSlot =
      scheduleEntriesBySlot.get(`${selectedDay}-${selectedShift}`) ?? null;

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
          await Promise.all([
            fetchAccesses(selectedUserId),
            fetchRoomOccupancy(selectedRoomId),
          ]);
          return;
        }
      }

      await authApi.assignSchedule(selectedUserId, {
        room_id: selectedRoomId,
        shifts: [selectedShift],
        days_of_week: [selectedDay],
      });

      await Promise.all([
        fetchAccesses(selectedUserId),
        fetchRoomOccupancy(selectedRoomId),
      ]);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Không thể cập nhật thời khóa biểu."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      title="Người dùng"
      subtitle="Mỗi người dùng có thời khóa biểu riêng, và quyền sử dụng phòng sẽ tự mở đúng theo ca đang diễn ra"
      isAdmin={true}
    >
      {!isScheduleViewOpen && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card padding="sm" className="rounded-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Tổng tài khoản</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {users.length}
                  </p>
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
                  <p className="text-3xl font-bold text-emerald-600">
                    {normalUsers.length}
                  </p>
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
                <p className="mt-5 text-xl font-semibold text-slate-900">
                  Tạo tài khoản người dùng
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Sử dụng mẫu tạo tài khoản chuẩn cho lớp học thông minh: đầy đủ
                  thông tin, mật khẩu tạm thời rõ ràng và dễ bàn giao.
                </p>
                <div className="mt-5 rounded-2xl border border-indigo-100 bg-white/90 px-4 py-3 text-xs text-slate-600">
                  Gợi ý: Sau khi tạo, hãy yêu cầu người dùng đăng nhập và đổi
                  mật khẩu ngay trong lần đầu sử dụng.
                </div>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4 p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Họ và tên
                    </span>
                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Nguyen Van A"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Email
                    </span>
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
                    <span className="text-sm font-medium text-slate-700">
                      Mật khẩu tạm thời
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Ít nhất 8 ký tự"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                      minLength={8}
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Xác nhận mật khẩu
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Nhập lại mật khẩu"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                      minLength={8}
                      required
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-600">
                    Tài khoản mới được tạo với quyền user. Lịch học và quyền
                    phòng được phân ở bên dưới.
                  </p>
                  <Button
                    type="submit"
                    loading={submitting}
                    className="rounded-2xl px-5"
                  >
                    <UserPlus className="mr-1.5 h-4 w-4" />
                    Tạo tài khoản
                  </Button>
                </div>
              </form>
            </div>
          </Card>

          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <CsvImportCard
              title="Tải lên danh sách tài khoản "
              formatHint="full_name,email,password"
              icon={<UserPlus className="h-5 w-5" />}
              fileId="user-import-csv"
              fileName={userImportFileName}
              disabled={importingUsers}
              templateFileName="mau-tai-khoan.csv"
              templateContent={
                "full_name,email,password\nNguyen Van A,a@example.com,12345678\nTran Thi B,b@example.com,12345678\n"
              }
              onTemplateDownload={downloadCsvTemplate}
              onFileChange={handleImportUsersCsv}
            />

            <CsvImportCard
              title="Cập Nhật lịch giảng dạy"
              formatHint="email,room_name,day_of_week,shift_number"
              icon={<CalendarDays className="h-5 w-5" />}
              fileId="schedule-import-csv"
              fileName={scheduleImportFileName}
              disabled={importingSchedule}
              templateFileName="mau-lich-day.csv"
              templateContent={
                "email,room_name,day_of_week,shift_number\na@example.com,Room A101,0,1\na@example.com,Room A101,3,6\n"
              }
              onTemplateDownload={downloadCsvTemplate}
              onFileChange={handleImportScheduleCsv}
            />
          </div>

          {previewKind && (
            <Card className="mb-6 rounded-3xl">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle>
                    Preview import{" "}
                    {previewKind === "users" ? "tài khoản" : "lịch dạy"}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={clearImportPreview}
                    >
                      <X className="mr-1.5 h-4 w-4" />
                      Hủy preview
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleConfirmImport}
                      loading={
                        previewKind === "users"
                          ? importingUsers
                          : importingSchedule
                      }
                    >
                      <Check className="mr-1.5 h-4 w-4" />
                      Xác nhận import
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  File:{" "}
                  <span className="font-medium text-slate-900">
                    {previewFileName}
                  </span>{" "}
                  • Tổng dòng dữ liệu: {previewRows.length}
                </p>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        {previewHeaders.map((header) => (
                          <th
                            key={header}
                            className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-slate-600"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {previewRows.slice(0, 8).map((row, index) => (
                        <tr key={`${previewFileName}-${index}`}>
                          {previewHeaders.map((header) => (
                            <td
                              key={`${header}-${index}`}
                              className="px-4 py-3 text-slate-700"
                            >
                              {row[header] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewRows.length > 8 && (
                  <p className="text-xs text-slate-500">
                    Đang hiển thị 8 dòng đầu tiên. Khi xác nhận, hệ thống sẽ
                    import toàn bộ {previewRows.length} dòng.
                  </p>
                )}
              </div>
            </Card>
          )}
        </>
      )}

      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
          <span className="text-sm">{successMessage}</span>
        </div>
      )}

      {importReport && (
        <Card className="mb-6 rounded-3xl">
          <CardHeader>
            <CardTitle>Kết quả import</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Thành công: {importReport.created_count} | Thất bại:{" "}
              {importReport.failed_count}
            </p>
            <div className="grid gap-2">
              {importReport.results.slice(0, 12).map((item) => (
                <div
                  key={`${item.row_number}-${item.email ?? item.room_name ?? "row"}`}
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    item.success
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  Dòng {item.row_number}: {item.email ?? "N/A"}
                  {item.room_name ? ` • ${item.room_name}` : ""} •{" "}
                  {item.message}
                </div>
              ))}
            </div>
            {importReport.results.length > 12 && (
              <p className="text-xs text-slate-500">
                Đang hiển thị 12 dòng đầu tiên trong tổng số{" "}
                {importReport.results.length} kết quả.
              </p>
            )}
          </div>
        </Card>
      )}

      {isScheduleViewOpen ? (
        <Card className="rounded-3xl">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>
                {selectedUser
                  ? `Thời khóa biểu của ${selectedUser.full_name}`
                  : "Thời khóa biểu người dùng"}
              </CardTitle>
              <Button
                variant="secondary"
                onClick={() => setIsScheduleViewOpen(false)}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Quay lại quản lý người dùng
              </Button>
            </div>
          </CardHeader>

          {!selectedUser ? (
            <p className="text-sm text-slate-500">
              Chọn một tài khoản ở bên trái để bắt đầu sắp lịch học hoặc lịch
              dạy.
            </p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_45%,#ffffff_100%)] p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">
                          Lịch cá nhân theo tuần
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Bấm vào từng ô để chọn ca học, sau đó gán phòng ở bảng
                          bên phải.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                          <CalendarDays className="h-4 w-4" />
                          Tuần chuẩn
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          T2 đến Chủ nhật
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="grid w-full grid-cols-[88px_repeat(7,minmax(0,1fr))] overflow-hidden rounded-3xl border border-slate-200 bg-white">
                        <div className="border-b border-r border-slate-200 bg-slate-50 px-2 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-900">
                            Khung giờ
                          </p>
                          <p className="mt-1 text-xs text-slate-500">GMT+7</p>
                        </div>
                        {DAYS.map((day) => (
                          <div
                            key={day.value}
                            className={`border-b border-slate-200 px-2 py-3 text-center ${
                              selectedDay === day.value
                                ? "bg-indigo-50"
                                : "bg-slate-50"
                            }`}
                          >
                            <p className="text-sm font-semibold text-slate-900">
                              {day.label}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {day.shortLabel}
                            </p>
                          </div>
                        ))}

                        {SHIFTS.map((shift) => (
                          <React.Fragment key={shift.value}>
                            <div className="border-r border-slate-200 px-2 py-3">
                              <div className="flex items-start gap-3">
                                <Clock3 className="mt-0.5 h-4 w-4 text-slate-400" />
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {getShiftLabel(shift.value)}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {shift.time}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {DAYS.map((day) => {
                              const slot = scheduleEntriesBySlot.get(
                                `${day.value}-${shift.value}`,
                              );
                              const isSelected =
                                selectedDay === day.value &&
                                selectedShift === shift.value;
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
                                  className={`min-h-[112px] border-t border-slate-100 px-2 py-2 text-left align-top transition ${
                                    isSelected
                                      ? "bg-indigo-50 ring-2 ring-inset ring-indigo-300"
                                      : slot
                                        ? "bg-emerald-50/70 hover:bg-emerald-50"
                                        : "bg-white hover:bg-slate-50"
                                  }`}
                                >
                                  {slot ? (
                                    <div className="flex h-full flex-col rounded-2xl border border-emerald-200 bg-white px-2 py-2 shadow-sm">
                                      <div className="mb-2 rounded-xl bg-indigo-700 px-2 py-1.5 text-white">
                                        <p className="text-xs font-semibold leading-tight">
                                          {room
                                            ? getRoomLabel(room)
                                            : `Phòng ${slot.access.room_id}`}
                                        </p>
                                        <p className="mt-1 text-[11px] text-indigo-100">
                                          {shift.time}
                                        </p>
                                      </div>
                                      <p className="line-clamp-2 text-xs font-medium text-slate-800">
                                        {room?.location ??
                                          "Đã xếp trong thời khóa biểu"}
                                      </p>
                                      <div className="mt-auto flex items-center justify-between pt-2 text-[11px] text-slate-500">
                                        <span>{day.shortLabel}</span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                                          <Check className="h-2.5 w-2.5" />
                                          Đã xếp
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-center">
                                      <p className="text-xs font-semibold text-slate-500">
                                        Trống
                                      </p>
                                      <p className="mt-1 text-[11px] text-slate-400">
                                        Chọn ô để xếp lịch
                                      </p>
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
                    <p className="text-sm font-semibold text-slate-700">
                      Ô đang chọn
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {selectedDay !== null && selectedShift !== null
                        ? `${getDayLabel(selectedDay)} • ${getShiftLabel(selectedShift)}`
                        : "Chưa chọn ô nào trên lịch"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedShift !== null
                        ? getShiftTime(selectedShift)
                        : "Hãy bấm vào một ô trong bảng lịch tuần."}
                    </p>
                    {selectedSlotEntry && (
                      <div className="mt-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-600">
                        Đang có lịch tại{" "}
                        {selectedSlotEntry.room
                          ? getRoomLabel(selectedSlotEntry.room)
                          : `Phòng ${selectedSlotEntry.access.room_id}`}
                        .
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">
                      Chọn tòa
                    </p>
                    <div className="space-y-3">
                      {hierarchy.map((item) => (
                        <button
                          key={item.key}
                          onClick={() => selectBuildingAndRoom(item.key)}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${
                            selectedBuilding === item.key
                              ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <Building2 className="h-5 w-5" />
                          <div>
                            <p className="font-semibold">{item.label}</p>
                            <p className="text-xs text-slate-500">
                              {item.rooms.length} phòng
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">
                      Chọn tầng
                    </p>
                    {!building ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-400">
                        Chưa chọn tòa.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {building.floors.map((item) => (
                          <button
                            key={item.floor}
                            onClick={() => selectFloorAndRoom(item.floor)}
                            className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${
                              selectedFloor === item.floor
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <Layers3 className="h-5 w-5" />
                            <div>
                              <p className="font-semibold">Tầng {item.floor}</p>
                              <p className="text-xs text-slate-500">
                                {item.rooms.length} phòng
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">
                      Chọn phòng học
                    </p>
                    {!floor ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-400">
                        Chưa chọn tầng.
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
                            className={`w-full rounded-2xl border px-4 py-3 text-left ${
                              selectedRoomId === room.id
                                ? "border-sky-300 bg-sky-50"
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <p className="font-semibold text-slate-900">
                              {getRoomLabel(room)}
                            </p>
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
                    <p className="text-sm font-semibold text-slate-700">
                      Gán lịch cho ô đang chọn
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {selectedRoom
                        ? `Phòng đang chọn: ${getRoomLabel(selectedRoom)}`
                        : "Hãy chọn phòng học trước khi gán lịch."}
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <Button
                        onClick={handleAssignSelectedSlot}
                        loading={submitting}
                        disabled={
                          !selectedRoomId ||
                          selectedDay === null ||
                          selectedShift === null ||
                          selectedSlotOccupied
                        }
                        className="rounded-2xl"
                      >
                        {selectedSlotAlreadyMatchesRoom
                          ? "Gỡ khỏi TKB"
                          : selectedSlotMine
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
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <Card padding="none" className="rounded-3xl">
            <div className="space-y-4 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Danh sách người dùng
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Hiển thị {filteredUsers.length}/{normalUsers.length} tài
                    khoản user
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={fetchUsers}
                  loading={loading}
                >
                  Làm mới
                </Button>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={userSearchQuery}
                  onChange={(event) => setUserSearchQuery(event.target.value)}
                  placeholder="Tìm theo tên hoặc email để xem lịch nhanh hơn"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>
            <div className="space-y-3 p-4">
              {filteredUsers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    Không tìm thấy người dùng phù hợp
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Thử đổi từ khóa tìm kiếm hoặc bấm Làm mới danh sách.
                  </p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`rounded-3xl border p-4 transition ${
                      selectedUserId === user.id
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
                          <p className="font-semibold text-slate-900">
                            {user.full_name}
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </p>
                          <p className="mt-2 text-xs text-slate-400">
                            Tạo lúc: {formatDateTime(user.created_at)}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => openScheduleView(user.id)}
                        >
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
