export default function CustomerStats({ total = 0, customers = [] }) {
  const activeCount = customers.filter((c) => Number(c.status) === 1).length;
  const allergyCount = customers.filter((c) => Boolean(c.hasAllergies)).length;
  const goldOrDiamond = customers.filter(
    (c) => c.membershipTier === 'GOLD' || c.membershipTier === 'DIAMOND'
  ).length;

  const stats = [
    {
      label: 'Tổng số khách hàng',
      value: total,
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
      label: 'Đang hoạt động',
      value: activeCount,
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
      label: 'Hạng VIP (Gold & Diamond)',
      value: goldOrDiamond,
      sub: 'thành viên thân thiết',
      iconColor: 'purple',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      label: 'Cảnh báo dị ứng thuốc',
      value: allergyCount,
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
    <div className="pms-stats-grid">
      {stats.map((s, idx) => (
        <div key={idx} className="pms-stat-card">
          <div className="pms-stat-header">
            <span className="pms-stat-label">{s.label}</span>
            <div className={`pms-stat-icon pms-stat-icon-${s.iconColor}`}>{s.icon}</div>
          </div>
          <div className="pms-stat-value">{s.value.toLocaleString('vi-VN')}</div>
          <div className="pms-stat-sub">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}
