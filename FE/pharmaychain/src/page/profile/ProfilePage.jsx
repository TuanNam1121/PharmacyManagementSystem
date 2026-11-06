import { useState, useEffect } from 'react';
import profileApi from '../../api/profileApi';
import { useAuth } from '../../hooks/useAuth';
import ChangePasswordModal from '../../component/auth/ChangePasswordModal';

export default function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    address: '',
    avatarUrl: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchProfile = async () => {
    setIsLoading(true);
    setServerError('');
    try {
      const data = await profileApi.getProfile();
      setProfile(data);
      setFormData({
        fullName: data.fullName || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || 'MALE',
        address: data.address || '',
        avatarUrl: data.avatarUrl || '',
      });
    } catch (err) {
      setServerError(err.message || 'Không thể tải thông tin hồ sơ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Họ và tên không được để trống';
    } else if (formData.fullName.trim().length > 100) {
      errors.fullName = 'Họ và tên tối đa 100 ký tự';
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!formData.phone.trim()) {
      errors.phone = 'Số điện thoại không được để trống';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      errors.phone = 'Số điện thoại không đúng định dạng Việt Nam (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09)';
    }

    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      if (dob >= today) {
        errors.dateOfBirth = 'Ngày sinh phải là một ngày trong quá khứ';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessToast('');

    if (!validate()) return;

    setIsSaving(true);
    try {
      const updated = await profileApi.updateProfile({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender,
        address: formData.address.trim(),
        avatarUrl: formData.avatarUrl.trim(),
      });

      setProfile(updated);
      setSuccessToast('Cập nhật hồ sơ cá nhân thành công!');

      // Update storage so layout header updates instantly
      const stored = localStorage.getItem('pms_user') || sessionStorage.getItem('pms_user');
      if (stored) {
        try {
          const userObj = JSON.parse(stored);
          userObj.fullName = updated.fullName;
          userObj.avatarUrl = updated.avatarUrl;
          if (localStorage.getItem('pms_user')) {
            localStorage.setItem('pms_user', JSON.stringify(userObj));
          } else {
            sessionStorage.setItem('pms_user', JSON.stringify(userObj));
          }
        } catch {}
      }

      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      setServerError(err.message || 'Cập nhật thất bại. Vui lòng kiểm tra lại');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || 'MALE',
        address: profile.address || '',
        avatarUrl: profile.avatarUrl || '',
      });
      setFieldErrors({});
      setServerError('');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const avatarInitials = (formData.fullName || profile?.username || 'U').trim().slice(0, 2).toUpperCase();

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px 0' }}>
      {/* Toast Notification */}
      {successToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #6ee7b7',
            borderRadius: '12px',
            padding: '12px 20px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '14px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: 'white',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#ffffff',
              color: '#059669',
              fontSize: '28px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {formData.avatarUrl ? (
              <img
                src={formData.avatarUrl}
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => (e.target.style.display = 'none')}
              />
            ) : (
              avatarInitials
            )}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>
              {profile?.fullName || profile?.username}
            </h1>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '13px' }}>
              {profile?.email} • Vai trò: <strong>{profile?.roleName || profile?.role}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPasswordModal(true)}
          className="btn-pms"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Đổi mật khẩu</span>
        </button>
      </div>

      {serverError && (
        <div
          style={{
            padding: '12px 16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: '10px',
            fontSize: '14px',
            marginBottom: '20px',
          }}
        >
          {serverError}
        </div>
      )}

      {/* Main Grid: Left Read-only info, Right Editable Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Read-Only Account Details */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
            height: 'fit-content',
          }}
        >
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Thông Tin Tài Khoản
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>Tên đăng nhập</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{profile?.username}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>Email hệ thống</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{profile?.email}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>Vai trò quyền hạn</div>
              <span className="pms-badge pms-badge-success" style={{ marginTop: '2px' }}>
                {profile?.roleName || profile?.role}
              </span>
            </div>

            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>Trạng thái tài khoản</div>
              <span className={`pms-badge ${profile?.status === 1 ? 'pms-badge-success' : 'pms-badge-danger'}`}>
                {profile?.status === 1 ? 'Hoạt động (Active)' : 'Đã khóa (Locked)'}
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Tài khoản được phân quyền bởi Quản trị viên (Admin). Bạn không thể thay đổi Tên đăng nhập và Email tại màn hình này.
              </div>
            </div>
          </div>
        </div>

        {/* Editable Profile Information */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
          }}
        >
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
            Chỉnh Sửa Hồ Sơ Cá Nhân
          </h3>

          <form onSubmit={handleSubmit}>
            {/* Full Name & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Họ và tên <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên..."
                  maxLength={100}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: `1.5px solid ${fieldErrors.fullName ? '#ef4444' : '#cbd5e1'}`,
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                {fieldErrors.fullName && (
                  <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                    {fieldErrors.fullName}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Số điện thoại <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="VD: 0912345678"
                  maxLength={15}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: `1.5px solid ${fieldErrors.phone ? '#ef4444' : '#cbd5e1'}`,
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                {fieldErrors.phone && (
                  <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                    {fieldErrors.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Date of Birth & Gender */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Ngày sinh
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: `1.5px solid ${fieldErrors.dateOfBirth ? '#ef4444' : '#cbd5e1'}`,
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                {fieldErrors.dateOfBirth && (
                  <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                    {fieldErrors.dateOfBirth}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Giới tính
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Địa chỉ thường trú
              </label>
              <textarea
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ nhà riêng, quận/huyện, tỉnh/thành phố..."
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Avatar URL */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Đường dẫn Ảnh đại diện (Avatar URL)
              </label>
              <input
                type="text"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                placeholder="https://example.com/avatar.png"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="btn-pms btn-pms-secondary"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-pms btn-pms-primary"
                style={{ minWidth: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" style={{ width: '14px', height: '14px' }} />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <span>Lưu hồ sơ</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={(msg) => {
          setSuccessToast(msg);
          setTimeout(() => setSuccessToast(''), 4000);
        }}
      />
    </div>
  );
}

