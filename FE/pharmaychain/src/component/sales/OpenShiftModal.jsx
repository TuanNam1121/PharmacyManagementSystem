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
        second: '2-digit',
    });

    return (
        <div className="pms-modal-backdrop" style={{ zIndex: 1050 }}>
            <div className="pms-modal" style={{ maxWidth: 500, width: '100%' }}>
                <div className="pms-modal-header" style={{ background: 'var(--brand-primary-light, #ecfdf5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'var(--brand-primary, #059669)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="pms-modal-title" style={{ margin: 0, color: 'var(--brand-primary, #059669)' }}>
                                Mở Ca Làm Việc (Open Shift)
                            </h3>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                Bắt đầu phiên bán hàng tại quầy POS
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

                        <div className="pms-form-group">
                            <label className="pms-label">Dược sĩ / Thu ngân</label>
                            <input
                                type="text"
                                className="pms-input"
                                value={currentUser?.fullName || currentUser?.username || 'Dược sĩ trực quầy'}
                                disabled
                                style={{ background: '#f3f4f6' }}
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
                                style={{ background: '#f3f4f6' }}
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
                                    style={{ fontSize: 16, fontWeight: 700, paddingRight: 40 }}
                                    value={openingCash}
                                    onChange={(e) => setOpeningCash(e.target.value)}
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
                            <div style={{ fontSize: 12, color: 'var(--brand-primary)', marginTop: 4 }}>
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

                    <div className="pms-modal-footer" style={{ padding: '14px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
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
                            disabled={submitting}
                        >
                            {submitting ? 'Đang mở ca...' : 'Xác nhận Mở Ca (Open Shift)'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
