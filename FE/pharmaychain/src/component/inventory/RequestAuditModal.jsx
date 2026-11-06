import React, { useState } from 'react';

export default function RequestAuditModal({ show, onHide, onConfirm, submitting }) {
    const [storeId, setStoreId] = useState('1');
    const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]);
    const [reason, setReason] = useState('');
    const [error, setError] = useState(null);

    if (!show) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!storeId || !auditDate) {
            setError('Vui lòng chọn chi nhánh nhà thuốc và ngày kiểm kê.');
            return;
        }
        try {
            await onConfirm({
                storeId: Number(storeId),
                auditDate,
                reason,
            });
            onHide();
        } catch (err) {
            setError(err?.message || 'Không thể gửi yêu cầu đợt kiểm kê.');
        }
    };

    return (
        <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !submitting) onHide(); }}>
            <div className="pms-modal" style={{ maxWidth: 520 }}>
                <div className="pms-modal-header">
                    <div>
                        <h3 className="pms-modal-title">Yêu Cầu Mở Đợt Kiểm Kê Kho</h3>
                        <p className="pms-modal-sub" style={{ fontSize: 12, margin: 0, color: 'var(--text-secondary)' }}>
                            Vai trò: <strong>Dược sĩ phụ trách</strong> — Yêu cầu sẽ được chuyển đến Quản lý Cửa Hàng để phê duyệt
                        </p>
                    </div>
                    <button type="button" className="pms-modal-close" onClick={onHide} disabled={submitting}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="pms-modal-body">
                        {error && (
                            <div className="pms-alert pms-alert-danger" style={{ marginBottom: 14 }}>
                                {error}
                            </div>
                        )}

                        <div className="pms-alert pms-alert-info" style={{ marginBottom: 16, fontSize: 13 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            Tạo yêu cầu này sẽ chốt số liệu tồn kho sổ sách cho tất cả mặt hàng tại chi nhánh. Việc kiểm đếm thực tế chỉ bắt đầu sau khi <strong>Quản lý Cửa Hàng phê duyệt</strong> yêu cầu.
                        </div>

                        <div className="pms-form-group" style={{ marginBottom: 14 }}>
                            <label className="pms-label" style={{ fontWeight: 600 }}>Chi nhánh kiểm kê <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <select
                                className="pms-select"
                                value={storeId}
                                onChange={(e) => setStoreId(e.target.value)}
                                disabled={submitting}
                                style={{ width: '100%' }}
                            >
                                <option value="3">Chi nhánh 01 — Cầu Giấy (ST01)</option>
                                <option value="4">Chi nhánh 02 — Đống Đa (ST02)</option>
                                <option value="2">Kho Tổng Trung Tâm (WH01)</option>
                            </select>
                        </div>

                        <div className="pms-form-group" style={{ marginBottom: 14 }}>
                            <label className="pms-label" style={{ fontWeight: 600 }}>Ngày kiểm kê dự kiến <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <input
                                type="date"
                                className="pms-input"
                                value={auditDate}
                                onChange={(e) => setAuditDate(e.target.value)}
                                disabled={submitting}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div className="pms-form-group">
                            <label className="pms-label" style={{ fontWeight: 600 }}>Mục đích kiểm kê & Ghi chú</label>
                            <textarea
                                rows={3}
                                className="pms-input"
                                placeholder="Ví dụ: Kiểm kê định kỳ cuối tháng, kiểm tra đột xuất tủ thuốc gây nghiện, đối soát số liệu lệch..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                disabled={submitting}
                                style={{ width: '100%', resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    <div className="pms-modal-footer">
                        <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
                            Hủy bỏ
                        </button>
                        <button type="submit" className="btn-pms btn-pms-primary" disabled={submitting}>
                            {submitting ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Cho Quản Lý'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
