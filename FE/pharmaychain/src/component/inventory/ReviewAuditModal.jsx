import React, { useEffect, useState } from 'react';

/**
 * Store Manager – bước 4: đối soát chênh lệch.
 *
 * Khớp với backend `PATCH /api/v1/inventory-audits/review`:
 *   - body: { auditId, decision, reviewNote }  (auditId do hook `handleFinalReview` tự gắn)
 *   - decision 3 = xác nhận & cân bằng kho (backend ghi số thực đếm vào tồn kho)
 *   - decision 4 = từ chối kết quả
 *   - chỉ xử lý được khi phiên đang ở status 2 (chờ đối soát)
 *   - xác nhận sẽ bị backend từ chối nếu còn dòng chưa đếm
 *
 * Đặt `true` nếu backend của bạn đưa phiên về status 1 khi từ chối (cho phép đếm lại).
 * Hiện tại backend giữ nguyên status = 4 nên phiên kết thúc và phải tạo phiên mới.
 */
const RECOUNT_REOPENS_SESSION = false;

const DECISION_CONFIRM = 3;
const DECISION_REJECT = 4;

const fmtVariance = (v) => (v == null ? '—' : v > 0 ? `+${v}` : String(v));

export default function ReviewAuditModal({ show, audit, loading, onHide, onConfirm, submitting }) {
    const [note, setNote] = useState('');
    const [error, setError] = useState(null);
    const [onlyDiff, setOnlyDiff] = useState(false);

    // Mỗi lần mở một phiên khác: xoá ghi chú và lỗi cũ
    useEffect(() => {
        if (show) {
            setNote('');
            setError(null);
            setOnlyDiff(false);
        }
    }, [show, audit?.id]);

    if (!show || !audit) return null;

    const details = audit.details || [];
    const uncounted = details.filter(d => d.countedQuantity == null).length;
    const diffRows = details.filter(d => (d.variance ?? 0) !== 0);
    const totalVariance = diffRows.reduce((sum, d) => sum + d.variance, 0);
    const rows = onlyDiff ? diffRows : details;

    // Backend chỉ cho đối soát khi status = 2
    const reviewable = audit.status === 2;
    const canConfirm = !loading && !submitting && reviewable && details.length > 0 && uncounted === 0;
    const canReject = !loading && !submitting && reviewable;

    const handleAction = async (decision) => {
        setError(null);
        const trimmed = note.trim();

        if (decision === DECISION_REJECT && !trimmed) {
            setError('Vui lòng nhập lý do khi từ chối kết quả kiểm đếm.');
            return;
        }

        try {
            // Backend ghi đè reviewNote bằng giá trị gửi lên (kể cả rỗng).
            // Nếu quản lý không nhập gì, gửi lại ghi chú hiện có để không mất lý do đề xuất.
            await onConfirm({
                decision,
                reviewNote: trimmed || audit.reviewNote || '',
            });
            // Thành công: hook tự đóng modal.
        } catch (err) {
            setError(err?.message || 'Không thể đối soát phiên kiểm kê.');
        }
    };

    return (
        <div
            className="pms-modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget && !submitting) onHide(); }}
        >
            <div className="pms-modal" style={{ maxWidth: 860 }}>
                <div className="pms-modal-header">
                    <div>
                        <h3 className="pms-modal-title">Đối Soát Chênh Lệch Kiểm Kê</h3>
                        <p className="pms-modal-sub" style={{ fontSize: 12, margin: 0, color: 'var(--text-secondary)' }}>
                            Mã phiên: <strong>{audit.code}</strong>
                        </p>
                    </div>
                    <button type="button" className="pms-modal-close" onClick={onHide} disabled={submitting}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="pms-modal-body">
                    {error && (
                        <div className="pms-alert pms-alert-danger" style={{ marginBottom: 14 }}>{error}</div>
                    )}

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40 }}>Đang tải số liệu đối soát...</div>
                    ) : (
                        <>
                            {!reviewable && (
                                <div className="pms-alert pms-alert-warning" style={{ marginBottom: 14 }}>
                                    Phiên này không ở trạng thái chờ đối soát nên không thể xử lý. Hãy làm mới danh sách.
                                </div>
                            )}

                            {reviewable && uncounted > 0 && (
                                <div className="pms-alert pms-alert-warning" style={{ marginBottom: 14 }}>
                                    Còn {uncounted} dòng chưa có số thực đếm. Cần đếm đủ trước khi xác nhận.
                                </div>
                            )}

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: 16,
                                    background: 'var(--surface-sunken)',
                                    padding: 14,
                                    borderRadius: 8,
                                    marginBottom: 16,
                                }}
                            >
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Người kiểm đếm</span><br />
                                    <strong>{audit.countedByUsername || '—'}</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Ngày kiểm kê</span><br />
                                    <strong>{audit.auditDate || '—'}</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Dòng lệch</span><br />
                                    <strong>{diffRows.length}/{details.length}</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Tổng chênh lệch</span><br />
                                    <strong style={{
                                        color: totalVariance > 0 ? 'var(--success)' : totalVariance < 0 ? 'var(--danger)' : undefined,
                                    }}>
                                        {fmtVariance(totalVariance)}
                                    </strong>
                                </div>
                            </div>

                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 10, cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={onlyDiff}
                                    onChange={(e) => setOnlyDiff(e.target.checked)}
                                />
                                Chỉ hiện các dòng chênh lệch
                            </label>

                            <div style={{ overflow: 'auto', maxHeight: 320, marginBottom: 16 }}>
                                <table className="pms-table">
                                    <thead>
                                        <tr>
                                            <th>Tên thuốc</th>
                                            <th>Số lô</th>
                                            <th style={{ textAlign: 'right' }}>Tồn sổ sách</th>
                                            <th style={{ textAlign: 'right' }}>Thực đếm</th>
                                            <th style={{ textAlign: 'right' }}>Chênh lệch</th>
                                            <th>Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                                                    {onlyDiff ? 'Không có dòng nào chênh lệch.' : 'Phiên này chưa có dòng dữ liệu nào.'}
                                                </td>
                                            </tr>
                                        ) : rows.map(d => (
                                            <tr key={d.id}>
                                                <td>{d.productName}</td>
                                                <td><span className="pms-badge pms-badge-neutral">{d.batchNumber || 'N/A'}</span></td>
                                                <td style={{ textAlign: 'right' }}>{d.systemQuantity}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                                    {d.countedQuantity ?? 'Chưa đếm'}
                                                </td>
                                                <td style={{
                                                    textAlign: 'right',
                                                    fontWeight: 700,
                                                    color: d.variance > 0 ? 'var(--success)' : d.variance < 0 ? 'var(--danger)' : undefined,
                                                }}>
                                                    {fmtVariance(d.variance)}
                                                </td>
                                                <td>{d.note || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="pms-form-group">
                                <label className="pms-label" style={{ fontWeight: 600 }}>
                                    Ghi chú đối soát (bắt buộc nếu từ chối)
                                </label>
                                <textarea
                                    rows={3}
                                    className="pms-input"
                                    placeholder="Nhập nhận xét về chênh lệch hoặc lý do từ chối kết quả..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    disabled={submitting}
                                    style={{ width: '100%', resize: 'vertical' }}
                                />
                            </div>

                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '10px 0 0' }}>
                                <strong>Xác nhận &amp; cân bằng:</strong> tồn kho của {diffRows.length} dòng lệch sẽ được cập nhật
                                theo số thực đếm, phiên chuyển sang “Đã xác nhận”.
                                <br />
                                <strong>Từ chối kết quả:</strong>{' '}
                                {RECOUNT_REOPENS_SESSION
                                    ? 'phiên quay lại bước đếm để dược sĩ đếm lại.'
                                    : 'tồn kho giữ nguyên, phiên chuyển sang “Từ chối” và kết thúc. Dược sĩ cần đề xuất phiên mới.'}
                            </p>
                        </>
                    )}
                </div>

                <div className="pms-modal-footer">
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
                        Đóng
                    </button>
                    <button
                        type="button"
                        className="btn-pms btn-pms-danger"
                        onClick={() => handleAction(DECISION_REJECT)}
                        disabled={!canReject}
                    >
                        Từ Chối Kết Quả
                    </button>
                    <button
                        type="button"
                        className="btn-pms btn-pms-success"
                        onClick={() => handleAction(DECISION_CONFIRM)}
                        disabled={!canConfirm}
                        title={uncounted > 0 ? 'Còn dòng chưa đếm' : undefined}
                    >
                        {submitting ? 'Đang xử lý...' : 'Xác Nhận & Cân Bằng Kho'}
                    </button>
                </div>
            </div>
        </div>
    );
}