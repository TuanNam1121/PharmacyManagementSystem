import { useState, useEffect } from 'react';

export default function ProductStatusModal({
  show,
  onHide,
  product,
  onConfirm,
}) {
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isCurrentlyActive = Number(product?.status) === 1;

  useEffect(() => {
    if (show) {
      setErrorMsg(null);
    }
  }, [show]);

  if (!show || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      // Toggle status: 1 -> 0 (Ngừng kinh doanh), other -> 1 (Đang kinh doanh)
      const targetStatus = isCurrentlyActive ? 0 : 1;
      await onConfirm(product.id, targetStatus);
      onHide();
    } catch (err) {
      setErrorMsg(err?.message || 'Cập nhật trạng thái thuốc thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-md">
        {/* Header */}
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">
              {isCurrentlyActive ? 'Tạm Ngừng Kinh Doanh Thuốc' : 'Kích Hoạt Kinh Doanh Thuốc'}
            </div>
            <div className="pms-modal-sub">
              Sản phẩm: <strong>{product.name}</strong> {product.unit ? `(${product.unit})` : ''}
            </div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="pms-modal-body">
            {errorMsg && (
              <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errorMsg}
              </div>
            )}

            {isCurrentlyActive ? (
              <div>
                <p style={{ fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 14 }}>
                  Bạn có chắc chắn muốn chuyển trạng thái sản phẩm <strong>"{product.name}"</strong> sang{' '}
                  <span className="pms-badge pms-badge-danger">NGỪNG KINH DOANH</span> không?
                </p>

                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--border-radius-md)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    fontSize: 12.5,
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                  }}
                >
                  <strong style={{ color: 'var(--status-danger)' }}>Lưu ý nghiệp vụ GSP:</strong>
                  <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                    <li>Hệ thống <strong>không xóa vĩnh viễn</strong> để bảo toàn lịch sử giao dịch bán lẻ và đối soát kho.</li>
                    <li>Thuốc sẽ tạm dừng hiển thị tại màn hình thu ngân POS và tìm kiếm bán lẻ.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 14 }}>
                  Bạn có chắc chắn muốn kích hoạt lại sản phẩm <strong>"{product.name}"</strong> sang trạng thái{' '}
                  <span className="pms-badge pms-badge-success">ĐANG KINH DOANH</span>?
                </p>
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--border-radius-md)',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontSize: 12.5,
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                  }}
                >
                  <strong style={{ color: 'var(--brand-primary)' }}>Thông tin:</strong> Sản phẩm sẽ tiếp tục hiển thị tại quầy bán lẻ POS và cho phép thực hiện nhập/xuất kho bình thường.
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
              Hủy
            </button>
            <button
              type="submit"
              className={`btn-pms ${isCurrentlyActive ? 'btn-pms-danger' : 'btn-pms-primary'}`}
              disabled={submitting}
            >
              {submitting
                ? 'Đang xử lý…'
                : isCurrentlyActive
                ? 'Xác Nhận Ngừng Kinh Doanh'
                : 'Kích Hoạt Thuốc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
