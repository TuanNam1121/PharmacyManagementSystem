import { formatDate, getInitials } from '../../utils/format';

const ROLE_COLORS = {
  ADMIN: 'badge-purple',
  MANAGER: 'badge-blue',
  PHARMACIST: 'badge-emerald',
  WAREHOUSE: 'badge-amber',
  CASHIER: 'badge-teal',
};

function getRoleBadgeStyle(roleCode) {
  const code = (roleCode || '').toUpperCase();
  if (code.includes('ADMIN')) return { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' };
  if (code.includes('PHARMACIST') || code.includes('SALE')) return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
  if (code.includes('WAREHOUSE') || code.includes('INVENTORY')) return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
  if (code.includes('MANAGER')) return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
  return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
}

export default function UserTable({
  users = [],
  loading = false,
  page = 0,
  size = 10,
  onView,
  onEdit,
  onToggleStatus,
}) {
  if (loading) {
    return (
      <div className="pms-card">
        <div className="pms-spinner-wrap">
          <div className="pms-spinner" />
          <span className="pms-spinner-text">Loading user accounts…</span>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="pms-card">
        <div className="pms-empty">
          <div className="pms-empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="pms-empty-title">No user accounts found</div>
          <div className="pms-empty-sub">No user records matched your search or filter criteria.</div>
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
              <th>User / Account</th>
              <th>Role</th>
              <th>Contact Info</th>
              <th>Status</th>
              <th>Registered At</th>
              <th className="text-right" style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => {
              const isActive = Number(u.status) === 1;
              const roleBadge = getRoleBadgeStyle(u.roleCode);

              return (
                <tr key={u.id || idx}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {page * size + idx + 1}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.fullName || u.username}
                          style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
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
                          {getInitials(u.fullName || u.username)}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13.5 }}>
                          {u.fullName || '—'}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                          @{u.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 9px',
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor: roleBadge.bg,
                        color: roleBadge.text,
                        border: `1px solid ${roleBadge.border}`,
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="6" />
                      </svg>
                      {u.roleName || u.roleCode || 'No Role'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>
                      {u.email}
                    </div>
                    {u.phone && (
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        {u.phone}
                      </div>
                    )}
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
                        Inactive / Locked
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="text-right">
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {/* View Detail */}
                      <button
                        className="btn-pms btn-pms-ghost btn-pms-sm"
                        title="View Account Details"
                        onClick={() => onView(u.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>

                      {/* Edit */}
                      <button
                        className="btn-pms btn-pms-ghost btn-pms-sm"
                        title="Edit User Profile & Role"
                        onClick={() => onEdit(u)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>

                      {/* Lock / Unlock Toggle */}
                      <button
                        className={`btn-pms btn-pms-sm ${isActive ? 'btn-pms-ghost' : 'btn-pms-outline'}`}
                        style={{
                          color: isActive ? 'var(--status-danger)' : 'var(--brand-primary)',
                        }}
                        title={isActive ? 'Lock Account' : 'Unlock Account'}
                        onClick={() => onToggleStatus(u.id, u.status)}
                      >
                        {isActive ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
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
