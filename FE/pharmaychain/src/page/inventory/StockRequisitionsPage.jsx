import React from 'react';
import { useStockRequisition } from '../../hooks/inventory/useStockRequisition';

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_MAP = {
    0: { label: 'Pending Review', cls: 'pms-badge pms-badge-neutral' },
    1: { label: 'Approved', cls: 'pms-badge pms-badge-info' },
    2: { label: 'Dispatched', cls: 'pms-badge pms-badge-warning' },
    3: { label: 'Received', cls: 'pms-badge pms-badge-success' },
    4: { label: 'Rejected', cls: 'pms-badge pms-badge-danger' },
};

function StatusBadge({ status }) {
    const s = STATUS_MAP[status] ?? STATUS_MAP[0];
    return <span className={s.cls}>{s.label}</span>;
}

// ── Progress Timeline ──────────────────────────────────────────────────────────
function RequisitionTimeline({ item }) {
    const steps = [
        { label: 'Created', time: item.createdAt, done: true },
        { label: 'Approved', time: item.approvedAt, done: item.status >= 1 && item.status !== 4 },
        { label: 'Dispatched', time: item.dispatchedAt, done: item.status >= 2 },
        { label: 'Received', time: item.receivedAt, done: item.status === 3 },
    ];

    const fmt = (dt) => dt ? new Date(dt).toLocaleString('en-US') : '—';

    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 24, overflowX: 'auto' }}>
            {steps.map((s, i) => (
                <React.Fragment key={i}>
                    <div style={{ textAlign: 'center', minWidth: 120, flex: 1 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%', margin: '0 auto 6px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: s.done ? 'var(--primary)' : 'var(--bg-secondary)',
                            border: `2px solid ${s.done ? 'var(--primary)' : 'var(--border)'}`,
                            color: s.done ? '#fff' : 'var(--text-muted)',
                            fontSize: 13, fontWeight: 700,
                        }}>
                            {s.done
                                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                : i + 1
                            }
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: s.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{fmt(s.time)}</div>
                    </div>
                    {i < steps.length - 1 && (
                        <div style={{
                            height: 2, flex: 0.5, marginTop: 15, alignSelf: 'flex-start',
                            background: steps[i + 1].done ? 'var(--primary)' : 'var(--border)',
                            transition: 'background 0.3s',
                        }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

// ── Detail Modal ───────────────────────────────────────────────────────────────
function DetailModal({ show, item, loading, onHide }) {
    if (!show) return null;
    return (
        <div className="pms-modal-overlay" onClick={onHide}>
            <div className="pms-modal" style={{ maxWidth: 820 }} onClick={e => e.stopPropagation()}>
                <div className="pms-modal-header">
                    <h3 className="pms-modal-title">Stock Requisition Details</h3>
                    <button type="button" className="pms-modal-close" onClick={onHide}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="pms-modal-body">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 48 }}>Loading...</div>
                    ) : item ? (
                        <>
                            {/* Timeline */}
                            <RequisitionTimeline item={item} />

                            {/* Info grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Requisition Code</span>
                                    <div style={{ fontWeight: 700 }}>{item.code}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Branch</span>
                                    <div style={{ fontWeight: 600 }}>{item.storeName ?? '—'}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Status</span>
                                    <div><StatusBadge status={item.status} /></div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Created By</span>
                                    <div style={{ fontWeight: 600 }}>{item.createdByUsername ?? '—'}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Approved By</span>
                                    <div style={{ fontWeight: 600 }}>{item.approvedByUsername ?? '—'}</div>
                                </div>
                                {item.rejectReason && (
                                    <div style={{ gridColumn: '1/-1' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Rejection Reason</span>
                                        <div style={{ color: 'var(--danger)', fontWeight: 600 }}>{item.rejectReason}</div>
                                    </div>
                                )}
                            </div>

                            {/* Detail table */}
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Requested Products List</h4>
                            {item.details?.length > 0 ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="pms-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Product</th>
                                                <th>Barcode</th>
                                                <th>Unit</th>
                                                <th style={{ textAlign: 'right' }}>Requested Qty</th>
                                                <th style={{ textAlign: 'right' }}>Approved Qty</th>
                                                <th style={{ textAlign: 'right' }}>Received Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {item.details.map((d, i) => (
                                                <tr key={d.id}>
                                                    <td>{i + 1}</td>
                                                    <td><strong>{d.productName}</strong></td>
                                                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{d.barcode ?? '—'}</td>
                                                    <td>{d.productUnit}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{d.requestedQty}</td>
                                                    <td style={{ textAlign: 'right', color: d.approvedQty != null ? 'var(--success)' : 'var(--text-muted)' }}>
                                                        {d.approvedQty ?? '—'}
                                                    </td>
                                                    <td style={{ textAlign: 'right', color: d.receivedQty != null ? 'var(--primary)' : 'var(--text-muted)' }}>
                                                        {d.receivedQty ?? '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-secondary)' }}>No products in this requisition.</p>
                            )}
                        </>
                    ) : null}
                </div>
                <div className="pms-modal-footer">
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide}>Close</button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function StockRequisitionsPage() {
    const {
        list, total, page, setPage, size,
        search, setSearch,
        storeId, setStoreId,
        statusFilter, setStatusFilter,
        listLoading,
        selectedItem,
        detailModalOpen, setDetailModalOpen,
        detailLoading,
        openDetail,
        error, setError,
        fetchList,
    } = useStockRequisition();

    const totalPages = Math.ceil(total / size);

    const STATUS_TABS = [
        { value: '', label: 'All' },
        { value: '0', label: 'Pending Review' },
        { value: '1', label: 'Approved' },
        { value: '2', label: 'Dispatched' },
        { value: '3', label: 'Received' },
        { value: '4', label: 'Rejected' },
    ];

    return (
        <div>
            {/* ── Header ── */}
            <div className="pms-page-header" style={{ marginBottom: 16 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h1 className="pms-page-title" style={{ margin: 0 }}>Branch Stock Requisitions</h1>
                        <span className="pms-badge pms-badge-info" style={{ fontSize: 11 }}>Store Manager</span>
                    </div>
                    <p className="pms-page-sub">
                        View and track status, delivery progress of internal replenishment requisitions from the central warehouse.
                    </p>
                </div>
                <div>
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={fetchList} title="Refresh">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Error alert ── */}
            {error && (
                <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                    <button type="button" className="pms-alert-close" onClick={() => setError(null)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            )}

            {/* ── Filters ── */}
            <div className="pms-card" style={{ marginBottom: 20 }}>
                <div className="pms-card-body" style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
                        {/* Store selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Branch:</label>
                            <select
                                className="pms-select"
                                style={{ minWidth: 200 }}
                                value={storeId}
                                onChange={e => { setStoreId(e.target.value); setPage(0); }}
                            >
                                <option value="">All Branches</option>
                                <option value="1">Store #1 — Central Pharmacy</option>
                                <option value="2">Store #2 — Cau Giay Pharmacy</option>
                                <option value="3">Store #3 — Dong Da Pharmacy</option>
                            </select>
                        </div>

                        {/* Search */}
                        <div className="pms-input-wrap" style={{ flex: 1, minWidth: 240 }}>
                            <span className="pms-input-icon">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                className="pms-input"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(0); }}
                                placeholder="Search by requisition code..."
                            />
                        </div>

                        {/* Status tabs */}
                        <div className="pms-tabs" style={{ margin: 0 }}>
                            {STATUS_TABS.map(tab => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    className={`pms-tab ${statusFilter === tab.value ? 'active' : ''}`}
                                    onClick={() => { setStatusFilter(tab.value); setPage(0); }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="pms-card">
                <div className="pms-card-body" style={{ padding: 0 }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="pms-table">
                            <thead>
                                <tr>
                                    <th>Requisition Code</th>
                                    <th>Branch</th>
                                    <th>Created By</th>
                                    <th>Status</th>
                                    <th>Created Date</th>
                                    <th>Approved Date</th>
                                    <th>Dispatched Date</th>
                                    <th>Received Date</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listLoading ? (
                                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
                                ) : list.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
                                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 8px', opacity: 0.4 }}>
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                            No stock requisitions found
                                        </td>
                                    </tr>
                                ) : list.map(item => (
                                    <tr key={item.id}>
                                        <td><strong>{item.code}</strong></td>
                                        <td>{item.storeName ?? '—'}</td>
                                        <td>{item.createdByUsername ?? '—'}</td>
                                        <td><StatusBadge status={item.status} /></td>
                                        <td style={{ fontSize: 13 }}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US') : '—'}</td>
                                        <td style={{ fontSize: 13 }}>{item.approvedAt ? new Date(item.approvedAt).toLocaleDateString('en-US') : '—'}</td>
                                        <td style={{ fontSize: 13 }}>{item.dispatchedAt ? new Date(item.dispatchedAt).toLocaleDateString('en-US') : '—'}</td>
                                        <td style={{ fontSize: 13 }}>{item.receivedAt ? new Date(item.receivedAt).toLocaleDateString('en-US') : '—'}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                type="button"
                                                className="btn-pms btn-pms-secondary"
                                                style={{ padding: '4px 12px', fontSize: 12 }}
                                                onClick={() => openDetail(item)}
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                Showing {list.length} / {total} requisitions
                            </span>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button type="button" className="btn-pms btn-pms-secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                                    ← Previous
                                </button>
                                <span style={{ padding: '4px 10px', fontSize: 13 }}>Page {page + 1}/{totalPages}</span>
                                <button type="button" className="btn-pms btn-pms-secondary" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Detail Modal ── */}
            <DetailModal
                show={detailModalOpen}
                item={selectedItem}
                loading={detailLoading}
                onHide={() => setDetailModalOpen(false)}
            />
        </div>
    );
}
