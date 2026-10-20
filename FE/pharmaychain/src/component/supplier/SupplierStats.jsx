export default function SupplierStats({ total, active, inactive }) {
  return (
    <div className="row g-3 mb-4">
      <div className="col-md-3 col-6">
        <div className="card h-100 border-0 shadow-sm rounded-4 bg-white">
          <div className="card-body p-3">
            <div className="text-muted small fw-medium">Tổng nhà cung cấp</div>
            <div className="fs-4 fw-bold text-dark">{total}</div>
          </div>
        </div>
      </div>
      <div className="col-md-3 col-6">
        <div className="card h-100 border-0 shadow-sm rounded-4 bg-white">
          <div className="card-body p-3">
            <div className="text-dark small fw-medium">Đang hoạt động</div>
            <div className="fs-4 fw-bold text-dark">{active}</div>
          </div>
        </div>
      </div>
      <div className="col-md-3 col-6">
        <div className="card h-100 border-0 shadow-sm rounded-4 bg-white">
          <div className="card-body p-3">
            <div className="text-dark small fw-medium">Không hoạt động</div>
            <div className="fs-4 fw-bold text-dark">{inactive}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
