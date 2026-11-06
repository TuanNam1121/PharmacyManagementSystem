import { useState, useEffect, useCallback } from 'react';
import { formatDate } from '../../utils/format';
import {
  createPurchaseProposal,
  getPurchaseProposals,
  getPurchaseProposalDetail,
  approvePurchaseProposal,
  rejectPurchaseProposal,
} from '../../api/PurchaseProposalAPI';
import PurchaseProposalCreateModal from '../../component/procurement/PurchaseProposalCreateModal';
import PurchaseProposalDetailModal from '../../component/procurement/PurchaseProposalDetailModal';
import PurchaseProposalRejectModal from '../../component/procurement/PurchaseProposalRejectModal';

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

export default function PurchaseProposalsPage() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPurchaseProposals({ page, size, search, status });
      setList(res?.content || []);
      setTotal(res?.totalElements ?? 0);
    } catch (err) {
      setError(err?.message || 'Failed to load purchase proposals');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, status]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleCreateSubmit = async (payload) => {
    setCreateLoading(true);
    setError(null);
    try {
      const res = await createPurchaseProposal(payload);
      setSuccessMsg(`Purchase proposal ${res?.code || ''} created successfully!`);
      setCreateModalOpen(false);
      await fetchList();
    } catch (err) {
      setError(err?.message || 'Failed to create purchase proposal');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenDetail = async (id) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    try {
      const res = await getPurchaseProposalDetail(id);
      setSelectedDetail(res);
    } catch (err) {
      setError(err?.message || 'Failed to load purchase proposal details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async (row) => {
    setActionLoadingId(row.id);
    setError(null);
    try {
      await approvePurchaseProposal(row.id);
      setSuccessMsg(`Purchase proposal ${row.code || ''} approved successfully!`);
      await fetchList();
    } catch (err) {
      setError(err?.message || 'Failed to approve purchase proposal');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenReject = (row) => {
    setRejectTarget(row);
    setRejectReason('');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectTarget) return;
    setRejectSubmitting(true);
    setError(null);
    try {
      await rejectPurchaseProposal(rejectTarget.id, rejectReason);
      setSuccessMsg(`Purchase proposal ${rejectTarget.code || ''} rejected.`);
      setRejectTarget(null);
      setRejectReason('');
      await fetchList();
    } catch (err) {
      setError(err?.message || 'Failed to reject purchase proposal');
    } finally {
      setRejectSubmitting(false);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: '0', label: 'Pending' },
    { value: '1', label: 'Approved' },
    { value: '2', label: 'Rejected' },
    { value: '3', label: 'Completed' },
  ];

  return (
    <div className="pms-page">
      <div className="pms-page-header">
        <div>
          <h1 className="pms-page-title">Purchase Proposals</h1>
          <p className="pms-page-sub">Manage purchase proposals created from supplier quotations</p>
        </div>
        <button
          className="btn-pms btn-pms-primary"
          onClick={() => setCreateModalOpen(true)}
        >
          + Create Purchase Proposal
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
          <button className="pms-alert-close" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="pms-filters-bar">
        <div className="pms-input-wrap" style={{ flex: 1, maxWidth: 360 }}>
          <span className="pms-input-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className="pms-input"
            type="text"
            placeholder="Search by proposal code or PR code…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>

        <select
          className="pms-select"
          style={{ width: 180 }}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> proposals
        </span>
      </div>

      <div className="pms-card">
        <div className="pms-card-body" style={{ padding: 0 }}>
          <div className="pms-table-wrap">
            <table className="pms-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Proposal Code</th>
                  <th>Purchase Requests</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th className="text-right" style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No purchase proposals found.
                    </td>
                  </tr>
                ) : (
                  list.map((row, i) => (
                    <tr key={row.id || i}>
                      <td className="text-xs text-muted-color">{page * size + i + 1}</td>
                      <td><span className="mono fw-700" style={{ fontSize: 13 }}>{row.code}</span></td>
                      <td>{row.purchaseRequests && row.purchaseRequests.length > 0
                        ? row.purchaseRequests.map((r) => r.code).join(', ')
                        : '—'}</td>
                      <td>
                        <span className={`pms-badge ${row.status === 1 ? 'pms-badge-success' : row.status === 2 ? 'pms-badge-danger' : 'pms-badge-info'}`}>
                          {row.statusText || 'Pending'}
                        </span>
                      </td>
                      <td className="text-sm text-muted-color">{formatDate(row.createdAt)}</td>
                      <td className="text-right">
                        <div style={{ display: 'inline-flex', gap: 4, justifyContent: 'flex-end' }}>
                          {row.status === 0 && (
                            <>
                              <button
                                className="btn-pms btn-pms-ghost btn-pms-sm"
                                style={{ color: 'var(--color-success)' }}
                                onClick={() => handleApprove(row)}
                                disabled={actionLoadingId === row.id}
                                title="Accept (Approve)"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </button>
                              <button
                                className="btn-pms btn-pms-ghost btn-pms-sm"
                                style={{ color: 'var(--color-danger)' }}
                                onClick={() => handleOpenReject(row)}
                                disabled={actionLoadingId === row.id}
                                title="Reject"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </>
                          )}
                          <button
                            className="btn-pms btn-pms-ghost btn-pms-sm"
                            onClick={() => handleOpenDetail(row.id)}
                            title="View details"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <Pagination total={total} page={page} size={size} onPage={setPage} />
      </div>

      <PurchaseProposalCreateModal
        show={createModalOpen}
        onHide={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        loading={createLoading}
      />
      <PurchaseProposalDetailModal
        show={detailModalOpen}
        onHide={() => { setDetailModalOpen(false); setSelectedDetail(null); }}
        detail={selectedDetail}
        loading={detailLoading}
      />
      <PurchaseProposalRejectModal
        show={!!rejectTarget}
        onHide={() => { setRejectTarget(null); setRejectReason(''); }}
        code={rejectTarget?.code}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onSubmit={handleConfirmReject}
        submitting={rejectSubmitting}
      />
    </div>
  );
}