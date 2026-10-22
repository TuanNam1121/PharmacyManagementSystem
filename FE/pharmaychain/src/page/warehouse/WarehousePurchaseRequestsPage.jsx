import { useState, useEffect, useCallback } from 'react';
import { formatDate } from '../../utils/format';
import {
  getPurchaseRequests,
  getPurchaseRequestDetail,
  createPurchaseRequest,
} from '../../api/WarehouseInventoryAPI';
import WarehouseCreatePurchaseRequestModal from '../../component/warehouse/WarehouseCreatePurchaseRequestModal';
import WarehousePurchaseRequestDetailModal from '../../component/warehouse/WarehousePurchaseRequestDetailModal';

export default function WarehousePurchaseRequestsPage() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPurchaseRequests({
        page,
        size,
        search,
        status: status !== '' ? status : undefined,
      });
      setList(res?.content || []);
      setTotal(res?.totalElements ?? 0);
    } catch (err) {
      setError(err?.message || 'Failed to load purchase requests');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, status]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleOpenDetail = async (id) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    try {
      const res = await getPurchaseRequestDetail(id);
      setSelectedDetail(res);
    } catch (err) {
      setError(err?.message || 'Failed to load purchase request details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateSubmit = async (payload) => {
    setCreateLoading(true);
    setError(null);
    try {
      const res = await createPurchaseRequest(payload);
      setSuccessMsg(`Purchase request ${res?.code || ''} created successfully!`);
      setCreateModalOpen(false);
      await fetchList();
    } catch (err) {
      setError(err?.message || 'Failed to create purchase request');
    } finally {
      setCreateLoading(false);
    }
  };

  const totalPages = Math.ceil(total / size);

  return (
    <div>
      {/* Page Header */}
      <div className="pms-page-header">
        <div>
          <h1 className="pms-page-title">Purchase Requests (Procurement Demands)</h1>
          <p className="pms-page-sub">Submit and manage medicine procurement requests to maintain central warehouse stock</p>
        </div>
        <button
          className="btn-pms btn-pms-primary"
          onClick={() => setCreateModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Purchase Request
        </button>
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
            placeholder="Search by code or reason…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="pms-select"
          style={{ width: 180 }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="1">Submitted</option>
          <option value="2">Approved</option>
          <option value="3">Fulfilled</option>
          <option value="4">Cancelled</option>
        </select>

        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> requests
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="pms-card">
          <div className="pms-spinner-wrap">
            <div className="pms-spinner" />
            <span className="pms-spinner-text">Loading purchase requests…</span>
          </div>
        </div>
      ) : list.length === 0 ? (
        <div className="pms-card">
          <div className="pms-empty">
            <div className="pms-empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div className="pms-empty-title">No purchase requests found</div>
            <div className="pms-empty-sub">Submit your first purchase request to order stock from suppliers.</div>
          </div>
        </div>
      ) : (
        <div className="pms-card">
          <div className="pms-table-wrap">
            <table className="pms-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Request Code</th>
                  <th>Reason / Justification</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Created By</th>
                  <th className="text-right" style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row, i) => (
                  <tr key={row.id || i}>
                    <td className="text-xs text-muted-color">{page * size + i + 1}</td>
                    <td>
                      <span className="mono fw-700" style={{ fontSize: 13 }}>{row.code}</span>
                    </td>
                    <td style={{ maxWidth: 280 }}>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.reason}>
                        {row.reason || '—'}
                      </div>
                    </td>
                    <td>
                      <span className="pms-badge pms-badge-neutral">{row.itemCount || (row.items ? row.items.length : 0)} items</span>
                    </td>
                    <td>
                      <span className={`pms-badge ${row.status === 2 ? 'pms-badge-success' : row.status === 4 ? 'pms-badge-danger' : 'pms-badge-info'}`}>
                        {row.statusText || 'Submitted'}
                      </span>
                    </td>
                    <td className="text-sm text-muted-color">{formatDate(row.createdAt)}</td>
                    <td className="text-sm text-muted-color">{row.createdByUsername || '—'}</td>
                    <td className="text-right">
                      <button
                        className="btn-pms btn-pms-sm btn-pms-secondary"
                        onClick={() => handleOpenDetail(row.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
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
      <WarehouseCreatePurchaseRequestModal
        show={createModalOpen}
        onHide={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        loading={createLoading}
      />
      <WarehousePurchaseRequestDetailModal
        show={detailModalOpen}
        onHide={() => { setDetailModalOpen(false); setSelectedDetail(null); }}
        detail={selectedDetail}
        loading={detailLoading}
      />
    </div>
  );
}
