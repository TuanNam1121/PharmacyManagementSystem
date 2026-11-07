import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useRfq,
  useRfqDetail,
  useCompareRfqs,
} from '../../hooks/rfq/useRfq';
import RfqFilters from '../../component/rfq/RfqFilters';
import RfqTable from '../../component/rfq/RfqTable';
import RfqDetailModal from '../../component/rfq/RfqDetailModal';
import QuotationCompareModal from '../../component/rfq/QuotationCompareModal';
import SendRfqModal from '../../component/supplier/SendRfqModal';
import { getRfqs } from '../../api/RfqAPI';

function Pagination({ total, page, size, onPage }) {
  if (total <= size) return null;
  const totalPages = Math.ceil(total / size);
  return (
    <div className="pms-pagination">
      <button className="pms-page-btn" disabled={page === 0} onClick={() => onPage(page - 1)}>‹</button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
        <button key={i} className={`pms-page-btn ${page === i ? 'active' : ''}`} onClick={() => onPage(i)}>{i + 1}</button>
      ))}
      {totalPages > 7 && <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>}
      <button className="pms-page-btn" disabled={page + 1 >= totalPages} onClick={() => onPage(page + 1)}>›</button>
    </div>
  );
}

export default function RfqPage() {
  const [searchParams] = useSearchParams();
  const urlProposalId = searchParams.get('proposalId');
  const [preselectedProposalId, setPreselectedProposalId] = useState(urlProposalId ? Number(urlProposalId) : null);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter] = useState('');
  const [purchaseProposalFilter] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);
  const [uiError, setUiError] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareEmptyMessage, setCompareEmptyMessage] = useState(null);
  const [detailRfqId, setDetailRfqId] = useState(null);
  const [sendModalOpen, setSendModalOpen] = useState(false);

  useEffect(() => {
    if (urlProposalId) {
      setPreselectedProposalId(Number(urlProposalId));
      setSendModalOpen(true);
    }
  }, [urlProposalId]);

  const {
    data,
    total,
    loading,
    error,
    refetch: fetchRfqs,
  } = useRfq({
    search,
    status: statusFilter,
    supplierId: supplierFilter,
    purchaseProposalId: purchaseProposalFilter,
    page,
    size,
  });

  const { detail: detailData, loading: detailLoading } =
    useRfqDetail(detailRfqId);

  const { compareData, compareLoading, error: compareError, compare } =
    useCompareRfqs();

  const handleViewDetail = (rfqId) => {
    setDetailRfqId(rfqId);
    setDetailModalOpen(true);
  };

  const isRespondedStatus = (status) =>
    status === 'RESPONDED' || status === '1' || String(status).toUpperCase() === 'ĐÃ PHẢN HỒI';

  const COMPARE_EMPTY_MESSAGE =
    'Không có hoặc chưa có nhà cung cấp khác báo giá cho cùng đề xuất mua hàng.';

  // Collect every responded RFQ that belongs to the same purchase proposal.
  // The full set is fetched (not just the current page) so a supplier that
  // responded on another page is not missed.
  const fetchRespondedRfqIds = async (proposalId) => {
    try {
      const response = await getRfqs({
        purchaseProposalId: proposalId,
        status: 'RESPONDED',
        page: 0,
        size: 200,
      });
      return (response?.content || []).map((r) => r.id);
    } catch {
      // Fallback to what is already loaded on the current page
      return (data || [])
        .filter(
          (r) =>
            (r.purchaseProposalId === proposalId || r.purchaseProposal?.id === proposalId) &&
            isRespondedStatus(r.status)
        )
        .map((r) => r.id);
    }
  };

  const openCompareForProposal = async (proposalId) => {
    if (!proposalId) {
      setUiError('Yêu cầu báo giá này chưa liên kết với đề xuất mua hàng nào.');
      return;
    }

    const respondedIds = await fetchRespondedRfqIds(proposalId);
    setCompareModalOpen(true);

    if (respondedIds.length < 2) {
      setCompareEmptyMessage(COMPARE_EMPTY_MESSAGE);
      return;
    }

    setCompareEmptyMessage(null);
    await compare(respondedIds);
  };

  const handleCompareRfq = (rfq) =>
    openCompareForProposal(rfq.purchaseProposalId || rfq.purchaseProposal?.id);

  return (
    <div className="pms-page">
      <div className="pms-page-header">
        <div>
          <h1 className="pms-page-title">Yêu Cầu Báo Giá (RFQ)</h1>
          <p className="pms-page-sub">
            Quản lý chào giá gửi nhà cung cấp, tiếp nhận báo giá và thẩm định so sánh giá
          </p>
        </div>
        <button
          className="btn-pms btn-pms-primary"
          onClick={() => setSendModalOpen(true)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Gửi Yêu Cầu Báo Giá
        </button>
      </div>

      {successMsg && (
        <div className="pms-alert pms-alert-success">
          ✓ {successMsg}
          <button className="pms-alert-close" onClick={() => setSuccessMsg(null)}>✕</button>
        </div>
      )}

      {error && (
        <div className="pms-alert pms-alert-danger">
          ⚠ {error}
          <button className="pms-alert-close" onClick={() => setUiError(null)}>✕</button>
        </div>
      )}
      {uiError && (
        <div className="pms-alert pms-alert-danger">
          ⚠ {uiError}
          <button className="pms-alert-close" onClick={() => setUiError(null)}>✕</button>
        </div>
      )}

      <RfqFilters
        search={search}
        statusFilter={statusFilter}
        total={total}
        onSearch={(val) => { setSearch(val); setPage(0); }}
        onStatusChange={(val) => { setStatusFilter(val); setPage(0); }}
      />

      <RfqTable
        data={data}
        loading={loading}
        page={page}
        size={size}
        onViewDetail={handleViewDetail}
        onCompare={handleCompareRfq}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <Pagination total={total} page={page} size={size} onPage={setPage} />
      </div>

      <RfqDetailModal
        show={detailModalOpen}
        onHide={() => { setDetailModalOpen(false); setDetailRfqId(null); }}
        detail={detailData}
        loading={detailLoading}
        onCompare={() => {
          if (!detailData) return;
          const proposalId = detailData.purchaseProposal?.id || detailData.purchaseProposalId;
          setDetailModalOpen(false);
          setDetailRfqId(null);
          openCompareForProposal(proposalId);
        }}
      />

      <QuotationCompareModal
        show={compareModalOpen}
        onHide={() => { setCompareModalOpen(false); setCompareEmptyMessage(null); }}
        data={compareData}
        loading={compareLoading}
        emptyMessage={compareEmptyMessage}
        error={compareError}
      />

      <SendRfqModal
        show={sendModalOpen}
        onHide={() => setSendModalOpen(false)}
        supplierSelectMode
        preselectedProposalId={preselectedProposalId}
        onSuccess={() => { fetchRfqs(); setSuccessMsg('Gửi yêu cầu báo giá thành công!'); }}
      />
    </div>
  );
}
