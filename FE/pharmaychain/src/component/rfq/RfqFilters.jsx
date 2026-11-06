export default function RfqFilters({
  search,
  statusFilter,
  onSearch,
  onStatusChange,
}) {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'SENT', label: 'Sent' },
    { value: 'RESPONDED', label: 'Responded' },
    { value: 'EXPIRED', label: 'Expired' },
  ];

  return (
    <div className="pms-filters-bar">
      {/* Search Input */}
      <div className="pms-input-wrap" style={{ flex: 1, maxWidth: 340 }}>
        <span className="pms-input-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          className="pms-input"
          type="text"
          placeholder="Search RFQ code, supplier, proposal…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Status Filter */}
      <select
        className="pms-select"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        {statusOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}