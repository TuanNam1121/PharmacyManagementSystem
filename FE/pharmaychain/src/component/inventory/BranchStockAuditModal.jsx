import { useState } from 'react';

export default function BranchStockAuditModal({ show, onHide, storeName, onConfirm, submitting }) {
    const [note, setNote] = useState('');
    const [error, setError] = useState(null);

    if (!show) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await onConfirm({ note });
        } catch (err) {
            setError(err?.message || 'Có lỗi xảy ra khi xác nhận kiểm kê.');
        }
    };

    return (
        <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !submitting) onHide(); }}>
            <div className="pms-modal" style={{ maxWidth: 500 }}>
                <div className="pms-modal-header">
                    <div>
                        <div className="pms-modal-title">Xác nhận Kiểm tra Tồn kho Quầy</div>
                        <div className="pms-modal-sub">Chi nhánh: <strong>{storeName}</strong></div>
                    </div>
                    <button type="button" className="pms-modal-close" onClick={onHide} disabled={submitting}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="pms-modal-body">
                        {error && (
                            <div className="pms-alert pms-alert-danger" style={{ marginBottom: 14 }}>
                                {error}
                            </div>
                        )}
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
                            Dược sĩ/Quản lý chi nhánh xác nhận đã rà soát thực tế các kệ thuốc, số lượng thuốc cận date và đối chiếu số liệu hệ thống.
                        </p>

                        <div className="pms-form-group" style={{ marginBottom: 4 }}>
                            <label className="pms-label">Ghi chú biên bản kiểm tra (Tuân thủ BR-02 Audit Log)</label>
                            <textarea
                                rows={3}
                                className="pms-input pms-input-bare"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Ghi chú kết quả kiểm tra nhanh, các lô thuốc cận date cần luân chuyển hoặc xử lý..."
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    <div className="pms-modal-footer">
                        <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
                            Hủy bỏ
                        </button>
                        <button type="submit" className="btn-pms btn-pms-primary" disabled={submitting}>
                            {submitting ? 'Đang ghi nhận...' : 'Xác nhận & Ghi vết kiểm toán'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
