import React, { useState } from 'react';
import { money } from '../../utils/format';

export default function OpenShiftModal({
    isOpen,
    onClose,
    onConfirm,
    currentUser,
    submitting,
    error,
}) {
    const activeBranchId = localStorage.getItem('pms_selected_store_id') || '3';
    const [storeId, setStoreId] = useState(activeBranchId);
    const [openingCash, setOpeningCash] = useState('0');
    const [note, setNote] = useState('');
    const [valError, setValError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const cash = Number(openingCash);
        if (isNaN(cash) || cash < 0) {
            setValError('Số tiền đầu ca phải là số nguyên không âm (>= 0)');
            return;
        }
        if (cash > 100000000) {
            setValError('Số tiền đầu ca không được vượt quá 100,000,000 VNĐ');
            return;
        }
        setValError('');
        onConfirm({ storeId: Number(storeId), openingCash: cash, note });
    };

    const now = new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div
            className="pms-modal-overlay"
            style={{ zIndex: 1200 }}
            onClick={(e) => {
                if (e.target === e.currentTarget && !submitting) onClose();
            }}
        >
            <div className="pms-modal" style={{ maxWidth: 520, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div className="pms-modal-header" style={{ background: 'var(--brand-primary-light, #ecfdf5)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: 'var(--brand-primary, #059669)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                            boxShadow: '0 2px 6px rgba(5,150,105,0.2)'
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div>
                            <div className="pms-modal-title" style={{ color: 'var(--brand-primary, #059669)', fontSize: 17 }}>
                                Mở Ca Làm Việc (Open Shift)
                            </div>
                            <div className="pms-modal-sub">
                                Bắt đầu phiên bán hàng tại quầy POS
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="pms-modal-close"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Đóng"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    <div className="pms-modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', flex: 1 }}>
                        {(error || valError) && (
                            <div className="pms-alert pms-alert-danger" style={{ padding: '10px 14px', fontSize: 13 }}>
                                {valError || error}
                            </div>
                        )}

                        <div className="pms-form-group">
                            <label className="pms-label">Dược sĩ / Thu ngân</label>
                            <input
                                type="text"
                                className="pms-input"
                                value={currentUser?.fullName || currentUser?.username || 'Dược sĩ trực quầy'}
                                disabled
                                style={{ background: '#f8fafc', color: '#334155', fontWeight: 600 }}
                            />
                        </div>

                        <div className="pms-form-group">
                            <label className="pms-label">Chi nhánh làm việc</label>
                            <div style={{
                                padding: '10px 14px',
                                background: '#f8fafc',
                                borderRadius: 8,
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#0f172a'
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--brand-primary)' }}>
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>{String(storeId) === '4' ? 'Nhà Thuốc Chi Nhánh 02 — Đống Đa (ST02)' : 'Nhà Thuốc Chi Nhánh 01 — Cầu Giấy (ST01)'}</span>
                            </div>
                        </div>

                        <div className="pms-form-group">
                            <label className="pms-label">Thời gian mở ca</label>
                            <input
                                type="text"
                                className="pms-input"
                                value={now}
                                disabled
                                style={{ background: '#f8fafc', color: '#64748b' }}
                            />
                        </div>

                        <div className="pms-form-group">
                            <label className="pms-label" style={{ fontWeight: 700 }}>
                                Tiền mặt đầu ca trong két (VNĐ) <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    className="pms-input"
                                    style={{ fontSize: 18, fontWeight: 800, height: 46, paddingRight: 40 }}
                                    value={openingCash}
                                    onChange={(e) => setOpeningCash(e.target.value)}
                                    placeholder="0"
                                    required
                                    autoFocus
                                />
                                <span style={{
                                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                    color: '#64748b', fontWeight: 700
                                }}>
                                    ₫
                                </span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--brand-primary)', marginTop: 4, fontWeight: 600 }}>
                                Bằng chữ: {money(Number(openingCash) || 0)}
                            </div>
                        </div>

                        <div className="pms-form-group">
                            <label className="pms-label">Ghi chú đầu ca</label>
                            <textarea
                                className="pms-input"
                                rows={2}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Ghi chú số lượng tiền lẻ, tiền rách (tùy chọn)..."
                            />
                        </div>
                    </div>

                    <div className="pms-modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0, borderTop: '1px solid #e2e8f0', background: '#fff' }}>
                        <button
                            type="button"
                            className="btn-pms btn-pms-secondary"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="btn-pms btn-pms-primary"
                            style={{ minWidth: 160, height: 40, fontWeight: 700 }}
                            disabled={submitting}
                        >
                            {submitting ? 'Đang mở ca...' : 'Xác nhận Mở Ca'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
