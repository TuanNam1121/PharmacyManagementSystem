import React, { useState, useEffect } from 'react';
import { money } from '../../utils/format';

export default function PaymentModal({
    isOpen,
    onClose,
    onConfirmPayment,
    subtotal,
    discountAmount,
    netAmount,
    customer,
    submitting,
    error,
}) {
    const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH, VNPAY_QR, BANK_TRANSFER
    const [tenderedCash, setTenderedCash] = useState('');
    const [transactionRef, setTransactionRef] = useState('');
    const [valError, setValError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTenderedCash(String(netAmount));
            setTransactionRef('');
            setValError('');
            setPaymentMethod('CASH');
        }
    }, [isOpen, netAmount]);

    if (!isOpen) return null;

    const tendered = Number(tenderedCash) || 0;
    const changeAmount = Math.max(0, tendered - netAmount);
    const isCashInsufficient = paymentMethod === 'CASH' && tendered < netAmount;

    const handleQuickDenom = (val) => {
        if (val === 'EXACT') {
            setTenderedCash(String(netAmount));
        } else {
            setTenderedCash(String(val));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (paymentMethod === 'CASH') {
            if (tendered < netAmount) {
                setValError(`Số tiền khách đưa không đủ (${money(tendered)} < ${money(netAmount)})`);
                return;
            }
        }
        setValError('');
        onConfirmPayment({
            paymentMethod,
            amountPaid: netAmount,
            tenderedCash: paymentMethod === 'CASH' ? tendered : netAmount,
            transactionRef: transactionRef.trim() || undefined,
        });
    };

    return (
        <div
            className="pms-modal-overlay"
            style={{ zIndex: 1200 }}
            onClick={(e) => {
                if (e.target === e.currentTarget && !submitting) onClose();
            }}
        >
            <div className="pms-modal" style={{ maxWidth: 540, width: '100%' }}>
                {/* Header */}
                <div className="pms-modal-header" style={{ background: 'var(--brand-primary-light, #ecfdf5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: 'var(--brand-primary, #059669)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                            boxShadow: '0 2px 6px rgba(5,150,105,0.2)'
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                        </div>
                        <div>
                            <div className="pms-modal-title" style={{ color: 'var(--brand-primary, #059669)', fontSize: 17 }}>
                                Thanh Toán Hóa Đơn (F9)
                            </div>
                            <div className="pms-modal-sub">
                                Xác nhận phương thức và thu tiền đơn bán lẻ
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

                <form onSubmit={handleSubmit}>
                    <div className="pms-modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {(error || valError) && (
                            <div className="pms-alert pms-alert-danger" style={{ padding: '10px 14px', fontSize: 13 }}>
                                {valError || error}
                            </div>
                        )}

                        {/* Order Summary Box */}
                        <div style={{
                            background: '#f8fafc',
                            padding: '14px 18px',
                            borderRadius: 10,
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b' }}>
                                <span>Tiền hàng:</span>
                                <strong style={{ color: '#0f172a' }}>{money(subtotal)}</strong>
                            </div>
                            {Number(discountAmount) > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#ef4444' }}>
                                    <span>Chiết khấu / Giảm giá:</span>
                                    <strong>-{money(discountAmount)}</strong>
                                </div>
                            )}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderTop: '1px solid #e2e8f0',
                                paddingTop: 10,
                                marginTop: 2
                            }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                                    Tổng tiền cần thanh toán:
                                </span>
                                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand-primary, #059669)' }}>
                                    {money(netAmount)}
                                </span>
                            </div>
                            {customer && (
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', borderTop: '1px dashed #e2e8f0', paddingTop: 8 }}>
                                    Khách hàng: <strong>{customer.fullName}</strong> ({customer.phone}) • Tích lũy: <strong style={{ color: 'var(--brand-primary)' }}>+{Math.floor(netAmount / 100000)} điểm</strong>
                                </div>
                            )}
                        </div>

                        {/* Payment Method Selector */}
                        <div>
                            <label className="pms-label" style={{ fontWeight: 700, marginBottom: 8, display: 'block' }}>
                                Chọn hình thức thanh toán:
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('CASH')}
                                    className="btn-pms"
                                    style={{
                                        border: `2px solid ${paymentMethod === 'CASH' ? 'var(--brand-primary, #059669)' : '#e2e8f0'}`,
                                        background: paymentMethod === 'CASH' ? 'var(--brand-primary-light, #ecfdf5)' : '#fff',
                                        color: paymentMethod === 'CASH' ? 'var(--brand-primary, #059669)' : '#475569',
                                        fontWeight: 700,
                                        padding: '12px 8px',
                                        borderRadius: 8,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="6" width="20" height="12" rx="2" />
                                        <circle cx="12" cy="12" r="2" />
                                    </svg>
                                    <span>Tiền mặt</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('VNPAY_QR')}
                                    className="btn-pms"
                                    style={{
                                        border: `2px solid ${paymentMethod === 'VNPAY_QR' ? 'var(--brand-primary, #059669)' : '#e2e8f0'}`,
                                        background: paymentMethod === 'VNPAY_QR' ? 'var(--brand-primary-light, #ecfdf5)' : '#fff',
                                        color: paymentMethod === 'VNPAY_QR' ? 'var(--brand-primary, #059669)' : '#475569',
                                        fontWeight: 700,
                                        padding: '12px 8px',
                                        borderRadius: 8,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="7" height="7" />
                                        <rect x="14" y="3" width="7" height="7" />
                                        <rect x="14" y="14" width="7" height="7" />
                                        <rect x="3" y="14" width="7" height="7" />
                                    </svg>
                                    <span>VietQR / MoMo</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                                    className="btn-pms"
                                    style={{
                                        border: `2px solid ${paymentMethod === 'BANK_TRANSFER' ? 'var(--brand-primary, #059669)' : '#e2e8f0'}`,
                                        background: paymentMethod === 'BANK_TRANSFER' ? 'var(--brand-primary-light, #ecfdf5)' : '#fff',
                                        color: paymentMethod === 'BANK_TRANSFER' ? 'var(--brand-primary, #059669)' : '#475569',
                                        fontWeight: 700,
                                        padding: '12px 8px',
                                        borderRadius: 8,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="5" width="20" height="14" rx="2" />
                                        <line x1="2" y1="10" x2="22" y2="10" />
                                    </svg>
                                    <span>Quẹt thẻ POS</span>
                                </button>
                            </div>
                        </div>

                        {/* Cash Calculation */}
                        {paymentMethod === 'CASH' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div className="pms-form-group">
                                    <label className="pms-label" style={{ fontWeight: 700, fontSize: 13 }}>
                                        Tiền khách đưa (VNĐ) <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1000"
                                            className="pms-input"
                                            style={{ fontSize: 18, fontWeight: 800, height: 46, paddingRight: 40 }}
                                            value={tenderedCash}
                                            onChange={(e) => setTenderedCash(e.target.value)}
                                            autoFocus
                                        />
                                        <span style={{
                                            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                            color: '#64748b', fontWeight: 700
                                        }}>
                                            ₫
                                        </span>
                                    </div>
                                </div>

                                {/* Quick Denominations */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    <button
                                        type="button"
                                        className="pos-denom-chip"
                                        style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}
                                        onClick={() => handleQuickDenom('EXACT')}
                                    >
                                        Đúng tiền ({money(netAmount)})
                                    </button>
                                    {[50000, 100000, 200000, 500000].map((denom) => (
                                        <button
                                            key={denom}
                                            type="button"
                                            className="pos-denom-chip"
                                            onClick={() => handleQuickDenom(denom)}
                                        >
                                            {money(denom)}
                                        </button>
                                    ))}
                                </div>

                                {/* Change Display */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '14px 18px',
                                    borderRadius: 10,
                                    background: isCashInsufficient ? '#fef2f2' : '#ecfdf5',
                                    border: `1.5px solid ${isCashInsufficient ? '#ef4444' : '#10b981'}`
                                }}>
                                    <span style={{ fontWeight: 700, fontSize: 14, color: isCashInsufficient ? '#991b1b' : '#065f46' }}>
                                        {isCashInsufficient ? 'Còn thiếu:' : 'Tiền thừa trả khách:'}
                                    </span>
                                    <span style={{ fontSize: 20, fontWeight: 800, color: isCashInsufficient ? '#b91c1c' : '#059669' }}>
                                        {isCashInsufficient ? money(netAmount - tendered) : money(changeAmount)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* VietQR View */}
                        {paymentMethod === 'VNPAY_QR' && (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                padding: 20, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, gap: 12
                            }}>
                                <img
                                    src={`https://img.vietqr.io/image/970422-0987654321-compact2.png?amount=${netAmount}&addInfo=PMS%20POS%20CHECKOUT`}
                                    alt="VietQR Code"
                                    style={{ width: 190, height: 190, borderRadius: 10, border: '1px solid #e2e8f0' }}
                                />
                                <div style={{ textAlign: 'center', fontSize: 13 }}>
                                    <div style={{ color: '#475569' }}>Quét mã QR qua ứng dụng Ngân hàng hoặc Ví MoMo/VNPay</div>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--brand-primary, #059669)', marginTop: 4 }}>
                                        {money(netAmount)}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Card Ref */}
                        {paymentMethod === 'BANK_TRANSFER' && (
                            <div className="pms-form-group">
                                <label className="pms-label">Mã tham chiếu / Số chuẩn chi máy cà thẻ POS</label>
                                <input
                                    type="text"
                                    className="pms-input"
                                    placeholder="Nhập Trace No / Ref No trên hóa đơn cà thẻ..."
                                    value={transactionRef}
                                    onChange={(e) => setTransactionRef(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>

                    <div className="pms-modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <button
                            type="button"
                            className="btn-pms btn-pms-secondary"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Quay lại
                        </button>
                        <button
                            type="submit"
                            className="btn-pms btn-pms-primary"
                            style={{ minWidth: 180, height: 42, fontSize: 14, fontWeight: 700 }}
                            disabled={submitting || isCashInsufficient}
                        >
                            {submitting ? 'Đang thanh toán...' : 'Hoàn tất & In Hóa Đơn'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
