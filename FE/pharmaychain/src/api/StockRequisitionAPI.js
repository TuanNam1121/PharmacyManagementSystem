import { get, post } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/stock-requisitions';

function unwrap(json) {
    return json && typeof json === 'object' && 'data' in json ? json.data : json;
}

/**
 * Get internal stock requisitions list
 */
export const getRequisitionList = async ({ storeId = '', status = '', search = '', page = 0, size = 10 } = {}) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (storeId) params.append('storeId', String(storeId));
    if (status !== '' && status !== null && status !== undefined) params.append('status', String(status));
    if (search) params.append('search', search);
    const json = await get(`${BASE_URL}?${params.toString()}`);
    return unwrap(json);
};

/**
 * View requisition details
 */
export const getRequisitionDetail = async (id) => {
    const json = await get(`${BASE_URL}/${encodeURIComponent(id)}`);
    return unwrap(json);
};

/**
 * Create a new stock requisition
 */
export const createStockRequisition = async (payload) => {
    const json = await post(BASE_URL, payload);
    return unwrap(json);
};
/**
 * Search products from backend
 */
export const searchProductsForRequisition = async (search = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const json = await get(`${BASE_URL}/products?${params.toString()}`);
    return unwrap(json);
};
export default {
    getRequisitionList,
    getRequisitionDetail,
    createStockRequisition,
    searchProductsForRequisition
};