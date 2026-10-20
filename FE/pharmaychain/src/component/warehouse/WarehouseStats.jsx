export default function WarehouseStats({ inventoryList, total }) {
  const totalUnits = inventoryList.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const expiringSoonCount = inventoryList.filter((x) => x.expiryStatus === 'EXPIRING_SOON').length;
  const expiredCount = inventoryList.filter((x) => x.expiryStatus === 'EXPIRED').length;
  const totalValue = inventoryList.reduce((acc, curr) => acc + (curr.totalValue || 0), 0);

  const stats = [
    {
      label: 'Total Batches (SKUs)',
      value: total,
      iconColor: 'emerald',
      sub: 'across all shelves',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
    },
    {
      label: 'Total Units in Stock',
      value: totalUnits.toLocaleString('en-US'),
      iconColor: 'blue',
      sub: 'units available',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
        </svg>
      ),
    },
    {
      label: 'Expiring Soon (≤90d)',
      value: expiringSoonCount,
      iconColor: 'amber',
      sub: 'batches need attention',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
    },
    {
      label: 'Expired Batches',
      value: expiredCount,
      iconColor: 'red',
      sub: 'require immediate action',
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
