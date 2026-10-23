import { get, post } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/reports/inventory';

function unwrap(json) {
    if (json && typeof json === 'object' && 'data' in json) {
        return json.data;
    }
    return json;
}

/**
 * UC71: Auto-fetch inventory report with filters (GET)
 */
export const getInventoryReport = async ({ storeId, stockStatus = 'ALL', startDate, endDate } = {}) => {
    const params = new URLSearchParams();
    if (storeId) params.append('storeId', String(storeId));
    if (stockStatus && stockStatus !== 'ALL') params.append('stockStatus', stockStatus);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const json = await get(`${BASE_URL}?${params.toString()}`);
    return unwrap(json);
};

/**
 * UC71: Download Executive Inventory Report (.xlsx) with embedded chart
 */
export const exportInventoryReportExcel = async ({ storeId, stockStatus = 'ALL', startDate, endDate } = {}) => {
    const params = new URLSearchParams();
    if (storeId) params.append('storeId', String(storeId));
    if (stockStatus && stockStatus !== 'ALL') params.append('stockStatus', stockStatus);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${BASE_URL}/export/excel?${params.toString()}`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error('Failed to export inventory Excel report from server');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Executive_Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
};
