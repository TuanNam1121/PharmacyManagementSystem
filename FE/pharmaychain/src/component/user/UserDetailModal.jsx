import { formatDate, getInitials } from '../../utils/format';

export default function UserDetailModal({
  show,
  onHide,
  user,
  loading = false,
  onEdit,
}) {
  if (!show) return null;

  const isActive = Number(user?.status) === 1;

  const getGenderText = (gender) => {
    if (gender === 1) return 'Nam';
    if (gender === 2) return 'Nữ';
    if (gender === 0) return 'Khác';
    return 'Chưa xác định';
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-lg">
        {/* Header */}
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">Hồ Sơ Nhân Viên &amp; Bảo Mật Tài Khoản</div>
            <div className="pms-modal-sub">Thông tin lý lịch, trạng thái đăng nhập và danh mục quyền phân bổ</div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="pms-modal-body">
          {loading ? (
            <div className="pms-spinner-wrap" style={{ padding: '40px 0' }}>
              <div className="pms-spinner" />
              <span className="pms-spinner-text">Đang tải hồ sơ nhân viên…</span>
            </div>
          ) : !user ? (
            <div className="pms-empty">
              <div className="pms-empty-title">Không tìm thấy hồ sơ tài khoản</div>
            </div>
          ) : (
            <div>
              {/* Profile Card Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 16,
                  background: 'var(--bg-canvas)',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid var(--border-color)',
                  marginBottom: 20,
                }}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || user.username}
                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(59, 130, 246, 0.25))',
                      color: 'var(--brand-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 18,
                      flexShrink: 0,
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    {getInitials(user.fullName || user.username)}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {user.fullName || 'Chưa đặt tên'}
                    </h3>
                    {isActive ? (
                      <span className="pms-badge pms-badge-success">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="pms-badge pms-badge-danger">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                        Đã khóa / Tạm dừng
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
                    @{user.username} • Mã tài khoản #{user.id}
                  </div>
                </div>
              </div>

              {/* 2-column info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Personal & Contact Info */}
                <div
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                    Thông Tin Cá Nhân
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Email:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{user.email || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Số Điện Thoại:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{user.phone || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Ngày Sinh:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{formatDate(user.dateOfBirth)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Giới Tính:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{getGenderText(user.gender)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Địa Chỉ:</span>{' '}
                      <span style={{ color: 'var(--text-primary)' }}>{user.address || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Account Security & Audit */}
                <div
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                    Bảo Mật &amp; Nhật Ký Hoạt Động
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Đăng Nhập Gần Nhất:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{formatDate(user.lastLoginAt) || 'Chưa từng đăng nhập'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Số Lần Sai Mật Khẩu:</span>{' '}
                      <span
                        className={`pms-badge ${Number(user.failedLoginCount) > 3 ? 'pms-badge-danger' : 'pms-badge-neutral'}`}
                        style={{ marginLeft: 6 }}
                      >
                        {user.failedLoginCount ?? 0}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Ngày Tạo Tài Khoản:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{formatDate(user.createdAt)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Cập Nhật Cuối:</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{formatDate(user.updatedAt)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role & Permissions Card */}
              <div
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Vai Trò &amp; Phân Quyền Truy Cập (RBAC)
                  </div>
                  {user.role && (
                    <span className="pms-badge pms-badge-info" style={{ fontSize: 12 }}>
                      {user.role.name || user.role.code}
                    </span>
                  )}
                </div>

                {user.role?.description && (
                  <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    {user.role.description}
                  </p>
                )}

                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
                    Quyền hạn được cấp ({user.permissions?.length || 0}):
                  </div>
                  {user.permissions && user.permissions.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {user.permissions.map((p, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 11,
                            fontFamily: 'monospace',
                            padding: '3px 8px',
                            background: 'var(--bg-canvas)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 4,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Áp dụng phân quyền chuẩn theo vai trò được gán.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pms-modal-footer">
          <button className="btn-pms btn-pms-secondary" onClick={onHide}>Đóng</button>
          {user && onEdit && (
            <button
              className="btn-pms btn-pms-primary"
              onClick={() => {
                onHide();
                onEdit(user);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Chỉnh Sửa Hồ Sơ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
