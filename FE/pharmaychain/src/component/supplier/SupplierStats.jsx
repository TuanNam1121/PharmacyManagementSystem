export default function SupplierStats({ total = 0, suppliers = [] }) {
  const activeCount = suppliers.filter((s) => String(s.status) === '1').length;
  const inactiveCount = suppliers.filter((s) => String(s.status) === '0').length;
  const withTaxCodeCount = suppliers.filter((s) => Boolean(s.taxCode)).length;

  const stats = [
    {
      label: 'Total Suppliers',
      value: total,
      sub: 'registered vendors',
      iconColor: 'emerald',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      label: 'Active Partners',
      value: activeCount,
      sub: 'procurement-ready',
      iconColor: 'blue',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
    },
    {
      label: 'Inactive Partners',
      value: inactiveCount,
      sub: 'suspended or paused',
      iconColor: 'red',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ),
    },
    {
      label: 'Tax Compliant',
      value: withTaxCodeCount,
      sub: 'verified tax ID on file',
      iconColor: 'amber',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
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
