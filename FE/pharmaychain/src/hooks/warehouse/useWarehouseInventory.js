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
  approveInventoryAdjustment,
  rejectInventoryAdjustment,
  createPurchaseReceipt,
  confirmPurchaseReceipt,
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
      setError(err?.message || 'Failed to load inventory list');
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
      setError(err?.message || 'Failed to load purchase history');
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
      setError(err?.message || 'Failed to load inventory adjustments');
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
      setSuccessMsg('Shelf/bin location assigned successfully!');
      setLocationModalOpen(false);
      setSelectedInventory(null);
      await fetchInventory();
    } catch (err) {
      setError(err?.message || 'Failed to assign location');
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
      setError(err?.message || 'Failed to create shelf/bin location');
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
      setError(err?.message || 'Failed to load purchase receipt details');
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
      setSuccessMsg('Inventory adjustment created successfully!');
      setAdjModalOpen(false);
      setSelectedForAdj(null);
      if (activeTab === 'inventory') {
        await fetchInventory();
      } else {
        await fetchAdjustments();
      }
    } catch (err) {
      setError(err?.message || 'Failed to create inventory adjustment');
      throw err;
    } finally {
      setAdjLoading(false);
    }
  };

  // Function #45: Approve Adjustment action
  const handleApproveAdjustment = async (id) => {
    setAdjLoading(true);
    setError(null);
    try {
      await approveInventoryAdjustment(id);
      setSuccessMsg('Inventory adjustment approved successfully and stock updated!');
      await fetchAdjustments();
      await fetchInventory();
    } catch (err) {
      setError(err?.message || 'Failed to approve adjustment');
      throw err;
    } finally {
      setAdjLoading(false);
    }
  };

  // Function #45: Reject Adjustment action
  const handleRejectAdjustment = async (id, reason) => {
    setAdjLoading(true);
    setError(null);
    try {
      await rejectInventoryAdjustment(id, reason);
      setSuccessMsg('Inventory adjustment rejected.');
      await fetchAdjustments();
    } catch (err) {
      setError(err?.message || 'Failed to reject adjustment');
      throw err;
    } finally {
      setAdjLoading(false);
    }
  };

  // Function #53: Create Purchase Receipt action
  const [createReceiptModalOpen, setCreateReceiptModalOpen] = useState(false);
  const [createReceiptLoading, setCreateReceiptLoading] = useState(false);

  const handleCreateReceipt = async (payload) => {
    setCreateReceiptLoading(true);
    setError(null);
    try {
      const created = await createPurchaseReceipt(payload);
      setSuccessMsg(`Purchase receipt ${created?.code || ''} created successfully (Pending inspection)!`);
      setCreateReceiptModalOpen(false);
      await fetchHistory();
      return created;
    } catch (err) {
      setError(err?.message || 'Failed to create purchase receipt');
      throw err;
    } finally {
      setCreateReceiptLoading(false);
    }
  };

  // Function #54: Confirm Purchase Receipt action
  const [confirmReceiptLoading, setConfirmReceiptLoading] = useState(false);

  const handleConfirmReceipt = async (id) => {
    setConfirmReceiptLoading(true);
    setError(null);
    try {
      const confirmed = await confirmPurchaseReceipt(id);
      setSuccessMsg(`Receipt ${confirmed?.code || ''} confirmed and stock accepted into warehouse inventory!`);
      setReceiptDetail(confirmed);
      await fetchHistory();
      await fetchInventory();
      return confirmed;
    } catch (err) {
      setError(err?.message || 'Failed to confirm purchase receipt');
      throw err;
    } finally {
      setConfirmReceiptLoading(false);
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

    // Purchase History & Receipts
    historyList,
    histTotal,
    histPage,
    setHistPage,
    histSize,
    setHistSize,
    histSearch,
    setHistSearch,
    histLoading,
    fetchHistory,
    receiptDetail,
    receiptModalOpen,
    setReceiptModalOpen,
    receiptLoading,
    handleViewReceiptDetail,
    createReceiptModalOpen,
    setCreateReceiptModalOpen,
    createReceiptLoading,
    handleCreateReceipt,
    confirmReceiptLoading,
    handleConfirmReceipt,

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
    handleApproveAdjustment,
    handleRejectAdjustment,

    // Common feedback
    error,
    setError,
    successMsg,
    setSuccessMsg,
  };
};
