import { useState, useEffect, useCallback } from 'react';
import { formatDate } from '../../utils/format';
import {
  getReplenishmentRequests,
  getReplenishmentRequestDetail,
  approveReplenishmentRequest,
  rejectReplenishmentRequest,
  confirmGoodsDispatch,
} from '../../api/WarehouseInventoryAPI';
import WarehouseReplenishmentDetailModal from '../../component/warehouse/WarehouseReplenishmentDetailModal';
import WarehouseDispatchModal from '../../component/warehouse/WarehouseDispatchModal';

export default function WarehouseReplenishmentPage() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedForDispatch, setSelectedForDispatch] = useState(null);
  const [dispatchLoading, setDispatchLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReplenishmentRequests({
        page,
        size,
        search,
        status: status !== '' ? status : undefined,
      });
      setList(res?.content || []);
      setTotal(res?.totalElements ?? 0);
    } catch (err) {
      setError(err?.message || 'Failed to load store replenishment requests');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, status]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // View detail
  const handleOpenDetail = async (id) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    try {
      const res = await getReplenishmentRequestDetail(id);
      setSelectedDetail(res);
    } catch (err) {
      setError(err?.message || 'Failed to load request details');
    } finally {
      setDetailLoading(false);
    }
  };

  // UC #50: Approve
  const handleApprove = async (id) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await approveReplenishmentRequest(id);
      setSuccessMsg(`Replenishment request ${res?.code || ''} approved successfully!`);
      setSelectedDetail(res);
      await fetchList();
    } catch (err) {
      setError(err?.message || 'Failed to approve replenishment request');
    } finally {
      setActionLoading(false);
    }
  };

  // UC #51: Reject
  const handleReject = async (id, reason) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await rejectReplenishmentRequest(id, reason);
      setSuccessMsg(`Replenishment request ${res?.code || ''} rejected.`);
      setSelectedDetail(res);
      await fetchList();
    } catch (err) {
      setError(err?.message || 'Failed to reject replenishment request');
    } finally {
      setActionLoading(false);
    }
  };

  // UC #52: Dispatch
  const handleOpenDispatch = (item) => {
    setSelectedForDispatch(item);
    setDispatchModalOpen(true);
  };

  const handleConfirmDispatch = async (id, payload) => {
    setDispatchLoading(true);
    setError(null);
    try {
      const issue = await confirmGoodsDispatch(id, payload);
      setSuccessMsg(`Goods Issue #${issue?.code || ''} created successfully! Stock deducted and dispatched.`);
      setDispatchModalOpen(false);
      setSelectedForDispatch(null);
      await fetchList();
      if (detailModalOpen && selectedDetail?.id === id) {
        setDetailModalOpen(false);
      }
    } catch (err) {
      setError(err?.message || 'Failed to dispatch goods');
    } finally {
      setDispatchLoading(false);
    }
  };

  const totalPages = Math.ceil(total / size);

  return (
    <div>
      {/* Page Header */}
      <div className="pms-page-header">
        <div>
          <h1 className="pms-page-title">Store Replenishment & Goods Issue</h1>
          <p className="pms-page-sub">
            Review stock requisitions from retail branches, approve quantities, and dispatch goods via FEFO picking
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="pms-alert pms-alert-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {successMsg}
          <button className="pms-alert-close" onClick={() => setSuccessMsg(null)}>✕</button>
        </div>
      )}
      {error && (
        <div className="pms-alert pms-alert-danger">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
          <button className="pms-alert-close" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="pms-filters-bar">
        <div className="pms-input-wrap" style={{ flex: 1, maxWidth: 360 }}>
          <span className="pms-input-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            className="pms-input"
            type="text"
            placeholder="Search by request code or store name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="pms-select"
          style={{ width: 190 }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="1">Submitted (Pending Review)</option>
          <option value="2">Approved (Ready for Dispatch)</option>
          <option value="3">Rejected</option>
          <option value="4">Dispatched (In Transit)</option>
          <option value="5">Completed / Received</option>
        </select>

        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> store requests
        </span>
      </div>

      {/* Requisitions List Table */}
      {loading ? (
        <div className="pms-card">
          <div className="pms-spinner-wrap">
            <div className="pms-spinner" />
            <span className="pms-spinner-text">Loading replenishment requests…</span>
          </div>
        </div>
      ) : list.length === 0 ? (
        <div className="pms-card">
          <div className="pms-empty">
            <div className="pms-empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div className="pms-empty-title">No replenishment requests found</div>
            <div className="pms-empty-sub">Branch stores have not submitted any stock requisitions matching your filter.</div>
          </div>
        </div>
      ) : (
        <div className="pms-card">
          <div className="pms-table-wrap">
            <table className="pms-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Requisition Code</th>
                  <th>Branch Store</th>
                  <th>Requested Date</th>
                  <th>Requested By</th>
                  <th>Status</th>
                  <th className="text-right" style={{ width: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row, i) => {
                  const isPending = row.status === 1 || row.status === 0 || row.statusText === 'Submitted';
                  const isApproved = row.status === 2 || row.statusText === 'Approved';
                  const isRejected = row.status === 3 || row.statusText === 'Rejected';
                  const isDispatched = row.status === 4 || row.statusText === 'Dispatched';

                  return (
                    <tr key={row.id || i}>
                      <td className="text-xs text-muted-color">{page * size + i + 1}</td>
                      <td>
                        <span className="mono fw-700" style={{ fontSize: 13 }}>{row.code}</span>
                      </td>
                      <td>
                        <div className="fw-600" style={{ fontSize: 13 }}>{row.storeName || 'Branch Store'}</div>
                      </td>
                      <td className="text-sm text-muted-color">{formatDate(row.createdAt)}</td>
                      <td className="text-sm text-muted-color">{row.createdByUsername || '—'}</td>
                      <td>
                        <span className={`pms-badge ${isApproved ? 'pms-badge-success' : isRejected ? 'pms-badge-danger' : isDispatched ? 'pms-badge-info' : 'pms-badge-warning'}`}>
                          {row.statusText || 'Pending Review'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end' }}>
                          {isPending && (
                            <button
                              className="btn-pms btn-pms-sm btn-pms-primary"
                              title="Approve Requisition"
                              onClick={() => handleApprove(row.id)}
                              disabled={actionLoading}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Approve
                            </button>
                          )}

                          {isApproved && (
                            <button
                              className="btn-pms btn-pms-sm btn-pms-primary"
                              title="Dispatch Goods (Goods Issue)"
                              onClick={() => handleOpenDispatch(row)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                              </svg>
                              Dispatch
                            </button>
                          )}

                          <button
                            className="btn-pms btn-pms-sm btn-pms-secondary"
                            title="View full requisition detail"
                            onClick={() => handleOpenDetail(row.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > size && (
        <div className="pms-pagination">
          <button className="pms-page-btn" disabled={page === 0} onClick={() => setPage(page - 1)}>
            ‹
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
            <button key={i} className={`pms-page-btn ${page === i ? 'active' : ''}`} onClick={() => setPage(i)}>
              {i + 1}
            </button>
          ))}
          <button className="pms-page-btn" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
            ›
          </button>
        </div>
      )}

      {/* Modals */}
      <WarehouseReplenishmentDetailModal
        show={detailModalOpen}
        onHide={() => { setDetailModalOpen(false); setSelectedDetail(null); }}
        detail={selectedDetail}
        loading={detailLoading}
        onApprove={handleApprove}
        onReject={handleReject}
        onOpenDispatch={handleOpenDispatch}
        actionLoading={actionLoading}
      />
      <WarehouseDispatchModal
        show={dispatchModalOpen}
        onHide={() => { setDispatchModalOpen(false); setSelectedForDispatch(null); }}
        requisition={selectedForDispatch}
        onConfirm={handleConfirmDispatch}
        loading={dispatchLoading}
      />
    </div>
  );
}
