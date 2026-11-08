import React, { useState, useEffect } from 'react';
import { getInvoiceByCodeOrId } from '../../api/salesApi';
import { money, formatDateTime, formatPaymentMethod } from '../../utils/format';

export default function InvoiceDetailModal({
    isOpen,
    onClose,
    invoiceCodeOrId,
    onReturnInvoice,
}) {
    const [loading, setLoading] = useState(false);
    const [invoice, setInvoice] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && invoiceCodeOrId) {
            setLoading(true);
            setError(null);
            getInvoiceByCodeOrId(invoiceCodeOrId)
                .then((data) => {
                    setInvoice(data);
                })
                .catch((err) => {
                    console.error('Lỗi khi tải chi tiết hóa đơn:', err);
                    setError(err?.message || 'Không thể tải chi tiết hóa đơn');
                })
                .finally(() => setLoading(false));
        } else {
            setInvoice(null);
            setError(null);
        }
    }, [isOpen, invoiceCodeOrId]);

    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div
            className="pms-modal-overlay"
            style={{ zIndex: 1250 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="pms-modal" style={{ maxWidth: 760, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div className="pms-modal-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: 'var(--brand-primary-light, #ecfdf5)',
                            color: 'var(--brand-primary, #059669)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--brand-primary-dark, #065f46)' }}>
                                    {invoice?.invoiceCode || invoiceCodeOrId}
                                </span>
                                {invoice?.prescriptionCode && (
                                    <span className="pms-badge pms-badge-neutral" style={{ fontSize: 11 }}>
                                        Đơn thuốc: {invoice.prescriptionCode}
                                    </span>
                                )}
                                <span className={`pms-badge ${invoice?.statusCode === 1 ? 'pms-badge-success' : 'pms-badge-warning'}`} style={{ fontSize: 11 }}>
                                    {invoice?.invoiceStatus || 'Đã thanh toán'}
                                </span>
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                                Chi tiết giao dịch bán lẻ tại quầy
                            </div>
                        </div>
                    </div>

                    <button type="button" className="pms-modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="pms-modal-body" style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {loading ? (
                        <div style={{ padding: '48px 0', textAlign: 'center', color: '#64748b' }}>
                            <div className="spinner-border text-success" role="status" style={{ width: 32, height: 32, marginBottom: 8 }} />
                            <div>Đang tải chi tiết hóa đơn...</div>
                        </div>
                    ) : error ? (
                        <div className="pms-alert pms-alert-danger">{error}</div>
                    ) : invoice ? (
                        <>
                            {/* Summary Metadata Card */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
                                background: '#f8fafc', padding: '14px 18px', borderRadius: 10, border: '1px solid #e2e8f0',
                                fontSize: 13
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div>
                                        <span style={{ color: '#64748b' }}>Chi nhánh: </span>
                                        <strong>{invoice.storeName || 'Nhà thuốc Chi nhánh 1'}</strong>
                                    </div>
                                    <div>
                                        <span style={{ color: '#64748b' }}>Dược sĩ bán: </span>
                                        <strong>{invoice.cashierName || 'Dược sĩ'}</strong>
                                    </div>
                                    <div>
                                        <span style={{ color: '#64748b' }}>Thời gian: </span>
                                        <strong>{formatDateTime(invoice.paidAt || invoice.createdAt)}</strong>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div>
                                        <span style={{ color: '#64748b' }}>Khách hàng: </span>
                                        <strong style={{ color: 'var(--brand-primary, #059669)' }}>
                                            {invoice.customerName || 'Khách lẻ'}
                                        </strong>
                                        {invoice.customerPhone && (
                                            <span style={{ color: '#64748b' }}> ({invoice.customerPhone})</span>
                                        )}
                                    </div>
                                    <div>
                                        <span style={{ color: '#64748b' }}>Hình thức thanh toán: </span>
                                        <span className="pms-badge pms-badge-info" style={{ fontSize: 11.5 }}>
                                            {formatPaymentMethod(invoice.paymentMethod)}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#64748b' }}>Điểm tích lũy: </span>
                                        <strong style={{ color: '#16a34a' }}>+{invoice.earnedPoints || 0} điểm</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 13.5, color: '#334155', marginBottom: 8 }}>
                                    Danh sách mặt hàng đã bán:
                                </div>
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                                    <table className="pms-table" style={{ margin: 0 }}>
                                        <thead>
                                            <tr style={{ background: '#f1f5f9', fontSize: 12 }}>
                                                <th>STT</th>
                                                <th>Tên Thuốc / Sản Phẩm</th>
                                                <th>Số Lô / Hạn Dùng</th>
                                                <th>ĐVT</th>
                                                <th style={{ textAlign: 'right' }}>Đơn Giá</th>
                                                <th style={{ textAlign: 'center' }}>SL</th>
                                                <th style={{ textAlign: 'right' }}>Thành Tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(!invoice.items || invoice.items.length === 0) ? (
                                                <tr>
                                                    <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>
                                                        Không có chi tiết mặt hàng
                                                    </td>
                                                </tr>
                                            ) : (
                                                invoice.items.map((item, idx) => (
                                                    <tr key={item.id || idx}>
                                                        <td style={{ color: '#94a3b8', width: 40 }}>{idx + 1}</td>
                                                        <td>
                                                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.productName}</div>
                                                            {item.dosageInstruction && (
                                                                <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>
                                                                    Liều dùng: {item.dosageInstruction}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{ fontSize: 11.5, color: '#64748b', whiteSpace: 'nowrap' }}>
                                                            <div>{item.batchNumber || '-'}</div>
                                                            {item.expiryDate && <div style={{ fontSize: 10.5 }}>HSD: {item.expiryDate}</div>}
                                                        </td>
                                                        <td>
                                                            <span className="pms-badge pms-badge-neutral" style={{ fontSize: 11.5 }}>
                                                                {item.unit || 'Đơn vị'}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'right', fontSize: 12.5 }}>
                                                            {money(item.unitPrice)}
                                                        </td>
                                                        <td style={{ textAlign: 'center', fontWeight: 800 }}>
                                                            {item.quantity}
                                                        </td>
                                                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                                            {money(item.lineTotal || (item.unitPrice * item.quantity))}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Totals Summary */}
                            <div style={{
                                marginLeft: 'auto', width: 320, display: 'flex', flexDirection: 'column', gap: 6,
                                padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0',
                                fontSize: 13
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                                    <span>Tổng tiền hàng:</span>
                                    <strong style={{ color: '#0f172a' }}>{money(invoice.totalAmount)}</strong>
                                </div>
                                {Number(invoice.discountAmount) > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                                        <span>Giảm giá / Chiết khấu:</span>
                                        <strong>-{money(invoice.discountAmount)}</strong>
                                    </div>
                                )}
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    borderTop: '1px solid #e2e8f0', paddingTop: 8, marginTop: 2
                                }}>
                                    <span style={{ fontWeight: 700, color: '#1e293b' }}>Khách phải trả:</span>
                                    <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--brand-primary, #059669)' }}>
                                        {money(invoice.finalAmount || invoice.netAmount)}
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="pms-modal-footer" style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        {invoice && onReturnInvoice && (invoice.statusCode === 1 || invoice.invoiceStatus === 'COMPLETED') && (
                            <button
                                type="button"
                                className="btn-pms btn-pms-warning"
                                style={{ background: '#fff7ed', color: '#c2410c', borderColor: '#ffedd5', gap: 6 }}
                                onClick={() => {
                                    onClose();
                                    onReturnInvoice(invoice);
                                }}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="1 4 1 10 7 10" />
                                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                </svg>
                                Đổi / Trả Hàng
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" className="btn-pms btn-pms-secondary" onClick={handlePrint} disabled={!invoice}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6 9 6 2 18 2 18 9" />
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                <rect x="6" y="14" width="12" height="8" />
                            </svg>
                            In Lại Hóa Đơn
                        </button>
                        <button type="button" className="btn-pms btn-pms-secondary" onClick={onClose}>
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

