import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import Layout from "../../components/layout/Layout";
import Card, { CardHeader, CardTitle } from "../../components/ui/Card";
import { authApi, roomApi } from "../../services";
import { DAYS, getCurrentDayOfWeek, getCurrentShift, getRoomLabel, SHIFTS } from "../../utils";
import type { Room, UserScheduleEntry } from "../../types";

type ScheduleSlot = {
  access: UserScheduleEntry;
  room: Room | null;
};

const UserSchedule: React.FC = () => {
  const [accesses, setAccesses] = useState<UserScheduleEntry[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(getCurrentDayOfWeek());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [scheduleData, roomData] = await Promise.all([authApi.getMySchedule(), roomApi.getAll()]);
        setAccesses(scheduleData);
        setRooms(roomData);
      } catch (err: any) {
        const detail = err?.response?.data?.detail;
        setError(typeof detail === "string" ? detail : "Không thể tải thời khóa biểu của bạn.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const roomMap = useMemo(() => new Map(rooms.map((room) => [room.id, room])), [rooms]);

  const scheduleBySlot = useMemo(
    () =>
      new Map<string, ScheduleSlot>(
        accesses.map((access) => [
          `${access.day_of_week}-${access.shift_number}`,
          {
            access,
            room: roomMap.get(access.room_id) ?? null,
          },
        ]),
      ),
    [accesses, roomMap],
  );

  const currentDay = getCurrentDayOfWeek();
  const currentShift = getCurrentShift();

  const todayEntries = useMemo(
    () => accesses.filter((access) => access.day_of_week === currentDay),
    [accesses, currentDay],
  );

  const selectedDayEntries = useMemo(
    () =>
      accesses
        .filter((access) => access.day_of_week === selectedDay)
        .sort((left, right) => left.shift_number - right.shift_number),
    [accesses, selectedDay],
  );

  return (
    <Layout title="Thời khóa biểu" subtitle="Lịch học cá nhân theo tuần cho người dùng" isAdmin={false}>
      {error && (
        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="rounded-3xl">
          <div className="py-10 text-center text-slate-500">Đang tải thời khóa biểu...</div>
        </Card>
      ) : accesses.length === 0 ? (
        <Card className="rounded-3xl border-dashed py-12 text-center text-slate-500">
          Bạn chưa có tiết học nào trong thời khóa biểu.
        </Card>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="rounded-3xl" padding="sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Tổng tiết mỗi tuần</p>
                  <p className="text-2xl font-bold text-slate-900">{accesses.length}</p>
                </div>
                <CalendarDays className="h-6 w-6 text-indigo-500" />
              </div>
            </Card>

            <Card className="rounded-3xl" padding="sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Tiết hôm nay</p>
                  <p className="text-2xl font-bold text-slate-900">{todayEntries.length}</p>
                </div>
                <Clock3 className="h-6 w-6 text-emerald-500" />
              </div>
            </Card>

            <Card className="rounded-3xl" padding="sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Ca hiện tại</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {currentShift ? `Ca ${currentShift}` : "Ngoài khung học"}
                  </p>
                </div>
                <div className="h-3 w-3 rounded-full bg-sky-500" />
              </div>
            </Card>
          </div>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Lịch học theo tuần</CardTitle>
            </CardHeader>

            <div className="mb-4 flex flex-wrap gap-2 md:hidden">
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setSelectedDay(day.value)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                    selectedDay === day.value
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {day.shortLabel}
                </button>
              ))}
            </div>

            <div className="grid gap-3 md:hidden">
              {selectedDayEntries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                  Không có tiết học trong ngày đã chọn.
                </div>
              ) : (
                selectedDayEntries.map((entry) => {
                  const room = roomMap.get(entry.room_id) ?? null;
                  const shift = SHIFTS.find((item) => item.value === entry.shift_number);
                  const isNow =
                    entry.day_of_week === currentDay &&
                    currentShift !== null &&
                    entry.shift_number === currentShift;

                  return (
                    <div
                      key={`${entry.day_of_week}-${entry.shift_number}-${entry.room_id}`}
                      className={`rounded-2xl border px-4 py-3 ${
                        isNow ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50/40"
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        Ca {entry.shift_number} {shift ? `(${shift.time})` : ""}
                      </p>
                      <p className="mt-2 text-sm font-medium text-indigo-700">
                        {room ? getRoomLabel(room) : `Phòng ${entry.room_id}`}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {room?.location || "Đã xếp trong thời khóa biểu"}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="hidden overflow-hidden rounded-3xl border border-slate-200 md:block">
              <div className="grid grid-cols-[92px_repeat(7,minmax(0,1fr))] bg-white">
                <div className="border-b border-r border-slate-200 bg-slate-50 px-2 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-900">Khung giờ</p>
                  <p className="mt-1 text-xs text-slate-500">GMT+7</p>
                </div>

                {DAYS.map((day) => (
                  <div
                    key={day.value}
                    className={`border-b border-slate-200 px-2 py-3 text-center ${
                      day.value === currentDay ? "bg-indigo-50" : "bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{day.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{day.shortLabel}</p>
                  </div>
                ))}

                {SHIFTS.map((shift) => (
                  <React.Fragment key={shift.value}>
                    <div className="border-r border-slate-200 px-2 py-3">
                      <p className="text-sm font-semibold text-slate-900">Ca {shift.value}</p>
                      <p className="mt-1 text-xs text-slate-500">{shift.time}</p>
                    </div>

                    {DAYS.map((day) => {
                      const slot = scheduleBySlot.get(`${day.value}-${shift.value}`);
                      const isNow =
                        day.value === currentDay &&
                        currentShift !== null &&
                        shift.value === currentShift;

                      return (
                        <div
                          key={`${day.value}-${shift.value}`}
                          className={`min-h-[110px] border-t border-slate-100 p-2 ${
                            slot ? "bg-emerald-50/50" : "bg-white"
                          } ${isNow ? "ring-1 ring-inset ring-indigo-300" : ""}`}
                        >
                          {slot ? (
                            <div className="h-full rounded-2xl border border-emerald-200 bg-white px-2 py-2">
                              <p className="text-xs font-semibold text-slate-900">
                                {slot.room ? getRoomLabel(slot.room) : `Phòng ${slot.access.room_id}`}
                              </p>
                              <p className="mt-1 text-[11px] text-slate-500">
                                {slot.room?.location || "Đã xếp trong thời khóa biểu"}
                              </p>
                              {isNow && (
                                <span className="mt-2 inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                                  Đang diễn ra
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                              Trống
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}
    </Layout>
  );
};

export default UserSchedule;
