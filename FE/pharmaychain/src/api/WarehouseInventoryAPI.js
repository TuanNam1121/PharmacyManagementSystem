import { get, post, patch } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/warehouse';

function unwrapApiResponse(json) {
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data;
  }
  return json;
}

/**
 * Function #41: View Inventory (Warehouse Inventory)
 */
export const getWarehouseInventory = async ({ page = 0, size = 10, search = '', expiryStatus = '' } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (search) params.append('search', search);
  if (expiryStatus) params.append('expiryStatus', expiryStatus);

  const json = await get(`${BASE_URL}/inventory?${params.toString()}`);
  return unwrapApiResponse(json);
};

/**
 * Function #43: Assign Shelf/Bin Location
 */
export const assignLocation = async (inventoryId, locationId) => {
  if (!inventoryId || !locationId) {
    throw new Error('Cần cung cấp mã tồn kho và mã vị trí kệ/ô');
  }
  const json = await patch(`${BASE_URL}/inventory/${encodeURIComponent(inventoryId)}/location`, { locationId });
  return unwrapApiResponse(json);
};

export const getWarehouseLocations = async () => {
  const json = await get(`${BASE_URL}/locations`);
  return unwrapApiResponse(json);
};

export const createWarehouseLocation = async (payload) => {
  const json = await post(`${BASE_URL}/locations`, payload);
  return unwrapApiResponse(json);
};

export const getWarehouseProducts = async () => {
  const json = await get(`${BASE_URL}/products`);
  return unwrapApiResponse(json);
};

/**
 * Function #42: View Purchase History
 */
export const getPurchaseHistory = async ({ page = 0, size = 10, search = '' } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (search) params.append('search', search);

  const json = await get(`${BASE_URL}/purchase-history?${params.toString()}`);
  return unwrapApiResponse(json);
};

export const getPurchaseReceiptDetail = async (id) => {
  const json = await get(`${BASE_URL}/purchase-history/${encodeURIComponent(id)}`);
  return unwrapApiResponse(json);
};

/**
 * Function #44: Create Inventory Adjustment
 */
export const createInventoryAdjustment = async (payload) => {
  const json = await post(`${BASE_URL}/inventory-adjustments`, payload);
  return unwrapApiResponse(json);
};

export const getInventoryAdjustments = async ({ page = 0, size = 10 } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  const json = await get(`${BASE_URL}/inventory-adjustments?${params.toString()}`);
  return unwrapApiResponse(json);
};

/**
 * Function #45: Approve / Reject Inventory Adjustment
 */
export const approveInventoryAdjustment = async (id, approverId) => {
  const params = new URLSearchParams();
  if (approverId) params.append('approverId', approverId);
  const q = params.toString() ? `?${params.toString()}` : '';
  const json = await patch(`${BASE_URL}/inventory-adjustments/${encodeURIComponent(id)}/approve${q}`);
  return unwrapApiResponse(json);
};

export const rejectInventoryAdjustment = async (id, reason, approverId) => {
  const params = new URLSearchParams();
  if (approverId) params.append('approverId', approverId);
  const q = params.toString() ? `?${params.toString()}` : '';
  const json = await patch(`${BASE_URL}/inventory-adjustments/${encodeURIComponent(id)}/reject${q}`, { reason });
  return unwrapApiResponse(json);
};

/**
 * Function #53: Manage Purchase Receipt (Create new incoming receipt)
 */
export const createPurchaseReceipt = async (payload, creatorId) => {
  const params = new URLSearchParams();
  if (creatorId) params.append('creatorId', creatorId);
  const q = params.toString() ? `?${params.toString()}` : '';
  const json = await post(`${BASE_URL}/purchase-receipts${q}`, payload);
  return unwrapApiResponse(json);
};

/**
 * Function #54: Confirm Purchase Receipt (Inspect & accept into stock)
 */
export const confirmPurchaseReceipt = async (id, confirmerId) => {
  const params = new URLSearchParams();
  if (confirmerId) params.append('confirmerId', confirmerId);
  const q = params.toString() ? `?${params.toString()}` : '';
  const json = await patch(`${BASE_URL}/purchase-receipts/${encodeURIComponent(id)}/confirm${q}`);
  return unwrapApiResponse(json);
};

/**
 * Function #48: Manage Purchase Requests
 */
export const getPurchaseRequests = async ({ page = 0, size = 10, search = '', status = '' } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (search) params.append('search', search);
  if (status !== '' && status !== undefined && status !== null) params.append('status', status);

  const json = await get(`${BASE_URL}/purchase-requests?${params.toString()}`);
  return unwrapApiResponse(json);
};

export const getPurchaseRequestDetail = async (id) => {
  const json = await get(`${BASE_URL}/purchase-requests/${encodeURIComponent(id)}`);
  return unwrapApiResponse(json);
};

export const createPurchaseRequest = async (payload, creatorId) => {
  const params = new URLSearchParams();
  if (creatorId) params.append('creatorId', creatorId);
  const q = params.toString() ? `?${params.toString()}` : '';
  const json = await post(`${BASE_URL}/purchase-requests${q}`, payload);
  return unwrapApiResponse(json);
};

/**
 * Function #49: Manage Store Replenishment Requests
 */
export const getReplenishmentRequests = async ({ page = 0, size = 10, search = '', status = '' } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (search) params.append('search', search);
  if (status !== '' && status !== undefined && status !== null) params.append('status', status);

  const json = await get(`${BASE_URL}/replenishment-requests?${params.toString()}`);
  return unwrapApiResponse(json);
};

export const getReplenishmentRequestDetail = async (id) => {
  const json = await get(`${BASE_URL}/replenishment-requests/${encodeURIComponent(id)}`);
  return unwrapApiResponse(json);
};

/**
 * Function #50: Approve Store Replenishment Request
 */
export const approveReplenishmentRequest = async (id, approverId) => {
  const params = new URLSearchParams();
  if (approverId) params.append('approverId', approverId);
  const q = params.toString() ? `?${params.toString()}` : '';
  const json = await patch(`${BASE_URL}/replenishment-requests/${encodeURIComponent(id)}/approve${q}`);
  return unwrapApiResponse(json);
};

/**
 * Function #51: Reject Store Replenishment Request
 */
export const rejectReplenishmentRequest = async (id, reason, approverId) => {
  const params = new URLSearchParams();
  if (approverId) params.append('approverId', approverId);
  const q = params.toString() ? `?${params.toString()}` : '';
  const json = await patch(`${BASE_URL}/replenishment-requests/${encodeURIComponent(id)}/reject${q}`, { reason });
  return unwrapApiResponse(json);
};

/**
 * Function #52: Confirm Goods Dispatch
 */
export const confirmGoodsDispatch = async (id, payload, dispatcherId) => {
  const params = new URLSearchParams();
  if (dispatcherId) params.append('dispatcherId', dispatcherId);
  const q = params.toString() ? `?${params.toString()}` : '';
  const json = await post(`${BASE_URL}/replenishment-requests/${encodeURIComponent(id)}/dispatch${q}`, payload);
  return unwrapApiResponse(json);
};

export default {
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
  getPurchaseRequests,
  getPurchaseRequestDetail,
  createPurchaseRequest,
  getReplenishmentRequests,
  getReplenishmentRequestDetail,
  approveReplenishmentRequest,
  rejectReplenishmentRequest,
  confirmGoodsDispatch,
};
