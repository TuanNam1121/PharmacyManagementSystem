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

export default {
  getWarehouseInventory,
  assignLocation,
  getWarehouseLocations,
  createWarehouseLocation,
  getPurchaseHistory,
  getPurchaseReceiptDetail,
  createInventoryAdjustment,
  getInventoryAdjustments,
};
