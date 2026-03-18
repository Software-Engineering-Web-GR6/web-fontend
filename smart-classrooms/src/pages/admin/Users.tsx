import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const users = [
  { id: '1', name: 'Nguyễn Văn A', email: 'a@edu.vn', role: 'admin', room: 'all' },
  { id: '2', name: 'Trần Thị B', email: 'b@edu.vn', role: 'user', room: 'A101' },
  { id: '3', name: 'Lê Văn C', email: 'c@edu.vn', role: 'user', room: 'A102' },
  { id: '4', name: 'Phạm Thị D', email: 'd@edu.vn', role: 'user', room: 'B201' },
];

export function AdminUsers() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Quản lý người dùng</h1>
      <Card>
        <CardHeader title="Danh sách người dùng" subtitle={`${users.length} người dùng`} />
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="pb-2">Họ tên</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Vai trò</th>
              <th className="pb-2">Phòng</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 last:border-0">
                <td className="py-2 font-medium">{user.name}</td>
                <td className="py-2 text-gray-600">{user.email}</td>
                <td className="py-2">
                  <Badge
                    label={user.role === 'admin' ? 'Admin' : 'User'}
                    color={user.role === 'admin' ? 'blue' : 'gray'}
                  />
                </td>
                <td className="py-2 text-gray-600">{user.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
