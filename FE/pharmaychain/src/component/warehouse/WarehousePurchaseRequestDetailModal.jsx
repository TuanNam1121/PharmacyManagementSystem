import { formatDate } from '../../utils/format';

export default function WarehousePurchaseRequestDetailModal({ show, onHide, detail, loading }) {
  if (!show) return null;

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-lg">
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">
              Purchase Request {detail?.code ? `— ${detail.code}` : ''}
            </div>
            <div className="pms-modal-sub">Replenishment request submitted to procurement</div>
          </div>
          <button className="pms-modal-close" onClick={onHide}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="pms-modal-body">
          {loading ? (
            <div className="pms-spinner-wrap">
              <div className="pms-spinner" />
              <span className="pms-spinner-text">Loading request details…</span>
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
                  <div className="pms-detail-label">Request Code</div>
                  <div className="pms-detail-value mono fw-700">{detail.code}</div>
                </div>
                <div className="pms-detail-row">
                  <div className="pms-detail-label">Status</div>
                  <div style={{ marginTop: 2 }}>
                    <span className="pms-badge pms-badge-info">{detail.statusText || 'Submitted'}</span>
                  </div>
                </div>
                <div className="pms-detail-row">
                  <div className="pms-detail-label">Submitted Date</div>
                  <div className="pms-detail-value">{formatDate(detail.createdAt)}</div>
                </div>
                <div className="pms-detail-row">
                  <div className="pms-detail-label">Created By</div>
                  <div className="pms-detail-value fw-600">{detail.createdByUsername || 'Warehouse Staff'}</div>
                </div>
              </div>

              {detail.reason && (
                <div style={{
                  padding: '12px 16px', background: 'var(--bg-card)',
                  borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)',
                  marginBottom: 20, fontSize: 13,
                }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Reason: </strong>
                  <span style={{ color: 'var(--text-secondary)' }}>{detail.reason}</span>
                </div>
              )}

              {/* Items table */}
              <div className="pms-card">
                <div className="pms-table-wrap">
                  <table className="pms-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th>Medicine / Product</th>
                        <th>Barcode</th>
                        <th>Unit</th>
                        <th className="text-right">Requested Qty</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.items && detail.items.length > 0 ? (
                        detail.items.map((item, i) => (
                          <tr key={item.id || i}>
                            <td className="text-xs text-muted-color">{i + 1}</td>
                            <td><span className="fw-600" style={{ fontSize: 13 }}>{item.productName}</span></td>
                            <td><span className="pms-badge pms-badge-neutral mono">{item.productCode || '—'}</span></td>
                            <td className="text-sm text-secondary-color">{item.unit || '—'}</td>
                            <td className="text-right fw-700" style={{ fontSize: 14 }}>{item.requestedQuantity}</td>
                            <td className="text-sm text-muted-color">{item.note || '—'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                            No items in this request.
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

        <div className="pms-modal-footer">
          <button className="btn-pms btn-pms-secondary" onClick={onHide}>Close</button>
        </div>
      </div>
    </div>
  );
}
