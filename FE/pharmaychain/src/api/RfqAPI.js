import { get, post } from './FetchData';

const RFQ_BASE_URL = 'http://localhost:8080/api/v1/rfq';

function unwrapApiResponse(json) {
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data;
  }
  return json;
}

export const getEligibleProposals = async () => {
  const json = await get(`${RFQ_BASE_URL}/proposals/eligible`);
  return unwrapApiResponse(json);
};

export const sendRfq = async (payload) => {
  const json = await post(`${RFQ_BASE_URL}/send`, payload);
  return unwrapApiResponse(json);
};

export const getRfqsBySupplier = async (supplierId, { page = 0, size = 10 } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  const json = await get(`${RFQ_BASE_URL}/supplier/${encodeURIComponent(supplierId)}?${params.toString()}`);
  return unwrapApiResponse(json);
};

export const getRfqById = async (id) => {
  const json = await get(`${RFQ_BASE_URL}/${encodeURIComponent(id)}`);
  return unwrapApiResponse(json);
};

export const getRfqs = async ({ search, status, supplierId, purchaseProposalId, page = 0, size = 10 } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (supplierId) params.append('supplierId', supplierId);
  if (purchaseProposalId) params.append('purchaseProposalId', purchaseProposalId);
  const json = await get(`${RFQ_BASE_URL}?${params.toString()}`);
  return unwrapApiResponse(json);
};

export const getRfqQuotationDetails = async (id) => {
  const json = await get(`${RFQ_BASE_URL}/${encodeURIComponent(id)}/quotation`);
  return unwrapApiResponse(json);
};

export const compareRfqs = async (rfqIds) => {
  const params = new URLSearchParams();
  rfqIds.forEach(id => params.append('ids', id));
  try {
    const json = await get(`${RFQ_BASE_URL}/compare?${params.toString()}`);
    return unwrapApiResponse(json);
  } catch (error) {
    console.error('compareRfqs API error:', error);
    console.error('Request URL:', `${RFQ_BASE_URL}/compare?${params.toString()}`);
    throw error;
  }
};

export const recordQuotation = async (rfqId, payload) => {
  const json = await post(`${RFQ_BASE_URL}/${encodeURIComponent(rfqId)}/record-quotation`, payload);
  return unwrapApiResponse(json);
};

export default {
  getEligibleProposals,
  sendRfq,
  getRfqsBySupplier,
  getRfqById,
  getRfqs,
  getRfqQuotationDetails,
  compareRfqs,
  recordQuotation,
};