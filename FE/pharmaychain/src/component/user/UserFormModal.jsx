import { useState, useEffect } from 'react';

export default function UserFormModal({
  show,
  onHide,
  mode = 'create', // 'create' | 'edit'
  user = null,
  roles = [],
  onSubmit,
}) {
  const isEdit = mode === 'edit';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    fullName: '',
    roleId: '',
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
          roleId: user.roleId || user.role?.id || (roles[0]?.id || ''),
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
          roleId: roles.length > 0 ? roles[0].id : '',
          status: 1,
          dateOfBirth: '',
          gender: 1,
          address: '',
          avatarUrl: '',
        });
      }
    }
  }, [show, isEdit, user, roles]);

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
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg('Email address is required.');
      return;
    }
    if (!formData.roleId) {
      setErrorMsg('Please select a Role for the account.');
      return;
    }

    if (!isEdit) {
      if (!formData.username.trim() || formData.username.trim().length < 3) {
        setErrorMsg('Username must be at least 3 characters.');
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        roleId: Number(formData.roleId),
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
      setErrorMsg(err?.message || 'Failed to save user account.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusText = (status) => {
    if (Number(status) === 1) return { text: 'Active', badge: 'pms-badge-success' };
    if (Number(status) === 2) return { text: 'Locked', badge: 'pms-badge-danger' };
    return { text: 'Disabled / Inactive', badge: 'pms-badge-neutral' };
  };

  const currentStatusInfo = getStatusText(formData.status);

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-lg">
        {/* Header */}
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">
              {isEdit ? 'Edit User Profile' : 'Create New User Account'}
            </div>
            <div className="pms-modal-sub">
              {isEdit
                ? `Update account information and role assignment for @${user?.username}`
                : 'Register a new staff member with credentials and system role'}
            </div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Close">
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
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {errorMsg}
                <button type="button" className="pms-alert-close" onClick={() => setErrorMsg(null)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Section 1: Credentials & Role */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                1. Account Credentials & Security
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="pms-form-group">
                  <label className="pms-label">Username *</label>
                  <input
                    className="pms-input pms-input-bare"
                    name="username"
                    placeholder="e.g. jdoe"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isEdit}
                    required
                  />
                  {isEdit && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                      Username cannot be changed after creation.
                    </span>
                  )}
                </div>

                {!isEdit ? (
                  <div className="pms-form-group">
                    <label className="pms-label">Initial Password *</label>
                    <input
                      className="pms-input pms-input-bare"
                      type="password"
                      name="password"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                ) : (
                  <div className="pms-form-group">
                    <label className="pms-label">Account Status (Read-only)</label>
                    <div style={{ display: 'flex', alignItems: 'center', height: 38, gap: 8 }}>
                      <span className={`pms-badge ${currentStatusInfo.badge}`}>
                        {currentStatusInfo.text}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        (Use Lock/Unlock action on user list to change status)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12 }}>
                <div className="pms-form-group">
                  <label className="pms-label">Assigned Role (RBAC) *</label>
                  <select
                    className="pms-select"
                    style={{ width: '100%' }}
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">— Select a Role —</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name || r.code} ({r.code})
                      </option>
                    ))}
                  </select>
                </div>

                {!isEdit && (
                  <div className="pms-form-group">
                    <label className="pms-label">Account Status</label>
                    <select
                      className="pms-select"
                      style={{ width: '100%' }}
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="1">Active</option>
                      <option value="0">Disabled</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Personal Profile */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                2. Personal Details
              </div>

              <div className="pms-form-group" style={{ marginBottom: 14 }}>
                <label className="pms-label">Full Name *</label>
                <input
                  className="pms-input pms-input-bare"
                  name="fullName"
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="pms-form-group">
                  <label className="pms-label">Email Address *</label>
                  <input
                    className="pms-input pms-input-bare"
                    type="email"
                    name="email"
                    placeholder="e.g. user@pharmacy.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="pms-form-group">
                  <label className="pms-label">Phone Number</label>
                  <input
                    className="pms-input pms-input-bare"
                    name="phone"
                    placeholder="e.g. +84 912 345 678"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="pms-form-group">
                  <label className="pms-label">Date of Birth</label>
                  <input
                    className="pms-input pms-input-bare"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                <div className="pms-form-group">
                  <label className="pms-label">Gender</label>
                  <select
                    className="pms-select"
                    style={{ width: '100%' }}
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="1">Male</option>
                    <option value="2">Female</option>
                    <option value="0">Other</option>
                  </select>
                </div>
              </div>

              <div className="pms-form-group" style={{ marginBottom: 14 }}>
                <label className="pms-label">Address</label>
                <input
                  className="pms-input pms-input-bare"
                  name="address"
                  placeholder="Residential or work address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="pms-form-group">
                <label className="pms-label">Avatar URL (Optional)</label>
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
              Cancel
            </button>
            <button type="submit" className="btn-pms btn-pms-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
