import { formatDate, money, getInitials } from '../../utils/format';

export default function ProductDetailModal({
  show,
  onHide,
  detail,
  loading = false,
  onEdit,
}) {
  if (!show) return null;

  const isActive = String(detail?.status) === '1';
  const isRx = detail?.isPrescription === true;

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-lg">
        {/* Header */}
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">Product Details</div>
            <div className="pms-modal-sub">Full catalog information, pricing and product metadata</div>
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
              <span className="pms-spinner-text">Loading product details…</span>
            </div>
          ) : !detail ? (
            <div className="pms-empty">
              <div className="pms-empty-title">Product information not available</div>
            </div>
          ) : (
            <div>
              {/* Product Banner */}
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
                  {getInitials(detail.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {detail.name}
                    </h3>
                    {isActive ? (
                      <span className="pms-badge pms-badge-success">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                        Active
                      </span>
                    ) : (
                      <span className="pms-badge pms-badge-danger">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                        Inactive
                      </span>
                    )}
                    {isRx ? (
                      <span className="pms-badge pms-badge-warning">Rx</span>
                    ) : (
                      <span className="pms-badge pms-badge-neutral">OTC</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {detail.categoryName && (
                      <span>Category: <strong style={{ color: 'var(--text-secondary)' }}>{detail.categoryName}</strong></span>
                    )}
                    {detail.barcode && (
                      <span>Barcode: <strong className="mono" style={{ color: 'var(--text-primary)' }}>{detail.barcode}</strong></span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2-Column Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Pricing & Stock */}
                <div
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                    Pricing &amp; Stock
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Selling Price:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>{money(detail.sellingPrice)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Cost Price:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{money(detail.costPrice)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Unit:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{detail.unit || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Minimum Stock:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{detail.minQuantity ?? '—'}</strong>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                    Product Info
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Active Ingredient:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{detail.activeIngredient || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Manufacturer:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{detail.manufacturer || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Added On:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{formatDate(detail.createdAt)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Last Updated:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{formatDate(detail.updatedAt) || '—'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {detail.description && (
                <div
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                    Description
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-canvas)', padding: '10px 12px', borderRadius: 6 }}>
                    {detail.description}
                  </div>
                </div>
              )}
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
              Edit Product
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
