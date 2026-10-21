import { formatDate, money } from '../../utils/format';

export default function WarehousePurchaseReceiptDetailModal({ show, onHide, detail, loading, onConfirm, confirmLoading }) {
  if (!show) return null;

  const isConfirmed = detail?.status === 1 || detail?.statusLabel === 'Confirmed';

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-xl">
        {/* Header */}
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">
              Purchase Receipt Detail {detail?.code ? `— ${detail.code}` : ''}
            </div>
            <div className="pms-modal-sub">Itemized list of received products, batch numbers, and costs</div>
          </div>
          <button className="pms-modal-close" onClick={onHide}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="pms-modal-body">
          {loading ? (
            <div className="pms-spinner-wrap">
              <div className="pms-spinner" />
              <span className="pms-spinner-text">Loading receipt details…</span>
            </div>
          ) : detail ? (
            <div>
              {/* Summary */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
                background: 'var(--bg-canvas)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)', padding: '16px 20px', marginBottom: 20,
              }}>
                <div className="pms-detail-row">
                  <div className="pms-detail-label">Receipt Code</div>
                  <div className="pms-detail-value mono fw-700">{detail.code}</div>
                </div>
                <div className="pms-detail-row">
                  <div className="pms-detail-label">Total Value</div>
                  <div className="pms-detail-value fw-700" style={{ color: 'var(--brand-primary)' }}>{money(detail.totalAmount)}</div>
                </div>
                <div className="pms-detail-row">
                  <div className="pms-detail-label">Created Date</div>
                  <div className="pms-detail-value">{formatDate(detail.createdAt)}</div>
                </div>
                <div className="pms-detail-row">
                  <div className="pms-detail-label">Status</div>
                  <div style={{ marginTop: 2 }}>
                    <span className="pms-badge pms-badge-success">{detail.statusLabel || 'Confirmed'}</span>
                  </div>
                </div>
              </div>

              {/* Items table */}
              <div className="pms-card">
                <div className="pms-table-wrap">
                  <table className="pms-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th>Product / Medicine</th>
                        <th>Batch No.</th>
                        <th>Expiry Date</th>
                        <th className="text-right">Ordered</th>
                        <th className="text-right">Received</th>
                        <th className="text-right">Unit Cost</th>
                        <th className="text-right">Subtotal</th>
                        <th>Bin Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.items && detail.items.length > 0 ? (
                        detail.items.map((item, i) => (
                          <tr key={item.id || i}>
                            <td className="text-xs text-muted-color">{i + 1}</td>
                            <td><span className="fw-600" style={{ fontSize: 13 }}>{item.productName}</span></td>
                            <td><span className="pms-badge pms-badge-neutral mono">{item.batchNumber}</span></td>
                            <td className="text-sm text-muted-color">{formatDate(item.expiryDate)}</td>
                            <td className="text-right text-muted-color">{item.orderQuantity}</td>
                            <td className="text-right fw-700">{item.receivedQuantity}</td>
                            <td className="text-right text-sm text-secondary-color">{money(item.unitCost)}</td>
                            <td className="text-right fw-600">{money(item.subtotal)}</td>
                            <td>
                              {item.locationCode
                                ? <span className="pms-badge pms-badge-info">{item.locationCode}</span>
                                : <span className="pms-badge pms-badge-neutral" style={{ opacity: 0.7 }}>Not assigned</span>
                              }
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                            No items found in this receipt.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="pms-empty">
              <div className="pms-empty-title">No data available</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pms-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {!isConfirmed && (
              <span className="text-xs text-muted-color">
                Inspect items before accepting into warehouse inventory.
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-pms btn-pms-secondary" onClick={onHide}>Close</button>
            {!isConfirmed && onConfirm && detail && (
              <button
                className="btn-pms btn-pms-primary"
                onClick={() => onConfirm(detail.id)}
                disabled={confirmLoading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--color-success)', borderColor: 'var(--color-success)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {confirmLoading ? 'Confirming…' : 'Confirm Receipt & Accept Stock'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
