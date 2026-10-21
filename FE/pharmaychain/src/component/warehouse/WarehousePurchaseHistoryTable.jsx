import { formatDate, money } from '../../utils/format';

export default function WarehousePurchaseHistoryTable({ data, loading, onViewDetail, onConfirm, confirmLoading }) {
  if (loading) {
    return (
      <div className="pms-card">
        <div className="pms-spinner-wrap">
          <div className="pms-spinner" />
          <span className="pms-spinner-text">Loading purchase history…</span>
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div className="pms-empty-title">No purchase receipts found</div>
          <div className="pms-empty-sub">No incoming shipments have been recorded yet.</div>
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
              <th>Receipt Code</th>
              <th>Delivery Type</th>
              <th className="text-right">Total Value</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Confirmed Date</th>
              <th className="text-right" style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const isConfirmed = row.status === 1;
              return (
                <tr key={row.id || i}>
                  <td className="text-xs text-muted-color">{i + 1}</td>
                  <td><span className="fw-600 mono" style={{ fontSize: 13 }}>{row.code}</span></td>
                  <td className="text-sm text-secondary-color">{row.deliveryTypeLabel || 'Standard Delivery'}</td>
                  <td className="text-right fw-700" style={{ fontSize: 14 }}>{money(row.totalAmount)}</td>
                  <td>
                    <span className={`pms-badge ${isConfirmed ? 'pms-badge-success' : 'pms-badge-warning'}`}>
                      {row.statusLabel || (isConfirmed ? 'Confirmed' : 'Pending Inspection')}
                    </span>
                  </td>
                  <td className="text-sm text-muted-color">{formatDate(row.createdAt)}</td>
                  <td className="text-sm text-muted-color">{formatDate(row.confirmedAt) || '—'}</td>
                  <td className="text-right">
                    <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end' }}>
                      {!isConfirmed && onConfirm && (
                        <button
                          className="btn-pms btn-pms-sm btn-pms-primary"
                          title="Confirm receipt and accept into inventory"
                          onClick={() => onConfirm(row.id)}
                          disabled={confirmLoading}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Confirm
                        </button>
                      )}
                      <button
                        className="btn-pms btn-pms-sm btn-pms-secondary"
                        title="View receipt details"
                        onClick={() => onViewDetail(row.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        Details
                      </button>
                    </div>
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
