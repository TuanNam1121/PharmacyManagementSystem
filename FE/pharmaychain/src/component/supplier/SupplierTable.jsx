import { formatDate, getInitials } from '../../utils/format';

export default function SupplierTable({
  data = [],
  loading = false,
  page = 0,
  size = 10,
  onView,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="pms-card">
        <div className="pms-spinner-wrap">
          <div className="pms-spinner" />
          <span className="pms-spinner-text">Loading suppliers directory…</span>
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="pms-empty-title">No suppliers found</div>
          <div className="pms-empty-sub">No supplier records matched your search or status filter.</div>
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
              <th style={{ width: 44 }}>#</th>
              <th>Supplier / Partner</th>
              <th>Contact Person</th>
              <th>Contact Details</th>
              <th>Tax Code</th>
              <th>Status</th>
              <th>Created Date</th>
              <th className="text-right" style={{ width: 110 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const isActive = String(row.status) === '1';

              return (
                <tr key={row.id || i}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {page * size + i + 1}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))',
                          color: 'var(--brand-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 12,
                          flexShrink: 0,
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        {getInitials(row.code || row.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13.5 }}>
                          {row.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <span className="pms-badge pms-badge-neutral mono" style={{ fontSize: 10.5 }}>
                            {row.code}
                          </span>
                          {row.address && (
                            <span
                              style={{
                                fontSize: 11.5,
                                color: 'var(--text-muted)',
                                maxWidth: 220,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={row.address}
                            >
                              • {row.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                      {row.contactPerson || '—'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>
                      {row.phone || '—'}
                    </div>
                    {row.email && (
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        {row.email}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {row.taxCode || '—'}
                    </span>
                  </td>
                  <td>
                    {(() => {
                      const s = String(row.status || '').toUpperCase();
                      if (s === '1' || s === 'ACTIVE') {
                        return (
                          <span className="pms-badge pms-badge-success">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
                            Active
                          </span>
                        );
                      }
                      if (s === '3' || s === 'PENDING') {
                        return (
                          <span className="pms-badge pms-badge-warning">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
                            Pending
                          </span>
                        );
                      }
                      return (
                        <span className="pms-badge pms-badge-danger">
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
                          Inactive
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="text-right">
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {/* View Details */}
                      <button
                        className="btn-pms btn-pms-ghost btn-pms-sm"
                        title="View Supplier Details"
                        onClick={() => onView(row.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>

                      {/* Edit Supplier */}
                      <button
                        className="btn-pms btn-pms-ghost btn-pms-sm"
                        title="Edit Supplier"
                        onClick={() => onEdit(row)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>

                      {/* Deactivate / Delete Supplier */}
                      <button
                        className="btn-pms btn-pms-ghost btn-pms-sm"
                        style={{ color: 'var(--status-danger)' }}
                        title="Deactivate Supplier"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to deactivate supplier "${row.name}"?`)) {
                            onDelete && onDelete(row.id);
                          }
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
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
