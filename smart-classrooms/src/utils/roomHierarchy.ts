import type { Room } from "../types";

export type RoomNode = Room & {
  code: string;
  floor: number;
  building: string;
};

export type FloorGroup = {
  floor: number;
  label: string;
  rooms: RoomNode[];
};

export type BuildingGroup = {
  key: string;
  label: string;
  rooms: RoomNode[];
  floors: FloorGroup[];
};

const floorFromRoomName = (roomName: string): number => {
  const match = roomName.match(/(\d)(\d{2})$/);
  return match ? Number(match[1]) : 1;
};

export const normalizeRoom = (room: Room): RoomNode => {
  const code = room.name.replace(/^Room\s+/i, "").trim();
  const building = room.building || code.charAt(0) || "A";
  const floor = room.floor ?? floorFromRoomName(code);

  return {
    ...room,
    code,
    building,
    floor,
  };
};

export const buildRoomHierarchy = (rooms: Room[]): BuildingGroup[] => {
  const normalized = rooms.map(normalizeRoom);
  const grouped = new Map<string, RoomNode[]>();

  normalized.forEach((room) => {
    const key = room.building;
    grouped.set(key, [...(grouped.get(key) ?? []), room]);
  });

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right, "vi"))
    .map(([building, buildingRooms]) => {
      const floorsMap = new Map<number, RoomNode[]>();
      buildingRooms.forEach((room) => {
        floorsMap.set(room.floor, [...(floorsMap.get(room.floor) ?? []), room]);
      });

      const floors = [...floorsMap.entries()]
        .sort(([left], [right]) => left - right)
        .map(([floor, floorRooms]) => ({
          floor,
          label: `Tầng ${floor}`,
          rooms: floorRooms.sort((left, right) => left.code.localeCompare(right.code, "vi")),
        }));

      return {
        key: building,
        label: `Tòa ${building}`,
        rooms: buildingRooms.sort((left, right) => left.code.localeCompare(right.code, "vi")),
        floors,
      };
    });
};

export const getRoomLabel = (room: Room | RoomNode | null | undefined): string =>
  room ? room.name.replace(/^Room\s+/i, "Phòng ").trim() : "Phòng";
