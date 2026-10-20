import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import accountApi from '../../api/accountApi';

export default function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    roleId: '',
    status: 1,
    password: '',
    dateOfBirth: '',
    gender: 1,
    avatarUrl: '',
    address: '',
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Fetch roles list
  useEffect(() => {
    accountApi.getRoles()
      .then(res => {
        if (res.data) {
          setRoles(res.data);
          // Pre-select first role if creating and not yet selected
          if (!isEditMode && res.data.length > 0) {
            setFormData(prev => ({ ...prev, roleId: res.data[0].id }));
          }
        }
      })
      .catch(err => console.error('Error fetching roles:', err));
  }, [isEditMode]);

  // If in edit mode, fetch existing user data
  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      accountApi.getAccountDetail(id)
        .then(res => {
          if (res.data) {
            const u = res.data;
            setFormData({
              username: u.username || '',
              fullName: u.fullName || '',
              email: u.email || '',
              phone: u.phone || '',
              roleId: u.role ? u.role.id : '',
              status: u.status !== undefined ? u.status : 1,
              password: '', // Blank when editing
              dateOfBirth: u.dateOfBirth ? u.dateOfBirth.substring(0, 10) : '',
              gender: u.gender !== undefined && u.gender !== null ? u.gender : 1,
              avatarUrl: u.avatarUrl || '',
              address: u.address || '',
            });
          }
        })
        .catch(err => {
          setAlert({ type: 'danger', message: err.message || 'Không thể tải thông tin người dùng' });
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'roleId' || name === 'status' || name === 'gender'
        ? (value === '' ? '' : Number(value))
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    // Basic frontend validations
    if (!formData.fullName.trim()) {
      setAlert({ type: 'warning', message: 'Vui lòng nhập Họ và tên' });
      return;
    }
    if (!formData.email.trim()) {
      setAlert({ type: 'warning', message: 'Vui lòng nhập Email' });
      return;
    }
    if (!formData.roleId) {
      setAlert({ type: 'warning', message: 'Vui lòng chọn Vai trò (Role)' });
      return;
    }

    if (!isEditMode) {
      if (!formData.username.trim()) {
        setAlert({ type: 'warning', message: 'Vui lòng nhập Tên đăng nhập' });
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setAlert({ type: 'warning', message: 'Mật khẩu phải từ 6 ký tự trở lên' });
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        // Update user
        const updatePayload = {
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
          roleId: formData.roleId,
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth || null,
          gender: formData.gender,
          address: formData.address,
          avatarUrl: formData.avatarUrl,
        };
        await accountApi.updateAccount(id, updatePayload);
        setAlert({ type: 'success', message: 'Cập nhật tài khoản thành công!' });
      } else {
        // Create user
        await accountApi.createAccount(formData);
        setAlert({ type: 'success', message: 'Tạo mới tài khoản thành công!' });
      }

      // Navigate back to list after short delay
      setTimeout(() => {
        navigate('/users');
      }, 1000);
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Đã có lỗi xảy ra khi lưu tài khoản' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" role="status"></div>
        <p className="mt-3 text-muted">Đang tải dữ liệu tài khoản...</p>
      </div>
    );
  }

  return (
    <div className="user-form-page">
      {/* Top Banner / Breadcrumb (Matching Image 2) */}
      <div className="page-title-wrap">
        <div>
          <h1 className="page-title">
            <span className="breadcrumb-muted">User & Security Management › Users › </span>
            {isEditMode ? 'Update User' : 'Add New User'}
          </h1>
          <p className="page-subtitle">*All fields are mandatory, except mentioned as (optional).</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-custom"
          onClick={() => navigate('/users')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to List
        </button>
      </div>

      {/* Alert Notification */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show mb-4`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
        </div>
      )}

      {/* Form Card (Matching Figma Image 2 Layout & Style) */}
      <div className="figma-card p-4">
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Row 1: Username & Full Name */}
            <div className="col-md-6">
              <label className="figma-form-label">
                User Name {isEditMode && <span className="text-muted fw-normal">(Không thể thay đổi)</span>}
              </label>
              <input
                type="text"
                name="username"
                className="form-control figma-input"
                placeholder="vd: pharmacist_nam"
                value={formData.username}
                onChange={handleChange}
                disabled={isEditMode}
                required={!isEditMode}
              />
            </div>

            <div className="col-md-6">
              <label className="figma-form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                className="form-control figma-input"
                placeholder="vd: Nguyễn Tuấn Nam"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Row 2: Email & Phone Number */}
            <div className="col-md-6">
              <label className="figma-form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control figma-input"
                placeholder="vd: nam@pharmacy.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="figma-form-label">Phone Number (optional)</label>
              <input
                type="text"
                name="phone"
                className="form-control figma-input"
                placeholder="vd: 0987654321"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Row 3: Role & Status */}
            <div className="col-md-6">
              <label className="figma-form-label">Role</label>
              <select
                name="roleId"
                className="form-select figma-input"
                value={formData.roleId}
                onChange={handleChange}
                required
              >
                <option value="">- Select Role -</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="figma-form-label">Status</label>
              <select
                name="status"
                className="form-select figma-input"
                value={formData.status}
                onChange={handleChange}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive / Locked</option>
              </select>
            </div>

            {/* Row 4: Password & Date of Birth */}
            {!isEditMode && (
              <div className="col-md-6">
                <label className="figma-form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control figma-input"
                  placeholder="Tối thiểu 6 ký tự"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className={isEditMode ? 'col-md-6' : 'col-md-6'}>
              <label className="figma-form-label">Date of Birth (optional)</label>
              <input
                type="date"
                name="dateOfBirth"
                className="form-control figma-input"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            {/* Row 5: Gender & Avatar URL */}
            <div className="col-md-6">
              <label className="figma-form-label">Gender</label>
              <select
                name="gender"
                className="form-select figma-input"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value={1}>Nam (Male)</option>
                <option value={0}>Nữ (Female)</option>
                <option value={2}>Khác (Other)</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="figma-form-label">Avatar URL (optional)</label>
              <input
                type="url"
                name="avatarUrl"
                className="form-control figma-input"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatarUrl}
                onChange={handleChange}
              />
            </div>

            {/* Row 6: Address (Textarea) */}
            <div className="col-12">
              <label className="figma-form-label">Address (optional)</label>
              <textarea
                name="address"
                rows="3"
                className="form-control figma-input"
                placeholder="Nhập địa chỉ liên hệ..."
                value={formData.address}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          {/* Form Action Buttons (Matching Image 2 button style) */}
          <div className="d-flex align-items-center gap-3 mt-4 pt-2">
            <button
              type="submit"
              className="btn btn-primary-coral"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving...
                </>
              ) : (
                'Save Details'
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline-custom"
              onClick={() => navigate('/users')}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
