export default function CategoryStats({ total = 0, categories = [] }) {
  const activeCount = categories.filter((c) => String(c.status) === '1').length;
  const inactiveCount = categories.filter((c) => String(c.status) === '0').length;

  const stats = [
    {
      label: 'Total Categories',
      value: total,
      sub: 'taxonomy entries',
      iconColor: 'indigo',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      label: 'Active Categories',
      value: activeCount,
      sub: 'available for products',
      iconColor: 'blue',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    {
      label: 'Inactive Categories',
      value: inactiveCount,
      sub: 'suspended or archived',
      iconColor: 'red',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
  ];

  return (
    <div className="pms-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {stats.map((s) => (
        <div className="pms-stat-card" key={s.label}>
          <div className={`pms-stat-icon ${s.iconColor}`}>{s.icon}</div>
          <div>
            <div className="pms-stat-label">{s.label}</div>
            <div className="pms-stat-value">{s.value}</div>
            <div className="pms-stat-sub">{s.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
