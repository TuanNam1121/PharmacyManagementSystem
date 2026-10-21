export default function ProductStats({ total = 0, products = [] }) {
  const activeCount = products.filter((p) => String(p.status) === '1').length;
  const inactiveCount = products.filter((p) => String(p.status) === '0').length;
  const prescriptionCount = products.filter((p) => p.isPrescription === true).length;

  const stats = [
    {
      label: 'Total Products',
      value: total,
      sub: 'items in catalog',
      iconColor: 'emerald',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
    },
    {
      label: 'Active Products',
      value: activeCount,
      sub: 'available for sale',
      iconColor: 'blue',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
    },
    {
      label: 'Prescription (Rx)',
      value: prescriptionCount,
      sub: 'require prescription',
      iconColor: 'amber',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
    },
    {
      label: 'Inactive Products',
      value: inactiveCount,
      sub: 'delisted or paused',
      iconColor: 'red',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="pms-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
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
