import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import authApi from '../../api/authApi';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenParam = searchParams.get('token') || '';

  const [formData, setFormData] = useState({
    token: tokenParam,
    newPassword: '',
    confirmPassword: '',
  });

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '#e2e8f0' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[@$!%*?&]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
      case 2:
        return { score, label: 'Yếu', color: '#ef4444' };
      case 3:
      case 4:
        return { score, label: 'Khá', color: '#f59e0b' };
      case 5:
        return { score, label: 'Mạnh', color: '#10b981' };
      default:
        return { score: 0, label: '', color: '#e2e8f0' };
    }
  };

  const strength = calculateStrength(formData.newPassword);

  const validate = () => {
    const errors = {};
    if (!formData.token.trim()) {
      errors.token = 'Mã xác thực token không được để trống';
    }

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/;

    if (!formData.newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 8 || formData.newPassword.length > 32) {
      errors.newPassword = 'Mật khẩu mới phải từ 8 đến 32 ký tự';
    } else if (!pwdRegex.test(formData.newPassword)) {
      errors.newPassword = 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@$!%*?&)';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({
        token: formData.token.trim(),
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.' },
        });
      }, 2500);
    } catch (err) {
      setServerError(err.message || 'Đặt lại mật khẩu thất bại. Token có thể đã hết hạn hoặc không hợp lệ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '20px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
          padding: '40px 36px',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              marginBottom: '16px',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            Tạo Mật Khẩu Mới
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Nhập mã token xác thực và thiết lập mật khẩu mới cho tài khoản
          </p>
        </div>

        {success ? (
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              textAlign: 'center',
              fontSize: '14px',
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>🎉</div>
            <strong>Đặt lại mật khẩu thành công!</strong>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>
              Đang chuyển hướng về trang đăng nhập...
            </div>
          </div>
        ) : (
          <>
            {serverError && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: '13px',
                  marginBottom: '20px',
                }}
              >
                <div>{serverError}</div>
                <div style={{ marginTop: '8px' }}>
                  <Link to="/forgot-password" style={{ color: '#dc2626', fontWeight: 600, fontSize: '12px' }}>
                    Yêu cầu nhận liên kết mới →
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Token field */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Mã Token Xác Thực <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="token"
                  value={formData.token}
                  onChange={handleChange}
                  placeholder="Nhập mã token từ email..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: `1.5px solid ${fieldErrors.token ? '#ef4444' : '#cbd5e1'}`,
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {fieldErrors.token && (
                  <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                    {fieldErrors.token}
                  </div>
                )}
              </div>

              {/* New Password */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Mật khẩu mới <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNew ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Tối thiểu 8 ký tự, đủ chữ hoa, thường, số, ký tự đặc biệt..."
                    style={{
                      width: '100%',
                      padding: '9px 38px 9px 12px',
                      borderRadius: '8px',
                      border: `1.5px solid ${fieldErrors.newPassword ? '#ef4444' : '#cbd5e1'}`,
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                    }}
                  >
                    {showNew ? '👁' : '👁‍🗨'}
                  </button>
                </div>

                {formData.newPassword && (
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '4px' }}>
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          style={{
                            flex: 1,
                            background: lvl <= strength.score ? strength.color : '#e2e8f0',
                            borderRadius: '2px',
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ fontSize: '11px', color: strength.color, fontWeight: 600 }}>
                      Độ mạnh: {strength.label}
                    </div>
                  </div>
                )}

                {fieldErrors.newPassword && (
                  <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                    {fieldErrors.newPassword}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Xác nhận mật khẩu mới <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu mới..."
                    style={{
                      width: '100%',
                      padding: '9px 38px 9px 12px',
                      borderRadius: '8px',
                      border: `1.5px solid ${fieldErrors.confirmPassword ? '#ef4444' : '#cbd5e1'}`,
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                    }}
                  >
                    {showConfirm ? '👁' : '👁‍🗨'}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                    {fieldErrors.confirmPassword}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-pms btn-pms-primary"
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '20px',
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" style={{ width: '16px', height: '16px' }} />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <span>Đặt lại mật khẩu</span>
                )}
              </button>

              <div style={{ textAlign: 'center', fontSize: '13px' }}>
                <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
                  Quay lại Đăng nhập
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

