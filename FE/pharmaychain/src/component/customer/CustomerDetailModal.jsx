import { getInitials } from '../../utils/format';

function formatCurrency(amount) {
  if (amount == null) return '0 ₫';
  return Number(amount).toLocaleString('vi-VN') + ' ₫';
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
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

function calculateBmi(heightCm, weightKg) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);
  let status = 'Bình thường';
  let color = '#34d399';
  if (bmi < 18.5) {
    status = 'Thiếu cân';
    color = '#60a5fa';
  } else if (bmi >= 25 && bmi < 30) {
    status = 'Thừa cân';
    color = '#fbbf24';
  } else if (bmi >= 30) {
    status = 'Béo phì';
    color = '#f87171';
  }
  return { bmi, status, color };
}

export default function CustomerDetailModal({
  show,
  onHide,
  customer,
  loading = false,
  onEdit,
  onNewSale,
}) {
  if (!show) return null;

  const isActive = Number(customer?.status) === 1;
  const tier = getTierBadge(customer?.membershipTier);
  const health = customer?.healthProfile;
  const hasAllergies = Boolean(health?.allergies && health.allergies.trim().length > 0);
  const bmiInfo = health ? calculateBmi(health.heightCm, health.weightKg) : null;
  const recentInvoices = customer?.recentInvoices || [];

  return (
    <div
      className="pms-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onHide();
      }}
    >
      <div className="pms-modal pms-modal-xl" style={{ maxWidth: 940 }}>
        {/* Modal Header */}
        <div className="pms-modal-header" style={{ alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="pms-modal-title" style={{ fontSize: 18 }}>
                Hồ Sơ Chi Tiết Khách Hàng
              </span>
              {customer?.customerCode && (
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: 12.5,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--brand-primary)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  {customer.customerCode}
                </span>
              )}
            </div>
            <div className="pms-modal-sub">
              Thông tin cá nhân, hạng hội viên, tiền sử bệnh án và lịch sử giao dịch thuốc
            </div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="pms-modal-body" style={{ padding: '20px 24px' }}>
          {loading ? (
            <div className="pms-spinner-wrap" style={{ padding: '60px 0' }}>
              <div className="pms-spinner" />
              <span className="pms-spinner-text">Đang tải hồ sơ khách hàng…</span>
            </div>
          ) : !customer ? (
            <div className="pms-empty" style={{ padding: '40px 0' }}>
              <div className="pms-empty-title">Không tìm thấy thông tin khách hàng yêu cầu</div>
              <div className="pms-empty-sub">Hồ sơ khách hàng có thể đã bị xóa hoặc không còn tồn tại trên hệ thống.</div>
            </div>
          ) : (
            <div>
              {/* Profile Overview Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '16px 20px',
                  background: 'var(--bg-canvas)',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid var(--border-color)',
                  marginBottom: 20,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(59, 130, 246, 0.25))',
                      color: 'var(--brand-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 18,
                      flexShrink: 0,
                      border: '2px solid rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    {getInitials(customer.fullName)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {customer.fullName || '—'}
                      </span>
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
                        Thẻ {tier.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <span>SĐT: <strong style={{ color: 'var(--text-primary)' }}>{customer.phone || '—'}</strong></span>
                      {customer.email && <span>Email: {customer.email}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {isActive ? (
                    <span className="pms-badge pms-badge-success" style={{ padding: '6px 12px', fontSize: 12 }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                      Đang hoạt động
                    </span>
                  ) : (
                    <span className="pms-badge pms-badge-neutral" style={{ padding: '6px 12px', fontSize: 12 }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                      Ngừng hoạt động
                    </span>
                  )}
                </div>
              </div>

              {/* 2-Column Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                {/* Column 1: Thông tin cá nhân & Thẻ thành viên */}
                <div
                  style={{
                    padding: 18,
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: 8,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Thông Tin Cá Nhân & Hội Viên
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Giới tính:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {getGenderDisplay(customer.gender ?? customer.genderCode)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Ngày sinh:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formatDate(customer.dateOfBirth)} {customer.age != null && `(${customer.age} tuổi)`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Địa chỉ:</span>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)', textAlign: 'right', maxWidth: 240 }}>
                        {customer.address || '—'}
                      </span>
                    </div>

                    <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Điểm tích lũy:</span>
                      <span style={{ fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {(customer.loyaltyPoints ?? 0).toLocaleString('vi-VN')} điểm
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Giá trị quy đổi:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formatCurrency((customer.loyaltyPoints ?? 0) * 1000)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Tổng chi tiêu tích lũy:</span>
                      <span style={{ fontWeight: 700, color: 'var(--brand-primary)', fontSize: 13.5 }}>
                        {formatCurrency(customer.totalSpent)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Tổng số đơn hàng:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {customer.totalOrders ?? 0} đơn
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Ngày tạo hồ sơ:</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {formatDateTime(customer.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Hồ sơ y tế & Cảnh báo an toàn dùng thuốc */}
                <div
                  style={{
                    padding: 18,
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: 8,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    Hồ Sơ Sức Khỏe & Cảnh Báo An Toàn
                  </div>

                  {/* Allergy Alert Banner */}
                  {hasAllergies ? (
                    <div
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        borderRadius: 6,
                        marginBottom: 12,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#f87171"
                        strokeWidth="2.5"
                        style={{ flexShrink: 0, marginTop: 1 }}
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <div>
                        <div style={{ color: '#f87171', fontWeight: 700, fontSize: 13 }}>
                          CẢNH BÁO TIỀN SỬ DỊ ỨNG THUỐC
                        </div>
                        <div style={{ color: 'var(--text-primary)', fontSize: 12.5, marginTop: 2, fontWeight: 500 }}>
                          {health.allergies}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: 6,
                        marginBottom: 12,
                        fontSize: 12.5,
                        color: 'var(--brand-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Chưa ghi nhận tiền sử dị ứng thuốc
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                    {/* Height, Weight, BMI */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Thể chất (Cao / Nặng):</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {health?.heightCm ? `${health.heightCm} cm` : '—'} / {health?.weightKg ? `${health.weightKg} kg` : '—'}
                        {bmiInfo && (
                          <span
                            style={{
                              marginLeft: 8,
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              background: 'rgba(255,255,255,0.06)',
                              color: bmiInfo.color,
                            }}
                          >
                            BMI: {bmiInfo.bmi} ({bmiInfo.status})
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Chronic diseases */}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Bệnh lý mãn tính:</span>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)', textAlign: 'right', maxWidth: 220 }}>
                        {health?.chronicDiseases || 'Không có ghi nhận'}
                      </span>
                    </div>

                    {/* Current medications */}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Thuốc dùng định kỳ:</span>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)', textAlign: 'right', maxWidth: 220 }}>
                        {health?.currentMedications || 'Không'}
                      </span>
                    </div>

                    {/* Pregnancy / Breastfeeding */}
                    {(health?.isPregnant || health?.isBreastfeeding) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Tình trạng phụ nữ:</span>
                        <span style={{ fontWeight: 600, color: '#fbbf24' }}>
                          {health.isPregnant && 'Đang mang thai '}
                          {health.isBreastfeeding && 'Đang nuôi con bằng sữa mẹ'}
                        </span>
                      </div>
                    )}

                    {/* Notes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Ghi chú của Dược sĩ:</span>
                      <div
                        style={{
                          padding: '8px 10px',
                          background: 'var(--bg-canvas)',
                          borderRadius: 6,
                          border: '1px solid var(--border-color)',
                          fontSize: 12.5,
                          color: health?.notes ? 'var(--text-primary)' : 'var(--text-muted)',
                          fontStyle: health?.notes ? 'normal' : 'italic',
                        }}
                      >
                        {health?.notes || 'Chưa có ghi chú đặc biệt từ dược sĩ'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Lịch sử hóa đơn gần nhất */}
              <div
                style={{
                  padding: 18,
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <line x1="6" y1="8" x2="10" y2="8" />
                      <line x1="6" y1="12" x2="14" y2="12" />
                      <line x1="6" y1="16" x2="18" y2="16" />
                    </svg>
                    Lịch Sử Mua Hàng Gần Đây (5 hóa đơn mới nhất)
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {recentInvoices.length} đơn gần nhất
                  </span>
                </div>

                {recentInvoices.length === 0 ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    Khách hàng này chưa có hóa đơn mua hàng nào trong hệ thống.
                  </div>
                ) : (
                  <div className="pms-table-wrap" style={{ border: 'none', margin: 0 }}>
                    <table className="pms-table">
                      <thead>
                        <tr>
                          <th>Mã hóa đơn</th>
                          <th>Thời gian giao dịch</th>
                          <th className="text-right">Tổng thanh toán</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentInvoices.map((inv, idx) => (
                          <tr key={inv.invoiceId || idx}>
                            <td>
                              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--brand-primary)' }}>
                                {inv.invoiceCode || `HD-${inv.invoiceId}`}
                              </span>
                            </td>
                            <td style={{ color: 'var(--text-secondary)' }}>
                              {formatDateTime(inv.createdAt)}
                            </td>
                            <td className="text-right" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {formatCurrency(inv.netAmount)}
                            </td>
                            <td>
                              {inv.status === 'COMPLETED' ? (
                                <span className="pms-badge pms-badge-success">Hoàn thành</span>
                              ) : inv.status === 'CANCELLED' ? (
                                <span className="pms-badge pms-badge-danger">Đã hủy</span>
                              ) : (
                                <span className="pms-badge pms-badge-neutral">{inv.status}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pms-modal-footer">
          <button className="pms-btn pms-btn-ghost" onClick={onHide}>
            Đóng
          </button>
          {customer && (
            <>
              <button
                className="pms-btn pms-btn-secondary"
                onClick={() => onEdit && onEdit(customer)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Sửa hồ sơ
              </button>
              <button
                type="button"
                className="btn-pms btn-pms-primary"
                onClick={() => onNewSale && onNewSale(customer)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#ffffff' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Tạo đơn POS cho khách này
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Export Drawer alias as well for naming flexibility
export { CustomerDetailModal as CustomerDetailDrawer };
