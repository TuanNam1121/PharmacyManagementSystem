import { get, patch, post } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/store-inventory';

function unwrapApiResponse(json) {
    if (json && typeof json === 'object' && 'data' in json) {
        return json.data;
    }
    return json;
}

/**
 * Get branch inventory list
 */
export const getBranchInventory = async ({ storeId = 7, page = 0, size = 10, search = '', warningFilter = '' } = {}) => {
    const params = new URLSearchParams({
        storeId: String(storeId),
        page: String(page),
        size: String(size),
    });
    if (search) params.append('search', search);
    if (warningFilter && warningFilter !== 'ALL') params.append('warningFilter', warningFilter);

    const json = await get(`${BASE_URL}?${params.toString()}`);
    return unwrapApiResponse(json);
};

/**
 * Get branch inventory KPI summary
 */
export const getBranchInventorySummary = async (storeId = 7) => {
    const json = await get(`${BASE_URL}/summary?storeId=${encodeURIComponent(storeId)}`);
    return unwrapApiResponse(json);
};

/**
 * Branch inventory item detail
 */
export const getInventoryDetail = async (id) => {
    const json = await get(`${BASE_URL}/${encodeURIComponent(id)}`);
    return unwrapApiResponse(json);
};

/**
 * Update min stock threshold (minQuantity)
 */
export const updateStockThreshold = async (payload) => {
    const json = await patch(`${BASE_URL}/threshold`, payload);
    return unwrapApiResponse(json);
};

/**
 * Record counter inventory audit check (Audit Log)
 */
export const auditStockCheck = async (payload) => {
    const json = await post(`${BASE_URL}/audit-check`, payload);
    return unwrapApiResponse(json);
};

export default {
    getBranchInventory,
    getBranchInventorySummary,
    getInventoryDetail,
    updateStockThreshold,
    auditStockCheck,
};
