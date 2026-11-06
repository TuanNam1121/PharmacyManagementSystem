import { get, post, put, patch, del } from './FetchData';

const CATEGORY_BASE_URL = 'http://localhost:8080/api/v1/category';

function unwrapApiResponse(json) {
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data;
  }
  return json;
}

export const viewCategoryList = async ({ page = 0, size = 10, sort = 'id' } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: String(sort),
  });
  const json = await get(`${CATEGORY_BASE_URL}?${params.toString()}`);
  return unwrapApiResponse(json);
};

export const viewCategoryDetail = async (id) => {
  if (id === null || id === undefined || id === '') {
    throw new Error('Category not found');
  }
  const json = await get(`${CATEGORY_BASE_URL}/${encodeURIComponent(id)}`);
  return unwrapApiResponse(json);
};

export const createCategory = async (payload) => {
  const json = await post(CATEGORY_BASE_URL, payload);
  return unwrapApiResponse(json);
};

export const updateCategory = async (id, payload) => {
  if (id === null || id === undefined || id === '') {
    throw new Error('Category ID is required');
  }
  const json = await put(`${CATEGORY_BASE_URL}/${encodeURIComponent(id)}`, payload);
  return unwrapApiResponse(json);
};

export const updateCategoryStatus = async (id, status) => {
  if (id === null || id === undefined || id === '') {
    throw new Error('Category ID is required');
  }
  const json = await patch(`${CATEGORY_BASE_URL}/${encodeURIComponent(id)}/status?status=${encodeURIComponent(status)}`);
  return unwrapApiResponse(json);
};

export const deleteCategory = async (id) => {
  if (id === null || id === undefined || id === '') {
    throw new Error('Category ID is required');
  }
  const json = await del(`${CATEGORY_BASE_URL}/${encodeURIComponent(id)}`);
  return unwrapApiResponse(json);
};

export default {
  viewCategoryList,
  viewCategoryDetail,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
};
