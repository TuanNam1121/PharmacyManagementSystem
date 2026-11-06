import { useEffect, useState } from 'react';
import { useProducts } from '../../hooks/product/useProducts';
import ProductStats from '../../component/product/ProductStats';
import ProductFilters from '../../component/product/ProductFilters';
import ProductTable from '../../component/product/ProductTable';
import ProductDetailModal from '../../component/product/ProductDetailModal';
import ProductFormModal from '../../component/product/ProductFormModal';
import ProductPriceModal from '../../component/product/ProductPriceModal';
import ProductStatusModal from '../../component/product/ProductStatusModal';

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

export default function ProductPage() {
  const {
    data,
    total,
    page,
    size,
    search,
    statusFilter,
    categoryFilter,
    loading,
    error,
    setError,
    successMsg,
    setSuccessMsg,
    setPage,
    setSearch,
    setStatusFilter,
    setCategoryFilter,
    fetchList,
    fetchDetail,
    detail,
    detailLoading,
    setDetail,
    categories,
    fetchCategories,
    handleToggleStatus,
  } = useProducts();

  const [modalOpen, setModalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Price Update modal state
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceProduct, setPriceProduct] = useState(null);

  // Status Toggle modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusProduct, setStatusProduct] = useState(null);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
    setSelectedProduct(null);
    setFormOpen(true);
  };

  const handleEdit = (product) => {
    setFormMode('edit');
    setSelectedProduct(product);
    setFormOpen(true);
  };

  const handleFormSuccess = async () => {
    setSuccessMsg(
      formMode === 'create'
        ? 'Đã thêm thuốc mới vào danh mục thành công!'
        : 'Đã cập nhật thông tin thuốc thành công!'
    );
    await fetchList();
  };

  // Price Update handler
  const handleUpdatePrice = (product) => {
    setPriceProduct(product);
    setPriceModalOpen(true);
  };

  const handlePriceSuccess = async () => {
    setSuccessMsg('Đã cập nhật giá bán niêm yết thành công!');
    await fetchList();
  };

  // Toggle Status handler
  const handleToggleProductStatus = (product) => {
    setStatusProduct(product);
    setStatusModalOpen(true);
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="pms-page-header">
        <div>
          <h1 className="pms-page-title">Danh Mục Thuốc &amp; Dược Phẩm</h1>
          <p className="pms-page-sub">
            Quản lý danh mục dược phẩm toàn chuỗi, thiết lập giá niêm yết và thông số tiêu chuẩn GSP
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
      <ProductStats total={total} products={data} />

      {/* ── Filters Bar ── */}
      <ProductFilters
        search={search}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        categories={categories}
        onSearch={(val) => { setSearch(val); setPage(0); }}
        onStatus={(val) => { setStatusFilter(val); setPage(0); }}
        onCategory={(val) => { setCategoryFilter(val); setPage(0); }}
        onAddNew={handleCreateNew}
        total={data.length}
      />

      {/* ── Table ── */}
      <ProductTable
        data={data}
        loading={loading}
        page={page}
        size={size}
        onView={handleView}
        onEdit={handleEdit}
        onUpdatePrice={handleUpdatePrice}
        onToggleStatus={handleToggleProductStatus}
      />

      {/* ── Pagination ── */}
      <Pagination
        total={total}
        page={page}
        size={size}
        onPage={setPage}
      />

      {/* ── Detail Modal ── */}
      <ProductDetailModal
        show={modalOpen}
        onHide={() => { setModalOpen(false); setDetail(null); }}
        detail={detail}
        loading={detailLoading}
        onEdit={handleEdit}
      />

      {/* ── Create / Edit Form Modal ── */}
      <ProductFormModal
        show={formOpen}
        onHide={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
        mode={formMode}
        product={selectedProduct}
        categories={categories}
      />

      {/* ── Price Update Modal ── */}
      <ProductPriceModal
        show={priceModalOpen}
        onHide={() => { setPriceModalOpen(false); setPriceProduct(null); }}
        product={priceProduct}
        onSuccess={handlePriceSuccess}
      />

      {/* ── Status Toggle Modal ── */}
      <ProductStatusModal
        show={statusModalOpen}
        onHide={() => { setStatusModalOpen(false); setStatusProduct(null); }}
        product={statusProduct}
        onConfirm={async (id, targetStatus) => {
          await handleToggleStatus(id, Number(statusProduct?.status ?? 1));
          setSuccessMsg(
            targetStatus === 0
              ? 'Đã tạm ngừng kinh doanh sản phẩm thành công!'
              : 'Đã kích hoạt lại sản phẩm thành công!'
          );
          setStatusModalOpen(false);
          setStatusProduct(null);
        }}
      />
    </div>
  );
}
