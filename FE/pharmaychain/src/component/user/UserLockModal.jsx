import { useState, useEffect } from 'react';

export default function UserLockModal({
  show,
  onHide,
  user,
  onConfirm,
}) {
  const [targetStatus, setTargetStatus] = useState(2); // 2: LOCKED, 0: DISABLED, 1: ACTIVE
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isCurrentlyActive = Number(user?.status) === 1;

  useEffect(() => {
    if (show) {
      setErrorMsg(null);
      setReason('');
      if (isCurrentlyActive) {
        setTargetStatus(2); // Mặc định khóa (LOCKED)
      } else {
        setTargetStatus(1); // Mặc định kích hoạt (ACTIVE)
      }
    }
  }, [show, isCurrentlyActive]);

  if (!show || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isCurrentlyActive && (!reason || !reason.trim())) {
      setErrorMsg('Vui lòng nhập lý do khóa hoặc vô hiệu hóa tài khoản.');
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm(user.id, targetStatus, reason.trim());
      onHide();
    } catch (err) {
      setErrorMsg(err?.message || 'Thao tác cập nhật trạng thái thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-md">
        {/* Header */}
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">
              {isCurrentlyActive ? 'Khóa / Vô Hiệu Hóa Tài Khoản' : 'Mở Khóa Tài Khoản'}
            </div>
            <div className="pms-modal-sub">
              Nhân viên: <strong>{user.fullName || user.username}</strong> (@{user.username})
            </div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="pms-modal-body">
            {errorMsg && (
              <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errorMsg}
              </div>
            )}

            {isCurrentlyActive ? (
              <div>
                <div className="pms-form-group" style={{ marginBottom: 14 }}>
                  <label className="pms-label">Chọn hình thức xử lý *</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input
                        type="radio"
                        name="targetStatus"
                        value={2}
                        checked={Number(targetStatus) === 2}
                        onChange={() => setTargetStatus(2)}
                      />
                      <span><strong>Khóa tài khoản</strong> (LOCKED - Tạm ngưng do vi phạm nghiệp vụ / nghỉ phép)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input
                        type="radio"
                        name="targetStatus"
                        value={0}
                        checked={Number(targetStatus) === 0}
                        onChange={() => setTargetStatus(0)}
                      />
                      <span><strong>Vô hiệu hóa vĩnh viễn</strong> (DISABLED - Đã nghỉ việc / Hết hạn hợp đồng)</span>
                    </label>
                  </div>
                </div>

                <div className="pms-form-group">
                  <label className="pms-label">Lý do khóa / vô hiệu hóa *</label>
                  <textarea
                    className="pms-input pms-input-bare"
                    rows={4}
                    placeholder="Nhập lý do chi tiết để lưu vết nhật ký kiểm toán (Audit Log)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    Hệ thống sẽ ghi nhận lý do này vào Audit Log và chấm dứt mọi phiên làm việc hiện tại của nhân viên.
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 16 }}>
                  Bạn có chắc chắn muốn mở khóa cho tài khoản <strong>@{user.username}</strong> không?
                  Sau khi mở khóa, nhân viên có thể đăng nhập vào hệ thống bình thường.
                </p>

                <div className="pms-form-group">
                  <label className="pms-label">Ghi chú mở khóa (Tùy chọn)</label>
                  <textarea
                    className="pms-input pms-input-bare"
                    rows={3}
                    placeholder="Nhập ghi chú hoặc lý do phục hồi tài khoản (nếu có)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
              Hủy
            </button>
            <button
              type="submit"
              className={`btn-pms ${isCurrentlyActive ? 'btn-pms-danger' : 'btn-pms-primary'}`}
              disabled={submitting}
            >
              {submitting
                ? 'Đang xử lý…'
                : isCurrentlyActive
                ? 'Xác Nhận Khóa Tài Khoản'
                : 'Mở Khóa Tài Khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
