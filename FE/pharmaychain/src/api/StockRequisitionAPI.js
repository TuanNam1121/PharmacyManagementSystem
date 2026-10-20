import { get } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/stock-requisitions';

function unwrap(json) {
    return json && typeof json === 'object' && 'data' in json ? json.data : json;
}

/**
 * UC36 - Step 2: Lấy danh sách đơn yêu cầu nội bộ
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
 * UC36 - Step 2 (chi tiết): Xem chi tiết 1 đơn
 */
export const getRequisitionDetail = async (id) => {
    const json = await get(`${BASE_URL}/${encodeURIComponent(id)}`);
    return unwrap(json);
};

export default { getRequisitionList, getRequisitionDetail };
