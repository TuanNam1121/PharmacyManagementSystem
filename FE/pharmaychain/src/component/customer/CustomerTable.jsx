import { getInitials } from '../../utils/format';

function formatCurrency(amount) {
  if (amount == null) return '0 ₫';
  return Number(amount).toLocaleString('vi-VN') + ' ₫';
}

function getTierBadge(tier) {
  const code = (tier || 'STANDARD').toUpperCase();
  switch (code) {
    case 'DIAMOND':
      return {
        bg: 'rgba(168, 85, 247, 0.15)',
        text: '#c084fc',
        border: 'rgba(168, 85, 247, 0.3)',
        label: 'Kim Cương',
      };
    case 'GOLD':
      return {
        bg: 'rgba(245, 158, 11, 0.15)',
        text: '#fbbf24',
        border: 'rgba(245, 158, 11, 0.3)',
        label: 'Vàng',
      };
    case 'SILVER':
      return {
        bg: 'rgba(59, 130, 246, 0.15)',
        text: '#60a5fa',
        border: 'rgba(59, 130, 246, 0.3)',
        label: 'Bạc',
      };
    case 'STANDARD':
    default:
      return {
        bg: 'rgba(148, 163, 184, 0.15)',
        text: '#94a3b8',
        border: 'rgba(148, 163, 184, 0.3)',
        label: 'Chuẩn',
      };
  }
}

function getGenderDisplay(gender) {
  const g = String(gender).toUpperCase();
  if (g === '1' || g === 'MALE' || g === 'NAM') return 'Nam';
  if (g === '0' || g === 'FEMALE' || g === 'NỮ') return 'Nữ';
  return 'Khác';
}

export default function CustomerTable({
  customers = [],
  loading = false,
  page = 0,
  size = 10,
  onView,
  onEdit,
  onDelete,
  onReactivate,
  onClearFilters,
}) {
  if (loading) {
    return (
      <div className="pms-card">
        <div className="pms-spinner-wrap" style={{ padding: '48px 0' }}>
          <div className="pms-spinner" />
          <span className="pms-spinner-text">Đang tải danh sách khách hàng…</span>
        </div>
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="pms-card">
        <div className="pms-empty" style={{ padding: '48px 16px' }}>
          <div className="pms-empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <div className="pms-empty-title">Không tìm thấy khách hàng nào phù hợp với từ khóa tìm kiếm</div>
          <div className="pms-empty-sub">
            Vui lòng thử điều chỉnh từ khóa tìm kiếm hoặc bỏ các bộ lọc đã chọn.
          </div>
          {onClearFilters && (
            <button
              className="pms-btn pms-btn-secondary"
              onClick={onClearFilters}
              style={{ marginTop: 16 }}
            >
              Xóa bộ lọc
            </button>
          )}
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
              <th>Mã KH</th>
              <th>Khách hàng</th>
              <th>Số điện thoại</th>
              <th>Giới tính</th>
              <th>Hạng thẻ</th>
              <th className="text-right">Điểm tích lũy</th>
              <th className="text-right">Tổng chi tiêu</th>
              <th>Dị ứng thuốc</th>
              <th>Trạng thái</th>
              <th style={{ width: 120, textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, idx) => {
              const isActive = Number(c.status) === 1;
              const tier = getTierBadge(c.membershipTier);
              const genderText = getGenderDisplay(c.gender ?? c.genderCode);

              return (
                <tr key={c.customerId || idx}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {page * size + idx + 1}
                  </td>
                  <td>
                    <span
                      onClick={() => onView && onView(c)}
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        fontSize: 12,
                        padding: '2px 6px',
                        background: 'rgba(16, 185, 129, 0.08)',
                        color: 'var(--brand-primary)',
                        borderRadius: 4,
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        cursor: onView ? 'pointer' : 'default',
                      }}
                      title="Bấm để xem chi tiết"
                    >
                      {c.customerCode || `KH-${String(c.customerId).padStart(6, '0')}`}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: onView ? 'pointer' : 'default' }}
                      onClick={() => onView && onView(c)}
                      title="Bấm để xem chi tiết"
                    >
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
                        {getInitials(c.fullName)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13.5 }}>
                          {c.fullName || '—'}
                        </div>
                        {c.email && (
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                            {c.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                      {c.phone || '—'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                      {genderText}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor: tier.bg,
                        color: tier.text,
                        border: `1px solid ${tier.border}`,
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      {tier.label}
                    </span>
                  </td>
                  <td className="text-right">
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                      {(c.loyaltyPoints ?? 0).toLocaleString('vi-VN')}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 3 }}>pts</span>
                  </td>
                  <td className="text-right">
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--brand-primary)' }}>
                      {formatCurrency(c.totalSpent)}
                    </span>
                  </td>
                  <td>
                    {c.hasAllergies ? (
                      <span
                        title={c.allergies || 'Có tiền sử dị ứng thuốc'}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 600,
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          cursor: 'help',
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        Có dị ứng
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td>
                    {isActive ? (
                      <span className="pms-badge pms-badge-success">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        Hoạt động
                      </span>
                    ) : (
                      <span className="pms-badge pms-badge-neutral">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        Khóa
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      {/* View Action */}
                      <button
                        className="pms-icon-btn view"
                        title="Xem chi tiết hồ sơ khách hàng"
                        aria-label="Xem chi tiết khách hàng"
                        onClick={() => onView && onView(c)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>

                      {/* Edit Action */}
                      <button
                        className="pms-icon-btn edit"
                        title="Chỉnh sửa thông tin khách hàng"
                        aria-label="Chỉnh sửa khách hàng"
                        onClick={() => onEdit && onEdit(c)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      {/* Delete or Reactivate Action */}
                      {isActive ? (
                        <button
                          className="pms-icon-btn danger"
                          title="Vô hiệu hóa / Khóa hồ sơ khách hàng"
                          aria-label="Vô hiệu hóa khách hàng"
                          onClick={() => onDelete && onDelete(c)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          className="pms-icon-btn success"
                          title="Kích hoạt lại hồ sơ khách hàng"
                          aria-label="Kích hoạt lại khách hàng"
                          onClick={() => onReactivate && onReactivate(c)}
                          style={{ color: 'var(--brand-primary)' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 4v6h-6" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                          </svg>
                        </button>
                      )}
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
