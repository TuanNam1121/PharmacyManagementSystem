import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWarehouseInventory } from '../../hooks/warehouse/useWarehouseInventory';
import WarehouseStats from '../../component/warehouse/WarehouseStats';
import WarehouseFilters from '../../component/warehouse/WarehouseFilters';
import WarehouseInventoryTable from '../../component/warehouse/WarehouseInventoryTable';
import WarehouseLocationModal from '../../component/warehouse/WarehouseLocationModal';
import WarehouseAdjustmentModal from '../../component/warehouse/WarehouseAdjustmentModal';
import WarehousePurchaseHistoryTable from '../../component/warehouse/WarehousePurchaseHistoryTable';
import WarehousePurchaseReceiptDetailModal from '../../component/warehouse/WarehousePurchaseReceiptDetailModal';
import WarehouseCreateReceiptModal from '../../component/warehouse/WarehouseCreateReceiptModal';
import WarehouseAdjustmentListTable from '../../component/warehouse/WarehouseAdjustmentListTable';

const TABS = [
  {
    key: 'inventory',
    label: 'Tồn kho tổng FEFO',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
      </svg>
    ),
  },
  {
    key: 'history',
    label: 'Lịch sử phiếu nhập kho',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    key: 'adjustments',
    label: 'Điều chỉnh tồn kho',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
        <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
      </svg>
    ),
  },
];

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
        <button key={i} className={`pms-page-btn ${page === i ? 'active' : ''}`} onClick={() => onPage(i)}>{i + 1}</button>
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

export default function WarehouseInventoryPage({
  defaultTab = 'inventory',
  defaultExpiryFilter = '',
  pageTitle,
  pageSub,
}) {
  const {
    activeTab, setActiveTab,
    inventoryList, invTotal, invPage, setInvPage, invSize, search, setSearch, expiryFilter, setExpiryFilter, invLoading,
    locations, locationModalOpen, setLocationModalOpen, selectedInventory, setSelectedInventory, locationLoading, handleAssignLocation, handleCreateLocation,
    historyList, histTotal, histPage, setHistPage, histSize, histSearch, setHistSearch, histLoading, receiptDetail, receiptModalOpen, setReceiptModalOpen, receiptLoading, handleViewReceiptDetail,
    createReceiptModalOpen, setCreateReceiptModalOpen, createReceiptLoading, handleCreateReceipt, confirmReceiptLoading, handleConfirmReceipt,
    adjustmentList, adjTotal, adjPage, setAdjPage, adjSize, adjModalOpen, setAdjModalOpen, selectedForAdj, setSelectedForAdj, adjLoading, handleCreateAdjustment,
    handleApproveAdjustment, handleRejectAdjustment,
    error, setError, successMsg, setSuccessMsg,
  } = useWarehouseInventory({ initialTab: defaultTab, initialExpiryFilter: defaultExpiryFilter });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/warehouse/receipts') {
      setActiveTab('history');
    } else if (location.pathname === '/warehouse/adjustments') {
      setActiveTab('adjustments');
    } else if (location.pathname === '/warehouse/inventory') {
      setActiveTab('inventory');
    }
  }, [location.pathname, setActiveTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'inventory' && location.pathname !== '/warehouse/inventory') {
      navigate('/warehouse/inventory');
    } else if (key === 'history' && location.pathname !== '/warehouse/receipts') {
      navigate('/warehouse/receipts');
    } else if (key === 'adjustments' && location.pathname !== '/warehouse/adjustments') {
      navigate('/warehouse/adjustments');
    }
  };

  const openLocationModal = (row) => { setSelectedInventory(row); setLocationModalOpen(true); };
  const openAdjustmentModal = (row) => { setSelectedForAdj(row); setAdjModalOpen(true); };

  // Dynamic header based on props or current tab
  const getHeaderInfo = () => {
    if (pageTitle) return { title: pageTitle, sub: pageSub };
    if (activeTab === 'adjustments') {
      return {
        title: 'Điều chỉnh tồn kho kiểm kê',
        sub: 'Ghi nhận kiểm kê thực tế, xử lý hao hụt / chênh lệch và cập nhật số lượng tồn kho theo lô.',
      };
    }
    if (activeTab === 'history') {
      return {
        title: 'Phiếu nhập kho & Tiếp nhận hàng từ NCC',
        sub: 'Theo dõi chứng từ mua hàng, tiếp nhận lô thuốc, người kiểm định và phân bổ ô kệ.',
      };
    }
    if (expiryFilter === 'EXPIRING_SOON' || expiryFilter === 'EXPIRED') {
      return {
        title: 'Cảnh báo hạn dùng & Tồn kho tối thiểu',
        sub: 'Chủ động giám sát các lô thuốc cận hạn (≤ 90 ngày) và đã hết hạn trên toàn bộ ô kệ kho tổng.',
      };
    }
    return {
      title: 'Quản lý tồn kho Kho Tổng',
      sub: 'Theo dõi lô thuốc theo FEFO, định vị ô kệ, lịch sử nhập hàng và điều chỉnh tồn kho.',
    };
  };

  const header = getHeaderInfo();

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="pms-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="pms-page-title">{header.title}</h1>
          <p className="pms-page-sub">{header.sub}</p>
        </div>
        <button
          type="button"
          className="pms-btn pms-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          onClick={() => navigate('/warehouse/requests')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          Yêu Cầu Mua Hàng Bổ Sung Kho
        </button>
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

      {/* ── KPI Stats ── */}
      <WarehouseStats inventoryList={inventoryList} total={invTotal} />

      {/* ── Tabs ── */}
      <div className="pms-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`pms-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Inventory ── */}
      {activeTab === 'inventory' && (
        <div>
          <WarehouseFilters
            search={search} expiryFilter={expiryFilter}
            onSearch={setSearch} onExpiryFilter={setExpiryFilter}
            total={invTotal}
          />
          <WarehouseInventoryTable
            data={inventoryList} loading={invLoading}
            onAssignLocation={openLocationModal} onAdjustStock={openAdjustmentModal}
          />
          <Pagination total={invTotal} page={invPage} size={invSize} onPage={setInvPage} />
        </div>
      )}

      {/* ── Tab 2: Purchase History ── */}
      {activeTab === 'history' && (
        <div>
          {/* History search bar and action */}
          <div className="pms-filters-bar">
            <div className="pms-input-wrap" style={{ flex: 1, maxWidth: 360 }}>
              <span className="pms-input-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                className="pms-input"
                type="text"
                placeholder="Tìm theo mã phiếu nhập hoặc ghi chú…"
                value={histSearch}
                onChange={(e) => setHistSearch(e.target.value)}
              />
            </div>

            <button
              className="btn-pms btn-pms-primary"
              onClick={() => setCreateReceiptModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Tạo phiếu nhập mua mới
            </button>

            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{histTotal}</strong> phiếu nhập
            </span>
          </div>
          <WarehousePurchaseHistoryTable
            data={historyList}
            loading={histLoading}
            onViewDetail={handleViewReceiptDetail}
            onConfirm={handleConfirmReceipt}
            confirmLoading={confirmReceiptLoading}
          />
          <Pagination total={histTotal} page={histPage} size={histSize} onPage={setHistPage} />
        </div>
      )}

      {/* ── Tab 3: Adjustments ── */}
      {activeTab === 'adjustments' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Nhật ký phiếu điều chỉnh tồn kho</div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{adjTotal}</strong> bản ghi
            </span>
          </div>
          <WarehouseAdjustmentListTable
            data={adjustmentList}
            loading={adjLoading}
            onApprove={handleApproveAdjustment}
            onReject={handleRejectAdjustment}
            actionLoading={adjLoading}
          />
          <Pagination total={adjTotal} page={adjPage} size={adjSize} onPage={setAdjPage} />
        </div>
      )}

      {/* ── Modals ── */}
      <WarehouseLocationModal
        show={locationModalOpen}
        onHide={() => { setLocationModalOpen(false); setSelectedInventory(null); }}
        inventory={selectedInventory}
        locations={locations}
        onAssign={handleAssignLocation}
        onCreateLocation={handleCreateLocation}
        loading={locationLoading}
      />
      <WarehouseAdjustmentModal
        show={adjModalOpen}
        onHide={() => { setAdjModalOpen(false); setSelectedForAdj(null); }}
        inventory={selectedForAdj}
        onSubmit={handleCreateAdjustment}
        loading={adjLoading}
      />
      <WarehousePurchaseReceiptDetailModal
        show={receiptModalOpen}
        onHide={() => setReceiptModalOpen(false)}
        detail={receiptDetail}
        loading={receiptLoading}
        onConfirm={handleConfirmReceipt}
        confirmLoading={confirmReceiptLoading}
      />
      <WarehouseCreateReceiptModal
        show={createReceiptModalOpen}
        onHide={() => setCreateReceiptModalOpen(false)}
        onSubmit={handleCreateReceipt}
        loading={createReceiptLoading}
      />
    </div>
  );
}
