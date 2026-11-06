import { useState, useEffect } from 'react';

export default function UserFormModal({
  show,
  onHide,
  mode = 'create', // 'create' | 'edit'
  user = null,
  onSubmit,
}) {
  const isEdit = mode === 'edit';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    fullName: '',
    status: 1,
    dateOfBirth: '',
    gender: 1,
    address: '',
    avatarUrl: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (show) {
      setErrorMsg(null);
      if (isEdit && user) {
        setFormData({
          username: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
          password: '',
          fullName: user.fullName || '',
          status: user.status ?? 1,
          dateOfBirth: user.dateOfBirth ? String(user.dateOfBirth).split('T')[0] : '',
          gender: user.gender ?? 1,
          address: user.address || '',
          avatarUrl: user.avatarUrl || '',
        });
      } else {
        setFormData({
          username: '',
          email: '',
          phone: '',
          password: '',
          fullName: '',
          status: 1,
          dateOfBirth: '',
          gender: 1,
          address: '',
          avatarUrl: '',
        });
      }
    }
  }, [show, isEdit, user]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic validation
    if (!formData.fullName.trim()) {
      setErrorMsg('Họ và tên nhân viên không được để trống.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg('Địa chỉ email không được để trống.');
      return;
    }

    if (!isEdit) {
      if (!formData.username.trim() || formData.username.trim().length < 3) {
        setErrorMsg('Tên đăng nhập phải có ít nhất 3 ký tự.');
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setErrorMsg('Mật khẩu khởi tạo phải có ít nhất 6 ký tự.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        dateOfBirth: formData.dateOfBirth || null,
        gender: Number(formData.gender),
        address: formData.address.trim() || null,
        avatarUrl: formData.avatarUrl.trim() || null,
      };

      if (!isEdit) {
        payload.username = formData.username.trim();
        payload.password = formData.password;
        payload.status = Number(formData.status);
      }

      await onSubmit(payload);
      onHide();
    } catch (err) {
      setErrorMsg(err?.message || 'Lưu thông tin tài khoản thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusText = (status) => {
    if (Number(status) === 1) return { text: 'Đang hoạt động', badge: 'pms-badge-success' };
    if (Number(status) === 2) return { text: 'Đã khóa', badge: 'pms-badge-danger' };
    return { text: 'Vô hiệu hóa', badge: 'pms-badge-neutral' };
  };

  const currentStatusInfo = getStatusText(formData.status);

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-lg">
        {/* Header */}
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">
              {isEdit ? 'Chỉnh Sửa Hồ Sơ Nhân Viên' : 'Tạo Tài Khoản Nhân Viên Mới'}
            </div>
            <div className="pms-modal-sub">
              {isEdit
                ? `Cập nhật thông tin định danh và hồ sơ cá nhân cho tài khoản @${user?.username}`
                : 'Đăng ký tài khoản nhân viên mới vào hệ thống quản lý chuỗi'}
            </div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="pms-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {errorMsg && (
              <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" strokeWidth="2"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {errorMsg}
                <button type="button" className="pms-alert-close" onClick={() => setErrorMsg(null)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Section 1: Credentials */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                1. Thông Tin Tài Khoản &amp; Bảo Mật
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="pms-form-group">
                  <label className="pms-label">Tên Đăng Nhập *</label>
                  <input
                    className="pms-input pms-input-bare"
                    name="username"
                    placeholder="Ví dụ: nva_pharmacist"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isEdit}
                    required
                  />
                  {isEdit && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                      Tên đăng nhập cố định và không thể thay đổi sau khi tạo.
                    </span>
                  )}
                </div>

                {!isEdit ? (
                  <div className="pms-form-group">
                    <label className="pms-label">Mật Khẩu Khởi Tạo *</label>
                    <input
                      className="pms-input pms-input-bare"
                      type="password"
                      name="password"
                      placeholder="Tối thiểu 6 ký tự"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                ) : (
                  <div className="pms-form-group">
                    <label className="pms-label">Trạng Thái Tài Khoản</label>
                    <div style={{ display: 'flex', alignItems: 'center', height: 38, gap: 8 }}>
                      <span className={`pms-badge ${currentStatusInfo.badge}`}>
                        {currentStatusInfo.text}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        (Sử dụng nút Khóa/Mở Khóa tại bảng danh sách)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {!isEdit && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12 }}>
                  <div className="pms-form-group">
                    <label className="pms-label">Trạng Thái Khởi Tạo</label>
                    <select
                      className="pms-select"
                      style={{ width: '100%' }}
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="1">Đang hoạt động</option>
                      <option value="0">Vô hiệu hóa</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: 20 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Lưu ý: Tài khoản mới chưa có vai trò. Sử dụng thao tác <strong>Phân Vai Trò</strong> sau khi tạo.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Personal Profile */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                2. Thông Tin Cá Nhân &amp; Hồ Sơ
              </div>

              <div className="pms-form-group" style={{ marginBottom: 14 }}>
                <label className="pms-label">Họ và Tên Nhân Viên *</label>
                <input
                  className="pms-input pms-input-bare"
                  name="fullName"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="pms-form-group">
                  <label className="pms-label">Địa Chỉ Email *</label>
                  <input
                    className="pms-input pms-input-bare"
                    type="email"
                    name="email"
                    placeholder="Ví dụ: nhanvien@pharmacy.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="pms-form-group">
                  <label className="pms-label">Số Điện Thoại</label>
                  <input
                    className="pms-input pms-input-bare"
                    name="phone"
                    placeholder="Ví dụ: 0912 345 678"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="pms-form-group">
                  <label className="pms-label">Ngày Sinh</label>
                  <input
                    className="pms-input pms-input-bare"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                <div className="pms-form-group">
                  <label className="pms-label">Giới Tính</label>
                  <select
                    className="pms-select"
                    style={{ width: '100%' }}
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="1">Nam</option>
                    <option value="2">Nữ</option>
                    <option value="0">Khác</option>
                  </select>
                </div>
              </div>

              <div className="pms-form-group" style={{ marginBottom: 14 }}>
                <label className="pms-label">Địa Chỉ Thường Trú</label>
                <input
                  className="pms-input pms-input-bare"
                  name="address"
                  placeholder="Địa chỉ cư trú hoặc nơi làm việc"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="pms-form-group">
                <label className="pms-label">Ảnh Đại Diện (URL)</label>
                <input
                  className="pms-input pms-input-bare"
                  name="avatarUrl"
                  placeholder="https://..."
                  value={formData.avatarUrl}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn-pms btn-pms-primary" disabled={submitting}>
              {submitting ? 'Đang lưu…' : isEdit ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
