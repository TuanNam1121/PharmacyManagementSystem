import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import accountApi from '../../api/accountApi';

export default function UserListPage() {
  const navigate = useNavigate();

  // State
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [size] = useState(8); // Matching 8 results per page in Figma mockup

  // Filters
  const [keyword, setKeyword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Fetch roles for filter dropdown
  useEffect(() => {
    accountApi.getRoles()
      .then(res => {
        if (res.data) setRoles(res.data);
      })
      .catch(err => console.error('Error fetching roles:', err));
  }, []);

  // Fetch accounts list
  const fetchUsers = useCallback(() => {
    setLoading(true);
    accountApi.getAccounts({
      keyword,
      status: selectedStatus,
      roleId: selectedRole,
      page,
      size,
      sortBy: 'createdAt',
      sortDir: 'desc',
    })
      .then(res => {
        if (res.data) {
          setUsers(res.data.items || []);
          setTotalElements(res.data.totalElements || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(err => {
        setAlert({ type: 'danger', message: err.message || 'Không thể tải danh sách tài khoản' });
      })
      .finally(() => setLoading(false));
  }, [keyword, selectedStatus, selectedRole, page, size]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle status toggle (Active / Inactive)
  const handleToggleStatus = async (user, e) => {
    e.stopPropagation();
    const newStatus = user.status === 1 ? 0 : 1;
    const confirmText = newStatus === 1 ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn có chắc muốn ${confirmText} tài khoản "${user.username}"?`)) {
      return;
    }

    try {
      await accountApi.updateAccountStatus(user.id, newStatus);
      setAlert({
        type: 'success',
        message: `Đã ${confirmText} tài khoản ${user.username} thành công!`,
      });
      fetchUsers();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Lỗi khi đổi trạng thái tài khoản' });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  return (
    <div className="user-list-page">
      {/* Top Banner / Breadcrumb */}
      <div className="page-title-wrap">
        <div>
          <h1 className="page-title">
            <span className="breadcrumb-muted">User & Security Management › </span>
            Users ({totalElements})
          </h1>
          <p className="page-subtitle">List of accounts registered in the system.</p>
        </div>
        <button
          className="btn btn-primary-coral"
          onClick={() => navigate('/users/add')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New User
        </button>
      </div>

      {/* Alert Notification */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="filter-toolbar">
        <form onSubmit={handleSearchSubmit} className="table-search-box">
          <input
            type="text"
            className="table-search-input"
            placeholder="Search User by name, username, email, phone..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button
            type="submit"
            className="btn p-0 border-0 position-absolute"
            style={{ right: '12px', top: '50%', transform: 'translateY(-50%)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        <button className="filter-icon-btn" title="Bộ lọc nâng cao" onClick={fetchUsers}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </button>

        {/* Filter by Role */}
        <select
          className="select-filter"
          value={selectedRole}
          onChange={(e) => {
            setSelectedRole(e.target.value);
            setPage(0);
          }}
        >
          <option value="">- Select Role -</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
          ))}
        </select>

        {/* Filter by Status */}
        <select
          className="select-filter"
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setPage(0);
          }}
        >
          <option value="">- Select Status -</option>
          <option value="1">Active</option>
          <option value="0">Inactive / Locked</option>
        </select>
      </div>

      {/* Main Table Card */}
      <div className="figma-card">
        <div className="table-responsive">
          <table className="figma-table">
            <thead>
              <tr>
                <th>User Name ↕</th>
                <th>Email & Phone</th>
                <th>Role ↕</th>
                <th>Status ↕</th>
                <th>Created Date ↕</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-danger me-2" role="status"></div>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    {/* User Profile */}
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={u.username}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#1E293B' }}>
                            {u.fullName || u.username}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>
                            @{u.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td>
                      <div style={{ fontWeight: 500 }}>{u.email}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{u.phone || 'Chưa cập nhật'}</div>
                    </td>

                    {/* Role */}
                    <td>
                      <span className="badge bg-light text-dark border px-2 py-1" style={{ fontWeight: 600 }}>
                        {u.roleName || u.roleCode || 'Chưa gán'}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`badge-status ${u.status === 1 ? 'active' : 'inactive'}`}>
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: u.status === 1 ? '#22C55E' : '#EF4444',
                            display: 'inline-block',
                          }}
                        ></span>
                        {u.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td style={{ color: '#64748B', fontSize: '13px' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="d-inline-flex align-items-center gap-3">
                        <button
                          type="button"
                          className="btn btn-link p-0 view-detail-link"
                          onClick={() => navigate(`/users/${u.id}`)}
                        >
                          View Full Detail »
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          style={{ padding: '2px 8px', fontSize: '12px' }}
                          onClick={() => navigate(`/users/edit/${u.id}`)}
                          title="Chỉnh sửa"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${u.status === 1 ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          style={{ padding: '2px 8px', fontSize: '12px' }}
                          onClick={(e) => handleToggleStatus(u, e)}
                          title={u.status === 1 ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {u.status === 1 ? 'Lock' : 'Unlock'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer (Matching Figma Mockup) */}
        <div className="pagination-wrap">
          <div>
            Showing {users.length === 0 ? 0 : page * size + 1} – {Math.min((page + 1) * size, totalElements)} results of {totalElements}
          </div>

          <div className="page-controls">
            <button
              className="page-nav-btn"
              disabled={page <= 0}
              onClick={() => setPage(page - 1)}
              title="Trang trước"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <span style={{ fontSize: '13.5px', fontWeight: 500, color: '#1E293B', padding: '0 8px' }}>
              Page {String(page + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
            </span>

            <button
              className="page-nav-btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              title="Trang sau"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
