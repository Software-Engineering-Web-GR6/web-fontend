import type { UserRoomAccess } from "../types";

export const DAYS = [
  { value: 0, label: "Thứ hai", shortLabel: "T2" },
  { value: 1, label: "Thứ ba", shortLabel: "T3" },
  { value: 2, label: "Thứ tư", shortLabel: "T4" },
  { value: 3, label: "Thứ năm", shortLabel: "T5" },
  { value: 4, label: "Thứ sáu", shortLabel: "T6" },
  { value: 5, label: "Thứ bảy", shortLabel: "T7" },
  { value: 6, label: "Chủ nhật", shortLabel: "CN" },
] as const;

export const SHIFTS = [
  { value: 1, label: "Ca 1", time: "07:00 - 09:35" },
  { value: 2, label: "Ca 2", time: "09:35 - 12:00" },
  { value: 3, label: "Ca 3", time: "13:00 - 15:35" },
  { value: 4, label: "Ca 4", time: "15:35 - 18:00" },
  { value: 5, label: "Ca 5", time: "18:15 - 19:50" },
  { value: 6, label: "Ca 6", time: "19:55 - 21:30" },
] as const;

export const getDayLabel = (dayOfWeek: number): string =>
  DAYS.find((day) => day.value === dayOfWeek)?.label ?? `Thứ ${dayOfWeek}`;

export const getShiftLabel = (shiftNumber: number): string =>
  SHIFTS.find((shift) => shift.value === shiftNumber)?.label ?? `Ca ${shiftNumber}`;

export const getShiftTime = (shiftNumber: number): string =>
  SHIFTS.find((shift) => shift.value === shiftNumber)?.time ?? "";

export const describeAccess = (
  access: UserRoomAccess,
  roomName: string,
  buildingLabel: string,
): string =>
  `${roomName} • ${buildingLabel} • ${getDayLabel(access.day_of_week)} • ${getShiftLabel(access.shift_number)}`;
