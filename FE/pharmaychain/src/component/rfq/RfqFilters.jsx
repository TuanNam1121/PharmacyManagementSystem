export default function RfqFilters({
  search,
  statusFilter,
  total,
  onSearch,
  onStatusChange,
}) {
  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'SENT', label: 'Đã gửi' },
    { value: 'RESPONDED', label: 'Đã phản hồi' },
    { value: 'EXPIRED', label: 'Đã hết hạn' },
  ];

  return (
    <div className="pms-filters-bar">
      {/* Search Input */}
      <div className="pms-input-wrap" style={{ flex: 1, maxWidth: 360 }}>
        <span className="pms-input-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          className="pms-input"
          type="text"
          placeholder="Tìm theo mã RFQ hoặc nhà cung cấp…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Status Filter */}
      <select
        className="pms-select"
        style={{ width: 180 }}
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        {statusOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
        Tổng cộng: <strong style={{ color: 'var(--text-primary)' }}>{total ?? 0}</strong> yêu cầu báo giá
      </span>
    </div>
  );
}