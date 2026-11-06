import { get, post, patch, put } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/inventory-audits';

function unwrap(json) {
    return json && typeof json === 'object' && 'data' in json ? json.data : json;
}

/**
 * 1. Get audit list
 */
export const getAuditList = async ({ storeId = '', status = '', search = '', page = 0, size = 10 } = {}) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (storeId) params.append('storeId', String(storeId));
    if (status !== '' && status !== null && status !== undefined) params.append('status', String(status));
    if (search) params.append('search', search);
    const json = await get(`${BASE_URL}?${params.toString()}`);
    return unwrap(json);
};

/**
 * 2. Get audit details
 */
export const getAuditDetail = async (id) => {
    const json = await get(`${BASE_URL}/${encodeURIComponent(id)}`);
    return unwrap(json);
};

/**
 * 3. Pharmacist: Request an audit session (Status 0)
 */
export const requestAuditSession = async (payload) => {
    // payload: { storeId, auditDate, reason }
    const json = await post(`${BASE_URL}/request`, payload);
    return unwrap(json);
};

/**
 * 4. Store Manager: Approve or reject audit request (Status 0 -> 1 or 4)
 */
export const approveAuditRequest = async (payload) => {
    // payload: { auditId, decision: 1 | 4, note }
    const json = await patch(`${BASE_URL}/approve-request`, payload);
    return unwrap(json);
};

/**
 * 5. Pharmacist: Submit counted quantities (Status 1 -> 2)
 */
export const submitAuditCount = async (payload) => {
    // payload: { auditId, items: [{ detailId, countedQuantity, note }] }
    const json = await put(`${BASE_URL}/submit-count`, payload);
    return unwrap(json);
};

/**
 * 6. Store Manager: Final review & reconcile (Status 2 -> 3 or 4)
 */
export const reviewAudit = async (payload) => {
    // payload: { auditId, decision: 3 | 4, reviewNote }
    const json = await patch(`${BASE_URL}/review`, payload);
    return unwrap(json);
};

export default {
    getAuditList,
    getAuditDetail,
    requestAuditSession,
    approveAuditRequest,
    submitAuditCount,
    reviewAudit,
};
