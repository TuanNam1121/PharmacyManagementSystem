import { get, post } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/sales/payments';

function unwrap(json) {
    if (json && typeof json === 'object' && 'data' in json) {
        return json.data;
    }
    return json;
}

/**
 * Khởi tạo mã VietQR thanh toán qua cổng PayOS
 * @param {object} payload { amount, invoiceId, description }
 */
export async function createPayOSPaymentLink(payload) {
    const res = await post(`${BASE_URL}/payos/create-link`, payload);
    return unwrap(res);
}

/**
 * Tra cứu trạng thái thanh toán thời gian thực theo orderCode
 * @param {number|string} orderCode
 */
export async function checkPayOSPaymentStatus(orderCode) {
    const res = await get(`${BASE_URL}/payos/status/${orderCode}`);
    return unwrap(res);
}

export default {
    createPayOSPaymentLink,
    checkPayOSPaymentStatus,
};
