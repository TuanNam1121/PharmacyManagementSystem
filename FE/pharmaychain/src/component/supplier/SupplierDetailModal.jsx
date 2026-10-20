import { formatDate, formatStatus } from '../../utils/format';

export default function SupplierDetailModal({ show, onHide, detail, loading }) {
  if (!show) return null;

  const st = detail ? formatStatus(detail.status) : { label: '-', variant: 'dark' };

  return (
    <div className="modal fade show" style={{ display: 'block', position: 'static' }} role="dialog" aria-modal="true" tabindex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow rounded-4">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold text-dark">Chi tiết nhà cung cấp</h5>
            <button type="button" className="btn-close" onClick={onHide} />
          </div>
          <div className="modal-body p-4">
            {loading ? (
              <div className="text-center py-4"><div className="spinner-border text-success" role="status"></div></div>
            ) : detail ? (
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="mb-3"><label className="form-label text-muted small fw-medium">Mã nhà cung cấp</label><div className="fw-medium">{detail.code}</div></div>
                  <div className="mb-3"><label className="form-label text-muted small fw-medium">Tên nhà cung cấp</label><div className="fw-bold">{detail.name}</div></div>
                  <div className="mb-3"><label className="form-label text-muted small fw-medium">Người liên hệ</label><div>{detail.contactPerson || '-'}</div></div>
                  <div className="mb-3"><label className="form-label text-muted small fw-medium">Số điện thoại</label><div>{detail.phone || '-'}</div></div>
                  <div className="mb-3"><label className="form-label text-muted small fw-medium">Email</label><div className="text-muted small">{detail.email || '-'}</div></div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3"><label className="form-label text-muted small fw-medium">Địa chỉ</label><div className="text-muted small">{detail.address || '-'}</div></div>
                  <div className="mb-3"><label className="form-label text-muted small fw-medium">Mã số thuế</label><div className="text-muted small">{detail.taxCode || '-'}</div></div>
                  <div className="mb-3"><label className="form-label text-muted small fw-medium">Ghi chú</label><div className="text-muted small">{detail.note || '-'}</div></div>
                  <div className="mb-3"><label className="form-label text-muted small fw-medium">Trạng thái</label><span className="badge bg-light text-dark border border-dark rounded-pill">{st.label}</span></div>
                  <div className="mb-3"><label className="form-label text-muted small fw-medium">Ngày tạo</label><div className="text-muted small">{formatDate(detail.createdAt)}</div></div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted py-4">Không có dữ liệu</div>
            )}
          </div>
          <div className="modal-footer border-0">
            <button type="button" className="btn btn-outline-secondary" onClick={onHide}>Đóng</button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </div>
  );
}
