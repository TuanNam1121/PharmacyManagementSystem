export default function PurchaseProposalRejectModal({
  show,
  onHide,
  code,
  reason,
  onReasonChange,
  onSubmit,
  submitting,
}) {
  if (!show) return null;

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !submitting) onHide(); }}>
      <div className="pms-modal" style={{ maxWidth: 480 }}>
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">Từ Chối Đề Xuất Mua Hàng</div>
            <div className="pms-modal-sub">
              {code ? `Đề xuất ${code}` : 'Từ chối đề xuất mua hàng này'}
            </div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="pms-modal-body">
            <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Lý do từ chối <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(không bắt buộc)</span>
            </div>
            <textarea
              className="pms-input"
              rows={3}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Ví dụ: Đơn giá chưa tối ưu, đề nghị đàm phán lại báo giá với nhà cung cấp..."
              disabled={submitting}
              style={{ width: '100%', resize: 'vertical' }}
              autoFocus
            />
          </div>

          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn-pms btn-pms-danger" disabled={submitting}>
              {submitting ? 'Đang xử lý…' : 'Xác Nhận Từ Chối'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}