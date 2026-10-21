import { useState } from 'react';
import { formatDate, money } from '../../utils/format';

const TYPE_LABELS = {
  1: 'Damaged / Broken',
  2: 'Expired — Disposal',
  3: 'Cycle Count',
  4: 'Other',
};

export default function WarehouseAdjustmentListTable({ data, loading, onApprove, onReject, actionLoading }) {
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const confirmReject = (id) => {
    if (!rejectReason.trim()) {
      alert('Please enter a reason for rejecting the adjustment');
      return;
    }
    if (onReject) {
      onReject(id, rejectReason.trim());
    }
    setRejectingId(null);
    setRejectReason('');
  };

  if (loading) {
    return (
      <div className="pms-card">
        <div className="pms-spinner-wrap">
          <div className="pms-spinner" />
          <span className="pms-spinner-text">Loading adjustment records…</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="pms-card">
        <div className="pms-empty">
          <div className="pms-empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
            </svg>
          </div>
          <div className="pms-empty-title">No adjustment records found</div>
          <div className="pms-empty-sub">No inventory adjustments have been submitted yet.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pms-card">
      <div className="pms-table-wrap">
        <table className="pms-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th>Product</th>
              <th>Batch No.</th>
              <th>Type</th>
              <th className="text-right">Qty Before</th>
              <th className="text-right">Qty After</th>
              <th className="text-right">Difference</th>
              <th className="text-right">Value Impact</th>
              <th>Reason</th>
              <th>Created By</th>
              <th>Status</th>
              <th className="text-right" style={{ width: 150 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const diff = row.difference || 0;
              const diffColor = diff < 0 ? 'var(--color-danger)' : diff > 0 ? 'var(--color-success)' : 'var(--text-muted)';
              const isPending = row.status === 0 || row.status === 'PENDING' || row.statusLabel === 'Pending Approval';
              const isApproved = row.status === 1 || row.status === 'APPROVED' || row.statusLabel === 'Approved';
              const isRejected = row.status === 2 || row.status === 'REJECTED' || row.statusLabel === 'Rejected';

              return (
                <tr key={row.id || i}>
                  <td className="text-xs text-muted-color">{i + 1}</td>
                  <td>
                    <div className="fw-600" style={{ fontSize: 13 }}>{row.productName}</div>
                    <div className="text-xs text-muted-color mono">{row.productCode || '—'}</div>
                  </td>
                  <td>
                    <span className="pms-badge pms-badge-neutral mono">{row.batchNumber}</span>
                  </td>
                  <td>
                    <span className="pms-badge pms-badge-neutral" style={{ fontSize: 11 }}>
                      {TYPE_LABELS[row.type] || row.typeLabel || 'Cycle Count'}
                    </span>
                  </td>
                  <td className="text-right text-muted-color">{row.quantityBefore}</td>
                  <td className="text-right fw-600">{row.quantityAfter}</td>
                  <td className="text-right">
                    <span style={{ fontWeight: 700, color: diffColor }}>
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  </td>
                  <td className="text-right text-sm fw-500 text-secondary-color">
                    {money(row.valueImpact)}
                  </td>
                  <td style={{ maxWidth: 200 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.reason}>
                      {row.reason || '—'}
                    </div>
                  </td>
                  <td className="text-sm text-muted-color">{row.createdByName || '—'}</td>
                  <td>
                    <span className={`pms-badge ${isApproved ? 'pms-badge-success' : isRejected ? 'pms-badge-danger' : 'pms-badge-warning'}`}>
                      {row.statusLabel || (isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending Approval')}
                    </span>
                  </td>
                  <td className="text-right">
                    {isPending ? (
                      rejectingId === row.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
                          <input
                            type="text"
                            className="pms-input"
                            style={{ fontSize: 11, padding: '3px 6px' }}
                            placeholder="Rejection reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            autoFocus
                          />
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            <button
                              className="btn-pms btn-pms-sm btn-pms-danger"
                              style={{ fontSize: 11, padding: '2px 6px' }}
                              onClick={() => confirmReject(row.id)}
                              disabled={actionLoading}
                            >
                              Confirm
                            </button>
                            <button
                              className="btn-pms btn-pms-sm btn-pms-secondary"
                              style={{ fontSize: 11, padding: '2px 6px' }}
                              onClick={() => { setRejectingId(null); setRejectReason(''); }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            className="btn-pms btn-pms-sm btn-pms-primary"
                            title="Approve adjustment and commit inventory"
                            onClick={() => onApprove && onApprove(row.id)}
                            disabled={actionLoading}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Approve
                          </button>
                          <button
                            className="btn-pms btn-pms-sm btn-pms-secondary"
                            title="Reject adjustment"
                            onClick={() => { setRejectingId(row.id); setRejectReason(''); }}
                            disabled={actionLoading}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-danger)' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            Reject
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="text-xs text-muted-color">
                        {row.approvedByName ? `By ${row.approvedByName}` : '—'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
