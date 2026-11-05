import { useState } from 'react';

export default function CustomerDeleteModal({
  show,
  onHide,
  customer,
  onConfirm,
  loading = false,
}) {
  const [reason, setReason] = useState('Khách hàng yêu cầu ngừng sử dụng dịch vụ');
  const [error, setError] = useState(null);

  if (!show || !customer) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do vô hiệu hóa khách hàng');
      return;
    }
    setError(null);
    if (onConfirm) {
      onConfirm(customer.customerId || customer.id, reason.trim());
    }
  };

  return (
    <div
      className="pms-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onHide();
      }}
    >
      <div className="pms-modal" style={{ maxWidth: 520 }}>
        {/* Header */}
        <div className="pms-modal-header" style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <div className="pms-modal-title" style={{ color: '#f87171' }}>
                Vô Hiệu Hóa Khách Hàng
              </div>
              <div className="pms-modal-sub">
                Tạm dừng quyền phát sinh đơn hàng mới của khách hàng này
              </div>
            </div>
          </div>
          <button className="pms-modal-close" onClick={onHide} disabled={loading} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="pms-modal-body" style={{ padding: '20px 24px' }}>
            {/* Customer Summary Card */}
            <div
              style={{
                padding: '12px 16px',
                background: 'var(--bg-canvas)',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                marginBottom: 16,
                fontSize: 13,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Mã khách hàng:</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                  {customer.customerCode || `KH-${customer.customerId || customer.id}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Họ và tên:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{customer.fullName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Số điện thoại:</span>
                <span style={{ fontWeight: 500 }}>{customer.phone || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Số đơn đã mua:</span>
                <span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>
                  {customer.totalOrders ?? 0} đơn hàng
                </span>
              </div>
            </div>

            {/* Warning text */}
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 6,
                fontSize: 12.5,
                color: 'var(--text-secondary)',
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#f87171' }}>Lưu ý an toàn:</strong> Khách hàng sẽ được chuyển sang trạng thái{' '}
              <strong>Ngừng hoạt động (status = 0)</strong> và ẩn khỏi ô tìm kiếm tại quầy POS. Toàn bộ hóa đơn cũ vẫn được bảo lưu nguyên vẹn để phục vụ kế toán.
            </div>

            {/* Reason */}
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Lý do vô hiệu hóa *
              </label>
              <textarea
                className={`pms-input ${error ? 'error' : ''}`}
                rows={3}
                placeholder="Nhập lý do chi tiết..."
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError(null);
                }}
                style={{ resize: 'vertical' }}
              />
              {error && <div style={{ color: '#f87171', fontSize: 11.5, marginTop: 4 }}>{error}</div>}
            </div>
          </div>

          {/* Footer */}
          <div className="pms-modal-footer">
            <button type="button" className="pms-btn pms-btn-ghost" onClick={onHide} disabled={loading}>
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="pms-btn pms-btn-danger"
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 140, justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <div className="pms-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  <span>Đang xử lý…</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>Xác nhận vô hiệu hóa</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
