import { useBranchInventory } from '../../hooks/inventory/useBranchInventory';
import BranchInventoryStats from '../../component/inventory/BranchInventoryStats';
import BranchInventoryTable from '../../component/inventory/BranchInventoryTable';
import BranchInventoryDetailModal from '../../component/inventory/BranchInventoryDetailModal';
import BranchThresholdModal from '../../component/inventory/BranchThresholdModal';
import BranchStockAuditModal from '../../component/inventory/BranchStockAuditModal';
import { useNavigate } from 'react-router-dom';

export default function BranchInventoryPage() {
    const navigate = useNavigate();
    const {
        storeId,
        setStoreId,
        search,
        setSearch,
        warningFilter,
        setWarningFilter,
        page,
        setPage,
        size,
        total,
        inventoryList,
        summary,
        loading,
        summaryLoading,
        error,
        setError,
        successMsg,
        setSuccessMsg,
        reloadAll,
        selectedItem,
        setSelectedItem,
        detailModalOpen,
        setDetailModalOpen,
        thresholdModalOpen,
        setThresholdModalOpen,
        auditModalOpen,
        setAuditModalOpen,
        submitting,
        handleUpdateThreshold,
        handleAuditCheck,
    } = useBranchInventory();

    const openDetail = (item) => {
        setSelectedItem(item);
        setDetailModalOpen(true);
    };

    const openThreshold = (item) => {
        setSelectedItem(item);
        setThresholdModalOpen(true);
    };

    return (
        <div>
            {/* ── Page Header ── */}
            <div className="pms-page-header" style={{ marginBottom: 16 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h1 className="pms-page-title" style={{ margin: 0 }}>Tồn kho Chi nhánh & Cảnh báo</h1>
                        <span className="pms-badge pms-badge-neutral" style={{ fontSize: 11 }}>UC33</span>
                        <span className="pms-badge pms-badge-info" style={{ fontSize: 11 }}>Pharmacist & Store Manager</span>
                    </div>
                    <p className="pms-page-sub">
                        Theo dõi mức tồn thuốc thực tế, số lô sản xuất, hạn sử dụng và hệ thống cảnh báo thuốc sắp hết/cận date tại chi nhánh.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={reloadAll} title="Làm mới">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        Làm mới
                    </button>

                    <button
                        type="button"
                        className="btn-pms btn-pms-primary"
                        onClick={() => navigate('/store/requisitions')}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                        Create Requisition
                    </button>

                </div>
            </div>

            {/* ── Alerts ── */}
            {successMsg && (
                <div className="pms-alert pms-alert-success" style={{ marginBottom: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {successMsg}
                    <button type="button" className="pms-alert-close" onClick={() => setSuccessMsg(null)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            )}

            {error && (
                <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                    <button type="button" className="pms-alert-close" onClick={() => setError(null)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            )}

            {/* ── KPI Stats Cards ── */}
            <BranchInventoryStats
                summary={summary}
                loading={summaryLoading}
                currentFilter={warningFilter}
                onSelectFilter={(filter) => {
                    setWarningFilter(filter);
                    setPage(0);
                }}
            />

            {/* ── Filters Bar ── */}
            <div className="pms-card" style={{ marginBottom: 20 }}>
                <div className="pms-card-body" style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, flex: 1 }}>
                            {/* Store Selector */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Chi nhánh:</label>
                                <select
                                    className="pms-select"
                                    style={{ minWidth: 220 }}
                                    value={storeId}
                                    onChange={(e) => {
                                        setStoreId(e.target.value);
                                        setPage(0);
                                    }}
                                >
                                    <option value="1">Store #1 — Nhà thuốc Trung Tâm</option>
                                    <option value="2">Store #2 — Nhà thuốc Cầu Giấy</option>
                                    <option value="3">Store #3 — Nhà thuốc Đống Đa</option>
                                </select>
                            </div>

                            {/* Search Input */}
                            <div className="pms-input-wrap" style={{ flex: 1, minWidth: 260 }}>
                                <span className="pms-input-icon">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    className="pms-input"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(0);
                                    }}
                                    placeholder="Tìm theo tên biệt dược, hoạt chất, barcode, số lô..."
                                />
                            </div>
                        </div>

                        {/* Fast Warning Status Tabs */}
                        <div className="pms-tabs" style={{ margin: 0 }}>
                            <button
                                type="button"
                                className={`pms-tab ${warningFilter === 'ALL' ? 'active' : ''}`}
                                onClick={() => { setWarningFilter('ALL'); setPage(0); }}
                            >
                                Tất cả
                            </button>
                            <button
                                type="button"
                                className={`pms-tab ${warningFilter === 'LOW_STOCK' ? 'active' : ''}`}
                                onClick={() => { setWarningFilter('LOW_STOCK'); setPage(0); }}
                            >
                                Sắp hết hàng
                            </button>
                            <button
                                type="button"
                                className={`pms-tab ${warningFilter === 'EXPIRING_SOON' ? 'active' : ''}`}
                                onClick={() => { setWarningFilter('EXPIRING_SOON'); setPage(0); }}
                            >
                                Cận hạn (90d)
                            </button>
                            <button
                                type="button"
                                className={`pms-tab ${warningFilter === 'EXPIRED' ? 'active' : ''}`}
                                onClick={() => { setWarningFilter('EXPIRED'); setPage(0); }}
                            >
                                Đã hết hạn
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Inventory Table ── */}
            <BranchInventoryTable
                items={inventoryList}
                loading={loading}
                total={total}
                page={page}
                size={size}
                onPage={setPage}
                onViewDetail={openDetail}
                onEditThreshold={openThreshold}
            />

            {/* ── Modals ── */}
            <BranchInventoryDetailModal
                show={detailModalOpen}
                onHide={() => setDetailModalOpen(false)}
                item={selectedItem}
            />

            <BranchThresholdModal
                show={thresholdModalOpen}
                onHide={() => setThresholdModalOpen(false)}
                item={selectedItem}
                onConfirm={handleUpdateThreshold}
                submitting={submitting}
            />

            <BranchStockAuditModal
                show={auditModalOpen}
                onHide={() => setAuditModalOpen(false)}
                storeName={summary?.storeName || 'Nhà thuốc'}
                onConfirm={handleAuditCheck}
                submitting={submitting}
            />
        </div>
    );
}
