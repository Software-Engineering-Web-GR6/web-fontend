import React, { useEffect, useMemo, useState } from "react";
import { Activity, Clock3, Database, LineChart } from "lucide-react";
import Layout from "../../components/layout/Layout";
import Card, { CardHeader, CardTitle } from "../../components/ui/Card";
import HistoryChart from "../../components/charts/HistoryChart";
import { useSensor } from "../../hooks";
import { useSensorStore } from "../../store";
import { authApi, roomApi } from "../../services";
import { formatDateTime, getCurrentRoomAccess, getRoomLabel } from "../../utils";
import type { Room, UserScheduleEntry } from "../../types";

const History: React.FC = () => {
  const { history } = useSensorStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [accesses, setAccesses] = useState<UserScheduleEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [myAccesses, allRooms] = await Promise.all([
          authApi.getMySchedule(),
          roomApi.getAll(),
        ]);
        setAccesses(myAccesses);
        setRooms(allRooms);
      } catch (error) {
        console.error("Failed to load user history context", error);
      }
    };
    load();
  }, []);

  const currentAccesses = useMemo(() => getCurrentRoomAccess(accesses), [accesses]);
  const currentRoom = useMemo(
    () => rooms.find((room) => currentAccesses.some((access) => access.room_id === room.id)) ?? null,
    [currentAccesses, rooms],
  );

  useSensor(currentRoom?.id ?? 1);

  const latestItem = history[history.length - 1] ?? null;

  return (
    <Layout
      title="Lịch sử"
      subtitle={
        currentRoom
          ? `Dữ liệu cảm biến của ${getRoomLabel(currentRoom)}`
          : "Hiện không có phòng hợp lệ trong ca đang diễn ra"
      }
      isAdmin={false}
    >
      {!currentRoom ? (
        <Card className="rounded-3xl py-12 text-center text-slate-500">
          Hiện chưa có phòng nào nằm trong thời khóa biểu của bạn ở khung giờ này.
        </Card>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card padding="sm" className="rounded-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Phòng đang theo dõi</p>
                  <p className="text-2xl font-bold text-slate-900">{getRoomLabel(currentRoom)}</p>
                </div>
                <Database className="h-6 w-6 text-slate-400" />
              </div>
            </Card>
            <Card padding="sm" className="rounded-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Bản ghi đã tải</p>
                  <p className="text-2xl font-bold text-indigo-600">{history.length}</p>
                </div>
                <LineChart className="h-6 w-6 text-indigo-400" />
              </div>
            </Card>
            <Card padding="sm" className="rounded-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Cập nhật gần nhất</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {latestItem ? formatDateTime(latestItem.timestamp) : "Chưa có dữ liệu"}
                  </p>
                </div>
                <Clock3 className="h-6 w-6 text-emerald-400" />
              </div>
            </Card>
          </div>

          <Card className="mb-6 rounded-3xl">
            <CardHeader>
              <CardTitle>Biểu đồ lịch sử cảm biến</CardTitle>
            </CardHeader>
            <HistoryChart height={350} />
          </Card>

          <Card padding="none" className="overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Bảng dữ liệu chi tiết</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Hiển thị 20 bản ghi gần nhất của phòng đang có trong thời khóa biểu hiện tại.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
                <Activity className="h-4 w-4" />
                Realtime history
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Thời gian
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Nhiệt độ
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Độ ẩm
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      CO2
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                        Chưa có dữ liệu để hiển thị.
                      </td>
                    </tr>
                  ) : (
                    [...history]
                      .reverse()
                      .slice(0, 20)
                      .map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                          <td className="px-5 py-4 text-sm font-medium text-slate-900">
                            {formatDateTime(item.timestamp)}
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-orange-600">
                            {item.temp.toFixed(1)}°C
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-sky-600">
                            {item.humidity.toFixed(1)}%
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-violet-600">
                            {item.co2.toFixed(0)} ppm
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </Layout>
  );
};

export default History;
