import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { User, Mail, Shield, MoreVertical } from "lucide-react";

const Users: React.FC = () => {
  const users = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      email: "admin@school.edu",
      role: "admin",
      status: "active",
    },
    {
      id: "2",
      name: "Trần Thị B",
      email: "teacher1@school.edu",
      role: "user",
      status: "active",
    },
    {
      id: "3",
      name: "Lê Văn C",
      email: "teacher2@school.edu",
      role: "user",
      status: "active",
    },
    {
      id: "4",
      name: "Phạm Thị D",
      email: "staff@school.edu",
      role: "user",
      status: "inactive",
    },
  ];

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;
  const activeCount = users.filter((u) => u.status === "active").length;

  return (
    <Layout
      title="Người dùng"
      subtitle="Quản lý tài khoản người dùng"
      isAdmin={true}
    >
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng người dùng</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <User className="w-6 h-6 text-gray-400" />
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Quản trị viên</p>
              <p className="text-2xl font-bold text-indigo-600">{adminCount}</p>
            </div>
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
            <Badge variant="success">
              {activeCount}/{users.length}
            </Badge>
          </div>
        </Card>
      </div>

      {/* User Table */}
      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Danh sách người dùng
          </h2>
          <Button size="sm">Thêm người dùng</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === "admin" ? "info" : "default"}>
                      {user.role === "admin" ? "Quản trị" : "Người dùng"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={user.status === "active" ? "success" : "default"}
                      size="sm"
                    >
                      {user.status === "active"
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
};

export default Users;
