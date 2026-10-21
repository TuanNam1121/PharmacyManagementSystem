import { get, patch } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/inventory-audits';

function unwrap(json) {
    return json && typeof json === 'object' && 'data' in json ? json.data : json;
}

/**
 * Get inventory audit list
 */
export const getAuditList = async ({ status = '', search = '', page = 0, size = 10 } = {}) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (status !== '' && status !== null && status !== undefined) params.append('status', String(status));
    if (search) params.append('search', search);
    const json = await get(`${BASE_URL}?${params.toString()}`);
    return unwrap(json);
};

/**
 * View audit details
 */
export const getAuditDetail = async (id) => {
    const json = await get(`${BASE_URL}/${encodeURIComponent(id)}`);
    return unwrap(json);
};

/**
 * Review audit (Approve=1 / Reject=2)
 */
export const reviewAudit = async (payload) => {
    // payload: { auditId, decision, reviewNote }
    const json = await patch(`${BASE_URL}/review`, payload);
    return unwrap(json);
};

export default { getAuditList, getAuditDetail, reviewAudit };
