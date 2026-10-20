import { get, post, patch } from './FetchData';

const SUPPLIER_BASE_URL = 'http://localhost:8080/api/v1/supplier';

function unwrapApiResponse(json) {
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data;
  }
  return json;
}

export const createSupplier = async (payload) => {
  const json = await post(SUPPLIER_BASE_URL, payload);
  return unwrapApiResponse(json);
};

export const updateSupplier = async (id, payload) => {
  if (id === null || id === undefined || id === '') {
    throw new Error('Supplier ID is required');
  }
  const json = await patch(`${SUPPLIER_BASE_URL}/${encodeURIComponent(id)}`, payload);
  return unwrapApiResponse(json);
};

export const viewSupplierList = async ({ page = 0, size = 10, sort = 'id' } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: String(sort),
  });
  const json = await get(`${SUPPLIER_BASE_URL}?${params.toString()}`);
  return unwrapApiResponse(json);
};

export const viewSupplierDetail = async (id) => {
  if (id === null || id === undefined || id === '') {
    throw new Error('Supplier not found');
  }
  const json = await get(`${SUPPLIER_BASE_URL}/${encodeURIComponent(id)}`);
  return unwrapApiResponse(json);
};

export default {
  createSupplier,
  updateSupplier,
  viewSupplierList,
  viewSupplierDetail,
};
