import { get, post, patch } from './FetchData';

const BASE_URL = 'http://localhost:8080/api/v1/purchase-proposals';

function unwrapApiResponse(json) {
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data;
  }
  return json;
}

/**
 * Create a new purchase proposal by aggregating one or more purchase requests
 */
export const createPurchaseProposal = async (payload) => {
  const json = await post(`${BASE_URL}`, payload);
  return unwrapApiResponse(json);
};

/**
 * Get purchase proposals with filtering and pagination
 */
export const getPurchaseProposals = async ({ page = 0, size = 10, search = '', status = '' } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (search) params.append('search', search);
  if (status !== '' && status !== undefined && status !== null) params.append('status', status);
  const json = await get(`${BASE_URL}?${params.toString()}`);
  return unwrapApiResponse(json);
};

/**
 * Get purchase proposal detail by ID
 */
export const getPurchaseProposalDetail = async (id) => {
  const json = await get(`${BASE_URL}/${encodeURIComponent(id)}`);
  return unwrapApiResponse(json);
};

/**
 * Get eligible purchase requests (SUBMITTED and not yet aggregated) for creating proposals
 */
export const getEligiblePurchaseRequests = async () => {
  const json = await get(`${BASE_URL}/eligible-requests`);
  return unwrapApiResponse(json);
};

/**
 * Approve a purchase proposal (sets status to Approved)
 */
export const approvePurchaseProposal = async (id) => {
  const json = await patch(`${BASE_URL}/${encodeURIComponent(id)}/approve`);
  return unwrapApiResponse(json);
};

/**
 * Reject a purchase proposal (sets status to Rejected, optional reason)
 */
export const rejectPurchaseProposal = async (id, reason = '') => {
  const params = new URLSearchParams();
  if (reason) params.append('reason', reason);
  const q = params.toString() ? `?${params.toString()}` : '';
  const json = await patch(`${BASE_URL}/${encodeURIComponent(id)}/reject${q}`);
  return unwrapApiResponse(json);
};

/**
 * Select the winning supplier quotation for a purchase proposal (moves it to Pending Approval)
 */
export const selectProposalSupplier = async (id, rfqId) => {
  const params = new URLSearchParams({ rfqId: String(rfqId) });
  const json = await patch(`${BASE_URL}/${encodeURIComponent(id)}/select-supplier?${params.toString()}`);
  return unwrapApiResponse(json);
};

export default {
  createPurchaseProposal,
  getPurchaseProposals,
  getPurchaseProposalDetail,
  getEligiblePurchaseRequests,
  approvePurchaseProposal,
  rejectPurchaseProposal,
  selectProposalSupplier,
};
