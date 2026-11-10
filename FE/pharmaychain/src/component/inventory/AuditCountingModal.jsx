import React, { useState, useEffect } from 'react';

export default function AuditCountingModal({ show, audit, onHide, onSubmitCount, submitting }) {
    const [counts, setCounts] = useState({});
    const [notes, setNotes] = useState({});
    const [error, setError] = useState(null);


    useEffect(() => {
        if (audit && audit.details) {
            const initialCounts = {};
            const initialNotes = {};
            audit.details.forEach(item => {
                initialCounts[item.id] = item.countedQuantity !== null ? item.countedQuantity : '';
                initialNotes[item.id] = item.note || '';
            });
            setCounts(initialCounts);
            setNotes(initialNotes);
        }
    }, [audit]);

    if (!show || !audit) return null;

    const handleCountChange = (detailId, val) => {
        setCounts(prev => ({
            ...prev,
            [detailId]: val === '' ? '' : Math.max(0, parseInt(val, 10) || 0),
        }));
    };

    const handleNoteChange = (detailId, val) => {
        setNotes(prev => ({ ...prev, [detailId]: val }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        let hasNoteError = false;

        // Validate all items are entered
        const items = audit.details.map(item => {
            const countVal = counts[item.id];
            if (countVal === '' || countVal === undefined) {
                return null;
            }

            const countedQty = Number(countVal);
            const noteText = (notes[item.id] || '').trim();

            const systemQty = item.systemQuantity;

            if (countedQty !== systemQty && !noteText) {
                hasNoteError = true;
            }



            return {
                detailId: item.id,
                countedQuantity: Number(countVal),
                note: noteText,
            };
        });

        if (hasNoteError) {
            setError('Vui lòng nhập ghi chú cho các thuốc có sự chênh lệch số lượng.');
            return;
        }

        if (items.some(x => x === null)) {
            setError('Vui lòng nhập số lượng thực đếm cho toàn bộ danh mục thuốc trước khi gửi duyệt.');
            return;
        }

        try {
            await onSubmitCount({
                auditId: audit.id,
                items,
            });
            onHide();
        } catch (err) {
            setError(err?.message || 'Không thể nộp kết quả kiểm đếm kho.');
        }
    };

    return (
        <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !submitting) onHide(); }}>
            <div className="pms-modal" style={{ maxWidth: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div className="pms-modal-header">
                    <div>
                        <h3 className="pms-modal-title">Thực Hiện Kiểm Đếm Tồn Kho Thực Tế</h3>
                        <p className="pms-modal-sub" style={{ fontSize: 12, margin: 0, color: 'var(--text-secondary)' }}>
                            Mã kiểm kê: <strong>{audit.code}</strong> — Chi nhánh: <strong>{audit.storeName}</strong>
                        </p>
                    </div>
                    <button type="button" className="pms-modal-close" onClick={onHide} disabled={submitting}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div className="pms-modal-body" style={{ overflowY: 'auto', flex: 1 }}>
                        {error && (
                            <div className="pms-alert pms-alert-danger" style={{ marginBottom: 14 }}>
                                {error}
                            </div>
                        )}

                        <div className="pms-alert pms-alert-info" style={{ marginBottom: 16, fontSize: 13 }}>
                            Vui lòng kiểm đếm thuốc thực tế tại quầy/kệ và đối chiếu với số liệu sổ sách hệ thống. Mức chênh lệch sẽ được tự động tính toán.
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table className="pms-table">
                                <thead>
                                    <tr>
                                        <th>Tên biệt dược & Quy cách</th>
                                        <th>Số lô</th>
                                        <th style={{ textAlign: 'right' }}>Tồn sổ sách</th>
                                        <th style={{ width: 140, textAlign: 'center' }}>SL thực đếm <span style={{ color: 'var(--danger)' }}>*</span></th>
                                        <th style={{ textAlign: 'right', width: 90 }}>Chênh lệch</th>
                                        <th>Ghi chú lý do lệch</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {audit.details?.map(item => {
                                        const countVal = counts[item.id];
                                        const parsedCount = countVal !== '' && countVal !== undefined ? Number(countVal) : null;
                                        const variance = parsedCount !== null ? parsedCount - item.systemQuantity : null;

                                        return (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: 600 }}>{item.productName}</td>
                                                <td><span className="pms-badge pms-badge-neutral">{item.batchNumber || 'N/A'}</span></td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.systemQuantity}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="pms-input"
                                                        style={{ width: 110, textAlign: 'right', padding: '6px 8px' }}
                                                        placeholder="0"
                                                        value={countVal}
                                                        onChange={(e) => handleCountChange(item.id, e.target.value)}
                                                        disabled={submitting}
                                                    />
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: 700 }}>
                                                    {variance !== null ? (
                                                        <span style={{ color: variance > 0 ? 'var(--success)' : variance < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                                                            {variance > 0 ? `+${variance}` : variance}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="pms-input"
                                                        placeholder="Hỏng vỡ, thiếu tem, thừa kho..."
                                                        value={notes[item.id] || ''}
                                                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                                                        disabled={submitting}
                                                        style={{ fontSize: 12, padding: '6px 8px' }}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="pms-modal-footer">
                        <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
                            Hủy bỏ
                        </button>
                        <button type="submit" className="btn-pms btn-pms-primary" disabled={submitting}>
                            {submitting ? 'Đang gửi kết quả...' : 'Nộp Báo Cáo Kiểm Đếm Cho Quản Lý'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
