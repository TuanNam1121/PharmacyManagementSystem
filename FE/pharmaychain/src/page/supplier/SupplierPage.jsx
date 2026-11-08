import { useEffect, useState } from 'react';
import { useSuppliers } from '../../hooks/supplier/useSuppliers';
import { isInactiveStatus } from '../../utils/format';
import SupplierStats from '../../component/supplier/SupplierStats';
import SupplierFilters from '../../component/supplier/SupplierFilters';
import SupplierTable from '../../component/supplier/SupplierTable';
import SupplierDetailModal from '../../component/supplier/SupplierDetailModal';
import SupplierCreateModal from '../../component/supplier/SupplierCreateModal';
import SupplierDeleteModal from '../../component/supplier/SupplierDeleteModal';

const INACTIVE_ACTION_MESSAGE = 'Nhà cung cấp đã ngừng hoạt động, không thể thực hiện thao tác này.';

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

export default function SupplierPage() {
  const {
    data,
    total,
    page,
    size,
    search,
    statusFilter,
    loading,
    error,
    setError,
    successMsg,
    setSuccessMsg,
    setPage,
    setSearch,
    setStatusFilter,
    fetchList,
    fetchDetail,
    handleDelete,
    detail,
    detailLoading,
    setDetail,
    stats,
    fetchStats,
  } = useSuppliers();

  const [modalOpen, setModalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    fetchList();
    fetchStats();
  }, [fetchList, fetchStats]);

  const handleView = async (id) => {
    setModalOpen(true);
    try {
      await fetchDetail(id);
    } catch {
      // error handled in hook
    }
  };

  const handleCreateNew = () => {
    setFormMode('create');
    setSelectedSupplier(null);
    setFormOpen(true);
  };

  const handleEdit = (supplier) => {
    if (isInactiveStatus(supplier?.status)) {
      setError(INACTIVE_ACTION_MESSAGE);
      return;
    }
    setFormMode('edit');
    setSelectedSupplier(supplier);
    setFormOpen(true);
  };

  const handleFormSuccess = async () => {
    setSuccessMsg(
      formMode === 'create'
        ? 'Đăng ký nhà cung ứng đối tác thành công!'
        : 'Cập nhật thông tin nhà cung ứng thành công!'
    );
    await fetchList();
  };

  const handleDeleteRequest = (row) => {
    if (isInactiveStatus(row?.status)) {
      setError(INACTIVE_ACTION_MESSAGE);
      return;
    }
    setDeleteTarget(row);
    setDeleteReason('');
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      await handleDelete(deleteTarget.id, deleteReason);
      setDeleteTarget(null);
      setDeleteReason('');
    } catch {
      // error handled in hook
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="pms-page-header">
        <div>
          <h1 className="pms-page-title">Danh Mục Nhà Cung Cấp & Đối Tác</h1>
          <p className="pms-page-sub">
            Quản lý nhà cung ứng dược phẩm, hồ sơ doanh nghiệp thương mại, thông tin liên hệ và tuân thủ mã số thuế.
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
      <SupplierStats total={stats?.total ?? total} stats={stats} suppliers={data} />

      {/* ── Filters Bar ── */}
      <SupplierFilters
        search={search}
        statusFilter={statusFilter}
        onSearch={(val) => { setSearch(val); setPage(0); }}
        onStatus={(val) => { setStatusFilter(val); setPage(0); }}
        onAddNew={handleCreateNew}
        total={data.length}
      />

      {/* ── Table ── */}
      <SupplierTable
        data={data}
        loading={loading}
        page={page}
        size={size}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      {/* ── Pagination ── */}
      <Pagination
        total={total}
        page={page}
        size={size}
        onPage={setPage}
      />

      {/* ── Detail Modal ── */}
      <SupplierDetailModal
        show={modalOpen}
        onHide={() => { setModalOpen(false); setDetail(null); }}
        detail={detail}
        loading={detailLoading}
        onEdit={handleEdit}
      />

      {/* ── Create / Edit Form Modal ── */}
      <SupplierCreateModal
        show={formOpen}
        onHide={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
        mode={formMode}
        supplier={selectedSupplier}
      />

      {/* ── Delete / Deactivate Modal ── */}
      <SupplierDeleteModal
        show={!!deleteTarget}
        onHide={() => { setDeleteTarget(null); setDeleteReason(''); }}
        supplierName={deleteTarget?.name}
        reason={deleteReason}
        onReasonChange={setDeleteReason}
        onSubmit={handleConfirmDelete}
        submitting={deleteSubmitting}
      />
    </div>
  );
}
