import { get } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/stores';

export const DEFAULT_RETAIL_STORES = [
    { id: 3, code: 'ST01', name: 'Chi nhánh 01 - Cầu Giấy', type: 1, typeName: 'Nhà thuốc chi nhánh' },
    { id: 4, code: 'ST02', name: 'Chi nhánh 02 - Đống Đa', type: 1, typeName: 'Nhà thuốc chi nhánh' },
];

function unwrapApiResponse(json) {
    if (json && typeof json === 'object' && 'data' in json) {
        return json.data;
    }
    return json;
}

/**
 * Fetch authorized active retail branches for the authenticated user
 */
export const getAuthorizedStores = async () => {
    try {
        const json = await get(BASE_URL);
        const data = unwrapApiResponse(json);
        if (Array.isArray(data) && data.length > 0) {
            return data;
        }
        return DEFAULT_RETAIL_STORES;
    } catch (err) {
        console.warn('Fallback to default retail stores:', err?.message || err);
        return DEFAULT_RETAIL_STORES;
    }
};

export default {
    DEFAULT_RETAIL_STORES,
    getAuthorizedStores,
};

