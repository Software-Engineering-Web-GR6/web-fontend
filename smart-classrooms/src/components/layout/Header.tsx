import { useState, useEffect } from 'react';

export function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <h2 className="text-base font-medium text-gray-700">
        Hệ thống quản lý phòng học thông minh
      </h2>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>🟢 Đang kết nối</span>
        <span>{time.toLocaleString('vi-VN')}</span>
      </div>
    </header>
  );
}
