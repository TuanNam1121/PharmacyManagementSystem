import { get } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/audit-logs';

function unwrap(json) {
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data;
  }
  return json;
}

export const fetchAuditLogs = async ({
  search = '',
  action = '',
  entityName = '',
  page = 0,
  size = 15,
} = {}) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search.trim());
  if (action !== '' && action !== null && action !== undefined) params.append('action', String(action));
  if (entityName) params.append('entityName', entityName.trim());
  params.append('page', String(page));
  params.append('size', String(size));

  const res = await get(`${BASE_URL}?${params.toString()}`);
  return unwrap(res);
};

export default {
  fetchAuditLogs,
};

