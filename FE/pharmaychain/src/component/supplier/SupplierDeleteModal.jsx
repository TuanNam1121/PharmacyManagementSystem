export default function SupplierDeleteModal({
  show,
  onHide,
  supplierName,
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
            <div className="pms-modal-title">Deactivate Supplier</div>
            <div className="pms-modal-sub">
              {supplierName ? `Supplier ${supplierName}` : 'Deactivate this supplier'}
            </div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="pms-modal-body">
            <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Delete Reason <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
            </div>
            <textarea
              className="pms-input"
              rows={3}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="e.g. Supplier no longer meets compliance requirements..."
              disabled={submitting}
              style={{ width: '100%', resize: 'vertical' }}
              autoFocus
            />
          </div>

          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-pms btn-pms-danger" disabled={submitting}>
              {submitting ? 'Deactivating…' : 'Deactivate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}