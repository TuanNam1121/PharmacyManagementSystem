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
            setError(err?.message || 'Có lỗi xảy ra khi xác nhận biên bản kiểm kê quầy.');
        }
    };

    return (
        <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !submitting) onHide(); }}>
            <div className="pms-modal" style={{ maxWidth: 500 }}>
                <div className="pms-modal-header">
                    <div>
                        <div className="pms-modal-title">Xác Nhận Kiểm Tra Tồn Kho Quầy Thuốc</div>
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
                            Dược sĩ phụ trách / Quản lý cửa hàng xác nhận đã trực tiếp kiểm tra các quầy kệ thực tế và các lô thuốc cận hạn, đối soát khớp với dữ liệu trên hệ thống.
                        </p>

                        <div className="pms-form-group" style={{ marginBottom: 4 }}>
                            <label className="pms-label">Ghi chú kết quả kiểm tra & đối soát</label>
                            <textarea
                                rows={3}
                                className="pms-input pms-input-bare"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Ghi nhận tình trạng quầy thuốc, các lô cận hạn cần lưu ý hoặc đề xuất cấp phát..."
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    <div className="pms-modal-footer">
                        <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
                            Hủy bỏ
                        </button>
                        <button type="submit" className="btn-pms btn-pms-primary" disabled={submitting}>
                            {submitting ? 'Đang ghi nhận...' : 'Xác Nhận & Lưu Biên Bản'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
