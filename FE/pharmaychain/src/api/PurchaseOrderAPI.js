import { get, patch } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/procurement/purchase-orders';

function unwrapApiResponse(json) {
    if (json && typeof json === 'object' && 'data' in json) {
        return json.data;
    }
    return json;
}

/**
 * UC67: Fetch paginated Purchase Orders with search & status filters
 */
export const getPurchaseOrders = async ({ page = 0, size = 10, search = '', status = '' } = {}) => {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
    });
    if (search) params.append('search', search);
    if (status !== '' && status !== undefined && status !== null) {
        params.append('status', String(status));
    }

    const json = await get(`${BASE_URL}?${params.toString()}`);
    return unwrapApiResponse(json);
};

/**
 * Fetch full details of a single Purchase Order
 */
export const getPurchaseOrderDetail = async (id) => {
    const json = await get(`${BASE_URL}/${encodeURIComponent(id)}`);
    return unwrapApiResponse(json);
};

/**
 * General Manager: Approve Purchase Order
 */
export const approvePurchaseOrder = async (id, { actionByUsername = 'admin', reason = '' } = {}) => {
    const json = await patch(`${BASE_URL}/${encodeURIComponent(id)}/approve`, {
        actionByUsername,
        reason,
    });
    return unwrapApiResponse(json);
};

/**
 * General Manager: Reject Purchase Order
 */
export const rejectPurchaseOrder = async (id, { actionByUsername = 'admin', reason = '' } = {}) => {
    const json = await patch(`${BASE_URL}/${encodeURIComponent(id)}/reject`, {
        actionByUsername,
        reason,
    });
    return unwrapApiResponse(json);
};
