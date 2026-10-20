import { get, patch, post } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/store-inventory';

function unwrapApiResponse(json) {
    if (json && typeof json === 'object' && 'data' in json) {
        return json.data;
    }
    return json;
}

/**
 * UC33 - Step 2: Lấy danh sách tồn kho chi nhánh
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
 * UC33 - Step 2: Lấy thống kê KPI tổng quan tồn kho chi nhánh
 */
export const getBranchInventorySummary = async (storeId = 7) => {
    const json = await get(`${BASE_URL}/summary?storeId=${encodeURIComponent(storeId)}`);
    return unwrapApiResponse(json);
};

/**
 * UC33 - Chi tiết 1 mặt hàng tồn kho
 */
export const getInventoryDetail = async (id) => {
    const json = await get(`${BASE_URL}/${encodeURIComponent(id)}`);
    return unwrapApiResponse(json);
};

/**
 * UC33 - Step 3, 4, 5: Cập nhật ngưỡng cảnh báo tồn tối thiểu (minQuantity)
 */
export const updateStockThreshold = async (payload) => {
    const json = await patch(`${BASE_URL}/threshold`, payload);
    return unwrapApiResponse(json);
};

/**
 * UC33 - Step 3, 4, 5: Ghi nhận kiểm kê tồn kho quầy (Audit Log)
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
