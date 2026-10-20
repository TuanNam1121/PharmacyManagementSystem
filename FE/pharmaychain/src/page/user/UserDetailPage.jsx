import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import accountApi from '../../api/accountApi';

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    setLoading(true);
    accountApi.getAccountDetail(id)
      .then(res => {
        if (res.data) setUser(res.data);
      })
      .catch(err => {
        setAlert({ type: 'danger', message: err.message || 'Không thể tải chi tiết tài khoản' });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleStatus = async () => {
    if (!user) return;
    const newStatus = user.status === 1 ? 0 : 1;
    const confirmText = newStatus === 1 ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn có chắc muốn ${confirmText} tài khoản này?`)) return;

    try {
      await accountApi.updateAccountStatus(user.id, newStatus);
      setUser(prev => ({ ...prev, status: newStatus }));
      setAlert({ type: 'success', message: `Đã ${confirmText} tài khoản thành công!` });
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Lỗi khi cập nhật trạng thái' });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" role="status"></div>
        <p className="mt-3 text-muted">Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert alert-warning">
        Không tìm thấy tài khoản người dùng.{' '}
        <button className="btn btn-link" onClick={() => navigate('/users')}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const genderLabel = user.gender === 1 ? 'Nam' : user.gender === 0 ? 'Nữ' : 'Khác';

  return (
    <div className="user-detail-page">
      {/* Top Banner / Breadcrumb */}
      <div className="page-title-wrap">
        <div>
          <h1 className="page-title">
            <span className="breadcrumb-muted">User & Security Management › Users › </span>
            {user.fullName || user.username}
          </h1>
          <p className="page-subtitle">User profile, assigned role and permission details.</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-custom"
            onClick={() => navigate('/users')}
          >
            Back to List
          </button>
          <button
            type="button"
            className="btn btn-primary-coral"
            onClick={() => navigate(`/users/edit/${user.id}`)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Edit User
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show mb-4`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
        </div>
      )}

      {/* Top Profile Summary Card */}
      <div className="figma-card p-4 mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-4">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
              alt={user.username}
              style={{ width: '72px', height: '72px', borderRadius: '12px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80';
              }}
            />
            <div>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '20px', color: '#1E293B' }}>
                {user.fullName || user.username}
              </h3>
              <p style={{ margin: '3px 0 0 0', color: '#64748B', fontSize: '14px' }}>
                @{user.username}
              </p>
              <div className="d-flex align-items-center gap-2 mt-2">
                <span className="badge bg-light text-dark border px-2 py-1" style={{ fontWeight: 600 }}>
                  {user.role ? `${user.role.name} (${user.role.code})` : 'Chưa có vai trò'}
                </span>
                <span className={`badge-status ${user.status === 1 ? 'active' : 'inactive'}`}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: user.status === 1 ? '#22C55E' : '#EF4444',
                      display: 'inline-block',
                    }}
                  ></span>
                  {user.status === 1 ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <button
              type="button"
              className={`btn btn-sm ${user.status === 1 ? 'btn-outline-danger' : 'btn-outline-success'}`}
              onClick={handleToggleStatus}
            >
              {user.status === 1 ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Personal & Account Information */}
        <div className="col-lg-7">
          <div className="figma-card p-4 h-100">
            <h5 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '18px', color: '#1E293B' }}>
              Personal & Contact Information
            </h5>

            <div className="row g-3">
              <div className="col-sm-6">
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>EMAIL</div>
                <div style={{ fontSize: '14px', fontWeight: 500, marginTop: '2px' }}>{user.email || '—'}</div>
              </div>
              <div className="col-sm-6">
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>PHONE NUMBER</div>
                <div style={{ fontSize: '14px', fontWeight: 500, marginTop: '2px' }}>{user.phone || '—'}</div>
              </div>
              <div className="col-sm-6">
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>DATE OF BIRTH</div>
                <div style={{ fontSize: '14px', fontWeight: 500, marginTop: '2px' }}>
                  {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : '—'}
                </div>
              </div>
              <div className="col-sm-6">
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>GENDER</div>
                <div style={{ fontSize: '14px', fontWeight: 500, marginTop: '2px' }}>{genderLabel}</div>
              </div>
              <div className="col-12">
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>ADDRESS</div>
                <div style={{ fontSize: '14px', fontWeight: 500, marginTop: '2px' }}>{user.address || '—'}</div>
              </div>
              <div className="col-sm-6">
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>CREATED AT</div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : '—'}
                </div>
              </div>
              <div className="col-sm-6">
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>LAST LOGIN</div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RBAC: Role & Permissions Card */}
        <div className="col-lg-5">
          <div className="figma-card p-4 h-100">
            <h5 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px', color: '#1E293B' }}>
              Role & Permissions (RBAC)
            </h5>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
              Permissions assigned to this account via role.
            </p>

            {user.role ? (
              <div>
                <div className="p-3 bg-light rounded mb-3 border">
                  <div style={{ fontWeight: 600, color: '#1E293B' }}>{user.role.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    Code: <code>{user.role.code}</code>
                  </div>
                  {user.role.description && (
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                      {user.role.description}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>
                  PERMISSIONS GRANTED ({user.permissions?.length || 0})
                </div>

                <div className="d-flex flex-wrap gap-2">
                  {user.permissions && user.permissions.length > 0 ? (
                    user.permissions.map((perm, idx) => (
                      <span
                        key={idx}
                        className="badge bg-secondary-subtle text-secondary-emphasis border px-2 py-1"
                        style={{ fontSize: '12px', fontWeight: 500 }}
                      >
                        {perm}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted" style={{ fontSize: '13px' }}>
                      Chưa có quyền cụ thể nào được gán cho vai trò này.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-muted" style={{ fontSize: '13px' }}>
                Tài khoản này chưa được gán vai trò nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
