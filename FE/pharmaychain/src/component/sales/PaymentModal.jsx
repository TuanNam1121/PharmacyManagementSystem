import React, { useState, useEffect, useRef } from 'react';
import { money } from '../../utils/format';
import { createPayOSPaymentLink, checkPayOSPaymentStatus } from '../../api/paymentApi';

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
    // Chỉ hỗ trợ 2 hình thức: CASH (Tiền mặt) và BANK_TRANSFER (Chuyển khoản PayOS VietQR)
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [tenderedCash, setTenderedCash] = useState('');
    const [valError, setValError] = useState('');

    // State cho cổng PayOS VietQR
    const [payOSLoading, setPayOSLoading] = useState(false);
    const [payOSData, setPayOSData] = useState(null);
    const [payOSError, setPayOSError] = useState('');
    const [payOSSuccess, setPayOSSuccess] = useState(false);
    const [successTxnRef, setSuccessTxnRef] = useState('');

    const pollingTimerRef = useRef(null);

    // Dọn dẹp Polling timer
    const clearPolling = () => {
        if (pollingTimerRef.current) {
            clearInterval(pollingTimerRef.current);
            pollingTimerRef.current = null;
        }
    };

    // Reset khi mở modal hoặc thay đổi netAmount
    useEffect(() => {
        if (isOpen) {
            setTenderedCash(String(netAmount));
            setValError('');
            setPaymentMethod('CASH');
            setPayOSData(null);
            setPayOSError('');
            setPayOSSuccess(false);
            setSuccessTxnRef('');
        } else {
            clearPolling();
        }
        return () => clearPolling();
    }, [isOpen, netAmount]);

    // Xử lý khi người dùng chuyển sang tab PayOS
    const handleSelectPayOS = async () => {
        setPaymentMethod('BANK_TRANSFER');
        setValError('');

        if (payOSData && !payOSSuccess) {
            // Đã có mã QR trước đó, tiếp tục lắng nghe polling
            startPolling(payOSData.orderCode);
            return;
        }

        try {
            setPayOSLoading(true);
            setPayOSError('');
            clearPolling();

            const res = await createPayOSPaymentLink({
                amount: netAmount,
                description: 'PMS POS ' + Math.floor(netAmount),
            });

            setPayOSData(res);
            startPolling(res.orderCode);
        } catch (err) {
            console.error('Không thể tạo mã VietQR PayOS:', err);
            setPayOSError(err.message || 'Chưa thể kết nối tới PayOS. Vui lòng kiểm tra cấu hình .env hoặc chọn Tiền mặt.');
        } finally {
            setPayOSLoading(false);
        }
    };

    // Bắt đầu chu kỳ Polling kiểm tra trạng thái thanh toán tự động (mỗi 2 giây)
    const startPolling = (orderCode) => {
        clearPolling();
        if (!orderCode) return;

        pollingTimerRef.current = setInterval(async () => {
            try {
                const statusRes = await checkPayOSPaymentStatus(orderCode);
                if (statusRes && (statusRes.completed || statusRes.status === 'PAID')) {
                    clearPolling();
                    setPayOSSuccess(true);
                    const refCode = statusRes.reference || `REF-${orderCode}`;
                    setSuccessTxnRef(refCode);

                    // Tự động kích hoạt hoàn tất đơn hàng sau 1.2s để thu ngân kịp nhìn thấy thông báo thành công
                    setTimeout(() => {
                        onConfirmPayment({
                            paymentMethod: 'BANK_TRANSFER',
                            amountPaid: netAmount,
                            tenderedCash: netAmount,
                            transactionRef: `PayOS #${orderCode} (${refCode})`,
                        });
                    }, 1200);
                }
            } catch (err) {
                console.warn('Polling PayOS status error:', err);
            }
        }, 2000);
    };

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

    const handleCashSubmit = (e) => {
        e.preventDefault();
        if (paymentMethod === 'CASH') {
            if (tendered < netAmount) {
                setValError(`Số tiền khách đưa không đủ (${money(tendered)} < ${money(netAmount)})`);
                return;
            }
            setValError('');
            onConfirmPayment({
                paymentMethod: 'CASH',
                amountPaid: netAmount,
                tenderedCash: tendered,
            });
        }
    };

    // URL ảnh VietQR chuẩn Napas 247 được sinh từ PayOS
    const qrImageUrl = payOSData
        ? (payOSData.bin && payOSData.accountNumber
            ? `https://img.vietqr.io/image/${payOSData.bin}-${payOSData.accountNumber}-compact2.png?amount=${payOSData.amount}&addInfo=${encodeURIComponent(payOSData.description)}&accountName=${encodeURIComponent(payOSData.accountName || '')}`
            : payOSData.checkoutUrl)
        : null;

    return (
        <div
            className="pms-modal-overlay"
            style={{ zIndex: 1200 }}
            onClick={(e) => {
                if (e.target === e.currentTarget && !submitting && !payOSSuccess) {
                    clearPolling();
                    onClose();
                }
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
                                Thanh Toán Hóa Đơn
                            </div>
                            <div className="pms-modal-sub">
                                Hỗ trợ Tiền mặt & Chuyển khoản VietQR tự động (PayOS)
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="pms-modal-close"
                        onClick={() => {
                            clearPolling();
                            onClose();
                        }}
                        disabled={submitting || payOSSuccess}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleCashSubmit}>
                    <div className="pms-modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {(error || valError || payOSError) && (
                            <div className="pms-alert pms-alert-danger" style={{ padding: '10px 14px', fontSize: 13 }}>
                                {valError || error || payOSError}
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

                        {/* Payment Method Selector - Chỉ 2 hình thức: CASH và BANK_TRANSFER (PayOS) */}
                        <div>
                            <label className="pms-label" style={{ fontWeight: 700, marginBottom: 8, display: 'block' }}>
                                Chọn hình thức thanh toán:
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {/* Nút 1: Tiền mặt */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        clearPolling();
                                        setPaymentMethod('CASH');
                                    }}
                                    className="btn-pms"
                                    style={{
                                        border: `2px solid ${paymentMethod === 'CASH' ? 'var(--brand-primary, #059669)' : '#e2e8f0'}`,
                                        background: paymentMethod === 'CASH' ? 'var(--brand-primary-light, #ecfdf5)' : '#fff',
                                        color: paymentMethod === 'CASH' ? 'var(--brand-primary, #059669)' : '#475569',
                                        fontWeight: 700,
                                        padding: '14px 10px',
                                        borderRadius: 10,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="6" width="20" height="12" rx="2" />
                                        <circle cx="12" cy="12" r="2" />
                                    </svg>
                                    <span style={{ fontSize: 14 }}>Tiền mặt</span>
                                </button>

                                {/* Nút 2: Chuyển khoản VietQR PayOS */}
                                <button
                                    type="button"
                                    onClick={handleSelectPayOS}
                                    className="btn-pms"
                                    style={{
                                        position: 'relative',
                                        border: `2px solid ${paymentMethod === 'BANK_TRANSFER' ? 'var(--brand-primary, #059669)' : '#e2e8f0'}`,
                                        background: paymentMethod === 'BANK_TRANSFER' ? 'var(--brand-primary-light, #ecfdf5)' : '#fff',
                                        color: paymentMethod === 'BANK_TRANSFER' ? 'var(--brand-primary, #059669)' : '#475569',
                                        fontWeight: 700,
                                        padding: '14px 10px',
                                        borderRadius: 10,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <span style={{
                                        position: 'absolute', top: -8, right: 8,
                                        background: '#2563eb', color: '#fff', fontSize: 10,
                                        padding: '2px 8px', borderRadius: 10, fontWeight: 800,
                                        letterSpacing: 0.5
                                    }}>
                                        TỰ ĐỘNG
                                    </span>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="7" height="7" />
                                        <rect x="14" y="3" width="7" height="7" />
                                        <rect x="14" y="14" width="7" height="7" />
                                        <rect x="3" y="14" width="7" height="7" />
                                    </svg>
                                    <span style={{ fontSize: 14 }}>Chuyển khoản PayOS</span>
                                </button>
                            </div>
                        </div>

                        {/* ===================== VIEW 1: TIỀN MẶT (CASH) ===================== */}
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

                                {/* Phím chọn mệnh giá nhanh */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    <button
                                        type="button"
                                        className="pos-denom-chip"
                                        style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0', fontWeight: 700 }}
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

                                {/* Khung hiển thị tiền thừa / thiếu */}
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

                        {/* ===================== VIEW 2: CHUYỂN KHOẢN PAYOS ===================== */}
                        {paymentMethod === 'BANK_TRANSFER' && (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                padding: '16px 20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, gap: 14
                            }}>
                                {payOSLoading ? (
                                    <div style={{ padding: '36px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                        <div className="spinner-border text-success" role="status" style={{ width: 36, height: 36 }} />
                                        <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>
                                            Đang kết nối PayOS để tạo mã VietQR...
                                        </span>
                                    </div>
                                ) : payOSSuccess ? (
                                    /* Màn hình Xác nhận Thành công Tự động */
                                    <div style={{ padding: '24px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 64, height: 64, borderRadius: '50%', background: '#dcfce7',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a'
                                        }}>
                                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: '#15803d' }}>
                                            Thanh Toán Thành Công!
                                        </div>
                                        <div style={{ fontSize: 13, color: '#64748b' }}>
                                            PayOS đã tự động xác nhận tiền vào tài khoản ({successTxnRef})
                                        </div>
                                        <div style={{ fontSize: 12, color: '#059669', fontStyle: 'italic' }}>
                                            Đang tự động in hóa đơn...
                                        </div>
                                    </div>
                                ) : payOSData ? (
                                    /* Màn hình hiển thị QR & Lắng nghe tự động */
                                    <>
                                        <div style={{ position: 'relative', padding: 8, background: '#fff', borderRadius: 12, border: '2px solid #059669', boxShadow: '0 4px 12px rgba(5,150,105,0.15)' }}>
                                            <img
                                                src={qrImageUrl}
                                                alt="PayOS VietQR Code"
                                                style={{ width: 190, height: 190, display: 'block', borderRadius: 8 }}
                                            />
                                        </div>

                                        <div style={{ width: '100%', background: '#f8fafc', padding: '10px 14px', borderRadius: 8, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#64748b' }}>Ngân hàng thụ hưởng:</span>
                                                <strong style={{ color: '#0f172a' }}>{payOSData.bin || 'Napas 247'}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#64748b' }}>Số tài khoản:</span>
                                                <strong style={{ color: '#0f172a', letterSpacing: 0.5 }}>{payOSData.accountNumber || '-'}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#64748b' }}>Chủ tài khoản:</span>
                                                <strong style={{ color: '#0f172a' }}>{payOSData.accountName || 'PHARMACY'}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#64748b' }}>Nội dung chuyển khoản:</span>
                                                <strong style={{ color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: 4 }}>
                                                    {payOSData.description}
                                                </strong>
                                            </div>
                                        </div>

                                        {/* Status Listening Indicator */}
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            padding: '8px 14px', background: '#eff6ff', borderRadius: 20,
                                            border: '1px solid #bfdbfe'
                                        }}>
                                            <div className="spinner-grow spinner-grow-sm text-primary" role="status" style={{ width: 12, height: 12 }} />
                                            <span style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>
                                                Đang chờ khách quét mã... Hệ thống tự nhận tiền 24/7
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                                        Bấm vào Chuyển khoản PayOS để tạo mã QR
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="pms-modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                        <button
                            type="button"
                            className="btn-pms btn-pms-secondary"
                            onClick={() => {
                                clearPolling();
                                onClose();
                            }}
                            disabled={submitting || payOSSuccess}
                        >
                            Quay lại
                        </button>

                        {paymentMethod === 'CASH' ? (
                            <button
                                type="submit"
                                className="btn-pms btn-pms-primary"
                                style={{ minWidth: 180, height: 42, fontSize: 14, fontWeight: 700 }}
                                disabled={submitting || isCashInsufficient}
                            >
                                {submitting ? 'Đang thanh toán...' : 'Hoàn tất & In Hóa Đơn (Enter)'}
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn-pms btn-pms-secondary"
                                style={{ color: '#475569', fontSize: 13 }}
                                onClick={() => {
                                    clearPolling();
                                    setPaymentMethod('CASH');
                                }}
                                disabled={submitting || payOSSuccess}
                            >
                                Đổi sang Tiền mặt
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
