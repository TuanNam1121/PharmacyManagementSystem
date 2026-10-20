export default function WarehouseFilters({
  search, expiryFilter, onSearch, onExpiryFilter, total,
}) {
  return (
    <div className="pms-filters-bar">
      {/* Search */}
      <div className="pms-input-wrap" style={{ flex: 1, maxWidth: 360 }}>
        <span className="pms-input-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          className="pms-input"
          type="text"
          placeholder="Search by product name, batch number, active ingredient…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Expiry status filter */}
      <select
        className="pms-select"
        value={expiryFilter}
        onChange={(e) => onExpiryFilter(e.target.value)}
      >
        <option value="">All Expiry Statuses</option>
        <option value="GOOD">Good — Safe</option>
        <option value="EXPIRING_SOON">Expiring Soon (≤90 days)</option>
        <option value="EXPIRED">Expired</option>
      </select>

      {/* Results count */}
      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
        <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> batches found
      </span>
    </div>
  );
}
