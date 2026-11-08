import { useEffect, useState } from 'react';
import { useCategories } from '../../hooks/category/useCategories';
import CategoryStats from '../../component/category/CategoryStats';
import CategoryFilters from '../../component/category/CategoryFilters';
import CategoryTable from '../../component/category/CategoryTable';
import CategoryFormModal from '../../component/category/CategoryFormModal';
import CategoryStatusModal from '../../component/category/CategoryStatusModal';

function Pagination({ total, page, size, onPage }) {
  if (total <= size) return null;
  const totalPages = Math.ceil(total / size);
  return (
    <div className="pms-pagination">
      <button className="pms-page-btn" disabled={page === 0} onClick={() => onPage(page - 1)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
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
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

export default function CategoryPage() {
  const {
    data,
    allCategories,
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
    handleToggleStatus,
    handleDeleteCategory,
  } = useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusCategory, setStatusCategory] = useState(null);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleCreateNew = () => {
    setFormMode('create');
    setSelectedCategory(null);
    setFormOpen(true);
  };

  const handleEdit = (category) => {
    setFormMode('edit');
    setSelectedCategory(category);
    setFormOpen(true);
  };

  const handleFormSuccess = async () => {
    setSuccessMsg(
      formMode === 'create'
        ? 'Đã tạo mới nhóm danh mục thành công!'
        : 'Đã cập nhật thông tin nhóm danh mục thành công!'
    );
    await fetchList();
  };

  const handleToggleCategoryStatus = (cat) => {
    setStatusCategory(cat);
    setStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async (categoryId, targetStatus) => {
    await handleToggleStatus(categoryId, statusCategory?.status ?? (targetStatus === 0 ? 1 : 0));
    setSuccessMsg(
      targetStatus === 0
        ? 'Đã ngừng hoạt động nhóm danh mục thành công!'
        : 'Đã kích hoạt lại nhóm danh mục thành công!'
    );
    await fetchList();
  };

  const handleDeleteClick = async (cat) => {
    const isConfirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa nhóm danh mục "${cat.name}"?\n\n` +
      `- Nếu danh mục này đang chứa sản phẩm, hệ thống sẽ tự động chuyển sang trạng thái "Ngừng hoạt động" (Inactive) để bảo toàn dữ liệu.\n` +
      `- Nếu danh mục chưa có sản phẩm nào, hệ thống sẽ xóa hoàn toàn khỏi cơ sở dữ liệu.`
    );
    if (!isConfirmed) return;

    try {
      await handleDeleteCategory(cat.id);
    } catch {
      // Error handled in hook
    }
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="pms-page-header">
        <div>
          <h1 className="pms-page-title">Nhóm Danh Mục Dược Phẩm</h1>
          <p className="pms-page-sub">
            Quản lý cấu trúc phân loại danh mục thuốc và vật tư y tế trong chuỗi nhà thuốc
          </p>
        </div>
      </div>

      {/* ── Alerts ── */}
      {successMsg && (
        <div className="pms-alert pms-alert-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {successMsg}
          <button className="pms-alert-close" onClick={() => setSuccessMsg(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <div className="pms-alert pms-alert-danger">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
          <button className="pms-alert-close" onClick={() => setError(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <CategoryStats total={allCategories.length} categories={allCategories} />

      {/* ── Filters Bar ── */}
      <CategoryFilters
        search={search}
        statusFilter={statusFilter}
        onSearch={(val) => { setSearch(val); setPage(0); }}
        onStatus={(val) => { setStatusFilter(val); setPage(0); }}
        onAddNew={handleCreateNew}
        total={total}
      />

      {/* ── Table ── */}
      <CategoryTable
        data={data}
        loading={loading}
        page={page}
        size={size}
        onEdit={handleEdit}
        onToggleStatus={handleToggleCategoryStatus}
        onDelete={handleDeleteClick}
      />

      {/* ── Pagination ── */}
      <Pagination
        total={total}
        page={page}
        size={size}
        onPage={setPage}
      />

      {/* ── Create / Edit Form Modal ── */}
      <CategoryFormModal
        show={formOpen}
        onHide={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
        mode={formMode}
        category={selectedCategory}
      />

      {/* ── Status Toggle Modal ── */}
      <CategoryStatusModal
        show={statusModalOpen}
        onHide={() => { setStatusModalOpen(false); setStatusCategory(null); }}
        category={statusCategory}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}
