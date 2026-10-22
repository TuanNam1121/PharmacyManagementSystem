import { useState } from 'react';
import { useUsers } from '../../hooks/user/useUsers';
import UserStats from '../../component/user/UserStats';
import UserFilters from '../../component/user/UserFilters';
import UserTable from '../../component/user/UserTable';
import UserDetailModal from '../../component/user/UserDetailModal';
import UserFormModal from '../../component/user/UserFormModal';
import UserLockModal from '../../component/user/UserLockModal';

function Pagination({ total, page, size, onPage }) {
  if (total <= size) return null;
  const totalPages = Math.ceil(total / size);
  return (
    <div className="pms-pagination">
      <button className="pms-page-btn" disabled={page === 0} onClick={() => onPage(page - 1)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
        <button
          key={i}
          className={`pms-page-btn ${page === i ? 'active' : ''}`}
          onClick={() => onPage(i)}
        >
          {i + 1}
        </button>
      ))}
      {totalPages > 7 && <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>}
      <button className="pms-page-btn" disabled={page + 1 >= totalPages} onClick={() => onPage(page + 1)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  );
}

export default function UsersPage() {
  const {
    accounts,
    totalElements,
    totalPages,
    page,
    setPage,
    size,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    roles,
    loading,
    error,
    setError,
    successMsg,
    setSuccessMsg,
    detailUser,
    detailLoading,
    loadDetail,
    handleCreateUser,
    handleUpdateUser,
    handleToggleStatus,
  } = useUsers();

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [editingUser, setEditingUser] = useState(null);

  // Lock / Unlock modal state
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [selectedUserForLock, setSelectedUserForLock] = useState(null);

  // View Details
  const handleView = async (id) => {
    setDetailModalOpen(true);
    try {
      await loadDetail(id);
    } catch {
      // Handled in hook
    }
  };

  // Open Create Modal
  const handleAddNew = () => {
    setFormMode('create');
    setEditingUser(null);
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const handleEdit = (user) => {
    setFormMode('edit');
    setEditingUser(user);
    setFormModalOpen(true);
  };

  // Open Lock/Unlock Modal (UC10)
  const handleOpenLockModal = (user) => {
    setSelectedUserForLock(user);
    setLockModalOpen(true);
  };

  // Handle Form Submit (UC09)
  const handleFormSubmit = async (payload) => {
    if (formMode === 'create') {
      await handleCreateUser(payload);
    } else {
      await handleUpdateUser(editingUser.id, payload);
    }
  };

  // Handle Lock / Unlock Confirm (UC10)
  const handleLockUnlockConfirm = async (id, targetStatus, reason) => {
    await handleToggleStatus(id, targetStatus, reason);
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="pms-page-header">
        <div>
          <h1 className="pms-page-title">User & Security Management</h1>
          <p className="pms-page-sub">
            Manage system accounts, configure role-based access control (RBAC), and monitor staff credentials.
          </p>
        </div>
      </div>

      {/* ── Alerts ── */}
      {successMsg && (
        <div className="pms-alert pms-alert-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {successMsg}
          <button className="pms-alert-close" onClick={() => setSuccessMsg(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {error && (
        <div className="pms-alert pms-alert-danger">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
          <button className="pms-alert-close" onClick={() => setError(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <UserStats
        total={totalElements}
        accounts={accounts}
        rolesCount={roles.length}
      />

      {/* ── Filters & Actions ── */}
      <UserFilters
        keyword={keyword}
        statusFilter={statusFilter}
        roleFilter={roleFilter}
        roles={roles}
        onKeywordChange={(val) => { setKeyword(val); setPage(0); }}
        onStatusChange={(val) => { setStatusFilter(val); setPage(0); }}
        onRoleChange={(val) => { setRoleFilter(val); setPage(0); }}
        onAddNew={handleAddNew}
        total={totalElements}
      />

      {/* ── Users Table ── */}
      <UserTable
        users={accounts}
        loading={loading}
        page={page}
        size={size}
        onView={handleView}
        onEdit={handleEdit}
        onLockUnlock={handleOpenLockModal}
      />

      {/* ── Pagination ── */}
      <Pagination
        total={totalElements}
        page={page}
        size={size}
        onPage={setPage}
      />

      {/* ── Modals ── */}
      <UserDetailModal
        show={detailModalOpen}
        onHide={() => setDetailModalOpen(false)}
        user={detailUser}
        loading={detailLoading}
        onEdit={handleEdit}
      />

      <UserFormModal
        show={formModalOpen}
        onHide={() => setFormModalOpen(false)}
        mode={formMode}
        user={editingUser}
        roles={roles}
        onSubmit={handleFormSubmit}
      />

      <UserLockModal
        show={lockModalOpen}
        onHide={() => { setLockModalOpen(false); setSelectedUserForLock(null); }}
        user={selectedUserForLock}
        onConfirm={handleLockUnlockConfirm}
      />
    </div>
  );
}
