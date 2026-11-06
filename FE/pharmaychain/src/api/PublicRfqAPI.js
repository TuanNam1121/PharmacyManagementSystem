import { get, post } from './FetchData';

const PUBLIC_RFQ_BASE_URL = 'http://localhost:8080/api/public/rfq-portal';

function unwrapApiResponse(json) {
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data;
  }
  return json;
}

export const getRfqDetails = async (token) => {
  const params = new URLSearchParams({ token });
  const json = await get(`${PUBLIC_RFQ_BASE_URL}?${params.toString()}`);
  return unwrapApiResponse(json);
};

export const submitQuotation = async (token, payload) => {
  const params = new URLSearchParams({ token });
  const json = await post(`${PUBLIC_RFQ_BASE_URL}/submit?${params.toString()}`, payload);
  return unwrapApiResponse(json);
};

export default {
  getRfqDetails,
  submitQuotation,
};