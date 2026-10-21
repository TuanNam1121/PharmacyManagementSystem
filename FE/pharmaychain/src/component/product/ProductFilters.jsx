export default function ProductFilters({
  search,
  statusFilter,
  categoryFilter,
  categories = [],
  onSearch,
  onStatus,
  onCategory,
  onAddNew,
  total = 0,
}) {
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
          placeholder="Search by name, barcode, manufacturer…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <select
        className="pms-select"
        value={categoryFilter}
        onChange={(e) => onCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={String(cat.id)}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        className="pms-select"
        value={statusFilter}
        onChange={(e) => onStatus(e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </select>

      {/* Results Count */}
      <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
        Found <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> products
      </span>

      {/* Add Product Button */}
      <button className="btn-pms btn-pms-primary" onClick={onAddNew}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New Product
      </button>
    </div>
  );
}
