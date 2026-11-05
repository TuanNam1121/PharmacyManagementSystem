import { get, post } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/sales/invoices';

function unwrap(json) {
    if (json && typeof json === 'object' && 'data' in json) {
        return json.data;
    }
    return json;
}

/**
 * Create and complete POS sales invoice
 * @param {object} payload
 */
export async function createSalesInvoice(payload) {
    const res = await post(BASE_URL, payload);
    return unwrap(res);
}

/**
 * Get sales invoice detail by ID or invoice code
 * @param {string|number} codeOrId
 */
export async function getInvoiceByCodeOrId(codeOrId) {
    const res = await get(`${BASE_URL}/${encodeURIComponent(codeOrId)}`);
    return unwrap(res);
}

/**
 * Query sales invoices list
 */
export async function getSalesInvoices({
    storeId,
    shiftId,
    customerId,
    keyword,
    status,
    page = 0,
    size = 10,
} = {}) {
    const params = new URLSearchParams();
    if (storeId) params.append('storeId', String(storeId));
    if (shiftId) params.append('shiftId', String(shiftId));
    if (customerId) params.append('customerId', String(customerId));
    if (keyword) params.append('keyword', keyword.trim());
    if (status !== undefined && status !== null && status !== '') params.append('status', String(status));
    params.append('page', String(page));
    params.append('size', String(size));

    const res = await get(`${BASE_URL}?${params.toString()}`);
    return unwrap(res);
}

/**
 * Return items from sales invoice and issue refund (UC25)
 * @param {object} payload
 */
export async function returnSalesInvoice(payload) {
    const res = await post(`${BASE_URL}/return`, payload);
    return unwrap(res);
}

/**
 * Fetch customer past purchases (UC23)
 * @param {number} customerId
 */
export async function getCustomerPurchaseHistory(customerId) {
    const res = await get(`${BASE_URL}/customer/${customerId}`);
    return unwrap(res);
}

export default {
    createSalesInvoice,
    getInvoiceByCodeOrId,
    getSalesInvoices,
    returnSalesInvoice,
    getCustomerPurchaseHistory,
};
