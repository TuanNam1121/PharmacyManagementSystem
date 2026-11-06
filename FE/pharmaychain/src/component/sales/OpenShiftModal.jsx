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
    const [storeId, setStoreId] = useState('1');
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
            <div className="pms-modal" style={{ maxWidth: 520, width: '100%' }}>
                <div className="pms-modal-header" style={{ background: 'var(--brand-primary-light, #ecfdf5)' }}>
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
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="pms-modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                            <select
                                className="pms-select"
                                value={storeId}
                                onChange={(e) => setStoreId(e.target.value)}
                            >
                                <option value="1">Chi nhánh 1 — Nhà thuốc Trung tâm (Hà Nội)</option>
                                <option value="2">Chi nhánh 2 — Nhà thuốc Cầu Giấy</option>
                                <option value="3">Chi nhánh 3 — Nhà thuốc Đống Đa</option>
                            </select>
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

                    <div className="pms-modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
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
