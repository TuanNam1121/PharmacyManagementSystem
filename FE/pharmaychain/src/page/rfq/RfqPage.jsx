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
import RecordQuotationModal from '../../component/rfq/RecordQuotationModal';
import SendRfqModal from '../../component/supplier/SendRfqModal';

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
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [selectedRfqForRecord, setSelectedRfqForRecord] = useState(null);
  const [detailRfqId, setDetailRfqId] = useState(null);
  const [sendModalOpen, setSendModalOpen] = useState(false);

  const handleRecordQuote = (rfq) => {
    setSelectedRfqForRecord(rfq);
    setRecordModalOpen(true);
  };

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

  const { compareData, compareLoading, compare } =
    useCompareRfqs();

  const handleViewDetail = (rfqId) => {
    setDetailRfqId(rfqId);
    setDetailModalOpen(true);
  };

  const handleCompareRfq = async (rfq) => {
    const proposalId = rfq.purchaseProposalId || rfq.purchaseProposal?.id;
    if (!proposalId) {
      setUiError('Yêu cầu báo giá này chưa liên kết với đề xuất mua hàng nào.');
      return;
    }

    // Find responded RFQs for the same purchase proposal
    const sameProposalRfqs = (data || []).filter(
      (r) =>
        (r.purchaseProposalId === proposalId || r.purchaseProposal?.id === proposalId) &&
        (r.status === 'RESPONDED' || r.status === '1' || String(r.status).toUpperCase() === 'ĐÃ PHẢN HỒI')
    );

    const compareIds = sameProposalRfqs.length > 0
      ? sameProposalRfqs.map((r) => r.id)
      : [rfq.id];

    setCompareModalOpen(true);
    await compare(compareIds);
  };

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
        onRecordQuote={handleRecordQuote}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <Pagination total={total} page={page} size={size} onPage={setPage} />
      </div>

      <RfqDetailModal
        show={detailModalOpen}
        onHide={() => { setDetailModalOpen(false); setDetailRfqId(null); }}
        detail={detailData}
        loading={detailLoading}
        onRecordQuote={handleRecordQuote}
        onCompare={() => {
          if (detailData) {
            const proposalId = detailData.purchaseProposal?.id || detailData.purchaseProposalId;
            const sameProposalRfqs = (data || []).filter(
              (r) => (r.purchaseProposalId === proposalId || r.purchaseProposal?.id === proposalId)
            );
            const compareIds = sameProposalRfqs.length > 0
              ? sameProposalRfqs.map((r) => r.id)
              : [detailData.id];

            setDetailModalOpen(false);
            setCompareModalOpen(true);
            compare(compareIds);
          }
        }}
      />

      <QuotationCompareModal
        show={compareModalOpen}
        onHide={() => { setCompareModalOpen(false); }}
        data={compareData}
        loading={compareLoading}
      />

      <RecordQuotationModal
        show={recordModalOpen}
        onHide={() => { setRecordModalOpen(false); setSelectedRfqForRecord(null); }}
        rfq={selectedRfqForRecord}
        onSuccess={(msg) => { fetchRfqs(); setSuccessMsg(msg); }}
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
