import React, { useState } from 'react';
import { useGoodsReceipt } from '../../hooks/inventory/useGoodsReceipt';

// ── Status Config ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
    0: { label: 'Picking', cls: 'pms-badge pms-badge-neutral' },
    1: { label: 'In Transit', cls: 'pms-badge pms-badge-info' },
    2: { label: 'Received', cls: 'pms-badge pms-badge-success' },
    3: { label: 'Discrepancy', cls: 'pms-badge pms-badge-warning' },
    4: { label: 'Cancelled', cls: 'pms-badge pms-badge-danger' },
};

function StatusBadge({ status }) {
    const s = STATUS_MAP[status] ?? { label: 'Unknown', cls: 'pms-badge pms-badge-neutral' };
    return <span className={s.cls}>{s.label}</span>;
}

// ── Progress Timeline ─────────────────────────────────────────────────────────
function DeliveryTimeline({ item }) {
    const steps = [
        { label: 'Issue Note Created', time: item.createdAt, done: true },
        { label: 'Dispatched / In Transit', time: item.dispatchedAt, done: item.status >= 1 && item.status !== 4 },
        { label: 'Received by Branch', time: item.receivedAt, done: item.status === 2 || item.status === 3 },
    ];

    const fmt = (dt) => dt ? new Date(dt).toLocaleString('en-US') : '—';

    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 24, overflowX: 'auto' }}>
            {steps.map((s, i) => (
                <React.Fragment key={i}>
                    <div style={{ textAlign: 'center', minWidth: 140, flex: 1 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%', margin: '0 auto 6px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: s.done ? 'var(--primary, #0284c7)' : 'var(--bg-secondary, #f1f5f9)',
                            border: `2px solid ${s.done ? 'var(--primary, #0284c7)' : 'var(--border, #cbd5e1)'}`,
                            color: s.done ? '#fff' : 'var(--text-muted, #64748b)',
                            fontSize: 13, fontWeight: 700,
                        }}>
                            {s.done ? '✓' : i + 1}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: s.done ? 'var(--text-primary, #0f172a)' : 'var(--text-muted, #64748b)' }}>
                            {s.label}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted, #64748b)', marginTop: 2 }}>{fmt(s.time)}</div>
                    </div>
                    {i < steps.length - 1 && (
                        <div style={{
                            height: 2, flex: 0.5, marginTop: 15, alignSelf: 'flex-start',
                            background: steps[i + 1].done ? 'var(--primary, #0284c7)' : 'var(--border, #cbd5e1)',
                            transition: 'background 0.3s',
                        }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ show, item, loading, onHide, onOpenConfirm, onOpenReject }) {
    if (!show) return null;
    const canAct = item && item.status === 1;

    return (
        <div className="pms-modal-overlay" onClick={onHide}>
            <div className="pms-modal" style={{ maxWidth: 860 }} onClick={e => e.stopPropagation()}>
                <div className="pms-modal-header">
                    <h3 className="pms-modal-title">Goods Receipt Details</h3>
                    <button type="button" className="pms-modal-close" onClick={onHide}>✕</button>
                </div>
                <div className="pms-modal-body">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 48 }}>Loading details...</div>
                    ) : item ? (
                        <>
                            {/* Timeline */}
                            <DeliveryTimeline item={item} />

                            {/* Rejected notice */}
                            {item.status === 4 && (
                                <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                                    🚫 <strong>This goods receipt has been rejected / cancelled.</strong>
                                    {item.note && item.note.includes('REJECTED:') && (
                                        <div style={{ marginTop: 4, fontSize: 13 }}>
                                            Reason: {item.note.split('REJECTED:').pop().trim()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Header Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: 12 }}>Receipt Code</span>
                                    <div style={{ fontWeight: 700, fontSize: 15 }}>{item.code}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: 12 }}>Origin Requisition</span>
                                    <div style={{ fontWeight: 600 }}>{item.stockRequisitionCode || '—'}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: 12 }}>Status</span>
                                    <div><StatusBadge status={item.status} /></div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: 12 }}>Dispatching Warehouse</span>
                                    <div style={{ fontWeight: 600 }}>{item.fromStoreName || 'Central Warehouse'}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: 12 }}>Carrier</span>
                                    <div style={{ fontWeight: 600 }}>{item.carrier || 'Internal Fleet'}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: 12 }}>Received By</span>
                                    <div style={{ fontWeight: 600 }}>{item.receivedByUsername || 'Pending'}</div>
                                </div>
                                {item.note && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: 12 }}>Note</span>
                                        <div style={{ fontWeight: 500 }}>{item.note}</div>
                                    </div>
                                )}
                            </div>

                            {/* Table of Items */}
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Item List & Batch Tracking</h4>
                            {item.details && item.details.length > 0 ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="pms-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Medicine / Product</th>
                                                <th>Batch Number</th>
                                                <th>Expiry Date</th>
                                                <th style={{ textAlign: 'right' }}>Dispatched Qty</th>
                                                <th style={{ textAlign: 'right' }}>Received Qty</th>
                                                <th style={{ textAlign: 'right' }}>Variance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {item.details.map((d, i) => (
                                                <tr key={d.id}>
                                                    <td>{i + 1}</td>
                                                    <td>
                                                        <strong>{d.productName}</strong>
                                                        <div style={{ fontSize: 11, color: 'var(--text-secondary, #64748b)' }}>{d.barcode}</div>
                                                    </td>
                                                    <td><span className="pms-badge pms-badge-neutral">{d.batchNumber || '—'}</span></td>
                                                    <td>{d.expiryDate ? new Date(d.expiryDate).toLocaleDateString('en-US') : '—'}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{d.quantity}</td>
                                                    <td style={{ textAlign: 'right', color: d.receivedQuantity != null ? 'var(--primary, #0284c7)' : 'var(--text-muted, #64748b)' }}>
                                                        {d.receivedQuantity ?? '—'}
                                                    </td>
                                                    <td style={{
                                                        textAlign: 'right',
                                                        fontWeight: 600,
                                                        color: d.difference && d.difference !== 0 ? 'var(--danger, #ef4444)' : 'var(--success, #22c55e)'
                                                    }}>
                                                        {d.difference != null ? (d.difference > 0 ? `+${d.difference}` : d.difference) : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-secondary, #64748b)' }}>No items found.</p>
                            )}
                        </>
                    ) : null}
                </div>
                <div className="pms-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Approve / Reject actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        {canAct && (
                            <>
                                <button
                                    type="button"
                                    className="btn-pms btn-pms-primary"
                                    style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', borderColor: '#16a34a' }}
                                    onClick={() => { onHide(); onOpenConfirm(item); }}
                                >
                                    ✅ Approve & Receive Stock
                                </button>
                                <button
                                    type="button"
                                    className="btn-pms"
                                    style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff', border: '1px solid #dc2626', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontWeight: 600 }}
                                    onClick={() => { onHide(); onOpenReject(item); }}
                                >
                                    🚫 Reject
                                </button>
                            </>
                        )}
                    </div>
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide}>Close</button>
                </div>
            </div>
        </div>
    );
}

// ── Reject Modal ──────────────────────────────────────────────────────────────
function RejectModal({ show, item, submitting, onHide, onSubmit }) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState(null);

    React.useEffect(() => {
        if (show) { setReason(''); setError(null); }
    }, [show]);

    if (!show || !item) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Please provide a rejection reason.');
            return;
        }
        onSubmit(item.id, reason.trim());
    };

    return (
        <div className="pms-modal-overlay" onClick={onHide}>
            <div className="pms-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="pms-modal-header" style={{ borderBottom: '2px solid #ef4444' }}>
                        <h3 className="pms-modal-title" style={{ color: '#dc2626' }}>🚫 Reject Goods Receipt</h3>
                        <button type="button" className="pms-modal-close" onClick={onHide}>✕</button>
                    </div>
                    <div className="pms-modal-body">
                        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                            <div style={{ fontWeight: 700, marginBottom: 4 }}>Receipt: <span style={{ color: '#dc2626' }}>{item.code}</span></div>
                            <div style={{ fontSize: 13, color: '#64748b' }}>From: {item.fromStoreName || 'Central Warehouse'}</div>
                            <div style={{ fontSize: 13, color: '#64748b' }}>
                                Items: {item.totalItems ?? 0} SKUs — {item.totalQuantity ?? 0} units dispatched
                            </div>
                        </div>

                        {error && (
                            <div className="pms-alert pms-alert-danger" style={{ marginBottom: 12 }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="pms-form-group">
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                                Rejection Reason <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <textarea
                                className="pms-input"
                                rows="4"
                                placeholder="e.g. Damaged packaging, wrong product, expired batch, quantity mismatch..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>
                    </div>
                    <div className="pms-modal-footer">
                        <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-pms"
                            style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 700, opacity: submitting ? 0.7 : 1 }}
                            disabled={submitting}
                        >
                            {submitting ? 'Rejecting...' : '🚫 Confirm Reject'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Confirm/Approve Modal (Step 3, 4, 5) ─────────────────────────────────────
function ConfirmModal({ show, item, loading, submitting, onHide, onSubmit }) {
    const [receivedQuantities, setReceivedQuantities] = useState({});
    const [note, setNote] = useState('');
    const [validationError, setValidationError] = useState(null);

    React.useEffect(() => {
        if (item && item.details) {
            const initial = {};
            item.details.forEach(d => {
                initial[d.id] = d.receivedQuantity != null ? d.receivedQuantity : d.quantity;
            });
            setReceivedQuantities(initial);
            setNote(item.note || '');
            setValidationError(null);
        }
    }, [item]);

    if (!show || !item) return null;

    const handleQtyChange = (detailId, val) => {
        const num = val === '' ? '' : parseInt(val, 10);
        setReceivedQuantities(prev => ({ ...prev, [detailId]: num }));
    };

    const fillAllEqual = () => {
        if (!item.details) return;
        const auto = {};
        item.details.forEach(d => { auto[d.id] = d.quantity; });
        setReceivedQuantities(auto);
    };

    const handleConfirm = (e) => {
        e.preventDefault();
        setValidationError(null);

        const itemsPayload = [];
        for (const d of item.details) {
            const q = receivedQuantities[d.id];
            if (q === '' || q === undefined || isNaN(q) || q < 0) {
                setValidationError(`Received quantity for product "${d.productName}" is invalid (must be >= 0).`);
                return;
            }
            itemsPayload.push({ detailId: d.id, receivedQuantity: q });
        }

        const payload = {
            note,
            receivedByUsername: 'admin',
            items: itemsPayload,
        };

        onSubmit(item.id, payload);
    };

    return (
        <div className="pms-modal-overlay" onClick={onHide}>
            <div className="pms-modal" style={{ maxWidth: 860 }} onClick={e => e.stopPropagation()}>
                <form onSubmit={handleConfirm}>
                    <div className="pms-modal-header" style={{ borderBottom: '2px solid #16a34a' }}>
                        <h3 className="pms-modal-title" style={{ color: '#16a34a' }}>✅ Approve & Receive Stock into Branch Inventory</h3>
                        <button type="button" className="pms-modal-close" onClick={onHide}>✕</button>
                    </div>

                    <div className="pms-modal-body">
                        {validationError && (
                            <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                                ⚠️ {validationError}
                            </div>
                        )}

                        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 16px', marginBottom: 14, fontSize: 13 }}>
                            📦 <strong>Receipt Code: {item.code}</strong> &nbsp;|&nbsp; From: {item.fromStoreName || 'Central Warehouse'}
                            &nbsp;|&nbsp; {item.totalItems ?? 0} SKUs — {item.totalQuantity ?? 0} units dispatched
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>Enter actual received quantity per product:</span>
                            <button
                                type="button"
                                className="btn-pms btn-pms-secondary"
                                style={{ fontSize: 12, padding: '4px 8px' }}
                                onClick={fillAllEqual}
                            >
                                Autofill with dispatched qty
                            </button>
                        </div>

                        <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                            <table className="pms-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Product</th>
                                        <th>Batch / Expiry</th>
                                        <th style={{ textAlign: 'right' }}>Dispatched Qty</th>
                                        <th style={{ width: 140, textAlign: 'right' }}>✅ Actual Received Qty</th>
                                        <th>Variance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {item.details?.map((d, i) => {
                                        const currentVal = receivedQuantities[d.id] ?? '';
                                        const diff = currentVal !== '' ? currentVal - d.quantity : 0;
                                        return (
                                            <tr key={d.id}>
                                                <td>{i + 1}</td>
                                                <td>
                                                    <strong>{d.productName}</strong>
                                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.barcode}</div>
                                                </td>
                                                <td>
                                                    <div><strong>{d.batchNumber}</strong></div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                        EXP: {d.expiryDate ? new Date(d.expiryDate).toLocaleDateString('en-US') : '—'}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{d.quantity}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="pms-input"
                                                        style={{ textAlign: 'right', fontWeight: 700, borderColor: diff < 0 ? '#ef4444' : diff > 0 ? '#eab308' : '#16a34a' }}
                                                        value={currentVal}
                                                        onChange={(e) => handleQtyChange(d.id, e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    {diff !== 0 && (
                                                        <span style={{ fontSize: 12, fontWeight: 600, color: diff < 0 ? 'var(--danger, #ef4444)' : 'var(--warning, #eab308)' }}>
                                                            {diff < 0 ? `Short ${Math.abs(diff)}` : `Over +${diff}`}
                                                        </span>
                                                    )}
                                                    {diff === 0 && <span style={{ color: 'var(--success, #22c55e)', fontSize: 12 }}>✓ Match</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                                Inspection & Receipt Note:
                            </label>
                            <textarea
                                className="pms-input"
                                rows="2"
                                placeholder="Note packaging condition, seal integrity, carrier info..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pms-modal-footer">
                        <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-pms"
                            style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 700, opacity: submitting ? 0.7 : 1 }}
                            disabled={submitting}
                        >
                            {submitting ? '⏳ Updating Inventory...' : '✅ Approve & Update Inventory'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function GoodsReceiptsPage() {
    const {
        list,
        total,
        page,
        setPage,
        size,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        listLoading,
        selectedItem,
        detailModalOpen,
        setDetailModalOpen,
        confirmModalOpen,
        setConfirmModalOpen,
        rejectModalOpen,
        setRejectModalOpen,
        detailLoading,
        submitting,
        openDetail,
        openConfirmModal,
        openRejectModal,
        handleConfirmReceipt,
        handleRejectReceipt,
        error,
        setError,
        successMsg,
        setSuccessMsg,
        fetchList,
    } = useGoodsReceipt();

    const totalPages = Math.ceil(total / size);

    const STATUS_TABS = [
        { value: '', label: 'All' },
        { value: '1', label: 'In Transit' },
        { value: '2', label: 'Received' },
        { value: '3', label: 'Discrepancy' },
        { value: '0', label: 'Picking' },
        { value: '4', label: 'Cancelled' },
    ];

    return (
        <div>
            {/* Header */}
            <div className="pms-page-header" style={{ marginBottom: 16 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h1 className="pms-page-title" style={{ margin: 0 }}>Branch Goods Receipts</h1>
                        <span className="pms-badge pms-badge-info" style={{ fontSize: 11 }}>Store Manager</span>
                    </div>
                    <p className="pms-page-subtitle" style={{ margin: 0 }}>
                        Track inter-store transfers from central warehouse. <strong>Approve</strong> to accept into branch inventory, or <strong>Reject</strong> if there are issues.
                    </p>
                </div>
                <div>
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={fetchList} disabled={listLoading}>
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                    <span>{error}</span>
                    <button type="button" onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
            )}
            {successMsg && (
                <div className="pms-alert pms-alert-success" style={{ marginBottom: 16 }}>
                    <span>{successMsg}</span>
                    <button type="button" onClick={() => setSuccessMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
            )}

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                <div className="pms-card" style={{ padding: '16px 20px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>TOTAL RECEIPTS</div>
                    <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{total}</div>
                </div>
                <div className="pms-card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--info, #0284c7)' }}>
                    <div style={{ color: 'var(--info, #0284c7)', fontSize: 12, fontWeight: 600 }}>⏳ AWAITING APPROVAL</div>
                    <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
                        {list.filter(x => x.status === 1).length}
                    </div>
                </div>
                <div className="pms-card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--success, #22c55e)' }}>
                    <div style={{ color: 'var(--success, #22c55e)', fontSize: 12, fontWeight: 600 }}>✅ APPROVED & RECEIVED</div>
                    <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
                        {list.filter(x => x.status === 2 || x.status === 3).length}
                    </div>
                </div>
                <div className="pms-card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--danger, #ef4444)' }}>
                    <div style={{ color: 'var(--danger, #ef4444)', fontSize: 12, fontWeight: 600 }}>🚫 REJECTED</div>
                    <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
                        {list.filter(x => x.status === 4).length}
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="pms-card" style={{ padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {STATUS_TABS.map(tab => (
                            <button
                                key={tab.value}
                                type="button"
                                className={`btn-pms ${statusFilter === tab.value ? 'btn-pms-primary' : 'btn-pms-secondary'}`}
                                style={{ fontSize: 12, padding: '6px 12px' }}
                                onClick={() => { setStatusFilter(tab.value); setPage(0); }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                            type="text"
                            className="pms-input"
                            style={{ width: 260 }}
                            placeholder="Receipt code, requisition, carrier..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="pms-card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="pms-table">
                        <thead>
                            <tr>
                                <th>Receipt Code</th>
                                <th>Requisition</th>
                                <th>Origin</th>
                                <th>Carrier</th>
                                <th style={{ textAlign: 'right' }}>SKUs</th>
                                <th style={{ textAlign: 'right' }}>Total Dispatched Qty</th>
                                <th>Dispatched Date</th>
                                <th>Received Date</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listLoading ? (
                                <tr>
                                    <td colSpan="10" style={{ textAlign: 'center', padding: 32 }}>Loading list...</td>
                                </tr>
                            ) : list.length === 0 ? (
                                <tr>
                                    <td colSpan="10" style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
                                        No goods receipts found.
                                    </td>
                                </tr>
                            ) : (
                                list.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <button
                                                type="button"
                                                style={{ background: 'none', border: 'none', color: 'var(--primary, #0284c7)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                                                onClick={() => openDetail(item)}
                                            >
                                                {item.code}
                                            </button>
                                        </td>
                                        <td>{item.stockRequisitionCode || '—'}</td>
                                        <td>{item.fromStoreName || 'Central Warehouse'}</td>
                                        <td>{item.carrier || '—'}</td>
                                        <td style={{ textAlign: 'right' }}>{item.totalItems ?? 0}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.totalQuantity ?? 0}</td>
                                        <td>{item.dispatchedAt ? new Date(item.dispatchedAt).toLocaleDateString('en-US') : '—'}</td>
                                        <td>{item.receivedAt ? new Date(item.receivedAt).toLocaleDateString('en-US') : '—'}</td>
                                        <td><StatusBadge status={item.status} /></td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', gap: 6 }}>
                                                <button
                                                    type="button"
                                                    className="btn-pms btn-pms-secondary"
                                                    style={{ fontSize: 12, padding: '4px 8px' }}
                                                    onClick={() => openDetail(item)}
                                                >
                                                    Details
                                                </button>
                                                {item.status === 1 && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="btn-pms"
                                                            style={{ fontSize: 12, padding: '4px 10px', background: '#16a34a', color: '#fff', border: '1px solid #16a34a', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                                                            onClick={() => openConfirmModal(item)}
                                                        >
                                                            ✅ Approve
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-pms"
                                                            style={{ fontSize: 12, padding: '4px 10px', background: '#ef4444', color: '#fff', border: '1px solid #ef4444', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                                                            onClick={() => openRejectModal(item)}
                                                        >
                                                            🚫 Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            Page {page + 1} / {totalPages} (Total {total} receipts)
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button
                                type="button"
                                className="btn-pms btn-pms-secondary"
                                disabled={page === 0}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                className="btn-pms btn-pms-secondary"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <DetailModal
                show={detailModalOpen}
                item={selectedItem}
                loading={detailLoading}
                onHide={() => setDetailModalOpen(false)}
                onOpenConfirm={openConfirmModal}
                onOpenReject={openRejectModal}
            />

            <ConfirmModal
                show={confirmModalOpen}
                item={selectedItem}
                loading={detailLoading}
                submitting={submitting}
                onHide={() => setConfirmModalOpen(false)}
                onSubmit={handleConfirmReceipt}
            />

            <RejectModal
                show={rejectModalOpen}
                item={selectedItem}
                submitting={submitting}
                onHide={() => setRejectModalOpen(false)}
                onSubmit={handleRejectReceipt}
            />
        </div>
    );
}
