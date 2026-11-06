import React from 'react';
import { useInventoryAudit } from '../../hooks/inventory/useInventoryAudit';
import RequestAuditModal from '../../component/inventory/RequestAuditModal';
import ApproveRequestModal from '../../component/inventory/ApproveRequestModal';
import AuditCountingModal from '../../component/inventory/AuditCountingModal';

// ── Status Badges ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    0: { label: 'Pending Approval', cls: 'pms-badge pms-badge-warning' },
    1: { label: 'Counting in Progress', cls: 'pms-badge pms-badge-info' },
    2: { label: 'Submitted for Review', cls: 'pms-badge pms-badge-primary' },
    3: { label: 'Confirmed & Approved', cls: 'pms-badge pms-badge-success' },
    4: { label: 'Rejected / Recount', cls: 'pms-badge pms-badge-danger' },
};

function StatusBadge({ status }) {
    const s = STATUS_CONFIG[status] ?? { label: 'Unknown', cls: 'pms-badge' };
    return <span className={s.cls}>{s.label}</span>;
}

// ── Detail Modal ───────────────────────────────────────────────────────────────
function DetailModal({ show, audit, loading, onHide }) {
    if (!show) return null;
    return (
        <div className="pms-modal-overlay" onClick={onHide}>
            <div className="pms-modal" style={{ maxWidth: 820 }} onClick={e => e.stopPropagation()}>
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
                        <div style={{ textAlign: 'center', padding: 40 }}>Loading audit details...</div>
                    ) : audit ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div><span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Audit Code</span><br /><strong>{audit.code}</strong></div>
                                <div><span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Status</span><br /><StatusBadge status={audit.status} /></div>
                                <div><span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Audit Date</span><br /><strong>{audit.auditDate ?? '—'}</strong></div>
                                <div><span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Requested By</span><br /><strong>{audit.requestedByUsername || '—'}</strong></div>
                                <div><span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Counted By</span><br /><strong>{audit.countedByUsername || '—'}</strong></div>
                                <div><span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Reviewed By</span><br /><strong>{audit.reviewedByUsername || '—'}</strong></div>
                                {audit.reviewNote && (
                                    <div style={{ gridColumn: '1/-1' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Notes / Purpose</span><br />
                                        <strong>{audit.reviewNote}</strong>
                                    </div>
                                )}
                            </div>

                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Audit Items & Variance Breakdown</h4>
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
                                                <th>Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {audit.details.map(d => (
                                                <tr key={d.id}>
                                                    <td>{d.productName}</td>
                                                    <td><span className="pms-badge pms-badge-neutral">{d.batchNumber || 'N/A'}</span></td>
                                                    <td style={{ textAlign: 'right' }}>{d.systemQuantity}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{d.countedQuantity ?? 'Pending Count'}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 700, color: d.variance > 0 ? 'var(--success)' : d.variance < 0 ? 'var(--danger)' : undefined }}>
                                                        {d.variance != null ? (d.variance > 0 ? `+${d.variance}` : d.variance) : '—'}
                                                    </td>
                                                    <td>{d.note || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-secondary)' }}>No items found in this audit session.</p>
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
        // Modals
        requestModalOpen, setRequestModalOpen,
        handleRequestAudit,
        approveModalOpen, setApproveModalOpen,
        openApproveModal,
        handleApproveRequest,
        countModalOpen, setCountModalOpen,
        openCountModal,
        handleSubmitCount,
        reviewModalOpen, setReviewModalOpen,
        openReviewModal,
        handleFinalReview,
        submitting,
        error, setError,
        successMsg, setSuccessMsg,
        fetchList,
    } = useInventoryAudit();

    const STATUS_TABS = [
        { value: '', label: 'All Sessions' },
        { value: '0', label: 'Pending Approval' },
        { value: '1', label: 'Approved (Counting)' },
        { value: '2', label: 'Submitted (Review)' },
        { value: '3', label: 'Confirmed' },
        { value: '4', label: 'Rejected' },
    ];

    return (
        <div>
            {/* ── Page Header ── */}
            <div className="pms-page-header" style={{ marginBottom: 16 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h1 className="pms-page-title" style={{ margin: 0 }}>Branch Stocktaking & Inventory Audits</h1>
                        <span className="pms-badge pms-badge-info" style={{ fontSize: 11 }}>Pharmacist & Store Manager</span>
                    </div>
                    <p className="pms-page-sub">
                        Request audit sessions, manage store manager approvals, conduct shelf stock counts, and verify variance reconciliations.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={fetchList} title="Refresh">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        Refresh
                    </button>
                    {/* Pharmacist Action Button */}
                    <button
                        type="button"
                        className="btn-pms btn-pms-primary"
                        onClick={() => setRequestModalOpen(true)}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Request Audit Session
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
                    <button type="button" className="pms-alert-close" onClick={() => setSuccessMsg(null)}>×</button>
                </div>
            )}
            {error && (
                <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                    {error}
                    <button type="button" className="pms-alert-close" onClick={() => setError(null)}>×</button>
                </div>
            )}

            {/* ── Filter Card ── */}
            <div className="pms-card" style={{ marginBottom: 20 }}>
                <div className="pms-card-body" style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                        <div className="pms-input-wrap" style={{ flex: 1, minWidth: 260 }}>
                            <input
                                type="text"
                                className="pms-input"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(0); }}
                                placeholder="Search audit code..."
                            />
                        </div>

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

            {/* ── Audit Table ── */}
            <div className="pms-card">
                <div className="pms-card-body" style={{ padding: 0 }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="pms-table">
                            <thead>
                                <tr>
                                    <th>Audit Code</th>
                                    <th>Store</th>
                                    <th>Audit Date</th>
                                    <th>Status</th>
                                    <th>Requested By</th>
                                    <th>Created At</th>
                                    <th style={{ textAlign: 'center' }}>Workflow Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listLoading ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>Loading audits...</td>
                                    </tr>
                                ) : auditList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                            No inventory audit sessions found.
                                        </td>
                                    </tr>
                                ) : (
                                    auditList.map(item => (
                                        <tr key={item.id}>
                                            <td style={{ fontWeight: 600 }}>{item.code}</td>
                                            <td>{item.storeName || 'Branch Store'}</td>
                                            <td>{item.auditDate || '—'}</td>
                                            <td><StatusBadge status={item.status} /></td>
                                            <td>{item.requestedByUsername || 'Pharmacist'}</td>
                                            <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US') : '—'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                    {/* View Detail button */}
                                                    <button
                                                        type="button"
                                                        className="btn-pms btn-pms-secondary btn-pms-sm"
                                                        onClick={() => openDetail(item)}
                                                    >
                                                        Details
                                                    </button>

                                                    {/* STEP 2: Store Manager approves opening request */}
                                                    {item.status === 0 && (
                                                        <button
                                                            type="button"
                                                            className="btn-pms btn-pms-warning btn-pms-sm"
                                                            onClick={() => openApproveModal(item)}
                                                            title="Store Manager: Review & Permit Counting"
                                                        >
                                                            Approve Request
                                                        </button>
                                                    )}

                                                    {/* STEP 3: Pharmacist can ONLY count if Manager approved (status 1) */}
                                                    {item.status === 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn-pms btn-pms-primary btn-pms-sm"
                                                            onClick={() => openCountModal(item)}
                                                            title="Pharmacist: Count physical stock"
                                                        >
                                                            Start Counting
                                                        </button>
                                                    )}

                                                    {/* STEP 4: Store Manager final confirmation & variance check */}
                                                    {item.status === 2 && (
                                                        <button
                                                            type="button"
                                                            className="btn-pms btn-pms-success btn-pms-sm"
                                                            onClick={() => openReviewModal(item)}
                                                            title="Store Manager: Final Review & Reconcile"
                                                        >
                                                            Final Review
                                                        </button>
                                                    )}
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

            {/* ── Modals ── */}
            <RequestAuditModal
                show={requestModalOpen}
                onHide={() => setRequestModalOpen(false)}
                onConfirm={handleRequestAudit}
                submitting={submitting}
            />

            <ApproveRequestModal
                show={approveModalOpen}
                audit={selectedAudit}
                onHide={() => setApproveModalOpen(false)}
                onConfirm={handleApproveRequest}
                submitting={submitting}
            />

            <AuditCountingModal
                show={countModalOpen}
                audit={selectedAudit}
                onHide={() => setCountModalOpen(false)}
                onSubmitCount={handleSubmitCount}
                submitting={submitting}
            />

            <DetailModal
                show={detailModalOpen}
                audit={selectedAudit}
                loading={detailLoading}
                onHide={() => setDetailModalOpen(false)}
            />
        </div>
    );
}
