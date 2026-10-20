export default function SupplierFilters({ search, statusFilter, onSearch, onStatus, total }) {
  return (
    <div className="card border-0 shadow-sm mb-4 rounded-4">
      <div className="card-body p-3">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <svg className="bi bi-search" width="16" height="16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.397h-.001c.03.04.062.078.098.115l1.57 1.57a1 1 0 0 0 1.414 0l.004-.004-1.57-1.57a1 1 0 0 0-1.414 0zm0-9A8 8 0 1 1 0 8a8 8 0 0 1 11.742-9zM12 6.5a5.5 5.5 0 1 0-11 0 5.5 5.5 0 0 0 11 0z"/></svg>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Tìm theo tên, mã NCC, SĐT..."
                value={search}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select border-0 shadow-none" value={statusFilter} onChange={(e) => onStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="1">Hoạt động</option>
              <option value="0">Không hoạt động</option>
            </select>
          </div>
          <div className="col-md-5 d-flex justify-content-end">
            <span className="text-muted small me-2">Tổng: {total} nhà cung cấp</span>
          </div>
        </div>
      </div>
    </div>
  );
}
