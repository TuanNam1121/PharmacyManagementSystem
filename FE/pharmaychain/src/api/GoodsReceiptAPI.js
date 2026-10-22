import { get, post } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/goods-receipts';

function unwrap(json) {
    return json && typeof json === 'object' && 'data' in json ? json.data : json;
}

/**
 * Get goods receipts list (with pagination & filtering)
 */
export const getGoodsReceiptList = async ({ storeId, status, search, page = 0, size = 10 }) => {
    const params = new URLSearchParams();
    if (storeId !== undefined && storeId !== null && storeId !== '') params.append('storeId', storeId);
    if (status !== undefined && status !== null && status !== '') params.append('status', status);
    if (search && search.trim()) params.append('search', search.trim());
    params.append('page', page);
    params.append('size', size);

    const json = await get(`${BASE_URL}?${params.toString()}`);
    return unwrap(json);
};

/**
 * Get goods receipt detail
 */
export const getGoodsReceiptDetail = async (id) => {
    const json = await get(`${BASE_URL}/${encodeURIComponent(id)}`);
    return unwrap(json);
};

/**
 * Confirm goods receipt inspection
 */
export const confirmGoodsReceipt = async (id, payload) => {
    const json = await post(`${BASE_URL}/${encodeURIComponent(id)}/confirm`, payload);
    return unwrap(json);
};

export default { getGoodsReceiptList, getGoodsReceiptDetail, confirmGoodsReceipt };
