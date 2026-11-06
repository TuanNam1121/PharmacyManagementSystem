import React, { useState } from 'react';
import { getInvoiceByCodeOrId, returnSalesInvoice } from '../../api/salesApi';
import { money, formatDateTime } from '../../utils/format';

export default function SalesReturnModal({
    isOpen,
    onClose,
    onReturnSuccess,
}) {
    const [searchCode, setSearchCode] = useState('');
    const [invoice, setInvoice] = useState(null);
    const [selectedItems, setSelectedItems] = useState({});
    const [returnQuantities, setReturnQuantities] = useState({});
    const [refundMethod, setRefundMethod] = useState(1); // 1 = Cash, 2 = Bank
    const [reason, setReason] = useState('');
    const [searching, setSearching] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successData, setSuccessData] = useState(null);

    if (!isOpen) return null;

    const handleSearchInvoice = async (e) => {
        e.preventDefault();
        if (!searchCode.trim()) return;

        setSearching(true);
        setError(null);
        setInvoice(null);
        setSelectedItems({});
        setReturnQuantities({});
        setSuccessData(null);

        try {
            const data = await getInvoiceByCodeOrId(searchCode.trim());
            if (!data) {
                setError('Không tìm thấy hóa đơn với mã đã nhập');
                return;
            }
            if (data.statusCode === 2) {
                setError('Hóa đơn này đã bị hủy bỏ trước đó!');
                return;
            }
            if (data.statusCode === 4) {
                setError('Hóa đơn này đã được hoàn trả toàn bộ!');
                return;
            }
            setInvoice(data);
            const initSelected = {};
            const initQtys = {};
            data.items?.forEach((item) => {
                initSelected[item.id] = false;
                initQtys[item.id] = item.quantity;
            });
            setSelectedItems(initSelected);
            setReturnQuantities(initQtys);
        } catch (err) {
            setError(err.message || 'Lỗi khi tra cứu hóa đơn');
        } finally {
            setSearching(false);
        }
    };

    const toggleItem = (detailId) => {
        setSelectedItems((prev) => ({
            ...prev,
            [detailId]: !prev[detailId],
        }));
    };

    const updateQty = (detailId, maxQty, newQty) => {
        const q = Math.max(1, Math.min(maxQty, Number(newQty) || 1));
        setReturnQuantities((prev) => ({
            ...prev,
            [detailId]: q,
        }));
    };

    const totalRefund = invoice?.items?.reduce((sum, item) => {
        if (selectedItems[item.id]) {
            const qty = returnQuantities[item.id] || 1;
            return sum + qty * Number(item.unitPrice || 0);
        }
        return sum;
    }, 0) || 0;

    const handleSubmitReturn = async (e) => {
        e.preventDefault();
        if (!invoice) return;

        const returnItems = [];
        invoice.items?.forEach((item) => {
            if (selectedItems[item.id]) {
                returnItems.push({
                    salesInvoiceDetailId: item.id,
                    quantity: returnQuantities[item.id] || 1,
                });
            }
        });

        if (returnItems.length === 0) {
            setError('Vui lòng chọn ít nhất 1 mặt hàng để hoàn trả');
            return;
        }

        if (!reason.trim()) {
            setError('Bắt buộc nhập lý do trả hàng / hoàn tiền');
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const res = await returnSalesInvoice({
                invoiceId: invoice.invoiceId,
                refundMethod: Number(refundMethod),
                reason: reason.trim(),
                items: returnItems,
            });
            setSuccessData(res);
            if (onReturnSuccess) onReturnSuccess(res);
        } catch (err) {
            setError(err.message || 'Lỗi khi thực hiện đổi trả');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="pms-modal-overlay"
            style={{ zIndex: 1200 }}
            onClick={(e) => {
                if (e.target === e.currentTarget && !submitting) onClose();
            }}
        >
            <div className="pms-modal" style={{ maxWidth: 660, width: '100%' }}>
                <div className="pms-modal-header" style={{ background: '#fffbeb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: '#f59e0b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                            boxShadow: '0 2px 6px rgba(245,158,11,0.2)'
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <polyline points="1 4 1 10 7 10" />
                                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                            </svg>
                        </div>
                        <div>
                            <div className="pms-modal-title" style={{ color: '#b45309', fontSize: 17 }}>
                                Trả Hàng & Hoàn Tiền Hóa Đơn (UC25)
                            </div>
                            <div className="pms-modal-sub">
                                Tiếp nhận thuốc trả lại, cập nhật tồn kho và hoàn tiền
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="pms-modal-close"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        ✕
                    </button>
                </div>

                <div className="pms-modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {error && (
                        <div className="pms-alert pms-alert-danger" style={{ padding: '10px 14px', fontSize: 13 }}>
                            {error}
                        </div>
                    )}

                    {successData ? (
                        <div style={{
                            textAlign: 'center', padding: '28px 20px', background: 'var(--brand-primary-light, #ecfdf5)',
                            borderRadius: 12, border: '1px solid #10b981', display: 'flex', flexDirection: 'column', gap: 12
                        }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: '50%', background: '#10b981',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto',
                                boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                            }}>
                                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <h4 style={{ margin: 0, color: '#065f46', fontSize: 18, fontWeight: 800 }}>Hoàn Trả Thuốc Thành Công!</h4>
                            <div style={{ fontSize: 13, color: '#047857' }}>
                                Mã phiếu trả: <strong>{successData.returnCode}</strong>
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#065f46' }}>
                                Số tiền đã hoàn: {money(successData.refundAmount)} ({successData.refundMethod})
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                Thuốc đã được tự động hoàn lại vào số lượng tồn kho của chi nhánh.
                            </div>
                            <div style={{ marginTop: 12 }}>
                                <button
                                    type="button"
                                    className="btn-pms btn-pms-primary"
                                    style={{ height: 38, padding: '0 20px' }}
                                    onClick={onClose}
                                >
                                    Đóng cửa sổ
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Search Box */}
                            <form onSubmit={handleSearchInvoice} style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="text"
                                    className="pms-input"
                                    style={{ height: 42 }}
                                    placeholder="Nhập mã hóa đơn gốc (VD: INV-20261104-0001)..."
                                    value={searchCode}
                                    onChange={(e) => setSearchCode(e.target.value)}
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    className="btn-pms btn-pms-primary"
                                    disabled={searching}
                                    style={{ whiteSpace: 'nowrap', height: 42, padding: '0 16px', fontWeight: 600 }}
                                >
                                    {searching ? 'Đang tìm...' : 'Tra cứu'}
                                </button>
                            </form>

                            {invoice && (
                                <form onSubmit={handleSubmitReturn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {/* Invoice Overview */}
                                    <div style={{
                                        background: '#f8fafc', padding: '12px 16px', borderRadius: 8, fontSize: 13,
                                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, border: '1px solid #e2e8f0'
                                    }}>
                                        <div>Mã HĐ: <strong style={{ color: '#0f172a' }}>{invoice.invoiceCode}</strong></div>
                                        <div>Ngày mua: <strong>{formatDateTime(invoice.createdAt)}</strong></div>
                                        <div>Khách hàng: <strong>{invoice.customerName}</strong></div>
                                        <div>Tổng tiền hóa đơn: <strong style={{ color: 'var(--brand-primary)' }}>{money(invoice.finalAmount)}</strong></div>
                                    </div>

                                    {/* Items Table */}
                                    <div>
                                        <label className="pms-label" style={{ fontWeight: 700, marginBottom: 6 }}>
                                            Chọn các loại thuốc khách muốn hoàn trả:
                                        </label>
                                        <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                                            <table className="pms-table" style={{ width: '100%', fontSize: 12, margin: 0 }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: 40, textAlign: 'center' }}></th>
                                                        <th>Tên thuốc</th>
                                                        <th style={{ width: 85, textAlign: 'center' }}>SL Trả</th>
                                                        <th style={{ width: 95, textAlign: 'right' }}>Đơn giá</th>
                                                        <th style={{ width: 100, textAlign: 'right' }}>Hoàn tiền</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {invoice.items?.map((item) => {
                                                        const isChecked = !!selectedItems[item.id];
                                                        const qty = returnQuantities[item.id] || item.quantity;
                                                        return (
                                                            <tr key={item.id} style={{ background: isChecked ? '#fffbeb' : '#fff' }}>
                                                                <td style={{ textAlign: 'center' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={() => toggleItem(item.id)}
                                                                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <strong style={{ color: '#0f172a' }}>{item.productName}</strong>
                                                                    <div style={{ fontSize: 11, color: '#64748b' }}>
                                                                        Đã mua: {item.quantity} {item.unit} • Lô: {item.batchNumber}
                                                                    </div>
                                                                </td>
                                                                <td style={{ textAlign: 'center' }}>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        max={item.quantity}
                                                                        disabled={!isChecked}
                                                                        value={qty}
                                                                        onChange={(e) => updateQty(item.id, item.quantity, e.target.value)}
                                                                        style={{
                                                                            width: 50, textAlign: 'center', height: 28,
                                                                            border: '1px solid var(--border-color)', borderRadius: 4,
                                                                            fontWeight: 700
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td style={{ textAlign: 'right' }}>
                                                                    {money(item.unitPrice)}
                                                                </td>
                                                                <td style={{ textAlign: 'right', fontWeight: 700, color: '#b45309' }}>
                                                                    {isChecked ? money(qty * Number(item.unitPrice)) : '0 ₫'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Total Refund Banner */}
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '12px 16px', background: '#fffbeb', borderRadius: 8, border: '1.5px solid #fcd34d'
                                    }}>
                                        <span style={{ fontWeight: 700, color: '#92400e', fontSize: 14 }}>
                                            Tổng tiền hoàn trả khách:
                                        </span>
                                        <span style={{ fontSize: 20, fontWeight: 800, color: '#b45309' }}>
                                            {money(totalRefund)}
                                        </span>
                                    </div>

                                    {/* Refund Method & Reason */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                                        <div className="pms-form-group">
                                            <label className="pms-label">Hình thức hoàn tiền</label>
                                            <select
                                                className="pms-select"
                                                value={refundMethod}
                                                onChange={(e) => setRefundMethod(e.target.value)}
                                            >
                                                <option value={1}>Tiền mặt</option>
                                                <option value={2}>Chuyển khoản</option>
                                            </select>
                                        </div>

                                        <div className="pms-form-group">
                                            <label className="pms-label">
                                                Lý do trả hàng <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="pms-input"
                                                placeholder="VD: Khách mua nhầm loại thuốc, đổi đơn bác sĩ..."
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                                        <button
                                            type="button"
                                            className="btn-pms btn-pms-secondary"
                                            onClick={onClose}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-pms"
                                            style={{ background: '#f59e0b', color: '#fff', fontWeight: 700, height: 40 }}
                                            disabled={submitting || totalRefund <= 0}
                                        >
                                            {submitting ? 'Đang hoàn trả...' : `Xác nhận Trả Hàng (${money(totalRefund)})`}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
