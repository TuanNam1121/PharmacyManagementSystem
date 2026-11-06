import { useState } from 'react';
import {
  useRfq,
  useRfqDetail,
  useCompareRfqs,
  useRfqSelection,
} from '../../hooks/rfq/useRfq';
import RfqFilters from '../../component/rfq/RfqFilters';
import RfqTable from '../../component/rfq/RfqTable';
import RfqDetailModal from '../../component/rfq/RfqDetailModal';
import QuotationCompareModal from '../../component/rfq/QuotationCompareModal';
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
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [purchaseProposalFilter, setPurchaseProposalFilter] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);
  const [uiError, setUiError] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [detailRfqId, setDetailRfqId] = useState(null);
  const [sendModalOpen, setSendModalOpen] = useState(false);

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

  const { detail: detailData, loading: detailLoading, refetch: fetchDetail } =
    useRfqDetail(detailRfqId);

  const { compareData, compareLoading, error: compareError, compare } =
    useCompareRfqs();

  const {
    selectedRfqs,
    toggleSelect,
    clearSelection,
    setSelectedRfqs: setSelectedRfqsState,
    selectedCount,
  } = useRfqSelection(data);

  const handleViewDetail = (rfqId) => {
    setDetailRfqId(rfqId);
    setDetailModalOpen(true);
  };

  const handleToggleSelect = (rfqId, rfqPurchaseProposalId) => {
    if (selectedRfqs.length > 0) {
      const firstSelected = selectedRfqs[0];
      if (firstSelected.purchaseProposalId !== rfqPurchaseProposalId) {
        setUiError('Only RFQs from the same Purchase Proposal can be compared together');
        return;
      }
    }
    toggleSelect(rfqId, rfqPurchaseProposalId);
  };

  const handleCompareSelected = async () => {
    if (selectedRfqs.length < 2) {
      setUiError('Please select at least 2 RFQs to compare');
      return;
    }

    const firstProposalId = selectedRfqs[0]?.purchaseProposalId;
    if (!firstProposalId) {
      setUiError('Selected RFQs must have a valid purchase proposal');
      return;
    }

    const allSameProposal = selectedRfqs.every((r) => r.purchaseProposalId === firstProposalId);
    if (!allSameProposal) {
      setUiError('All selected RFQs must belong to the same Purchase Proposal');
      return;
    }

    setCompareModalOpen(true);
    await compare(selectedRfqs.map((r) => r.id));
  };

  const handleClearSelection = () => {
    clearSelection();
  };

  return (
    <div>
      <div className="pms-page-header">
        <div>
          <h1 className="pms-page-title">RFQ & Quotations</h1>
          <p className="pms-page-sub">
            Manage Requests for Quotation, review supplier responses, and compare quotations.
          </p>
        </div>
        <button
          className="btn-pms btn-pms-primary"
          onClick={() => setSendModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          Send RFQ Email
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

      {selectedRfqs.length > 0 && (
        <div className="pms-alert pms-alert-info" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div>
              <strong>{selectedRfqs.length} RFQ(s) selected</strong> from the same Purchase Proposal. {selectedRfqs.map((r) => r.code).join(', ')}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-pms btn-pms-primary" onClick={handleCompareSelected}>
                Compare Selected
              </button>
              <button className="btn-pms btn-pms-ghost" onClick={handleClearSelection}>
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <RfqFilters
        search={search}
        statusFilter={statusFilter}
        supplierFilter={supplierFilter}
        purchaseProposalFilter={purchaseProposalFilter}
        onSearch={(val) => { setSearch(val); setPage(0); }}
        onStatusChange={(val) => { setStatusFilter(val); setPage(0); }}
        onSupplierChange={(val) => { setSupplierFilter(val); setPage(0); }}
        onPurchaseProposalChange={(val) => { setPurchaseProposalFilter(val); setPage(0); }}
        onRefresh={fetchRfqs}
      />

      <RfqTable
        data={data}
        loading={loading}
        page={page}
        size={size}
        selectedRfqs={selectedRfqs.map((r) => r.id)}
        onViewDetail={handleViewDetail}
        onToggleSelect={handleToggleSelect}
      />

      <Pagination total={total} page={page} size={size} onPage={setPage} />

      <RfqDetailModal
        show={detailModalOpen}
        onHide={() => { setDetailModalOpen(false); setDetailRfqId(null); }}
        detail={detailData}
        loading={detailLoading}
        onCompare={() => {
          if (detailData) {
            const purchaseProposalId = detailData.purchaseProposal?.id;
            const sameProposalRfqs = data.filter((r) => r.purchaseProposalId === purchaseProposalId);
            setSelectedRfqsState(
              sameProposalRfqs.map((rfq) => ({
                id: rfq.id,
                code: rfq.code,
                supplierName: rfq.supplierName,
                purchaseProposalId,
              }))
            );
            setDetailModalOpen(false);
            setSuccessMsg(
              `Selected ${sameProposalRfqs.length} RFQ(s) from the same Purchase Proposal. Click "Compare Selected" to view comparison.`
            );
          }
        }}
      />

      <QuotationCompareModal
        show={compareModalOpen}
        onHide={() => { setCompareModalOpen(false); }}
        data={compareData}
        loading={compareLoading}
      />

      <SendRfqModal
        show={sendModalOpen}
        onHide={() => setSendModalOpen(false)}
        supplierSelectMode
        onSuccess={() => { fetchRfqs(); setSuccessMsg('RFQ sent successfully!'); }}
      />
    </div>
  );
}