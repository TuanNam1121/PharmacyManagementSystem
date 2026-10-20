import { formatDate, formatStatus, getInitials } from '../../utils/format';

export default function SupplierTable({ data, loading, onView }) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-2 text-muted">Đang tải danh sách nhà cung cấp...</p>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th className="border-0 fw-medium text-muted small" style={{ width: 40 }}>#</th>
              <th className="border-0 fw-medium text-muted small" style={{ width: 52 }}></th>
              <th className="border-0 fw-medium text-muted small">Mã NCC</th>
              <th className="border-0 fw-medium text-muted small">Nhà cung cấp</th>
              <th className="border-0 fw-medium text-muted small">Người liên hệ</th>
              <th className="border-0 fw-medium text-muted small">SĐT</th>
              <th className="border-0 fw-medium text-muted small">Email</th>
              <th className="border-0 fw-medium text-muted small">Địa chỉ</th>
              <th className="border-0 fw-medium text-muted small" style={{ width: 130 }}>Trạng thái</th>
              <th className="border-0 fw-medium text-muted small" style={{ width: 110 }}>Ngày tạo</th>
              <th className="border-0 fw-medium text-muted small text-end" style={{ width: 110 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const st = formatStatus(row.status);
              return (
                <tr key={row.id || i}>
                  <td className="border-0 text-muted small">{i + 1}</td>
                  <td className="border-0">
                    <div className="avatar-sm rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                      {getInitials(row.code)}
                    </div>
                  </td>
                  <td className="border-0 fw-medium">{row.code}</td>
                  <td className="border-0 fw-medium">{row.name}</td>
                  <td className="border-0">{row.contactPerson || '-'}</td>
                  <td className="border-0">{row.phone || '-'}</td>
                  <td className="border-0 text-muted small">{row.email || '-'}</td>
                  <td className="border-0 text-muted small">{row.address || '-'}</td>
                  <td className="border-0">
                    <span className="badge bg-light text-dark border border-dark rounded-pill">{st.label}</span>
                  </td>
                  <td className="border-0 text-muted small">{formatDate(row.createdAt)}</td>
                  <td className="border-0 text-end">
                    <div className="d-inline-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary" title="Xem chi tiết" onClick={() => onView(row.id)}>
                        <svg className="bi bi-eye" width="14" height="14"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13 13 0 0 1 1.602-2.805C1.4 6.651 1 8 1 8s0.55 1.349 1.373 2.417.4.681.217 1.193C1.72 13.088 5.5 16 5.5 16s3.779-2.912 6.83-4.704c0.29-0.613 0.09-1.434-0.217-1.797C9.513 9.349 9 8 9 8s-0.39-1.349-1.173-2.805c-0.434-0.802-0.833-1.568-0.833-2.805S3.739 5.197 4.173 4.39 4.8 2.885 5.19 2.29C6.582 1.035 8.521 0 8.521 0S10.439 1.035 11.81 2.29c0.39 0.595 0.588 1.519 0.588 2.29s-0.198 1.695-0.833 2.805C11.393 10.651 11 12 11 12s0.4-1.349 1.227-2.417c0.414-0.568 0.318-1.298 0.217-1.797C13.898 5.195 14.827 8 14.827 8s-0.4 1.349-1.227 2.417c-0.414 0.568-0.318 1.298-0.217 1.797C9.379 13.088 5.5 16 5.5 16s-3.78-2.912-6.83-4.704c-0.29-0.613-0.09-1.434 0.217-1.797C4.463 9.349 5 8 5 8s0.4-1.349 1.173-2.805c0.434-0.802 0.833-1.568 0.833-2.805z"/></svg>
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" title="Sửa" disabled>
                        <svg className="bi bi-pencil" width="14" height="14"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10a.5.5 0 0 1 .708 0zM2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1H2.5zm1 4a.5.5 0 0 1 0-1h3a.5.5 0 0 1 0 1h-3z"/></svg>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" title="Xóa" disabled>
                        <svg className="bi bi-trash" width="14" height="14"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0V6a.5.5 0 0 0-1 0V6a.5.5 0 0 0-1 0V6a.5.5 0 0 0-1 0V6a.5.5 0 0 0-1 0V6a.5.5 0 0 0-1 0V6a.5.5 0 0 0-1 0V6a.5.5 0 0 0-1 0V6a.5.5 0 0 0-1 0V6a.5.5 0 0 0-1 0zM8 4a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4zM3.5 9a.5.5 0 0 0-1 0V7a.5.5 0 0 0-1 0V7a.5.5 0 0 0-1 0V7a.5.5 0 0 0-1 0V7a.5.5 0 0 0-1 0V7a.5.5 0 0 0-1 0zM11 7.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8a.5.5 0 0 1 .5-.5zM4.5 5.5A.5.5 0 0 1 5 5v6a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5zM6 4.5a.5.5 0 0 0 0-1H5.5a.5.5 0 0 0 0 1H6z"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
