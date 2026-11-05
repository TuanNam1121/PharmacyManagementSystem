import React, { useEffect, useState } from 'react';
import useShift from '../../hooks/sales/useShift';
import usePosCart from '../../hooks/sales/usePosCart';
import { useAuth } from '../../context/AuthContext';
import { createSalesInvoice } from '../../api/salesApi';
import { money, formatDateTime } from '../../utils/format';

import PosSearchBar from '../../component/sales/PosSearchBar';
import PosCartTable from '../../component/sales/PosCartTable';
import OpenShiftModal from '../../component/sales/OpenShiftModal';
import CloseShiftModal from '../../component/sales/CloseShiftModal';
import CustomerSelectModal from '../../component/sales/CustomerSelectModal';
import PaymentModal from '../../component/sales/PaymentModal';
import InvoicePrintTemplate from '../../component/sales/InvoicePrintTemplate';
import SalesReturnModal from '../../component/sales/SalesReturnModal';
import CustomerHistoryDrawer from '../../component/sales/CustomerHistoryDrawer';

export default function PosCounterPage() {
    const { user } = useAuth();
    const {
        currentShift,
        shiftSummary,
        loading: shiftLoading,
        submitting: shiftSubmitting,
        error: shiftError,
        openModalVisible,
        setOpenModalVisible,
        closeModalVisible,
        setCloseModalVisible,
        fetchSummary,
        handleOpenShift,
        handleCloseShift,
        refreshShift,
    } = useShift();

    const {
        cartItems,
        customer,
        discountAmount,
        setDiscountAmount,
        prescriptionCode,
        setPrescriptionCode,
        orderNote,
        setOrderNote,
        heldOrders,
        allergyAlert,
        setAllergyAlert,
        paymentModalOpen,
        setPaymentModalOpen,
        customerModalOpen,
        setCustomerModalOpen,
        historyDrawerOpen,
        setHistoryDrawerOpen,
        returnModalOpen,
        setReturnModalOpen,
        lastCompletedInvoice,
        setLastCompletedInvoice,
        addToCart,
        updateQuantity,
        updateDosage,
        removeFromCart,
        clearCart,
        holdCurrentOrder,
        resumeHeldOrder,
        selectCustomer,
        subtotal,
        netAmount,
        estimatedPoints,
    } = usePosCart();

    const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
    const [checkoutError, setCheckoutError] = useState(null);
    const [printModalOpen, setPrintModalOpen] = useState(false);

    // Fast payment states directly on right panel
    const [quickMethod, setQuickMethod] = useState('CASH'); // CASH, VNPAY_QR, BANK_TRANSFER
    const [tenderedCash, setTenderedCash] = useState('');

    useEffect(() => {
        setTenderedCash(String(netAmount));
    }, [netAmount]);

    const tendered = Number(tenderedCash) || 0;
    const changeAmount = Math.max(0, tendered - netAmount);
    const isCashInsufficient = quickMethod === 'CASH' && tendered < netAmount;

    const handleQuickDenom = (val) => {
        if (val === 'EXACT') setTenderedCash(String(netAmount));
        else setTenderedCash(String(val));
    };

    // Handle shift close trigger
    const onTriggerCloseShift = async () => {
        await fetchSummary();
        setCloseModalVisible(true);
    };

    // Direct Checkout execution
    const executeCheckout = async (paymentOverride = null) => {
        if (!currentShift) {
            setCheckoutError('Bạn cần mở ca làm việc trước khi thanh toán!');
            setOpenModalVisible(true);
            return;
        }

        if (cartItems.length === 0) {
            alert('Giỏ hàng chưa có sản phẩm nào!');
            return;
        }

        const method = paymentOverride?.paymentMethod || quickMethod;
        const paid = paymentOverride?.amountPaid || netAmount;
        const tenderedAmt = paymentOverride?.tenderedCash || (method === 'CASH' ? tendered : netAmount);

        if (method === 'CASH' && tenderedAmt < netAmount) {
            alert(`Tiền khách đưa không đủ (${money(tenderedAmt)} < ${money(netAmount)})!`);
            return;
        }

        setCheckoutSubmitting(true);
        setCheckoutError(null);

        try {
            const invoicePayload = {
                shiftId: currentShift.shiftId || currentShift.id,
                customerId: customer?.id || null,
                discount: Number(discountAmount) || 0,
                prescriptionCode: prescriptionCode.trim() || null,
                note: orderNote.trim() || null,
                items: cartItems.map((item) => ({
                    productId: item.productId,
                    batchId: item.batchId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    dosageInstruction: item.dosageInstruction || null,
                })),
                payment: {
                    paymentMethod: method,
                    amountPaid: paid,
                    tenderedCash: tenderedAmt,
                    transactionRef: paymentOverride?.transactionRef || undefined,
                },
            };

            const completed = await createSalesInvoice(invoicePayload);
            clearCart();
            setLastCompletedInvoice(completed);
            setPrintModalOpen(true);
        } catch (err) {
            setCheckoutError(err.message || 'Thanh toán hóa đơn thất bại');
            alert(err.message || 'Thanh toán thất bại');
        } finally {
            setCheckoutSubmitting(false);
        }
    };

    const storeId = currentShift?.storeId || 1;

    return (
        <div className="pos-layout">
            {/* ── Top POS Ribbon / Shift Header ── */}
            <div className="pms-card" style={{ marginBottom: 0, borderRadius: 12 }}>
                <div className="pms-card-body" style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                        {/* Left: Shift & Cashier identity */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                background: currentShift ? 'var(--brand-primary, #059669)' : '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                boxShadow: currentShift ? '0 4px 12px rgba(5,150,105,0.25)' : '0 4px 12px rgba(239,68,68,0.25)',
                                flexShrink: 0
                            }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                            </div>

                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                                        Quầy Thu Ngân POS
                                    </h2>
                                    {currentShift ? (
                                        <span className="pms-badge pms-badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', fontSize: 11 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                                            Ca đang mở #{currentShift.shiftId || currentShift.id}
                                        </span>
                                    ) : (
                                        <span className="pms-badge pms-badge-danger" style={{ padding: '3px 9px', fontSize: 11 }}>
                                            Chưa mở ca làm việc
                                        </span>
                                    )}
                                </div>

                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                                    {currentShift ? (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
                                            <span>Thu ngân: <strong style={{ color: '#0f172a' }}>{currentShift.cashierName || user?.fullName}</strong></span>
                                            <span>•</span>
                                            <span>Chi nhánh: <strong style={{ color: '#0f172a' }}>{currentShift.storeName || 'ST01 - Cầu Giấy'}</strong></span>
                                            <span>•</span>
                                            <span>Đầu ca: <strong style={{ color: 'var(--brand-primary)' }}>{money(currentShift.openingCash)}</strong></span>
                                            <span>•</span>
                                            <span>Mở lúc: {formatDateTime(currentShift.openedAt || currentShift.openingTime)}</span>
                                        </div>
                                    ) : (
                                        <span style={{ color: '#dc2626', fontWeight: 600 }}>
                                            ⚠️ Bạn chưa mở ca làm việc. Vui lòng mở ca để thực hiện xuất hóa đơn và thu tiền!
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Order Tabs & Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {heldOrders.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f8fafc', padding: '3px 8px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', marginRight: 4 }}>
                                        {heldOrders.length} Đơn tạm:
                                    </span>
                                    {heldOrders.map((ho, i) => (
                                        <button
                                            key={ho.id}
                                            type="button"
                                            className="btn-pms btn-pms-secondary"
                                            style={{ fontSize: 11, padding: '2px 8px', height: 26 }}
                                            onClick={() => resumeHeldOrder(ho.id)}
                                            title="Khôi phục đơn tạm"
                                        >
                                            Đơn #{i + 1} ({ho.cartItems?.length || 0} món)
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                type="button"
                                className="btn-pms btn-pms-secondary"
                                style={{ fontSize: 12, height: 36 }}
                                onClick={() => setReturnModalOpen(true)}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 6 }}>
                                    <polyline points="1 4 1 10 7 10" />
                                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                </svg>
                                Trả hàng / Đổi thuốc (UC25)
                            </button>

                            {currentShift ? (
                                <button
                                    type="button"
                                    className="btn-pms"
                                    style={{
                                        background: '#ef4444',
                                        color: '#fff',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        height: 36,
                                        padding: '0 14px',
                                        boxShadow: '0 2px 6px rgba(239,68,68,0.2)'
                                    }}
                                    onClick={onTriggerCloseShift}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 6 }}>
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    Chốt ca (Close Shift)
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn-pms btn-pms-primary"
                                    style={{ fontSize: 13, height: 36, fontWeight: 700 }}
                                    onClick={() => setOpenModalVisible(true)}
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 6 }}>
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    Mở ca làm việc (Open Shift)
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main POS Workspace Grid ── */}
            <div className="pos-grid">
                {/* ── LEFT COLUMN: Search & Order Cart ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Search Bar */}
                    <PosSearchBar
                        storeId={storeId}
                        onSelectItem={(item) => {
                            if (!currentShift) {
                                alert('Vui lòng mở ca làm việc trước khi thêm thuốc vào giỏ!');
                                setOpenModalVisible(true);
                                return;
                            }
                            addToCart(item);
                        }}
                    />

                    {/* Allergy Alert Banner */}
                    {allergyAlert && (
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: 10,
                            background: '#fef2f2',
                            border: '1.5px solid #ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            boxShadow: '0 4px 12px rgba(239,68,68,0.1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: '#ef4444',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    flexShrink: 0
                                }}>
                                    !
                                </div>
                                <div style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.4 }}>
                                    <strong style={{ textTransform: 'uppercase' }}>Cảnh báo dị ứng nghiêm trọng:</strong> Khách hàng <strong>{allergyAlert.customerName}</strong> có tiền sử dị ứng với thành phần <strong style={{ textDecoration: 'underline', color: '#b91c1c' }}>{allergyAlert.allergy}</strong> trong thuốc <strong>{allergyAlert.productName}</strong>! Vui lòng tư vấn đổi thuốc an toàn!
                                </div>
                            </div>
                            <button
                                type="button"
                                style={{
                                    border: 'none',
                                    background: '#fee2e2',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    color: '#991b1b',
                                    fontWeight: 700,
                                    padding: '4px 8px',
                                    fontSize: 12
                                }}
                                onClick={() => setAllergyAlert(null)}
                            >
                                Đã hiểu ✕
                            </button>
                        </div>
                    )}

                    {/* Cart Items Table */}
                    <PosCartTable
                        items={cartItems}
                        onUpdateQuantity={updateQuantity}
                        onUpdateDosage={updateDosage}
                        onRemoveItem={removeFromCart}
                        onClearCart={clearCart}
                    />

                    {/* Operational Status Footer */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 16px',
                        background: '#fff',
                        borderRadius: 10,
                        border: '1px solid var(--border-color)',
                        fontSize: 12,
                        color: 'var(--text-secondary)'
                    }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#059669', fontWeight: 600 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                                Hệ thống POS sẵn sàng bán lẻ
                            </span>
                            <span>•</span>
                            <span>Kho xuất: <strong>Kho Chi Nhánh (Xuất theo FEFO)</strong></span>
                            <span>•</span>
                            <span>Mặt hàng trong giỏ: <strong style={{ color: '#0f172a' }}>{cartItems.length}</strong></span>
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>
                            PharmaChain POS v2.0
                        </span>
                    </div>
                </div>

                {/* ── RIGHT COLUMN: Customer & Fast Checkout Terminal ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 12 }}>
                    <div className="pms-card" style={{ marginBottom: 0, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                        {/* Section Header */}
                        <div style={{
                            padding: '12px 18px',
                            background: '#f8fafc',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#334155' }}>
                                Thông Tin Đơn Hàng & Thu Tiền
                            </span>
                            <span style={{ fontSize: 11, color: '#64748b' }}>
                                {cartItems.length} sản phẩm
                            </span>
                        </div>

                        <div className="pms-card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {/* 1. Customer Box */}
                            <div style={{
                                border: '1px solid var(--border-color)',
                                borderRadius: 10,
                                padding: '12px 14px',
                                background: customer ? 'var(--brand-primary-light, #ecfdf5)' : '#fafafa',
                                transition: 'all 0.15s ease'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: customer ? 'var(--brand-primary)' : '#64748b' }}>
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: customer ? 'var(--brand-primary)' : '#475569' }}>
                                            {customer ? 'Hội viên nhà thuốc' : 'Khách hàng'}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn-pms btn-pms-secondary"
                                        style={{ fontSize: 11, padding: '2px 8px', height: 24, fontWeight: 600 }}
                                        onClick={() => setCustomerModalOpen(true)}
                                    >
                                        {customer ? 'Đổi khách' : '+ Chọn khách hàng'}
                                    </button>
                                </div>

                                {customer ? (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong style={{ fontSize: 14, color: '#0f172a' }}>{customer.fullName}</strong>
                                            <span className="pms-badge pms-badge-success" style={{ fontSize: 10, padding: '1px 6px' }}>
                                                {customer.membershipTier || 'Thành viên'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, display: 'flex', justifyContent: 'space-between' }}>
                                            <span>SĐT: <strong>{customer.phone}</strong></span>
                                            <span>Điểm tích lũy: <strong style={{ color: 'var(--brand-primary)' }}>{customer.rewardPoints || 0} điểm</strong></span>
                                        </div>
                                        {customer.allergies && (
                                            <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4, fontWeight: 600 }}>
                                                ⚠️ Dị ứng: {customer.allergies}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 6, borderTop: '1px dashed #cbd5e1' }}>
                                            <button
                                                type="button"
                                                style={{ border: 'none', background: 'transparent', color: 'var(--brand-primary)', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                                onClick={() => setHistoryDrawerOpen(true)}
                                            >
                                                Xem lịch sử mua thuốc (UC23) →
                                            </button>
                                            <button
                                                type="button"
                                                style={{ border: 'none', background: 'transparent', color: '#94a3b8', fontSize: 11, cursor: 'pointer', padding: 0 }}
                                                onClick={() => selectCustomer(null)}
                                            >
                                                Bỏ chọn
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: 12, color: '#64748b' }}>
                                        Khách vãng lai (Không tích điểm thưởng thành viên)
                                    </div>
                                )}
                            </div>

                            {/* 2. Prescription & Note */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <div>
                                    <label className="pms-label" style={{ fontSize: 11, marginBottom: 4 }}>Mã đơn thuốc Rx</label>
                                    <input
                                        type="text"
                                        className="pms-input"
                                        style={{ height: 32, fontSize: 12, padding: '4px 8px' }}
                                        placeholder="VD: RX-2026-8812"
                                        value={prescriptionCode}
                                        onChange={(e) => setPrescriptionCode(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="pms-label" style={{ fontSize: 11, marginBottom: 4 }}>Ghi chú đơn</label>
                                    <input
                                        type="text"
                                        className="pms-input"
                                        style={{ height: 32, fontSize: 12, padding: '4px 8px' }}
                                        placeholder="Ghi chú thêm..."
                                        value={orderNote}
                                        onChange={(e) => setOrderNote(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* 3. Financial Calculation Ledger */}
                            <div style={{
                                borderTop: '1px solid #e2e8f0',
                                paddingTop: 12,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b' }}>
                                    <span>Tổng tiền hàng:</span>
                                    <strong style={{ color: '#0f172a' }}>{money(subtotal)}</strong>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#64748b' }}>
                                    <span>Giảm giá / Chiết khấu:</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1000"
                                            style={{
                                                width: 85,
                                                height: 26,
                                                textAlign: 'right',
                                                fontSize: 12,
                                                fontWeight: 600,
                                                border: '1px solid var(--border-color)',
                                                borderRadius: 4,
                                                padding: '2px 6px'
                                            }}
                                            value={discountAmount}
                                            onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                                        />
                                        <span style={{ fontSize: 11 }}>₫</span>
                                    </div>
                                </div>

                                <div style={{
                                    borderTop: '2px dashed #cbd5e1',
                                    paddingTop: 10,
                                    marginTop: 4,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'baseline'
                                }}>
                                    <span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>
                                        KHÁCH CẦN TRẢ:
                                    </span>
                                    <span style={{ fontSize: 26, fontWeight: 900, color: 'var(--brand-primary, #059669)' }}>
                                        {money(netAmount)}
                                    </span>
                                </div>

                                {customer && (
                                    <div style={{ fontSize: 11, color: 'var(--brand-primary)', textAlign: 'right', fontWeight: 600 }}>
                                        Ước tính cộng: +{estimatedPoints} điểm tích lũy
                                    </div>
                                )}
                            </div>

                            {/* 4. Payment Method & Fast Tendered Cash Calculator */}
                            <div style={{
                                borderTop: '1px solid #e2e8f0',
                                paddingTop: 12,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                                    <button
                                        type="button"
                                        onClick={() => setQuickMethod('CASH')}
                                        style={{
                                            border: `1.5px solid ${quickMethod === 'CASH' ? 'var(--brand-primary)' : '#e2e8f0'}`,
                                            background: quickMethod === 'CASH' ? 'var(--brand-primary-light, #ecfdf5)' : '#fff',
                                            color: quickMethod === 'CASH' ? 'var(--brand-primary)' : '#475569',
                                            fontWeight: 700,
                                            fontSize: 12,
                                            padding: '8px 4px',
                                            borderRadius: 8,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Tiền mặt
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setQuickMethod('VNPAY_QR')}
                                        style={{
                                            border: `1.5px solid ${quickMethod === 'VNPAY_QR' ? 'var(--brand-primary)' : '#e2e8f0'}`,
                                            background: quickMethod === 'VNPAY_QR' ? 'var(--brand-primary-light, #ecfdf5)' : '#fff',
                                            color: quickMethod === 'VNPAY_QR' ? 'var(--brand-primary)' : '#475569',
                                            fontWeight: 700,
                                            fontSize: 12,
                                            padding: '8px 4px',
                                            borderRadius: 8,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        VietQR / MoMo
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setQuickMethod('BANK_TRANSFER')}
                                        style={{
                                            border: `1.5px solid ${quickMethod === 'BANK_TRANSFER' ? 'var(--brand-primary)' : '#e2e8f0'}`,
                                            background: quickMethod === 'BANK_TRANSFER' ? 'var(--brand-primary-light, #ecfdf5)' : '#fff',
                                            color: quickMethod === 'BANK_TRANSFER' ? 'var(--brand-primary)' : '#475569',
                                            fontWeight: 700,
                                            fontSize: 12,
                                            padding: '8px 4px',
                                            borderRadius: 8,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Quẹt thẻ POS
                                    </button>
                                </div>

                                {quickMethod === 'CASH' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Tiền khách đưa:</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1000"
                                                style={{
                                                    width: 140,
                                                    height: 32,
                                                    textAlign: 'right',
                                                    fontSize: 14,
                                                    fontWeight: 800,
                                                    border: '1.5px solid var(--border-color)',
                                                    borderRadius: 6,
                                                    padding: '2px 8px',
                                                    color: '#0f172a'
                                                }}
                                                value={tenderedCash}
                                                onChange={(e) => setTenderedCash(e.target.value)}
                                            />
                                        </div>

                                        {/* Quick Denominations */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            <button
                                                type="button"
                                                className="pos-denom-chip"
                                                style={{ padding: '3px 8px', fontSize: 11 }}
                                                onClick={() => handleQuickDenom('EXACT')}
                                            >
                                                Đúng tiền
                                            </button>
                                            {[50000, 100000, 200000, 500000].map((denom) => (
                                                <button
                                                    key={denom}
                                                    type="button"
                                                    className="pos-denom-chip"
                                                    style={{ padding: '3px 8px', fontSize: 11 }}
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
                                            padding: '8px 12px',
                                            borderRadius: 6,
                                            background: isCashInsufficient ? '#fef2f2' : '#ecfdf5',
                                            border: `1px solid ${isCashInsufficient ? '#fca5a5' : '#86efac'}`,
                                            fontSize: 12
                                        }}>
                                            <span style={{ fontWeight: 700, color: isCashInsufficient ? '#991b1b' : '#065f46' }}>
                                                {isCashInsufficient ? 'Còn thiếu:' : 'Tiền thối lại:'}
                                            </span>
                                            <span style={{ fontWeight: 800, fontSize: 14, color: isCashInsufficient ? '#b91c1c' : '#059669' }}>
                                                {isCashInsufficient ? money(netAmount - tendered) : money(changeAmount)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 5. Big Checkout Actions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                                <button
                                    type="button"
                                    className="btn-pms btn-pms-primary"
                                    style={{
                                        height: 50,
                                        fontSize: 16,
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                                        borderRadius: 8
                                    }}
                                    disabled={cartItems.length === 0 || !currentShift || isCashInsufficient || checkoutSubmitting}
                                    onClick={() => executeCheckout()}
                                >
                                    {checkoutSubmitting ? (
                                        <div className="spinner-border spinner-border-sm" style={{ marginRight: 8 }} />
                                    ) : (
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <rect x="2" y="4" width="20" height="16" rx="2" />
                                            <line x1="1" y1="10" x2="23" y2="10" />
                                        </svg>
                                    )}
                                    {checkoutSubmitting ? 'Đang thanh toán...' : 'THANH TOÁN & IN HÓA ĐƠN'}
                                </button>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    <button
                                        type="button"
                                        className="btn-pms btn-pms-secondary"
                                        style={{ fontSize: 12, padding: '7px 4px', height: 34 }}
                                        onClick={holdCurrentOrder}
                                        disabled={cartItems.length === 0}
                                    >
                                        Lưu tạm đơn
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-pms btn-pms-secondary"
                                        style={{ fontSize: 12, padding: '7px 4px', color: '#ef4444', height: 34 }}
                                        onClick={() => {
                                            if (window.confirm('Bạn có chắc muốn hủy và làm trống giỏ hàng hiện tại?')) {
                                                clearCart();
                                            }
                                        }}
                                        disabled={cartItems.length === 0}
                                    >
                                        Hủy đơn
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Dialogs & Modals with proper Overlay ── */}
            <OpenShiftModal
                isOpen={openModalVisible}
                onClose={() => setOpenModalVisible(false)}
                onConfirm={handleOpenShift}
                currentUser={user}
                submitting={shiftSubmitting}
                error={shiftError}
            />

            <CloseShiftModal
                isOpen={closeModalVisible}
                onClose={() => setCloseModalVisible(false)}
                onConfirm={handleCloseShift}
                shiftSummary={shiftSummary}
                submitting={shiftSubmitting}
                error={shiftError}
            />

            <CustomerSelectModal
                isOpen={customerModalOpen}
                onClose={() => setCustomerModalOpen(false)}
                onSelectCustomer={selectCustomer}
            />

            <PaymentModal
                isOpen={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                onConfirmPayment={(paymentData) => {
                    setPaymentModalOpen(false);
                    executeCheckout(paymentData);
                }}
                subtotal={subtotal}
                discountAmount={discountAmount}
                netAmount={netAmount}
                customer={customer}
                submitting={checkoutSubmitting}
                error={checkoutError}
            />

            <InvoicePrintTemplate
                isOpen={printModalOpen}
                onClose={() => setPrintModalOpen(false)}
                invoice={lastCompletedInvoice}
            />

            <SalesReturnModal
                isOpen={returnModalOpen}
                onClose={() => setReturnModalOpen(false)}
                onReturnSuccess={() => {
                    refreshShift();
                }}
            />

            <CustomerHistoryDrawer
                isOpen={historyDrawerOpen}
                onClose={() => setHistoryDrawerOpen(false)}
                customer={customer}
            />
        </div>
    );
}
