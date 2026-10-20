import { get, post, put, patch } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/accounts';
const ROLES_URL = 'http://localhost:8080/api/v1/roles';

function unwrap(json) {
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data;
  }
  return json;
}

export const fetchAccounts = async ({
  keyword = '',
  status = '',
  roleId = '',
  page = 0,
  size = 10,
  sortBy = 'createdAt',
  sortDir = 'desc',
} = {}) => {
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword.trim());
  if (status !== '' && status !== null && status !== undefined) params.append('status', String(status));
  if (roleId !== '' && roleId !== null && roleId !== undefined) params.append('roleId', String(roleId));
  params.append('page', String(page));
  params.append('size', String(size));
  params.append('sortBy', sortBy);
  params.append('sortDir', sortDir);

  const res = await get(`${BASE_URL}?${params.toString()}`);
  return unwrap(res);
};

export const fetchAccountDetail = async (id) => {
  if (!id) throw new Error('Account ID is required');
  const res = await get(`${BASE_URL}/${encodeURIComponent(id)}`);
  return unwrap(res);
};

export const createAccount = async (payload) => {
  const res = await post(BASE_URL, payload);
  return unwrap(res);
};

export const updateAccount = async (id, payload) => {
  if (!id) throw new Error('Account ID is required');
  const res = await put(`${BASE_URL}/${encodeURIComponent(id)}`, payload);
  return unwrap(res);
};

export const updateAccountStatus = async (id, status) => {
  if (!id) throw new Error('Account ID is required');
  const res = await patch(`${BASE_URL}/${encodeURIComponent(id)}/status?status=${encodeURIComponent(status)}`);
  return unwrap(res);
};

export const fetchRoles = async () => {
  const res = await get(ROLES_URL);
  return unwrap(res);
};

export default {
  fetchAccounts,
  fetchAccountDetail,
  createAccount,
  updateAccount,
  updateAccountStatus,
  fetchRoles,
};
