import { useState } from 'react';
import { formatDate } from '../../utils/format';

export default function WarehouseReplenishmentDetailModal({
  show,
  onHide,
  detail,
  loading,
  onApprove,
  onReject,
  onOpenDispatch,
  actionLoading,
}) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!show) return null;

  const isPending = detail?.status === 1 || detail?.status === 0 || detail?.statusText === 'Submitted';
  const isApproved = detail?.status === 2 || detail?.statusText === 'Approved';
  const isRejected = detail?.status === 3 || detail?.statusText === 'Rejected';
  const isDispatched = detail?.status === 4 || detail?.statusText === 'Dispatched';

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      alert('Please specify a rejection reason');
      return;
    }
    onReject(detail.id, rejectReason.trim());
    setRejecting(false);
    setRejectReason('');
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-xl">
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">
              Store Replenishment Request {detail?.code ? `— ${detail.code}` : ''}
            </div>
            <div className="pms-modal-sub">Stock requisition from retail branch to central warehouse</div>
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
              {/* Header metadata */}
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
                  <div className="pms-detail-label">Requesting Store</div>
                  <div className="pms-detail-value fw-700" style={{ color: 'var(--brand-primary)' }}>
                    {detail.storeName || 'Branch Store'}
                  </div>
                </div>
                <div className="pms-detail-row">
                  <div className="pms-detail-label">Requested Date</div>
                  <div className="pms-detail-value">{formatDate(detail.createdAt)}</div>
                </div>
                <div className="pms-detail-row">
                  <div className="pms-detail-label">Status</div>
                  <div style={{ marginTop: 2 }}>
                    <span className={`pms-badge ${isApproved ? 'pms-badge-success' : isRejected ? 'pms-badge-danger' : isDispatched ? 'pms-badge-info' : 'pms-badge-warning'}`}>
                      {detail.statusText || 'Pending Review'}
                    </span>
                  </div>
                </div>
              </div>

              {isRejected && detail.rejectReason && (
                <div className="pms-alert pms-alert-danger" style={{ marginBottom: 20 }}>
                  <strong>Rejection Reason: </strong> {detail.rejectReason}
                </div>
              )}

              {/* Items Table */}
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
                        <th className="text-right">Approved Qty</th>
                        <th className="text-right">Warehouse Available Stock</th>
                        <th>Stock Check</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.items && detail.items.length > 0 ? (
                        detail.items.map((item, i) => {
                          const hasEnough = item.availableStock >= (item.requestedQty || 0);
                          return (
                            <tr key={item.id || i}>
                              <td className="text-xs text-muted-color">{i + 1}</td>
                              <td><span className="fw-600" style={{ fontSize: 13 }}>{item.productName}</span></td>
                              <td><span className="pms-badge pms-badge-neutral mono">{item.productCode || '—'}</span></td>
                              <td className="text-sm text-secondary-color">{item.unit || '—'}</td>
                              <td className="text-right fw-700" style={{ fontSize: 13 }}>{item.requestedQty}</td>
                              <td className="text-right fw-700 text-sm" style={{ color: 'var(--color-success)' }}>
                                {item.approvedQty != null ? item.approvedQty : item.requestedQty}
                              </td>
                              <td className="text-right fw-600">
                                {item.availableStock != null ? item.availableStock : '—'}
                              </td>
                              <td>
                                {hasEnough ? (
                                  <span className="pms-badge pms-badge-success" style={{ fontSize: 11 }}>In Stock</span>
                                ) : (
                                  <span className="pms-badge pms-badge-warning" style={{ fontSize: 11 }}>Low Warehouse Stock</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                            No items found in this requisition.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reject prompt */}
              {rejecting && (
                <div style={{
                  marginTop: 16, padding: '16px', background: 'var(--bg-card)',
                  borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-danger)',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-danger)', marginBottom: 8 }}>
                    Specify reason for rejecting this replenishment request:
                  </div>
                  <input
                    type="text"
                    className="pms-input"
                    placeholder="e.g. Central stock reserved for hospital quota, please re-request next week..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                    <button className="btn-pms btn-pms-sm btn-pms-secondary" onClick={() => setRejecting(false)}>
                      Cancel
                    </button>
                    <button className="btn-pms btn-pms-sm btn-pms-danger" onClick={handleConfirmReject} disabled={actionLoading}>
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="pms-empty">
              <div className="pms-empty-title">No data available</div>
            </div>
          )}
        </div>

        <div className="pms-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn-pms btn-pms-secondary" onClick={onHide}>Close</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {isPending && !rejecting && (
              <>
                <button
                  className="btn-pms btn-pms-secondary"
                  onClick={() => setRejecting(true)}
                  disabled={actionLoading}
                  style={{ color: 'var(--color-danger)' }}
                >
                  Reject Request
                </button>
                <button
                  className="btn-pms btn-pms-primary"
                  onClick={() => onApprove(detail.id)}
                  disabled={actionLoading}
                  style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                >
                  {actionLoading ? 'Approving…' : 'Approve Request'}
                </button>
              </>
            )}

            {isApproved && (
              <button
                className="btn-pms btn-pms-primary"
                onClick={() => { onHide(); onOpenDispatch(detail); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--brand-primary)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="1" y="3" width="15" height="13"/>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                Dispatch Goods (Create Goods Issue)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
