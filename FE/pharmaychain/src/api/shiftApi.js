import { get, post } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/shifts';

function unwrap(json) {
    if (json && typeof json === 'object' && 'data' in json) {
        return json.data;
    }
    return json;
}

/**
 * Open a new shift for current logged-in user
 * @param {{ storeId: number, openingCash: number, note?: string }} payload
 */
export async function openShift(payload) {
    const res = await post(`${BASE_URL}/open`, payload);
    return unwrap(res);
}

/**
 * Close current shift with physical cash count
 * @param {{ closingCash: number, note?: string }} payload
 */
export async function closeShift(payload) {
    const res = await post(`${BASE_URL}/close`, payload);
    return unwrap(res);
}

/**
 * Get current active shift
 */
export async function getCurrentShift() {
    const res = await get(`${BASE_URL}/current`);
    return unwrap(res);
}

/**
 * Get current shift financial summary before closing
 */
export async function getCurrentShiftSummary() {
    const res = await get(`${BASE_URL}/current/summary`);
    return unwrap(res);
}

export default {
    openShift,
    closeShift,
    getCurrentShift,
    getCurrentShiftSummary,
};

