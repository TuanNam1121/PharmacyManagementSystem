import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSuppliers } from '../../hooks/supplier/useSuppliers';
import SupplierStats from '../../component/supplier/SupplierStats';
import SupplierFilters from '../../component/supplier/SupplierFilters';
import SupplierTable from '../../component/supplier/SupplierTable';
import SupplierDetailModal from '../../component/supplier/SupplierDetailModal';
import SupplierCreateModal from '../../component/supplier/SupplierCreateModal';

export default function SupplierPage() {
  const {
    data, total, page, size, search, statusFilter, loading, error,
    setPage, setSize, setSearch, setStatusFilter,
    fetchList, fetchDetail, detail, detailLoading, setDetail,
  } = useSuppliers();

  const [modalOpen, setModalOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const activeCount = data.filter((x) => x.status === '1').length;
  const inactiveCount = data.filter((x) => x.status === '0').length;

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleView = async (id) => {
    setModalOpen(true);
    try {
      await fetchDetail(id);
    } catch {
      // error already set by hook
    }
  };

  const handleCreate = () => {
    setCreateOpen(true);
  };

  const handleCreateSuccess = async () => {
    await fetchList();
  };


  return (
    <div className="container-fluid px-4 py-4">
      {/* Page header */}
      <nav className="mb-3" aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><NavLink to="/" className="text-muted text-decoration-none">Đối tác</NavLink></li>
          <li className="breadcrumb-item active" aria-current="page">Nhà cung cấp</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Nhà cung cấp</h1>
          <p className="text-muted mb-0">Quản lý đối tác cung cấp và hồ sơ pháp lý trên toàn hệ thống.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={handleCreate}>
            <svg className="bi bi-plus" width="16" height="16" aria-hidden="true"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h-3V4.5A.5.5 0 0 1 4 4z"/></svg>
            Thêm nhà cung cấp
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" />
        </div>
      )}

      {/* Stats */}
      <SupplierStats total={total} active={activeCount} inactive={inactiveCount} />

      {/* Filters */}
      <SupplierFilters
        search={search}
        statusFilter={statusFilter}
        onSearch={setSearch}
        onStatus={setStatusFilter}
        total={data.length}
      />

      {/* Table */}
      <SupplierTable data={data} loading={loading} onView={handleView} />

      {/* Pagination */}
      <nav className="mt-3">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
            <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); if (page > 0) setPage(page - 1); }}>&laquo;</a>
          </li>
          <li className={`page-item ${page === 0 ? 'active' : ''}`}>
            <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setPage(0); }}>1</a>
          </li>
          <li className={`page-item ${page === 1 ? 'active' : ''}`}>
            <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setPage(1); }}>2</a>
          </li>
          <li className={`page-item ${page === 2 ? 'active' : ''}`}>
            <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setPage(2); }}>3</a>
          </li>
          <li className={`page-item ${page + 1 >= Math.ceil(total / size) ? 'disabled' : ''}`}>
            <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setPage(page + 1); }}>&raquo;</a>
          </li>
        </ul>
      </nav>

      {/* Detail modal */}
      <SupplierDetailModal show={modalOpen} onHide={() => { setModalOpen(false); setDetail(null); }} detail={detail} loading={detailLoading} />

      {/* Create modal */}
      <SupplierCreateModal show={createOpen} onHide={() => setCreateOpen(false)} onSuccess={handleCreateSuccess} />
    </div>
  );
}
