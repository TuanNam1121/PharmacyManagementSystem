import { formatDate, getInitials } from '../../utils/format';

export default function CategoryTable({
  data = [],
  loading = false,
  page = 0,
  size = 10,
  onEdit,
  onToggleStatus,
}) {
  if (loading) {
    return (
      <div className="pms-card">
        <div className="pms-spinner-wrap">
          <div className="pms-spinner" />
          <span className="pms-spinner-text">Loading categories…</span>
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
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div className="pms-empty-title">No categories found</div>
          <div className="pms-empty-sub">No category records matched your search or status filter.</div>
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
              <th>Category Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Created Date</th>
              <th className="text-right" style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const isActive = Number(row.status) === 1;
              const createdByName =
                row.createdByFullName || row.createdByUsername || '—';

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
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
                          color: '#6366f1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 12,
                          flexShrink: 0,
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                        }}
                      >
                        {getInitials(row.name)}
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13.5 }}>
                        {row.name}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 12.5,
                        color: 'var(--text-secondary)',
                        display: 'block',
                        maxWidth: 280,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={row.description || ''}
                    >
                      {row.description || '—'}
                    </span>
                  </td>
                  <td>
                    {isActive ? (
                      <span className="pms-badge pms-badge-success">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        Active
                      </span>
                    ) : (
                      <span className="pms-badge pms-badge-danger">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        Inactive
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                    {createdByName}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="text-right">
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {/* Edit Category */}
                      <button
                        className="btn-pms btn-pms-ghost btn-pms-sm"
                        title="Edit Category"
                        onClick={() => onEdit(row)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      {/* Toggle Inactive / Active (UC20) */}
                      <button
                        className={`btn-pms btn-pms-sm ${isActive ? 'btn-pms-ghost' : 'btn-pms-outline'}`}
                        style={{
                          color: isActive ? 'var(--status-danger)' : 'var(--brand-primary)',
                        }}
                        title={isActive ? 'Vô hiệu hóa Danh mục (Inactive)' : 'Kích hoạt Danh mục (Active)'}
                        onClick={() => onToggleStatus && onToggleStatus(row)}
                      >
                        {isActive ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
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
