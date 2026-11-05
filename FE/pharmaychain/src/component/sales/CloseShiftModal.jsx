import React, { useState, useEffect } from 'react';
import { money, formatDateTime } from '../../utils/format';

export default function CloseShiftModal({
    isOpen,
    onClose,
    onConfirm,
    shiftSummary,
    submitting,
    error,
}) {
    const [closingCash, setClosingCash] = useState('');
    const [note, setNote] = useState('');
    const [valError, setValError] = useState('');

    useEffect(() => {
        if (shiftSummary && shiftSummary.expectedCash !== undefined) {
            setClosingCash(String(shiftSummary.expectedCash));
        }
    }, [shiftSummary]);

    if (!isOpen || !shiftSummary) return null;

    const expectedCash = Number(shiftSummary.expectedCash) || 0;
    const actualCash = Number(closingCash) || 0;
    const discrepancy = actualCash - expectedCash;

    const handleSubmit = (e) => {
        e.preventDefault();
        const cash = Number(closingCash);
        if (isNaN(cash) || cash < 0) {
            setValError('Số tiền thực tế kiểm trong két không được nhỏ hơn 0');
            return;
        }
        if (discrepancy !== 0 && (!note || !note.trim())) {
            setValError('Bắt buộc nhập lý do giải trình khi két tiền bị chênh lệch (thừa hoặc thiếu)');
            return;
        }
        setValError('');
        onConfirm({ closingCash: cash, note: note.trim() });
    };

    return (
        <div className="pms-modal-backdrop" style={{ zIndex: 1050 }}>
            <div className="pms-modal" style={{ maxWidth: 560, width: '100%' }}>
                <div className="pms-modal-header" style={{ background: '#fef2f2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: '#ef4444',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="pms-modal-title" style={{ margin: 0, color: '#b91c1c' }}>
                                Chốt & Bàn Giao Ca Làm Việc (Close Shift)
                            </h3>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                Kết thúc ca làm việc và kiểm đếm doanh thu quầy POS
                            </span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="pms-modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {(error || valError) && (
                            <div className="pms-alert pms-alert-danger" style={{ padding: '10px 14px', fontSize: 13 }}>
                                {valError || error}
                            </div>
                        )}

                        {/* Shift Info */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                            background: '#f9fafb', padding: '12px 14px', borderRadius: 8, fontSize: 13
                        }}>
                            <div>
                                <span style={{ color: 'var(--text-secondary)' }}>Thu ngân: </span>
                                <strong>{shiftSummary.cashierName}</strong>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-secondary)' }}>Chi nhánh: </span>
                                <strong>{shiftSummary.storeName}</strong>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-secondary)' }}>Giờ mở ca: </span>
                                <strong>{formatDateTime(shiftSummary.openingTime)}</strong>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-secondary)' }}>Tổng hóa đơn: </span>
                                <strong>{shiftSummary.totalInvoices} đơn</strong>
                            </div>
                        </div>

                        {/* Financial Ledger Table */}
                        <div style={{
                            border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden', fontSize: 13
                        }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', padding: '8px 12px',
                                borderBottom: '1px solid var(--border-color)', background: '#fff'
                            }}>
                                <span>Tiền mặt đầu ca:</span>
                                <strong>{money(shiftSummary.openingCash)}</strong>
                            </div>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', padding: '8px 12px',
                                borderBottom: '1px solid var(--border-color)', background: '#fff'
                            }}>
                                <span>+ Doanh thu tiền mặt trong ca:</span>
                                <strong style={{ color: 'var(--brand-primary)' }}>+{money(shiftSummary.cashSales)}</strong>
                            </div>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', padding: '8px 12px',
                                borderBottom: '1px solid var(--border-color)', background: '#fff'
                            }}>
                                <span>- Hoàn trả khách hàng (Tiền mặt):</span>
                                <strong style={{ color: '#ef4444' }}>-{money(shiftSummary.refundCash)}</strong>
                            </div>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', padding: '10px 12px',
                                background: 'var(--brand-primary-light, #ecfdf5)', fontWeight: 700
                            }}>
                                <span style={{ color: 'var(--brand-primary, #059669)' }}>Tiền mặt dự kiến phải có trong két:</span>
                                <span style={{ color: 'var(--brand-primary, #059669)', fontSize: 15 }}>{money(expectedCash)}</span>
                            </div>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', padding: '6px 12px',
                                background: '#f8fafc', fontSize: 12, color: 'var(--text-secondary)'
                            }}>
                                <span>Doanh thu VietQR: {money(shiftSummary.qrSales)} | Quẹt thẻ: {money(shiftSummary.cardSales)}</span>
                                <span>(Không tính vào két tiền mặt)</span>
                            </div>
                        </div>

                        {/* Physical Cash Input */}
                        <div className="pms-form-group">
                            <label className="pms-label" style={{ fontWeight: 700 }}>
                                Tiền mặt thực tế kiểm đếm trong két (VNĐ) <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    className="pms-input"
                                    style={{ fontSize: 16, fontWeight: 700, paddingRight: 40 }}
                                    value={closingCash}
                                    onChange={(e) => setClosingCash(e.target.value)}
                                    placeholder="0"
                                    required
                                    autoFocus
                                />
                                <span style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    color: 'var(--text-secondary)', fontWeight: 600
                                }}>
                                    ₫
                                </span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                                Bằng chữ: {money(actualCash)}
                            </div>
                        </div>

                        {/* Discrepancy Status */}
                        <div style={{
                            padding: '10px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: discrepancy === 0 ? '#ecfdf5' : discrepancy > 0 ? '#fffbeb' : '#fef2f2',
                            border: `1px solid ${discrepancy === 0 ? '#10b981' : discrepancy > 0 ? '#f59e0b' : '#ef4444'}`
                        }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: discrepancy === 0 ? '#059669' : discrepancy > 0 ? '#b45309' : '#b91c1c' }}>
                                {discrepancy === 0 && '✓ Két tiền cân bằng chuẩn xác (0 ₫)'}
                                {discrepancy > 0 && `▲ Thừa tiền két: +${money(discrepancy)}`}
                                {discrepancy < 0 && `▼ Thiếu tiền két: ${money(discrepancy)}`}
                            </div>
                            <span className={`pms-badge ${discrepancy === 0 ? 'pms-badge-success' : discrepancy > 0 ? 'pms-badge-warning' : 'pms-badge-danger'}`}>
                                {discrepancy === 0 ? 'Khớp két' : discrepancy > 0 ? 'Thừa két' : 'Lệch âm'}
                            </span>
                        </div>

                        {/* Mandatory Note when discrepancy !== 0 */}
                        <div className="pms-form-group">
                            <label className="pms-label">
                                Giải trình chênh lệch & Ghi chú {discrepancy !== 0 && <span style={{ color: '#ef4444' }}>* (Bắt buộc)</span>}
                            </label>
                            <textarea
                                className="pms-input"
                                rows={2}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder={discrepancy !== 0 ? "Vui lòng nhập lý do lệch tiền (VD: Thối nhầm tiền, khách không lấy tiền lẻ...)" : "Ghi chú thêm nếu có..."}
                                required={discrepancy !== 0}
                            />
                        </div>
                    </div>

                    <div className="pms-modal-footer" style={{ padding: '14px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <button
                            type="button"
                            className="btn-pms btn-pms-secondary"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Quay lại bán hàng
                        </button>
                        <button
                            type="submit"
                            className="btn-pms"
                            style={{ background: '#ef4444', color: '#fff' }}
                            disabled={submitting}
                        >
                            {submitting ? 'Đang chốt ca...' : 'Xác nhận Chốt Ca (Close Shift)'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
