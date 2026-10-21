import { formatDate, getInitials } from '../../utils/format';

export default function SupplierDetailModal({
  show,
  onHide,
  detail,
  loading = false,
  onEdit,
}) {
  if (!show) return null;

  const isActive = String(detail?.status) === '1';

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-lg">
        {/* Header */}
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">Supplier Partner Profile</div>
            <div className="pms-modal-sub">View business details, tax records, and contact credentials</div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="pms-modal-body">
          {loading ? (
            <div className="pms-spinner-wrap" style={{ padding: '40px 0' }}>
              <div className="pms-spinner" />
              <span className="pms-spinner-text">Loading supplier details…</span>
            </div>
          ) : !detail ? (
            <div className="pms-empty">
              <div className="pms-empty-title">Supplier information not available</div>
            </div>
          ) : (
            <div>
              {/* Partner Card Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 16,
                  background: 'var(--bg-canvas)',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid var(--border-color)',
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(59, 130, 246, 0.25))',
                    color: 'var(--brand-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 18,
                    flexShrink: 0,
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                  }}
                >
                  {getInitials(detail.code || detail.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {detail.name}
                    </h3>
                    {(() => {
                      const s = String(detail.status || '').toUpperCase();
                      if (s === '1' || s === 'ACTIVE') {
                        return (
                          <span className="pms-badge pms-badge-success">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                            Active
                          </span>
                        );
                      }
                      if (s === '3' || s === 'PENDING') {
                        return (
                          <span className="pms-badge pms-badge-warning">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                            Pending
                          </span>
                        );
                      }
                      return (
                        <span className="pms-badge pms-badge-danger">
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                          Inactive
                        </span>
                      );
                    })()}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 10 }}>
                    <span>Supplier Code: <strong className="mono" style={{ color: 'var(--text-primary)' }}>{detail.code}</strong></span>
                    {detail.taxCode && <span>Tax ID: <strong className="mono" style={{ color: 'var(--text-primary)' }}>{detail.taxCode}</strong></span>}
                  </div>
                </div>
              </div>

              {/* 2-Column Info Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Contact Information */}
                <div
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                    Contact Details
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Representative:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{detail.contactPerson || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Phone Number:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{detail.phone || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Email Address:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{detail.email || '—'}</strong>
                    </div>
                  </div>
                </div>

                {/* Corporate & Registration */}
                <div
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                    Business & Compliance
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Tax Code:</span>{' '}
                      <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{detail.taxCode || '—'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Registered On:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{formatDate(detail.createdAt)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Last Updated:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{formatDate(detail.updatedAt) || '—'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address & Note */}
              <div
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                    Business Address
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                    {detail.address || 'No address registered.'}
                  </div>
                </div>

                {detail.note && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                      Internal Procurement Notes
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-canvas)', padding: '10px 12px', borderRadius: 6 }}>
                      {detail.note}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pms-modal-footer">
          <button className="btn-pms btn-pms-secondary" onClick={onHide}>Close</button>
          {detail && onEdit && (
            <button
              className="btn-pms btn-pms-primary"
              onClick={() => {
                onHide();
                onEdit(detail);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Supplier
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
