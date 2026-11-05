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

    // Global keyboard hotkeys: F2, F4, F8, F9, ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F4') {
                e.preventDefault();
                setCustomerModalOpen(true);
            } else if (e.key === 'F8') {
                e.preventDefault();
                holdCurrentOrder();
            } else if (e.key === 'F9') {
                e.preventDefault();
                if (cartItems.length > 0 && currentShift) {
                    setPaymentModalOpen(true);
                }
            } else if (e.key === 'Escape') {
                if (paymentModalOpen) setPaymentModalOpen(false);
                else if (customerModalOpen) setCustomerModalOpen(false);
                else if (historyDrawerOpen) setHistoryDrawerOpen(false);
                else if (returnModalOpen) setReturnModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        cartItems.length,
        currentShift,
        paymentModalOpen,
        customerModalOpen,
        historyDrawerOpen,
        returnModalOpen,
        holdCurrentOrder,
        setCustomerModalOpen,
        setPaymentModalOpen,
        setHistoryDrawerOpen,
        setReturnModalOpen,
    ]);

    // Handle shift close trigger
    const onTriggerCloseShift = async () => {
        await fetchSummary();
        setCloseModalVisible(true);
    };

    // Handle Complete POS Payment
    const handleConfirmPayment = async (paymentData) => {
        if (!currentShift) {
            setCheckoutError('Bạn cần mở ca làm việc trước khi thanh toán!');
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
                    paymentMethod: paymentData.paymentMethod,
                    amountPaid: paymentData.amountPaid,
                    tenderedCash: paymentData.tenderedCash,
                    transactionRef: paymentData.transactionRef,
                },
            };

            const completed = await createSalesInvoice(invoicePayload);
            setPaymentModalOpen(false);
            clearCart();
            setLastCompletedInvoice(completed);
            setPrintModalOpen(true);
        } catch (err) {
            setCheckoutError(err.message || 'Thanh toán hóa đơn thất bại');
        } finally {
            setCheckoutSubmitting(false);
        }
    };

    const storeId = currentShift?.storeId || 1;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* ── Top Header / Shift Control Bar ── */}
            <div className="pms-card" style={{ marginBottom: 0 }}>
                <div className="pms-card-body" style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        {/* Left: Branding & Status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: currentShift ? 'var(--brand-primary, #059669)' : '#ef4444',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                            }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                            </div>

                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>
                                        Quầy Bán Lẻ Thuốc POS
                                    </h2>
                                    <span className={`pms-badge ${currentShift ? 'pms-badge-success' : 'pms-badge-danger'}`} style={{ fontSize: 11 }}>
                                        {currentShift ? 'Ca đang mở' : 'Chưa mở ca'}
                                    </span>
                                </div>

                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                    {currentShift ? (
                                        <span>
                                            Ca #{currentShift.shiftId || currentShift.id} • Thu ngân: <strong>{currentShift.cashierName || user?.fullName}</strong> • Chi nhánh: <strong>{currentShift.storeName || 'Chi nhánh Hà Nội'}</strong> • Mở lúc: {formatDateTime(currentShift.openedAt || currentShift.openingTime)} • Đầu ca: {money(currentShift.openingCash)}
                                        </span>
                                    ) : (
                                        <span style={{ color: '#ef4444' }}>
                                            ⚠️ Cần mở ca làm việc để bắt đầu xuất hóa đơn bán thuốc
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Quick Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {heldOrders.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span className="pms-badge pms-badge-warning">
                                        {heldOrders.length} đơn tạm
                                    </span>
                                    {heldOrders.map((ho, i) => (
                                        <button
                                            key={ho.id}
                                            type="button"
                                            className="btn-pms btn-pms-secondary"
                                            style={{ fontSize: 11, padding: '3px 8px' }}
                                            onClick={() => resumeHeldOrder(ho.id)}
                                            title="Khôi phục đơn tạm"
                                        >
                                            Đơn #{i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                type="button"
                                className="btn-pms btn-pms-secondary"
                                style={{ fontSize: 12 }}
                                onClick={() => setReturnModalOpen(true)}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="1 4 1 10 7 10" />
                                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                </svg>
                                Trả hàng / Hoàn tiền
                            </button>

                            {currentShift ? (
                                <button
                                    type="button"
                                    className="btn-pms"
                                    style={{ background: '#ef4444', color: '#fff', fontSize: 12 }}
                                    onClick={onTriggerCloseShift}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    Chốt ca (Close Shift)
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn-pms btn-pms-primary"
                                    style={{ fontSize: 13 }}
                                    onClick={() => setOpenModalVisible(true)}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

            {/* ── Main POS Workspace: Two-Column Layout ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(340px, 1fr)', gap: 14 }}>
                {/* ── Left Column: Search & Cart ── */}
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
                            padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #ef4444',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 18 }}>⚠️</span>
                                <div style={{ fontSize: 13, color: '#b91c1c' }}>
                                    <strong>CẢNH BÁO DỊ ỨNG:</strong> Khách hàng <strong>{allergyAlert.customerName}</strong> có tiền sử dị ứng với thành phần: <strong style={{ textDecoration: 'underline' }}>{allergyAlert.allergy}</strong> trong thuốc <strong>{allergyAlert.productName}</strong>!
                                </div>
                            </div>
                            <button
                                type="button"
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#b91c1c', fontWeight: 700 }}
                                onClick={() => setAllergyAlert(null)}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Cart Table */}
                    <PosCartTable
                        items={cartItems}
                        onUpdateQuantity={updateQuantity}
                        onUpdateDosage={updateDosage}
                        onRemoveItem={removeFromCart}
                        onClearCart={clearCart}
                    />

                    {/* Quick Shortcuts Hint */}
                    <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: 12, padding: '8px 12px',
                        background: '#f8fafc', borderRadius: 6, fontSize: 12, color: 'var(--text-secondary)'
                    }}>
                        <span><kbd style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>F2</kbd> Tìm thuốc</span>
                        <span><kbd style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>F4</kbd> Khách hàng</span>
                        <span><kbd style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>F8</kbd> Lưu đơn tạm</span>
                        <span><kbd style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>F9</kbd> Thanh toán</span>
                        <span><kbd style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>ESC</kbd> Đóng cửa sổ</span>
                    </div>
                </div>

                {/* ── Right Column: Customer & Checkout ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Customer Box */}
                    <div className="pms-card" style={{ marginBottom: 0 }}>
                        <div className="pms-card-body" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                                    Khách Hàng (F4)
                                </span>
                                <button
                                    type="button"
                                    className="btn-pms btn-pms-secondary"
                                    style={{ fontSize: 11, padding: '3px 8px' }}
                                    onClick={() => setCustomerModalOpen(true)}
                                >
                                    {customer ? 'Đổi khách' : '+ Chọn khách'}
                                </button>
                            </div>

                            {customer ? (
                                <div style={{ background: 'var(--brand-primary-light, #ecfdf5)', padding: '10px 12px', borderRadius: 6, fontSize: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <strong style={{ fontSize: 14, color: '#111827' }}>{customer.fullName}</strong>
                                        <span className="pms-badge pms-badge-success" style={{ fontSize: 10 }}>
                                            {customer.membershipTier || 'Thành viên'}
                                        </span>
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
                                        SĐT: {customer.phone} • Tích lũy: <strong style={{ color: 'var(--brand-primary, #059669)' }}>{customer.rewardPoints || 0} điểm</strong>
                                    </div>
                                    {customer.allergies && (
                                        <div style={{ color: '#ef4444', marginTop: 4, fontWeight: 600 }}>
                                            ⚠️ Tiền sử: {customer.allergies}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                        <button
                                            type="button"
                                            className="btn-pms btn-pms-secondary"
                                            style={{ fontSize: 11, padding: '2px 8px' }}
                                            onClick={() => setHistoryDrawerOpen(true)}
                                        >
                                            Xem lịch sử mua (UC23)
                                        </button>
                                        <button
                                            type="button"
                                            style={{ border: 'none', background: 'transparent', color: '#6b7280', fontSize: 11, cursor: 'pointer' }}
                                            onClick={() => selectCustomer(null)}
                                        >
                                            Bỏ chọn
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    padding: '8px 12px', background: '#f9fafb', borderRadius: 6, fontSize: 12,
                                    color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <span>Khách vãng lai (Không tích điểm)</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Prescription & Order Notes */}
                    <div className="pms-card" style={{ marginBottom: 0 }}>
                        <div className="pms-card-body" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div className="pms-form-group">
                                <label className="pms-label" style={{ fontSize: 12 }}>Mã đơn thuốc bác sĩ (Nếu có)</label>
                                <input
                                    type="text"
                                    className="pms-input"
                                    style={{ height: 32, fontSize: 12 }}
                                    placeholder="VD: RX-2026-9812"
                                    value={prescriptionCode}
                                    onChange={(e) => setPrescriptionCode(e.target.value)}
                                />
                            </div>

                            <div className="pms-form-group">
                                <label className="pms-label" style={{ fontSize: 12 }}>Ghi chú đơn hàng</label>
                                <input
                                    type="text"
                                    className="pms-input"
                                    style={{ height: 32, fontSize: 12 }}
                                    placeholder="Ghi chú thêm về đơn hàng..."
                                    value={orderNote}
                                    onChange={(e) => setOrderNote(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary & Checkout Card */}
                    <div className="pms-card" style={{ marginBottom: 0 }}>
                        <div className="pms-card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Tổng tiền hàng ({cartItems.length} món):</span>
                                <strong style={{ fontSize: 14 }}>{money(subtotal)}</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Chiết khấu / Giảm giá:</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        style={{
                                            width: 90, height: 28, textAlign: 'right', fontSize: 13,
                                            border: '1px solid var(--border-color)', borderRadius: 4, padding: '2px 6px'
                                        }}
                                        value={discountAmount}
                                        onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                                    />
                                    <span>₫</span>
                                </div>
                            </div>

                            <div style={{
                                borderTop: '2px dashed var(--border-color)',
                                paddingTop: 12,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                                    KHÁCH PHẢI TRẢ:
                                </span>
                                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--brand-primary, #059669)' }}>
                                    {money(netAmount)}
                                </span>
                            </div>

                            {customer && (
                                <div style={{ fontSize: 12, color: 'var(--brand-primary, #059669)', textAlign: 'right' }}>
                                    Ước tính tích lũy: +{estimatedPoints} điểm
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                                <button
                                    type="button"
                                    className="btn-pms btn-pms-primary"
                                    style={{
                                        height: 48,
                                        fontSize: 16,
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                                    }}
                                    disabled={cartItems.length === 0 || !currentShift}
                                    onClick={() => setPaymentModalOpen(true)}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <line x1="1" y1="10" x2="23" y2="10" />
                                    </svg>
                                    THANH TOÁN (F9)
                                </button>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    <button
                                        type="button"
                                        className="btn-pms btn-pms-secondary"
                                        style={{ fontSize: 12, padding: '8px' }}
                                        onClick={holdCurrentOrder}
                                        disabled={cartItems.length === 0}
                                    >
                                        Lưu tạm đơn (F8)
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-pms btn-pms-secondary"
                                        style={{ fontSize: 12, padding: '8px', color: '#ef4444' }}
                                        onClick={clearCart}
                                        disabled={cartItems.length === 0}
                                    >
                                        Hủy đơn (ESC)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Dialogs & Modals ── */}
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
                onConfirmPayment={handleConfirmPayment}
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
