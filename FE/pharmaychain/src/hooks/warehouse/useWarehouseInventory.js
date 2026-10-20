import { useState, useCallback, useEffect } from 'react';
import {
  getWarehouseInventory,
  assignLocation,
  getWarehouseLocations,
  createWarehouseLocation,
  getPurchaseHistory,
  getPurchaseReceiptDetail,
  createInventoryAdjustment,
  getInventoryAdjustments,
} from '../../api/WarehouseInventoryAPI';

export const useWarehouseInventory = ({ initialTab = 'inventory', initialExpiryFilter = '' } = {}) => {
  // Tab state: 'inventory' | 'history' | 'adjustments'
  const [activeTab, setActiveTab] = useState(initialTab);

  // Inventory state (Function #41)
  const [inventoryList, setInventoryList] = useState([]);
  const [invTotal, setInvTotal] = useState(0);
  const [invPage, setInvPage] = useState(0);
  const [invSize, setInvSize] = useState(10);
  const [search, setSearch] = useState('');
  const [expiryFilter, setExpiryFilter] = useState(initialExpiryFilter);
  const [invLoading, setInvLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialExpiryFilter !== undefined) {
      setExpiryFilter(initialExpiryFilter);
    }
  }, [initialExpiryFilter]);

  // Locations state (Function #43)
  const [locations, setLocations] = useState([]);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Purchase History state (Function #42)
  const [historyList, setHistoryList] = useState([]);
  const [histTotal, setHistTotal] = useState(0);
  const [histPage, setHistPage] = useState(0);
  const [histSize, setHistSize] = useState(10);
  const [histSearch, setHistSearch] = useState('');
  const [histLoading, setHistLoading] = useState(false);
  const [receiptDetail, setReceiptDetail] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);

  // Inventory Adjustments state (Function #44)
  const [adjustmentList, setAdjustmentList] = useState([]);
  const [adjTotal, setAdjTotal] = useState(0);
  const [adjPage, setAdjPage] = useState(0);
  const [adjSize, setAdjSize] = useState(10);
  const [adjModalOpen, setAdjModalOpen] = useState(false);
  const [selectedForAdj, setSelectedForAdj] = useState(null);
  const [adjLoading, setAdjLoading] = useState(false);

  // Fetch Inventory List
  const fetchInventory = useCallback(async () => {
    setInvLoading(true);
    setError(null);
    try {
      const res = await getWarehouseInventory({
        page: invPage,
        size: invSize,
        search,
        expiryStatus: expiryFilter,
      });
      setInventoryList(res?.content || []);
      setInvTotal(res?.totalElements ?? 0);
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách tồn kho');
    } finally {
      setInvLoading(false);
    }
  }, [invPage, invSize, search, expiryFilter]);

  // Fetch Locations
  const fetchLocations = useCallback(async () => {
    try {
      const res = await getWarehouseLocations();
      setLocations(res || []);
    } catch (err) {
      console.error('Failed to load locations', err);
    }
  }, []);

  // Fetch Purchase History
  const fetchHistory = useCallback(async () => {
    setHistLoading(true);
    setError(null);
    try {
      const res = await getPurchaseHistory({
        page: histPage,
        size: histSize,
        search: histSearch,
      });
      setHistoryList(res?.content || []);
      setHistTotal(res?.totalElements ?? 0);
    } catch (err) {
      setError(err?.message || 'Không thể tải lịch sử nhập hàng');
    } finally {
      setHistLoading(false);
    }
  }, [histPage, histSize, histSearch]);

  // Fetch Adjustments List
  const fetchAdjustments = useCallback(async () => {
    setAdjLoading(true);
    setError(null);
    try {
      const res = await getInventoryAdjustments({
        page: adjPage,
        size: adjSize,
      });
      setAdjustmentList(res?.content || []);
      setAdjTotal(res?.totalElements ?? 0);
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách phiếu điều chỉnh');
    } finally {
      setAdjLoading(false);
    }
  }, [adjPage, adjSize]);

  // Trigger data based on active tab
  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventory();
      fetchLocations();
    } else if (activeTab === 'history') {
      fetchHistory();
    } else if (activeTab === 'adjustments') {
      fetchAdjustments();
    }
  }, [activeTab, fetchInventory, fetchLocations, fetchHistory, fetchAdjustments]);

  // Assign location action
  const handleAssignLocation = async (inventoryId, locationId) => {
    setLocationLoading(true);
    setError(null);
    try {
      await assignLocation(inventoryId, locationId);
      setSuccessMsg('Gán vị trí ô/kệ thành công!');
      setLocationModalOpen(false);
      setSelectedInventory(null);
      await fetchInventory();
    } catch (err) {
      setError(err?.message || 'Gán vị trí thất bại');
      throw err;
    } finally {
      setLocationLoading(false);
    }
  };

  // Create new location action
  const handleCreateLocation = async (payload) => {
    try {
      const created = await createWarehouseLocation(payload);
      await fetchLocations();
      return created;
    } catch (err) {
      setError(err?.message || 'Tạo vị trí ô/kệ thất bại');
      throw err;
    }
  };

  // View Receipt Detail
  const handleViewReceiptDetail = async (id) => {
    setReceiptLoading(true);
    setReceiptModalOpen(true);
    try {
      const res = await getPurchaseReceiptDetail(id);
      setReceiptDetail(res);
    } catch (err) {
      setError(err?.message || 'Không thể tải chi tiết phiếu nhập kho');
    } finally {
      setReceiptLoading(false);
    }
  };

  // Create Adjustment action
  const handleCreateAdjustment = async (payload) => {
    setAdjLoading(true);
    setError(null);
    try {
      await createInventoryAdjustment(payload);
      setSuccessMsg('Tạo phiếu điều chỉnh tồn kho thành công!');
      setAdjModalOpen(false);
      setSelectedForAdj(null);
      if (activeTab === 'inventory') {
        await fetchInventory();
      } else {
        await fetchAdjustments();
      }
    } catch (err) {
      setError(err?.message || 'Tạo phiếu điều chỉnh thất bại');
      throw err;
    } finally {
      setAdjLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,

    // Inventory
    inventoryList,
    invTotal,
    invPage,
    setInvPage,
    invSize,
    setInvSize,
    search,
    setSearch,
    expiryFilter,
    setExpiryFilter,
    invLoading,
    fetchInventory,

    // Locations
    locations,
    locationModalOpen,
    setLocationModalOpen,
    selectedInventory,
    setSelectedInventory,
    locationLoading,
    handleAssignLocation,
    handleCreateLocation,

    // Purchase History
    historyList,
    histTotal,
    histPage,
    setHistPage,
    histSize,
    setHistSize,
    histSearch,
    setHistSearch,
    histLoading,
    receiptDetail,
    receiptModalOpen,
    setReceiptModalOpen,
    receiptLoading,
    handleViewReceiptDetail,

    // Adjustments
    adjustmentList,
    adjTotal,
    adjPage,
    setAdjPage,
    adjSize,
    setAdjSize,
    adjModalOpen,
    setAdjModalOpen,
    selectedForAdj,
    setSelectedForAdj,
    adjLoading,
    handleCreateAdjustment,
    fetchAdjustments,

    // Common feedback
    error,
    setError,
    successMsg,
    setSuccessMsg,
  };
};
