export default function CustomerStats({ total = 0, customers = [] }) {
  const activeCount = customers.filter((c) => Number(c.status) === 1).length;
  const allergyCount = customers.filter((c) => Boolean(c.hasAllergies)).length;
  const purchaserCount = customers.filter(
    (c) => Number(c.totalSpent || 0) > 0
  ).length;

  const stats = [
    {
      label: 'Tổng Số Khách Hàng',
      value: total.toLocaleString('vi-VN'),
      sub: 'hồ sơ khách hàng',
      iconColor: 'emerald',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Đang Hoạt Động',
      value: activeCount.toLocaleString('vi-VN'),
      sub: 'tài khoản giao dịch',
      iconColor: 'blue',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: 'Đã Phát Sinh Mua Hàng',
      value: purchaserCount.toLocaleString('vi-VN'),
      sub: 'có lịch sử hóa đơn',
      iconColor: 'violet',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
    },
    {
      label: 'Cảnh Báo Dị Ứng Thuốc',
      value: allergyCount.toLocaleString('vi-VN'),
      sub: 'cần lưu ý khi kê đơn',
      iconColor: 'amber',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
  ];

  return (
    <div className="pms-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', width: '100%', marginBottom: 20 }}>
      {stats.map((s) => (
        <div className="pms-stat-card" key={s.label}>
          <div className={`pms-stat-icon ${s.iconColor}`}>{s.icon}</div>
          <div>
            <div className="pms-stat-label">{s.label}</div>
            <div className="pms-stat-value" style={{ whiteSpace: 'nowrap' }}>{s.value}</div>
            <div className="pms-stat-sub">{s.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

