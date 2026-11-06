import { useState, useEffect } from 'react';
import { fetchRolePermissions } from '../../api/UserAPI';

function formatPermissionLabel(perm) {
  if (typeof perm === 'object' && perm.description && perm.description.trim()) {
    return perm.description;
  }
  const code = typeof perm === 'object' ? perm.code : perm;
  if (!code) return '';
  return code
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export default function UserRoleModal({
  show,
  onHide,
  user = null,
  roles = [],
  onConfirm,
}) {
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Initialize selected role when modal opens
  useEffect(() => {
    if (show && user) {
      setErrorMsg(null);
      const initialRoleId = user.roleId || user.role?.id || '';
      setSelectedRoleId(initialRoleId ? String(initialRoleId) : '');
    }
  }, [show, user]);

  // Dynamically update permissions when selectedRoleId changes
  useEffect(() => {
    if (!selectedRoleId) {
      setPermissions([]);
      return;
    }

    const currentRole = roles.find((r) => String(r.id) === String(selectedRoleId));
    if (currentRole && currentRole.permissionDetails && currentRole.permissionDetails.length > 0) {
      setPermissions(currentRole.permissionDetails);
    } else if (currentRole && currentRole.permissions && currentRole.permissions.length > 0) {
      setPermissions(currentRole.permissions);
    } else {
      let active = true;
      setLoadingPerms(true);
      fetchRolePermissions(selectedRoleId)
        .then((res) => {
          if (active) {
            setPermissions(Array.isArray(res) ? res : []);
          }
        })
        .catch((err) => {
          console.error('Failed to load permissions for role:', err);
          if (active) setPermissions([]);
        })
        .finally(() => {
          if (active) setLoadingPerms(false);
        });
      return () => {
        active = false;
      };
    }
  }, [selectedRoleId, roles]);

  if (!show || !user) return null;

  const displayName = user.fullName || user.username || 'Nhân viên';

  const handleRoleChange = (e) => {
    setSelectedRoleId(e.target.value);
    setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedRoleId) {
      setErrorMsg('Vui lòng chọn vai trò cần phân quyền.');
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm(user.id, Number(selectedRoleId), displayName);
      onHide();
    } catch (err) {
      setErrorMsg(err?.message || 'Phân quyền vai trò cho nhân viên thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRoleObj = roles.find((r) => String(r.id) === String(selectedRoleId));

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-md" style={{ maxWidth: 580 }}>
        {/* Header */}
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">
              Phân Quyền Vai Trò - {displayName}
            </div>
            <div className="pms-modal-sub">
              Gán vai trò hệ thống và kiểm tra danh mục quyền hạn được cấp
            </div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="pms-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {errorMsg && (
              <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errorMsg}
                <button type="button" className="pms-alert-close" onClick={() => setErrorMsg(null)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}

            {/* Target User Info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--bg-canvas)',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--border-color)',
                marginBottom: 18,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  @{user.username} • {user.email}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Vai Trò Hiện Tại</span>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: user.roleName || user.roleCode ? 'var(--brand-primary)' : 'var(--text-muted)',
                  }}
                >
                  {user.roleName || user.roleCode || 'Chưa phân vai trò'}
                </span>
              </div>
            </div>

            {/* Role Selector */}
            <div className="pms-form-group" style={{ marginBottom: 18 }}>
              <label className="pms-label">
                Chọn Vai Trò Mới *
              </label>
              <select
                className="pms-select"
                style={{ width: '100%', height: 40 }}
                value={selectedRoleId}
                onChange={handleRoleChange}
                required
              >
                <option value="">-- Chọn một vai trò hệ thống --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name || r.code} ({r.code})
                  </option>
                ))}
              </select>
              {selectedRoleObj && selectedRoleObj.description && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, fontStyle: 'italic' }}>
                  {selectedRoleObj.description}
                </div>
              )}
            </div>

            {/* Permissions Preview Area */}
            <div
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: 14,
                background: 'var(--bg-canvas)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Danh Mục Quyền Hạn Được Cấp
                </div>
                {selectedRoleId && (
                  <span className="pms-badge pms-badge-neutral" style={{ fontSize: 11 }}>
                    {permissions.length} quyền thao tác
                  </span>
                )}
              </div>

              {loadingPerms ? (
                <div className="pms-spinner-wrap" style={{ padding: '20px 0' }}>
                  <div className="pms-spinner" style={{ width: 20, height: 20 }} />
                  <span className="pms-spinner-text" style={{ fontSize: 12 }}>Đang tải danh mục quyền…</span>
                </div>
              ) : !selectedRoleId ? (
                <div
                  style={{
                    padding: '24px 12px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                    fontStyle: 'italic',
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{ display: 'block', margin: '0 auto 8px', opacity: 0.6 }}
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Vui lòng chọn một vai trò để xem danh sách quyền hạn chi tiết.
                </div>
              ) : permissions.length === 0 ? (
                <div
                  style={{
                    padding: '16px 12px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 12.5,
                  }}
                >
                  Chưa có quyền hạn cụ thể nào được cấu hình cho vai trò này.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 8,
                    maxHeight: 220,
                    overflowY: 'auto',
                    paddingRight: 4,
                  }}
                >
                  {permissions.map((perm, idx) => {
                    const code = typeof perm === 'object' ? perm.code : perm;
                    const label = formatPermissionLabel(perm);
                    const module = typeof perm === 'object' ? perm.module : null;

                    return (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 6,
                          padding: '6px 10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {label}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
                          <span style={{ fontFamily: 'monospace' }}>{code}</span>
                          {module && (
                            <span
                              style={{
                                background: 'rgba(148, 163, 184, 0.15)',
                                padding: '1px 4px',
                                borderRadius: 3,
                                textTransform: 'uppercase',
                                fontSize: 9,
                              }}
                            >
                              {module}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pms-modal-footer">
            <button
              type="button"
              className="btn-pms btn-pms-secondary"
              onClick={onHide}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-pms btn-pms-primary"
              disabled={submitting || !selectedRoleId}
            >
              {submitting ? 'Đang lưu vai trò…' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
