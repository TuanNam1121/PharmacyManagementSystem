import { get } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/customers';

function unwrap(json) {
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data;
  }
  return json;
}

/**
 * Fetch customer list with pagination, sorting and filters (UC30)
 */
export const fetchCustomers = async ({
  keyword = '',
  membershipTier = '',
  status = '',
  page = 0,
  size = 10,
  sortBy = 'createdAt',
  sortDir = 'desc',
} = {}) => {
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword.trim());
  if (membershipTier && membershipTier !== 'ALL') params.append('membershipTier', membershipTier);
  if (status !== '' && status !== null && status !== undefined && status !== 'ALL') {
    params.append('status', String(status));
  }
  params.append('page', String(page));
  params.append('size', String(size));
  params.append('sortBy', sortBy);
  params.append('sortDir', sortDir);

  const res = await get(`${BASE_URL}?${params.toString()}`);
  return unwrap(res);
};

/**
 * Fetch detailed customer profile including health profile and recent orders (UC29)
 */
export const fetchCustomerDetail = async (id) => {
  if (!id) throw new Error('Customer ID is required');
  const res = await get(`${BASE_URL}/${encodeURIComponent(id)}`);
  return unwrap(res);
};
