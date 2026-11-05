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
        <div className="pms-modal-backdrop" style={{ zIndex: 1060 }} onClick={onClose}>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: 480,
                    maxWidth: '90vw',
                    background: '#fff',
                    boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1070,
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
                    <div>
                        <h3 style={{ margin: 0, fontSize: 16, color: 'var(--brand-primary, #059669)' }}>
                            Lịch Sử Mua Thuốc (UC23)
                        </h3>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            Khách hàng: <strong>{customer?.fullName}</strong> ({customer?.phone})
                        </span>
                    </div>
                    <button
                        type="button"
                        className="btn-pms btn-pms-secondary"
                        style={{ padding: '4px 8px', fontSize: 13 }}
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {loading && (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Đang tải lịch sử mua hàng...
                        </div>
                    )}

                    {!loading && history.length === 0 && (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Khách hàng chưa có lịch sử mua hàng nào tại hệ thống.
                        </div>
                    )}

                    {!loading && history.map((inv) => {
                        const isExpanded = expandedInvoiceId === inv.invoiceId;
                        return (
                            <div
                                key={inv.invoiceId}
                                style={{
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    background: '#fff',
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
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                                            {formatDateTime(inv.createdAt)} • {inv.storeName}
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand-primary, #059669)' }}>
                                            {money(inv.finalAmount)}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                            {inv.items?.length || 0} món
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div style={{ padding: '10px 14px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', fontSize: 12 }}>
                                        <div style={{ marginBottom: 6, fontWeight: 600, color: '#4b5563' }}>
                                            Thuốc đã mua:
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {inv.items?.map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e5e7eb', paddingBottom: 4 }}>
                                                    <div>
                                                        <strong>{item.productName}</strong>
                                                        <span style={{ color: 'var(--text-secondary)' }}> x {item.quantity} {item.unit}</span>
                                                        {item.dosageInstruction && (
                                                            <div style={{ fontSize: 11, color: '#059669' }}>HDSD: {item.dosageInstruction}</div>
                                                        )}
                                                    </div>
                                                    <span style={{ fontWeight: 600 }}>{money(item.lineTotal)}</span>
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
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={onClose}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
