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
        <div className="pms-modal-backdrop" style={{ zIndex: 1050 }}>
            <div className="pms-modal" style={{ maxWidth: 540, width: '100%' }}>
                <div className="pms-modal-header" style={{ background: 'var(--brand-primary-light, #ecfdf5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'var(--brand-primary, #059669)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="pms-modal-title" style={{ margin: 0, color: 'var(--brand-primary, #059669)' }}>
                                Thanh Toán Hóa Đơn (Process Payment - F9)
                            </h3>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                Xác nhận phương thức và hoàn tất giao dịch
                            </span>
                        </div>
                    </div>
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
                            background: '#f8fafc', padding: '14px 18px', borderRadius: 8,
                            border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 8
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span>Tiền hàng:</span>
                                <strong>{money(subtotal)}</strong>
                            </div>
                            {Number(discountAmount) > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#ef4444' }}>
                                    <span>Chiết khấu / Giảm giá:</span>
                                    <strong>-{money(discountAmount)}</strong>
                                </div>
                            )}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                borderTop: '1px solid #e2e8f0', paddingTop: 8
                            }}>
                                <span style={{ fontSize: 14, fontWeight: 700 }}>Tổng tiền phải thanh toán:</span>
                                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--brand-primary, #059669)' }}>
                                    {money(netAmount)}
                                </span>
                            </div>
                            {customer && (
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', borderTop: '1px dashed #e2e8f0', paddingTop: 6 }}>
                                    Khách hàng: <strong>{customer.fullName}</strong> ({customer.phone}) • +{Math.floor(netAmount / 100000)} điểm tích lũy
                                </div>
                            )}
                        </div>

                        {/* Payment Method Tabs */}
                        <div>
                            <label className="pms-label" style={{ fontWeight: 700, marginBottom: 8, display: 'block' }}>
                                Phương thức thanh toán
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('CASH')}
                                    className="btn-pms"
                                    style={{
                                        border: `2px solid ${paymentMethod === 'CASH' ? 'var(--brand-primary, #059669)' : '#e5e7eb'}`,
                                        background: paymentMethod === 'CASH' ? 'var(--brand-primary-light, #ecfdf5)' : '#fff',
                                        color: paymentMethod === 'CASH' ? 'var(--brand-primary, #059669)' : '#374151',
                                        fontWeight: 700,
                                        padding: '10px 8px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                                        border: `2px solid ${paymentMethod === 'VNPAY_QR' ? 'var(--brand-primary, #059669)' : '#e5e7eb'}`,
                                        background: paymentMethod === 'VNPAY_QR' ? 'var(--brand-primary-light, #ecfdf5)' : '#fff',
                                        color: paymentMethod === 'VNPAY_QR' ? 'var(--brand-primary, #059669)' : '#374151',
                                        fontWeight: 700,
                                        padding: '10px 8px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                                        border: `2px solid ${paymentMethod === 'BANK_TRANSFER' ? 'var(--brand-primary, #059669)' : '#e5e7eb'}`,
                                        background: paymentMethod === 'BANK_TRANSFER' ? 'var(--brand-primary-light, #ecfdf5)' : '#fff',
                                        color: paymentMethod === 'BANK_TRANSFER' ? 'var(--brand-primary, #059669)' : '#374151',
                                        fontWeight: 700,
                                        padding: '10px 8px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="5" width="20" height="14" rx="2" />
                                        <line x1="2" y1="10" x2="22" y2="10" />
                                    </svg>
                                    <span>Quẹt thẻ POS</span>
                                </button>
                            </div>
                        </div>

                        {/* Cash Details */}
                        {paymentMethod === 'CASH' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div className="pms-form-group">
                                    <label className="pms-label" style={{ fontWeight: 700 }}>
                                        Tiền khách đưa (VNĐ) <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        className="pms-input"
                                        style={{ fontSize: 18, fontWeight: 700, height: 44 }}
                                        value={tenderedCash}
                                        onChange={(e) => setTenderedCash(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                {/* Quick Denominations */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    <button
                                        type="button"
                                        className="btn-pms btn-pms-secondary"
                                        style={{ fontSize: 12, padding: '4px 10px', fontWeight: 600 }}
                                        onClick={() => handleQuickDenom('EXACT')}
                                    >
                                        Đủ tiền ({money(netAmount)})
                                    </button>
                                    {[50000, 100000, 200000, 500000].map((denom) => (
                                        <button
                                            key={denom}
                                            type="button"
                                            className="btn-pms btn-pms-secondary"
                                            style={{ fontSize: 12, padding: '4px 10px' }}
                                            onClick={() => handleQuickDenom(denom)}
                                        >
                                            {money(denom)}
                                        </button>
                                    ))}
                                </div>

                                {/* Change Display */}
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '12px 16px', borderRadius: 8,
                                    background: isCashInsufficient ? '#fef2f2' : '#ecfdf5',
                                    border: `1px solid ${isCashInsufficient ? '#ef4444' : '#10b981'}`
                                }}>
                                    <span style={{ fontWeight: 700, fontSize: 14, color: isCashInsufficient ? '#b91c1c' : '#065f46' }}>
                                        {isCashInsufficient ? 'Còn thiếu:' : 'Tiền thừa trả lại khách:'}
                                    </span>
                                    <span style={{ fontSize: 18, fontWeight: 800, color: isCashInsufficient ? '#b91c1c' : '#059669' }}>
                                        {isCashInsufficient ? money(netAmount - tendered) : money(changeAmount)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* VietQR Display */}
                        {paymentMethod === 'VNPAY_QR' && (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                padding: 16, background: '#fff', border: '1px solid var(--border-color)', borderRadius: 8, gap: 10
                            }}>
                                <img
                                    src={`https://img.vietqr.io/image/970422-0987654321-compact2.png?amount=${netAmount}&addInfo=PMS%20POS%20CHECKOUT`}
                                    alt="VietQR Code"
                                    style={{ width: 180, height: 180, borderRadius: 8, border: '1px solid #e5e7eb' }}
                                />
                                <div style={{ textAlign: 'center', fontSize: 13 }}>
                                    <div>Quét mã VietQR trên ứng dụng Ngân hàng hoặc Ví điện tử</div>
                                    <strong style={{ color: 'var(--brand-primary, #059669)', fontSize: 16 }}>{money(netAmount)}</strong>
                                </div>
                            </div>
                        )}

                        {/* Card Reference */}
                        {paymentMethod === 'BANK_TRANSFER' && (
                            <div className="pms-form-group">
                                <label className="pms-label">Mã tham chiếu / Số chuẩn chi máy POS</label>
                                <input
                                    type="text"
                                    className="pms-input"
                                    placeholder="Nhập Trace No / Ref No trên hóa đơn cà thẻ..."
                                    value={transactionRef}
                                    onChange={(e) => setTransactionRef(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="pms-modal-footer" style={{ padding: '14px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
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
                            style={{ minWidth: 160 }}
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
