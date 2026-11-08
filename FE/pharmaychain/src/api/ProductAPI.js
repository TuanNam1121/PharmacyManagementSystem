import { get, post, put, patch, del } from './FetchData';

const PRODUCT_BASE_URL = 'http://localhost:8080/api/v1/product';
const CATEGORY_BASE_URL = 'http://localhost:8080/api/v1/category';

function unwrapApiResponse(json) {
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data;
  }
  return json;
}

export const viewProductList = async ({
  page = 0,
  size = 10,
  sortBy = 'createdAt',
  sortDir = 'desc',
  keyword = '',
  status = '',
  categoryId = '',
} = {}) => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('size', String(size));
  params.set('sortBy', String(sortBy));
  params.set('sortDir', String(sortDir));

  if (keyword) params.set('keyword', keyword);
  if (status !== '' && status !== null && status !== undefined) params.set('status', String(status));
  if (categoryId !== '' && categoryId !== null && categoryId !== undefined) params.set('categoryId', String(categoryId));

  const json = await get(`${PRODUCT_BASE_URL}?${params.toString()}`);
  return unwrapApiResponse(json);
};

export const viewProductDetail = async (id) => {
  if (id === null || id === undefined || id === '') {
    throw new Error('Product ID is required');
  }
  const json = await get(`${PRODUCT_BASE_URL}/${encodeURIComponent(id)}`);
  return unwrapApiResponse(json);
};

export const createProduct = async (payload) => {
  const json = await post(PRODUCT_BASE_URL, payload);
  return unwrapApiResponse(json);
};

export const updateProduct = async (id, payload) => {
  if (id === null || id === undefined || id === '') {
    throw new Error('Product ID is required');
  }
  const json = await put(`${PRODUCT_BASE_URL}/${encodeURIComponent(id)}`, payload);
  return unwrapApiResponse(json);
};

export const updateProductPrice = async (id, payload) => {
  if (id === null || id === undefined || id === '') {
    throw new Error('Product ID is required');
  }
  const json = await put(`${PRODUCT_BASE_URL}/${encodeURIComponent(id)}/price`, payload);
  return unwrapApiResponse(json);
};

export const updateProductStatus = async (id, status) => {
  if (id === null || id === undefined || id === '') {
    throw new Error('Product ID is required');
  }
  const json = await patch(`${PRODUCT_BASE_URL}/${encodeURIComponent(id)}/status?status=${encodeURIComponent(status)}`);
  return unwrapApiResponse(json);
};

export const deleteProduct = async (id) => {
  if (id === null || id === undefined || id === '') {
    throw new Error('Product ID is required');
  }
  const json = await del(`${PRODUCT_BASE_URL}/${encodeURIComponent(id)}`);
  return unwrapApiResponse(json);
};

export const viewCategoryOptions = async () => {
  const json = await get(`${CATEGORY_BASE_URL}?page=0&size=100&sort=name`);
  return unwrapApiResponse(json);
};

export const viewPriceHistory = async (id) => {
  if (id === null || id === undefined || id === '') {
    throw new Error('Product ID is required');
  }
  const json = await get(`${PRODUCT_BASE_URL}/${encodeURIComponent(id)}/price-history`);
  return unwrapApiResponse(json);
};

export default {
  viewProductList,
  viewProductDetail,
  createProduct,
  updateProduct,
  updateProductPrice,
  updateProductStatus,
  deleteProduct,
  viewCategoryOptions,
  viewPriceHistory,
};
