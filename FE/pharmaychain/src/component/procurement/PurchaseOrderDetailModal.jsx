import React, { useState } from 'react';
import { formatDate } from '../../utils/format';

const STATUS_BADGES = {
    0: { label: 'Draft', cls: 'pms-badge pms-badge-neutral' },
    1: { label: 'Pending Approval', cls: 'pms-badge pms-badge-warning' },
    2: { label: 'Approved', cls: 'pms-badge pms-badge-success' },
    3: { label: 'Rejected', cls: 'pms-badge pms-badge-danger' },
    4: { label: 'Partially Received', cls: 'pms-badge pms-badge-info' },
    5: { label: 'Completed', cls: 'pms-badge pms-badge-success' },
};

export default function PurchaseOrderDetailModal({
    show,
    onHide,
    detail,
    loading,
    onApprove,
    onReject,
    actionLoading,
}) {
    const [rejectMode, setRejectMode] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [approveNote, setApproveNote] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    if (!show) return null;

    const badge = STATUS_BADGES[detail?.status] || {
        label: detail?.statusText || 'Unknown',
        cls: 'pms-badge pms-badge-neutral',
    };

    const isPending = detail?.status === 0 || detail?.status === 1;

    const handleConfirmReject = () => {
        if (!rejectReason.trim()) {
            setErrorMsg('Rejection reason is required (Business Rule AT01).');
            return;
        }
        setErrorMsg('');
        onReject(detail.id, rejectReason.trim());
    };

    const handleConfirmApprove = () => {
        setErrorMsg('');
        onApprove(detail.id, approveNote.trim());
    };

    return (
        <div
            className="pms-modal-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget && !actionLoading) onHide();
            }}
        >
            <div className="pms-modal pms-modal-lg" style={{ maxWidth: 880 }}>
                {/* Header */}
                <div className="pms-modal-header">
                    <div>
                        <div className="pms-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span>Purchase Order: {detail?.code || '—'}</span>
                            <span className={badge.cls}>{badge.label}</span>
                        </div>
                        <div className="pms-modal-sub">
                            Review supplier quotation items and approve or reject order (UC67 General Manager)
                        </div>
                    </div>
                    <button className="pms-modal-close" onClick={onHide} disabled={actionLoading}>
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="pms-modal-body">
                    {loading ? (
                        <div className="pms-spinner-wrap" style={{ padding: '40px 0', textAlign: 'center' }}>
                            <div className="pms-spinner" />
                            <span className="pms-spinner-text" style={{ display: 'block', marginTop: 10 }}>
                                Loading purchase order items…
                            </span>
                        </div>
                    ) : detail ? (
                        <div>
                            {errorMsg && (
                                <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                                    ⚠️ {errorMsg}
                                </div>
                            )}

                            {/* Order Metadata Grid */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: 16,
                                    background: 'var(--bg-canvas, #f8fafc)',
                                    border: '1px solid var(--border-color, #e2e8f0)',
                                    borderRadius: 'var(--border-radius-md, 8px)',
                                    padding: '16px 20px',
                                    marginBottom: 20,
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                                        Supplier
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginTop: 2 }}>
                                        {detail.supplierName || '—'}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>{detail.supplierCode}</div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                                        PR Reference
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>
                                        {detail.purchaseRequestCode || 'Direct'}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>
                                        Quotation: {detail.supplierQuotationCode || '—'}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                                        Total Order Value
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: 16, color: '#059669', marginTop: 2 }}>
                                        {Number(detail.totalAmount || 0).toLocaleString('vi-VN')} ₫
                                    </div>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>Includes Tax</div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                                        Submitted By / Date
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>
                                        {detail.createdByUsername || 'Purchasing Staff'}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>
                                        {formatDate(detail.createdAt)}
                                    </div>
                                </div>
                            </div>

                            {/* Status Notice if Rejected or Approved */}
                            {detail.status === 3 && detail.rejectReason && (
                                <div
                                    style={{
                                        background: '#fef2f2',
                                        border: '1px solid #fecaca',
                                        borderRadius: 8,
                                        padding: '12px 16px',
                                        marginBottom: 20,
                                    }}
                                >
                                    <strong style={{ color: '#b91c1c' }}>Rejection Reason: </strong>
                                    <span style={{ color: '#7f1d1d' }}>{detail.rejectReason}</span>
                                </div>
                            )}

                            {detail.status === 2 && detail.approvedByUsername && (
                                <div
                                    style={{
                                        background: '#f0fdf4',
                                        border: '1px solid #bbf7d0',
                                        borderRadius: 8,
                                        padding: '10px 16px',
                                        marginBottom: 20,
                                        fontSize: 13,
                                        color: '#15803d',
                                    }}
                                >
                                    ✓ Approved by <strong>{detail.approvedByUsername}</strong> on {formatDate(detail.approvedAt)}
                                </div>
                            )}

                            {/* Items Table */}
                            <div style={{ marginBottom: 20 }}>
                                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Order Line Items</h4>
                                <div className="pms-table-container">
                                    <table className="pms-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Medicine / Product</th>
                                                <th>Barcode</th>
                                                <th>Unit</th>
                                                <th style={{ textAlign: 'right' }}>Qty</th>
                                                <th style={{ textAlign: 'right' }}>Unit Price (₫)</th>
                                                <th style={{ textAlign: 'right' }}>Tax (%)</th>
                                                <th style={{ textAlign: 'right' }}>Subtotal (₫)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detail.items && detail.items.length > 0 ? (
                                                detail.items.map((it, idx) => (
                                                    <tr key={it.id || idx}>
                                                        <td>{idx + 1}</td>
                                                        <td className="fw-600">{it.productName || '—'}</td>
                                                        <td className="mono" style={{ fontSize: 12 }}>{it.productBarcode || '—'}</td>
                                                        <td>{it.unit || 'Box'}</td>
                                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{it.quantity}</td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            {Number(it.unitPrice || 0).toLocaleString('vi-VN')}
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>{it.taxRate}%</td>
                                                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                                            {Number(it.subtotal || 0).toLocaleString('vi-VN')}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                                                        No item breakdown found for this quotation.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot>
                                            <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                                                <td colSpan={7} style={{ textAlign: 'right' }}>Grand Total (VAT Included):</td>
                                                <td style={{ textAlign: 'right', color: '#059669', fontSize: 15 }}>
                                                    {Number(detail.totalAmount || 0).toLocaleString('vi-VN')} ₫
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Reject Form Block (if user clicked Reject) */}
                            {rejectMode && (
                                <div
                                    style={{
                                        background: '#fff1f2',
                                        border: '1px solid #fda4af',
                                        borderRadius: 8,
                                        padding: '16px',
                                        marginTop: 16,
                                    }}
                                >
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#9f1239', marginBottom: 6 }}>
                                        Rejection Justification * (Business Rule AT01)
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="pms-input"
                                        placeholder="Enter reason for rejecting this purchase order (e.g., Quotation price exceeds budget, supplier terms unfavorable)..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        style={{ width: '100%', marginBottom: 10 }}
                                    />
                                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                        <button
                                            type="button"
                                            className="btn-pms btn-pms-secondary"
                                            onClick={() => {
                                                setRejectMode(false);
                                                setRejectReason('');
                                                setErrorMsg('');
                                            }}
                                            disabled={actionLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-pms btn-pms-danger"
                                            onClick={handleConfirmReject}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? 'Rejecting…' : 'Confirm Rejection'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Footer Actions */}
                <div className="pms-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="btn-pms btn-pms-secondary" onClick={onHide} disabled={actionLoading}>
                        Close
                    </button>

                    {isPending && !rejectMode && (
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                type="button"
                                className="btn-pms btn-pms-danger"
                                onClick={() => setRejectMode(true)}
                                disabled={actionLoading}
                            >
                                Reject Order…
                            </button>
                            <button
                                type="button"
                                className="btn-pms btn-pms-primary"
                                onClick={handleConfirmApprove}
                                disabled={actionLoading}
                                style={{ background: '#059669', borderColor: '#059669' }}
                            >
                                {actionLoading ? 'Approving…' : '✓ Approve Purchase Order'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
