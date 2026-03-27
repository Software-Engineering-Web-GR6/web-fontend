import type { UserScheduleEntry } from "../types";

const SHIFT_WINDOWS = [
  { shift: 1, start: "07:00", end: "09:35" },
  { shift: 2, start: "09:35", end: "12:00" },
  { shift: 3, start: "13:00", end: "15:35" },
  { shift: 4, start: "15:35", end: "18:00" },
  { shift: 5, start: "18:15", end: "19:50" },
  { shift: 6, start: "19:55", end: "21:30" },
];

const minutesNow = (date: Date) => date.getHours() * 60 + date.getMinutes();
const toMinutes = (value: string) => {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
};

export const getCurrentShift = (date = new Date()): number | null => {
  const current = minutesNow(date);
  const active = SHIFT_WINDOWS.find(
    ({ start, end }) => current >= toMinutes(start) && current < toMinutes(end),
  );
  return active?.shift ?? null;
};

export const getCurrentDayOfWeek = (date = new Date()): number => {
  return (date.getDay() + 6) % 7;
};

export const getCurrentRoomAccess = (
  accesses: UserScheduleEntry[],
  date = new Date(),
): UserScheduleEntry[] => {
  const currentShift = getCurrentShift(date);
  if (currentShift === null) {
    return [];
  }

  const dayOfWeek = getCurrentDayOfWeek(date);
  return accesses.filter(
    (access) =>
      access.shift_number === currentShift && access.day_of_week === dayOfWeek,
  );
};
