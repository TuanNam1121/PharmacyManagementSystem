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
function DetailModal({ show, item, loading, onHide, onOpenConfirm }) {
    if (!show) return null;
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
                <div className="pms-modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        {item && item.status === 1 && (
                            <button
                                type="button"
                                className="btn-pms btn-pms-primary"
                                onClick={() => { onHide(); onOpenConfirm(item); }}
                            >
                                Inspect & Receive Stock
                            </button>
                        )}
                    </div>
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide}>Close</button>
                </div>
            </div>
        </div>
    );
}

// ── Confirm Modal (Step 3, 4, 5) ─────────────────────────────────────────────
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

        // Validation against business constraints (Step 4 & AT01)
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
                    <div className="pms-modal-header">
                        <h3 className="pms-modal-title">Confirm Goods Receipt into Branch Inventory</h3>
                        <button type="button" className="pms-modal-close" onClick={onHide}>✕</button>
                    </div>

                    <div className="pms-modal-body">
                        {validationError && (
                            <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                                ⚠️ {validationError}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div>
                                <strong>Receipt Code: {item.code}</strong> | Origin: {item.fromStoreName || 'Central Warehouse'}
                            </div>
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
                                        <th style={{ width: 140, textAlign: 'right' }}>Actual Received Qty</th>
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
                                                        style={{ textAlign: 'right', fontWeight: 700 }}
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
                                                    {diff === 0 && <span style={{ color: 'var(--success, #22c55e)', fontSize: 12 }}>Match</span>}
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
                        <button type="submit" className="btn-pms btn-pms-primary" disabled={submitting}>
                            {submitting ? 'Saving to Inventory...' : 'Confirm Receipt'}
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
        detailLoading,
        submitting,
        openDetail,
        openConfirmModal,
        handleConfirmReceipt,
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
                        Track inter-store transfers from central warehouse, inspect batches & expiry dates, and accept into branch inventory
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
                    <div style={{ color: 'var(--info, #0284c7)', fontSize: 12, fontWeight: 600 }}>IN TRANSIT</div>
                    <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
                        {list.filter(x => x.status === 1).length}
                    </div>
                </div>
                <div className="pms-card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--success, #22c55e)' }}>
                    <div style={{ color: 'var(--success, #22c55e)', fontSize: 12, fontWeight: 600 }}>SUCCESSFULLY RECEIVED</div>
                    <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
                        {list.filter(x => x.status === 2).length}
                    </div>
                </div>
                <div className="pms-card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--warning, #eab308)' }}>
                    <div style={{ color: 'var(--warning, #eab308)', fontSize: 12, fontWeight: 600 }}>WITH DISCREPANCY</div>
                    <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
                        {list.filter(x => x.status === 3).length}
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="pms-card" style={{ padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Status Tabs */}
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

                    {/* Search Input */}
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
                                                    <button
                                                        type="button"
                                                        className="btn-pms btn-pms-primary"
                                                        style={{ fontSize: 12, padding: '4px 8px' }}
                                                        onClick={() => openConfirmModal(item)}
                                                    >
                                                        Inspect & Receive
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
            />

            <ConfirmModal
                show={confirmModalOpen}
                item={selectedItem}
                loading={detailLoading}
                submitting={submitting}
                onHide={() => setConfirmModalOpen(false)}
                onSubmit={handleConfirmReceipt}
            />
        </div>
    );
}
