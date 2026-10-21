import React from 'react';
import { useInventoryAudit } from '../../hooks/inventory/useInventoryAudit';

// ── Status badge helper ────────────────────────────────────────────────────────
const STATUS_MAP = {
    0: { label: 'Pending Review', cls: 'pms-badge pms-badge-neutral' },
    1: { label: 'Confirmed', cls: 'pms-badge pms-badge-success' },
    2: { label: 'Rejected', cls: 'pms-badge pms-badge-danger' },
};

function StatusBadge({ status }) {
    const s = STATUS_MAP[status] ?? STATUS_MAP[0];
    return <span className={s.cls}>{s.label}</span>;
}

// ── Review Modal ───────────────────────────────────────────────────────────────
function ReviewModal({ show, audit, onHide, onConfirm, submitting }) {
    const [decision, setDecision] = React.useState(null);
    const [reviewNote, setReviewNote] = React.useState('');
    const [touched, setTouched] = React.useState(false);

    React.useEffect(() => {
        if (show) { setDecision(null); setReviewNote(''); setTouched(false); }
    }, [show]);

    if (!show || !audit) return null;

    const handleSubmit = () => {
        setTouched(true);
        if (!decision) return;
        onConfirm({ decision, reviewNote });
    };

    return (
        <div className="pms-modal-overlay" onClick={onHide}>
            <div className="pms-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
                <div className="pms-modal-header">
                    <h3 className="pms-modal-title">Review Inventory Audit</h3>
                    <button type="button" className="pms-modal-close" onClick={onHide}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="pms-modal-body">
                    <div style={{ marginBottom: 16 }}>
                        <span style={{ fontWeight: 600 }}>Audit:</span> {audit.code}
                        {' '}<StatusBadge status={audit.status} />
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                            Review Decision <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                type="button"
                                className={`btn-pms ${decision === 1 ? 'btn-pms-success' : 'btn-pms-secondary'}`}
                                onClick={() => setDecision(1)}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Confirm & Approve
                            </button>
                            <button
                                type="button"
                                className={`btn-pms ${decision === 2 ? 'btn-pms-danger' : 'btn-pms-secondary'}`}
                                onClick={() => setDecision(2)}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                Reject & Recount
                            </button>
                        </div>
                        {touched && !decision && (
                            <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>
                                Please select a review decision
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>
                            Review Notes
                        </label>
                        <textarea
                            className="pms-input"
                            rows={4}
                            maxLength={500}
                            placeholder="Enter review notes (optional)..."
                            value={reviewNote}
                            onChange={e => setReviewNote(e.target.value)}
                            style={{ width: '100%', resize: 'vertical' }}
                        />
                        <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)' }}>
                            {reviewNote.length}/500
                        </div>
                    </div>
                </div>
                <div className="pms-modal-footer">
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={`btn-pms ${decision === 2 ? 'btn-pms-danger' : 'btn-pms-primary'}`}
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? 'Processing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Detail Modal ───────────────────────────────────────────────────────────────
function DetailModal({ show, audit, loading, onHide, onReview }) {
    if (!show) return null;
    return (
        <div className="pms-modal-overlay" onClick={onHide}>
            <div className="pms-modal" style={{ maxWidth: 780 }} onClick={e => e.stopPropagation()}>
                <div className="pms-modal-header">
                    <h3 className="pms-modal-title">Inventory Audit Details</h3>
                    <button type="button" className="pms-modal-close" onClick={onHide}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="pms-modal-body">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
                    ) : audit ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div><span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Audit Code</span><br /><strong>{audit.code}</strong></div>
                                <div><span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Status</span><br /><StatusBadge status={audit.status} /></div>
                                <div><span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Audit Date</span><br /><strong>{audit.auditDate ?? '—'}</strong></div>
                                <div><span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Created At</span><br /><strong>{audit.createdAt ? new Date(audit.createdAt).toLocaleString('en-US') : '—'}</strong></div>
                                {audit.reviewNote && (
                                    <div style={{ gridColumn: '1/-1' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Review Notes</span><br />
                                        <strong>{audit.reviewNote}</strong>
                                    </div>
                                )}
                            </div>

                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Counted Products Breakdown</h4>
                            {audit.details?.length > 0 ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="pms-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Batch Number</th>
                                                <th style={{ textAlign: 'right' }}>System Stock</th>
                                                <th style={{ textAlign: 'right' }}>Counted Qty</th>
                                                <th style={{ textAlign: 'right' }}>Variance</th>
                                                <th>Note</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {audit.details.map(d => (
                                                <tr key={d.id}>
                                                    <td>{d.productName}</td>
                                                    <td>{d.batchNumber}</td>
                                                    <td style={{ textAlign: 'right' }}>{d.systemQuantity}</td>
                                                    <td style={{ textAlign: 'right' }}>{d.countedQuantity ?? '—'}</td>
                                                    <td style={{ textAlign: 'right', color: d.variance > 0 ? 'var(--success)' : d.variance < 0 ? 'var(--danger)' : undefined }}>
                                                        {d.variance != null ? (d.variance > 0 ? `+${d.variance}` : d.variance) : '—'}
                                                    </td>
                                                    <td>{d.note || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-secondary)' }}>No product details found.</p>
                            )}
                        </>
                    ) : null}
                </div>
                <div className="pms-modal-footer">
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide}>Close</button>
                    {audit?.status === 0 && (
                        <button type="button" className="btn-pms btn-pms-primary" onClick={() => { onHide(); onReview(audit); }}>
                            Review & Decide
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function InventoryAuditPage() {
    const {
        auditList, total, page, setPage, size,
        search, setSearch,
        statusFilter, setStatusFilter,
        listLoading,
        selectedAudit,
        detailModalOpen, setDetailModalOpen,
        detailLoading,
        openDetail,
        reviewModalOpen, setReviewModalOpen,
        openReview,
        handleReview,
        submitting,
        error, setError,
        successMsg, setSuccessMsg,
        fetchList,
    } = useInventoryAudit();

    const totalPages = Math.ceil(total / size);

    const STATUS_TABS = [
        { value: '', label: 'All' },
        { value: '0', label: 'Pending Review' },
        { value: '1', label: 'Confirmed' },
        { value: '2', label: 'Rejected' },
    ];

    return (
        <div>
            {/* ── Header ── */}
            <div className="pms-page-header" style={{ marginBottom: 16 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h1 className="pms-page-title" style={{ margin: 0 }}>Branch Inventory Audits</h1>
                        <span className="pms-badge pms-badge-info" style={{ fontSize: 11 }}>Store Manager</span>
                    </div>
                    <p className="pms-page-sub">
                        Review inventory count results, approve stock reconciliations or reject and request a recount.
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

            {/* ── Alerts ── */}
            {successMsg && (
                <div className="pms-alert pms-alert-success" style={{ marginBottom: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {successMsg}
                    <button type="button" className="pms-alert-close" onClick={() => setSuccessMsg(null)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            )}
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                        {/* Search */}
                        <div className="pms-input-wrap" style={{ flex: 1, minWidth: 260 }}>
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
                                placeholder="Search by audit code..."
                            />
                        </div>

                        {/* Status Tabs */}
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
                                    <th>Audit Code</th>
                                    <th>Audit Date</th>
                                    <th>Status</th>
                                    <th>Review Note</th>
                                    <th>Created At</th>
                                    <th>Reviewed At</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listLoading ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
                                ) : auditList.length === 0 ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No inventory audits found</td></tr>
                                ) : auditList.map(audit => (
                                    <tr key={audit.id}>
                                        <td><strong>{audit.code}</strong></td>
                                        <td>{audit.auditDate ?? '—'}</td>
                                        <td><StatusBadge status={audit.status} /></td>
                                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {audit.reviewNote || '—'}
                                        </td>
                                        <td>{audit.createdAt ? new Date(audit.createdAt).toLocaleDateString('en-US') : '—'}</td>
                                        <td>{audit.reviewedAt ? new Date(audit.reviewedAt).toLocaleDateString('en-US') : '—'}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                <button
                                                    type="button"
                                                    className="btn-pms btn-pms-secondary"
                                                    style={{ padding: '4px 10px', fontSize: 12 }}
                                                    onClick={() => openDetail(audit)}
                                                    title="View details"
                                                >
                                                    Details
                                                </button>
                                                {audit.status === 0 && (
                                                    <button
                                                        type="button"
                                                        className="btn-pms btn-pms-primary"
                                                        style={{ padding: '4px 10px', fontSize: 12 }}
                                                        onClick={() => openReview(audit)}
                                                        title="Review"
                                                    >
                                                        Review
                                                    </button>
                                                )}
                                            </div>
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
                                Showing {auditList.length} / {total} audits
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

            {/* ── Modals ── */}
            <DetailModal
                show={detailModalOpen}
                audit={selectedAudit}
                loading={detailLoading}
                onHide={() => setDetailModalOpen(false)}
                onReview={openReview}
            />
            <ReviewModal
                show={reviewModalOpen}
                audit={selectedAudit}
                onHide={() => setReviewModalOpen(false)}
                onConfirm={handleReview}
                submitting={submitting}
            />
        </div>
    );
}
