import React, { useState, useEffect } from 'react';
import { getCustomerPurchaseHistory } from '../../api/salesApi';
import { money, formatDateTime } from '../../utils/format';

export default function CustomerHistoryDrawer({
    isOpen,
    onClose,
    customer,
}) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);

    useEffect(() => {
        if (!isOpen || !customer?.id) {
            setHistory([]);
            return;
        }

        const loadHistory = async () => {
            setLoading(true);
            try {
                const data = await getCustomerPurchaseHistory(customer.id);
                setHistory(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching customer history:', err);
                setHistory([]);
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [isOpen, customer]);

    if (!isOpen) return null;

    const toggleExpand = (id) => {
        setExpandedInvoiceId((prev) => (prev === id ? null : id));
    };

    return (
        <div
            className="pms-modal-overlay"
            style={{ zIndex: 1250, padding: 0 }}
            onClick={onClose}
        >
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: 500,
                    maxWidth: '92vw',
                    background: '#fff',
                    boxShadow: '-8px 0 30px rgba(0,0,0,0.18)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1260,
                    animation: 'slideInRight 0.22s ease-out',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--brand-primary-light, #ecfdf5)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 8,
                            background: 'var(--brand-primary)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 16, color: 'var(--brand-primary, #059669)', fontWeight: 800 }}>
                                Lịch Sử Mua Thuốc (UC23)
                            </h3>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                Khách hàng: <strong>{customer?.fullName}</strong> ({customer?.phone})
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="pms-modal-close"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {loading && (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <div className="spinner-border spinner-border-sm" style={{ marginRight: 8, color: 'var(--brand-primary)' }} />
                            Đang tải lịch sử mua hàng...
                        </div>
                    )}

                    {!loading && history.length === 0 && (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                            Khách hàng chưa có lịch sử mua hàng nào tại chuỗi nhà thuốc.
                        </div>
                    )}

                    {!loading && history.map((inv) => {
                        const isExpanded = expandedInvoiceId === inv.invoiceId;
                        return (
                            <div
                                key={inv.invoiceId}
                                style={{
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 10,
                                    overflow: 'hidden',
                                    background: '#fff',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                                }}
                            >
                                <div
                                    onClick={() => toggleExpand(inv.invoiceId)}
                                    style={{
                                        padding: '12px 14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: isExpanded ? '#f8fafc' : '#fff',
                                        transition: 'background 0.15s ease',
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                                                {inv.invoiceCode}
                                            </strong>
                                            <span className={`pms-badge ${inv.statusCode === 1 ? 'pms-badge-success' : inv.statusCode === 2 ? 'pms-badge-danger' : 'pms-badge-warning'}`} style={{ fontSize: 10 }}>
                                                {inv.invoiceStatus}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>
                                            {formatDateTime(inv.createdAt)} • {inv.storeName}
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--brand-primary, #059669)' }}>
                                            {money(inv.finalAmount)}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                            {inv.items?.length || 0} món thuốc ▼
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div style={{ padding: '12px 14px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: 12 }}>
                                        <div style={{ marginBottom: 8, fontWeight: 700, color: '#475569' }}>
                                            Danh sách thuốc đã mua:
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {inv.items?.map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: 6 }}>
                                                    <div>
                                                        <strong style={{ color: '#0f172a' }}>{item.productName}</strong>
                                                        <span style={{ color: 'var(--text-secondary)' }}> x {item.quantity} {item.unit}</span>
                                                        {item.dosageInstruction && (
                                                            <div style={{ fontSize: 11, color: '#059669', marginTop: 1 }}>HDSD: {item.dosageInstruction}</div>
                                                        )}
                                                    </div>
                                                    <span style={{ fontWeight: 700, color: '#334155' }}>{money(item.lineTotal)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={onClose}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
