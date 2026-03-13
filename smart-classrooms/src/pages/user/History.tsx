import React from "react";
import Layout from "../../components/layout/Layout";
import Card, { CardHeader, CardTitle } from "../../components/ui/Card";
import HistoryChart from "../../components/charts/HistoryChart";
import { useSensorStore } from "../../store";
import { formatDateTime } from "../../utils";

const History: React.FC = () => {
  const { history } = useSensorStore();

  return (
    <Layout
      title="Lịch sử"
      subtitle="Dữ liệu cảm biến theo thời gian"
      isAdmin={false}
    >
      {/* Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Biểu đồ lịch sử</CardTitle>
        </CardHeader>
        <HistoryChart height={350} />
      </Card>

      {/* Data Table */}
      <Card padding="none">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Dữ liệu chi tiết
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhiệt độ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Độ ẩm
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                [...history]
                  .reverse()
                  .slice(0, 20)
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDateTime(item.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-orange-600">
                        {item.temp.toFixed(1)}°C
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">
                        {item.humidity.toFixed(1)}%
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
};

export default History;
