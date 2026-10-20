import { formatDate, money } from '../../utils/format';

const TYPE_LABELS = {
  1: 'Damaged / Broken',
  2: 'Expired — Disposal',
  3: 'Cycle Count',
  4: 'Other',
};

export default function WarehouseAdjustmentListTable({ data, loading }) {
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
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const diff = row.difference || 0;
              const diffColor = diff < 0 ? 'var(--color-danger)' : diff > 0 ? 'var(--color-success)' : 'var(--text-muted)';
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
                    <span className={`pms-badge ${row.status === 'APPROVED' ? 'pms-badge-success' : row.status === 'REJECTED' ? 'pms-badge-danger' : 'pms-badge-warning'}`}>
                      {row.statusLabel || 'Pending Approval'}
                    </span>
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
