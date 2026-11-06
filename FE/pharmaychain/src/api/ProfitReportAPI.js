import { get, post } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/reports/profit';

function unwrap(json) {
    if (json && typeof json === 'object' && 'data' in json) {
        return json.data;
    }
    return json;
}

/**
 * UC70: Fetch initial or filtered profit report
 */
export const getProfitReport = async ({ startDate, endDate, storeId } = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (storeId) params.append('storeId', String(storeId));

    const json = await get(`${BASE_URL}?${params.toString()}`);
    return unwrap(json);
};

/**
 * UC70: Confirm and generate profit report with audit logging
 */
export const generateProfitReport = async (payload) => {
    const json = await post(`${BASE_URL}/generate`, payload);
    return unwrap(json);
};

/**
 * UC70: Download Executive Profit Report with Charts (.xlsx)
 */
export const exportProfitReportExcel = async ({ startDate, endDate, storeId } = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (storeId) params.append('storeId', String(storeId));

    const response = await fetch(`${BASE_URL}/export/excel?${params.toString()}`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error('Failed to export Excel report from server');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Executive_Profit_Report_${startDate || 'all'}_${endDate || 'all'}.xlsx`;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
};

