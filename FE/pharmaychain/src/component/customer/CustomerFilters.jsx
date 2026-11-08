export default function CustomerFilters({
  keyword,
  statusFilter,
  onKeywordChange,
  onStatusChange,
  onAddNew,
  onExport,
  total = 0,
}) {
  return (
    <div className="pms-filters-bar">
      {/* Search Input */}
      <div className="pms-input-wrap" style={{ flex: 1, minWidth: 260, maxWidth: 380 }}>
        <span className="pms-input-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          className="pms-input"
          type="text"
          placeholder="Tìm theo SĐT, Họ tên, Mã KH..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
        {keyword && (
          <button
            type="button"
            onClick={() => onKeywordChange('')}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 2,
            }}
            title="Xóa tìm kiếm"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Status Filter */}
      <select
        className="pms-select"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        style={{ minWidth: 150 }}
      >
        <option value="">Tất cả trạng thái</option>
        <option value="1">Đang hoạt động</option>
        <option value="0">Ngừng hoạt động</option>
      </select>

      {/* Total Count */}
      <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
        Tìm thấy <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> khách hàng
      </span>

      {/* Export Button */}
      {onExport && (
        <button
          className="btn-pms btn-pms-secondary"
          onClick={onExport}
          title="Xuất danh sách khách hàng"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Xuất file
        </button>
      )}

      {/* Register New Customer Button */}
      <button
        className="btn-pms btn-pms-primary"
        onClick={onAddNew}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Đăng ký mới
      </button>
    </div>
  );
}

