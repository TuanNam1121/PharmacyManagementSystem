import { get, post } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/daily-sales';

function unwrapApiResponse(json) {
    if (json && typeof json === 'object' && 'data' in json) {
        return json.data;
    }
    return json;
}

/**
 * Get daily sales overview & reconciliation metrics
 */
export const getDailySalesOverview = async ({ storeId = 7, date = '' } = {}) => {
    const params = new URLSearchParams({ storeId: String(storeId) });
    if (date) params.append('date', date);
    const json = await get(`${BASE_URL}/overview?${params.toString()}`);
    return unwrapApiResponse(json);
};

/**
 * List daily sales invoices with pagination
 */
export const getDailyInvoices = async ({ storeId = 7, date = '', page = 0, size = 10 } = {}) => {
    const params = new URLSearchParams({
        storeId: String(storeId),
        page: String(page),
        size: String(size),
    });
    if (date) params.append('date', date);
    const json = await get(`${BASE_URL}/invoices?${params.toString()}`);
    return unwrapApiResponse(json);
};

/**
 * List daily shifts
 */
export const getDailyShifts = async ({ storeId = 7, date = '' } = {}) => {
    const params = new URLSearchParams({ storeId: String(storeId) });
    if (date) params.append('date', date);
    const json = await get(`${BASE_URL}/shifts?${params.toString()}`);
    return unwrapApiResponse(json);
};

/**
 * Store Manager reconciles and closes daily sales
 * Payload: { storeId, businessDate, actualCash, note }
 */
export const reconcileDailySales = async (payload) => {
    const json = await post(`${BASE_URL}/reconcile`, payload);
    return unwrapApiResponse(json);
};

export default {
    getDailySalesOverview,
    getDailyInvoices,
    getDailyShifts,
    reconcileDailySales,
};
