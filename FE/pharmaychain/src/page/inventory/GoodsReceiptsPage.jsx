import React, { useState } from 'react';
import { useGoodsReceipt } from '../../hooks/inventory/useGoodsReceipt';

// ── Cấu hình trạng thái tiếng Việt ─────────────────────────────────────────────
const STATUS_MAP = {
    0: { label: 'Đang soạn hàng', cls: 'pms-badge pms-badge-neutral' },
    1: { label: 'Đang vận chuyển', cls: 'pms-badge pms-badge-info' },
    2: { label: 'Đã nhận đủ', cls: 'pms-badge pms-badge-success' },
    3: { label: 'Có chênh lệch', cls: 'pms-badge pms-badge-warning' },
    4: { label: 'Đã từ chối', cls: 'pms-badge pms-badge-danger' },
};

function StatusBadge({ status }) {
    const s = STATUS_MAP[status] ?? { label: 'Không xác định', cls: 'pms-badge pms-badge-neutral' };
    return <span className={s.cls}>{s.label}</span>;
}

// ── Tiến trình giao nhận hàng ──────────────────────────────────────────────────
function DeliveryTimeline({ item }) {
    const steps = [
        { label: 'Tạo phiếu xuất kho', time: item.createdAt, done: true },
        { label: 'Xuất kho / Đang giao', time: item.dispatchedAt, done: item.status >= 1 && item.status !== 4 },
        { label: 'Chi nhánh đã nhận', time: item.receivedAt, done: item.status === 2 || item.status === 3 },
    ];

    const fmt = (dt) => dt ? new Date(dt).toLocaleString('vi-VN') : '—';

    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 24, overflowX: 'auto' }}>
            {steps.map((s, i) => (
                <React.Fragment key={i}>
                    <div style={{ textAlign: 'center', minWidth: 140, flex: 1 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%', margin: '0 auto 6px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: s.done ? 'var(--primary, #0284c7)' : 'var(--bg-secondary, #f1f5f9)',
                            border: `2px solid ${s.done ? 'var(--primary, #0284c7)' : 'var(--border, #cbd5e1)'}`,
                            color: s.done ? '#fff' : 'var(--text-muted, #64748b)',
                            fontSize: 13, fontWeight: 700,
                        }}>
                            {s.done ? '✓' : i + 1}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: s.done ? 'var(--text-primary, #0f172a)' : 'var(--text-muted, #64748b)' }}>
                            {s.label}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted, #64748b)', marginTop: 2 }}>{fmt(s.time)}</div>
                    </div>
                    {i < steps.length - 1 && (
                        <div style={{
                            height: 2, flex: 0.5, marginTop: 15, alignSelf: 'flex-start',
                            background: steps[i + 1].done ? 'var(--primary, #0284c7)' : 'var(--border, #cbd5e1)',
                            transition: 'background 0.3s',
                        }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

// ── Modal chi tiết phiếu nhận hàng ──────────────────────────────────────────────
function DetailModal({ show, item, loading, onHide, onOpenConfirm, onOpenReject }) {
    if (!show) return null;
    const canAct = item && item.status === 1;

    return (
        <div className="pms-modal-overlay" onClick={onHide}>
            <div className="pms-modal" style={{ maxWidth: 860 }} onClick={e => e.stopPropagation()}>
                <div className="pms-modal-header">
                    <h3 className="pms-modal-title">Chi tiết phiếu nhận hàng điều chuyển</h3>
                    <button type="button" className="pms-modal-close" onClick={onHide}>✕</button>
                </div>
                <div className="pms-modal-body">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 48 }}>Đang tải thông tin chi tiết...</div>
                    ) : item ? (
                        <>
                            {/* Tiến trình */}
                            <DeliveryTimeline item={item} />

                            {/* Thông báo nếu bị từ chối */}
                            {item.status === 4 && (
                                <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                                    🚫 <strong>Phiếu nhận hàng này đã bị từ chối tiếp nhận.</strong>
                                    {item.note && item.note.includes('REJECTED:') && (
                                        <div style={{ marginTop: 4, fontSize: 13 }}>
                                            Lý do: {item.note.split('REJECTED:').pop().trim()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Thông tin chung */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: 12 }}>Mã phiếu nhận</span>
                                    <div style={{ fontWeight: 700, fontSize: 15 }}>{item.code}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: 12 }}>Yêu cầu điều chuyển gốc</span>
                                    <div style={{ fontWeight: 600 }}>{item.stockRequisitionCode || '—'}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: 12 }}>Trạng thái</span>
                                    <div><StatusBadge status={item.status} /></div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: 12 }}>Kho xuất hàng</span>
                                    <div style={{ fontWeight: 600 }}>{item.fromStoreName || 'Kho Tổng Trung Tâm'}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: 12 }}>Đơn vị vận chuyển</span>
                                    <div style={{ fontWeight: 600 }}>{item.carrier || 'Đội xe nội bộ'}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: 12 }}>Người nhận</span>
                                    <div style={{ fontWeight: 600 }}>{item.receivedByUsername || 'Chờ tiếp nhận'}</div>
                                </div>
                                {item.note && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: 12 }}>Ghi chú điều chuyển</span>
                                        <div style={{ fontWeight: 500 }}>{item.note}</div>
                                    </div>
                                )}
                            </div>

                            {/* Danh sách thuốc */}
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Danh sách thuốc & Theo dõi lô hạn dùng (FEFO)</h4>
                            {item.details && item.details.length > 0 ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="pms-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Tên thuốc / Sản phẩm</th>
                                                <th>Số lô</th>
                                                <th>Hạn sử dụng</th>
                                                <th style={{ textAlign: 'right' }}>SL xuất kho</th>
                                                <th style={{ textAlign: 'right' }}>SL thực nhận</th>
                                                <th style={{ textAlign: 'right' }}>Chênh lệch</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {item.details.map((d, i) => (
                                                <tr key={d.id}>
                                                    <td>{i + 1}</td>
                                                    <td>
                                                        <strong>{d.productName}</strong>
                                                        <div style={{ fontSize: 11, color: 'var(--text-secondary, #64748b)' }}>{d.barcode}</div>
                                                    </td>
                                                    <td><span className="pms-badge pms-badge-neutral">{d.batchNumber || '—'}</span></td>
                                                    <td>{d.expiryDate ? new Date(d.expiryDate).toLocaleDateString('vi-VN') : '—'}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{d.quantity}</td>
                                                    <td style={{ textAlign: 'right', color: d.receivedQuantity != null ? 'var(--primary, #0284c7)' : 'var(--text-muted, #64748b)' }}>
                                                        {d.receivedQuantity ?? '—'}
                                                    </td>
                                                    <td style={{
                                                        textAlign: 'right',
                                                        fontWeight: 600,
                                                        color: d.difference && d.difference !== 0 ? 'var(--danger, #ef4444)' : 'var(--success, #22c55e)'
                                                    }}>
                                                        {d.difference != null ? (d.difference > 0 ? `+${d.difference}` : d.difference) : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-secondary, #64748b)' }}>Không có sản phẩm nào trong phiếu.</p>
                            )}
                        </>
                    ) : null}
                </div>
                <div className="pms-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {canAct && (
                            <>
                                <button
                                    type="button"
                                    className="btn-pms btn-pms-primary"
                                    style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', borderColor: '#16a34a' }}
                                    onClick={() => { onHide(); onOpenConfirm(item); }}
                                >
                                    ✅ Duyệt nhận & Cập nhật kho
                                </button>
                                <button
                                    type="button"
                                    className="btn-pms"
                                    style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff', border: '1px solid #dc2626', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontWeight: 600 }}
                                    onClick={() => { onHide(); onOpenReject(item); }}
                                >
                                    🚫 Từ chối nhận
                                </button>
                            </>
                        )}
                    </div>
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide}>Đóng</button>
                </div>
            </div>
        </div>
    );
}

// ── Modal từ chối nhận hàng ──────────────────────────────────────────────────
function RejectModal({ show, item, submitting, onHide, onSubmit }) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState(null);

    React.useEffect(() => {
        if (show) { setReason(''); setError(null); }
    }, [show]);

    if (!show || !item) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Vui lòng nhập lý do từ chối nhận hàng.');
            return;
        }
        onSubmit(item.id, reason.trim());
    };

    return (
        <div className="pms-modal-overlay" onClick={onHide}>
            <div className="pms-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="pms-modal-header" style={{ borderBottom: '2px solid #ef4444' }}>
                        <h3 className="pms-modal-title" style={{ color: '#dc2626' }}>🚫 Từ chối tiếp nhận kiện hàng</h3>
                        <button type="button" className="pms-modal-close" onClick={onHide}>✕</button>
                    </div>
                    <div className="pms-modal-body">
                        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                            <div style={{ fontWeight: 700, marginBottom: 4 }}>Mã phiếu: <span style={{ color: '#dc2626' }}>{item.code}</span></div>
                            <div style={{ fontSize: 13, color: '#64748b' }}>Xuất từ: {item.fromStoreName || 'Kho Tổng Trung Tâm'}</div>
                            <div style={{ fontSize: 13, color: '#64748b' }}>
                                Quy mô: {item.totalItems ?? 0} mặt hàng — {item.totalQuantity ?? 0} đơn vị thuốc
                            </div>
                        </div>

                        {error && (
                            <div className="pms-alert pms-alert-danger" style={{ marginBottom: 12 }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="pms-form-group">
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                                Lý do từ chối nhận hàng <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <textarea
                                className="pms-input"
                                rows="4"
                                placeholder="Ví dụ: Bao bì thuốc bị móp méo, ướt rách, giao sai chủng loại, cận hạn dùng, thiếu số lượng..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>
                    </div>
                    <div className="pms-modal-footer">
                        <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="btn-pms"
                            style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 700, opacity: submitting ? 0.7 : 1 }}
                            disabled={submitting}
                        >
                            {submitting ? 'Đang xử lý...' : '🚫 Xác nhận từ chối'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Modal xác nhận kiểm đếm & nhập kho chi nhánh ────────────────────────────────
function ConfirmModal({ show, item, loading, submitting, onHide, onSubmit }) {
    const [receivedQuantities, setReceivedQuantities] = useState({});
    const [note, setNote] = useState('');
    const [validationError, setValidationError] = useState(null);

    React.useEffect(() => {
        if (item && item.details) {
            const initial = {};
            item.details.forEach(d => {
                initial[d.id] = d.receivedQuantity != null ? d.receivedQuantity : d.quantity;
            });
            setReceivedQuantities(initial);
            setNote(item.note || '');
            setValidationError(null);
        }
    }, [item]);

    if (!show || !item) return null;

    const handleQtyChange = (detailId, val) => {
        const num = val === '' ? '' : parseInt(val, 10);
        setReceivedQuantities(prev => ({ ...prev, [detailId]: num }));
    };

    const fillAllEqual = () => {
        if (!item.details) return;
        const auto = {};
        item.details.forEach(d => { auto[d.id] = d.quantity; });
        setReceivedQuantities(auto);
    };

    const handleConfirm = (e) => {
        e.preventDefault();
        setValidationError(null);

        const itemsPayload = [];
        for (const d of item.details) {
            const q = receivedQuantities[d.id];
            if (q === '' || q === undefined || isNaN(q) || q < 0) {
                setValidationError(`Số lượng thực nhận cho thuốc "${d.productName}" không hợp lệ (phải >= 0).`);
                return;
            }
            itemsPayload.push({ detailId: d.id, receivedQuantity: q });
        }

        const payload = {
            note,
            receivedByUsername: 'admin',
            items: itemsPayload,
        };

        onSubmit(item.id, payload);
    };

    return (
        <div className="pms-modal-overlay" onClick={onHide}>
            <div className="pms-modal" style={{ maxWidth: 860 }} onClick={e => e.stopPropagation()}>
                <form onSubmit={handleConfirm}>
                    <div className="pms-modal-header" style={{ borderBottom: '2px solid #16a34a' }}>
                        <h3 className="pms-modal-title" style={{ color: '#16a34a' }}>✅ Kiểm đếm thực tế & Nhập kho chi nhánh</h3>
                        <button type="button" className="pms-modal-close" onClick={onHide}>✕</button>
                    </div>

                    <div className="pms-modal-body">
                        {validationError && (
                            <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                                ⚠️ {validationError}
                            </div>
                        )}

                        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 16px', marginBottom: 14, fontSize: 13 }}>
                            📦 <strong>Mã phiếu: {item.code}</strong> &nbsp;|&nbsp; Xuất từ: {item.fromStoreName || 'Kho Tổng Trung Tâm'}
                            &nbsp;|&nbsp; {item.totalItems ?? 0} mặt hàng — {item.totalQuantity ?? 0} đơn vị xuất
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>Nhập số lượng thực nhận cho từng loại thuốc:</span>
                            <button
                                type="button"
                                className="btn-pms btn-pms-secondary"
                                style={{ fontSize: 12, padding: '4px 8px' }}
                                onClick={fillAllEqual}
                            >
                                Điền nhanh theo SL xuất
                            </button>
                        </div>

                        <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                            <table className="pms-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Tên thuốc</th>
                                        <th>Số lô / Hạn dùng</th>
                                        <th style={{ textAlign: 'right' }}>SL xuất</th>
                                        <th style={{ width: 140, textAlign: 'right' }}>✅ SL thực nhận</th>
                                        <th>Chênh lệch</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {item.details?.map((d, i) => {
                                        const currentVal = receivedQuantities[d.id] ?? '';
                                        const diff = currentVal !== '' ? currentVal - d.quantity : 0;
                                        return (
                                            <tr key={d.id}>
                                                <td>{i + 1}</td>
                                                <td>
                                                    <strong>{d.productName}</strong>
                                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.barcode}</div>
                                                </td>
                                                <td>
                                                    <div><strong>{d.batchNumber}</strong></div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                        HSD: {d.expiryDate ? new Date(d.expiryDate).toLocaleDateString('vi-VN') : '—'}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{d.quantity}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="pms-input"
                                                        style={{ textAlign: 'right', fontWeight: 700, borderColor: diff < 0 ? '#ef4444' : diff > 0 ? '#eab308' : '#16a34a' }}
                                                        value={currentVal}
                                                        onChange={(e) => handleQtyChange(d.id, e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    {diff !== 0 && (
                                                        <span style={{ fontSize: 12, fontWeight: 600, color: diff < 0 ? 'var(--danger, #ef4444)' : 'var(--warning, #eab308)' }}>
                                                            {diff < 0 ? `Thiếu ${Math.abs(diff)}` : `Thừa +${diff}`}
                                                        </span>
                                                    )}
                                                    {diff === 0 && <span style={{ color: 'var(--success, #22c55e)', fontSize: 12 }}>✓ Khớp 100%</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                                Ghi chú kiểm đếm & Cảm quan chất lượng thuốc:
                            </label>
                            <textarea
                                className="pms-input"
                                rows="2"
                                placeholder="Ghi chú tình trạng bao bì, nhiệt độ bảo quản, tem nhãn..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pms-modal-footer">
                        <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="btn-pms"
                            style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 700, opacity: submitting ? 0.7 : 1 }}
                            disabled={submitting}
                        >
                            {submitting ? '⏳ Đang cập nhật tồn kho...' : '✅ Xác nhận & Cập nhật tồn kho'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Trang chính Nhận hàng điều chuyển ──────────────────────────────────────────
export default function GoodsReceiptsPage() {
    const {
        list,
        total,
        page,
        setPage,
        size,
        search,
        setSearch,
        storeId,
        setStoreId,
        statusFilter,
        setStatusFilter,
        listLoading,
        selectedItem,
        detailModalOpen,
        setDetailModalOpen,
        confirmModalOpen,
        setConfirmModalOpen,
        rejectModalOpen,
        setRejectModalOpen,
        detailLoading,
        submitting,
        openDetail,
        openConfirmModal,
        openRejectModal,
        handleConfirmReceipt,
        handleRejectReceipt,
        error,
        setError,
        successMsg,
        setSuccessMsg,
        fetchList,
    } = useGoodsReceipt();

    const totalPages = Math.ceil(total / size);

    const STATUS_TABS = [
        { value: '', label: 'Tất cả' },
        { value: '1', label: 'Đang vận chuyển' },
        { value: '2', label: 'Đã nhận đủ' },
        { value: '3', label: 'Có chênh lệch' },
        { value: '0', label: 'Đang soạn hàng' },
        { value: '4', label: 'Đã từ chối' },
    ];

    return (
        <div>
            {/* Header */}
            <div className="pms-page-header" style={{ marginBottom: 16 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h1 className="pms-page-title" style={{ margin: 0 }}>Nhận hàng điều chuyển chi nhánh</h1>
                        <span className="pms-badge pms-badge-info" style={{ fontSize: 11 }}>Cửa hàng trưởng</span>
                    </div>
                    <p className="pms-page-subtitle" style={{ margin: 0 }}>
                        Theo dõi các lô hàng điều chuyển từ Kho tổng trung tâm. Bấm <strong>Duyệt nhận</strong> để nhập vào kho chi nhánh hoặc <strong>Từ chối</strong> nếu phát hiện sai lệch / hư hỏng.
                    </p>
                </div>
                <div>
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={fetchList} disabled={listLoading}>
                        🔄 Làm mới
                    </button>
                </div>
            </div>

            {/* Thông báo Alert */}
            {error && (
                <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                    <span>{error}</span>
                    <button type="button" onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
            )}
            {successMsg && (
                <div className="pms-alert pms-alert-success" style={{ marginBottom: 16 }}>
                    <span>{successMsg}</span>
                    <button type="button" onClick={() => setSuccessMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
            )}

            {/* Thẻ thống kê KPI */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                <div className="pms-card" style={{ padding: '16px 20px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>TỔNG SỐ PHIẾU</div>
                    <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{total}</div>
                </div>
                <div className="pms-card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--info, #0284c7)' }}>
                    <div style={{ color: 'var(--info, #0284c7)', fontSize: 12, fontWeight: 600 }}>⏳ ĐANG CHỜ DUYỆT NHẬN</div>
                    <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
                        {list.filter(x => x.status === 1).length}
                    </div>
                </div>
                <div className="pms-card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--success, #22c55e)' }}>
                    <div style={{ color: 'var(--success, #22c55e)', fontSize: 12, fontWeight: 600 }}>✅ ĐÃ NHẬP KHO THÀNH CÔNG</div>
                    <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
                        {list.filter(x => x.status === 2 || x.status === 3).length}
                    </div>
                </div>
                <div className="pms-card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--danger, #ef4444)' }}>
                    <div style={{ color: 'var(--danger, #ef4444)', fontSize: 12, fontWeight: 600 }}>🚫 ĐÃ TỪ CHỐI TIẾP NHẬN</div>
                    <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
                        {list.filter(x => x.status === 4).length}
                    </div>
                </div>
            </div>

            {/* Thanh bộ lọc */}
            <div className="pms-card" style={{ padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {STATUS_TABS.map(tab => (
                            <button
                                key={tab.value}
                                type="button"
                                className={`btn-pms ${statusFilter === tab.value ? 'btn-pms-primary' : 'btn-pms-secondary'}`}
                                style={{ fontSize: 12, padding: '6px 12px' }}
                                onClick={() => { setStatusFilter(tab.value); setPage(0); }}
                            >
                                {tab.label}
                            </button>
                        ))}

                        <select
                            className="pms-input"
                            style={{ fontSize: 12, padding: '5px 10px', marginLeft: 8 }}
                            value={storeId}
                            onChange={(e) => { setStoreId(e.target.value); setPage(0); }}
                        >
                            <option value="">Tất cả chi nhánh</option>
                            <option value="3">Chi nhánh 01 - Cầu Giấy (ST01)</option>
                            <option value="4">Chi nhánh 02 - Đống Đa (ST02)</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                            type="text"
                            className="pms-input"
                            style={{ width: 280 }}
                            placeholder="Tìm mã phiếu nhận, yêu cầu, vận chuyển..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        />
                    </div>
                </div>
            </div>

            {/* Bảng danh sách phiếu nhận */}
            <div className="pms-card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="pms-table">
                        <thead>
                            <tr>
                                <th>Mã phiếu nhận</th>
                                <th>Yêu cầu nguồn</th>
                                <th>Kho xuất</th>
                                <th>Đơn vị vận chuyển</th>
                                <th style={{ textAlign: 'right' }}>Số mặt hàng</th>
                                <th style={{ textAlign: 'right' }}>Tổng SL xuất</th>
                                <th>Ngày xuất kho</th>
                                <th>Ngày nhận hàng</th>
                                <th>Trạng thái</th>
                                <th style={{ textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listLoading ? (
                                <tr>
                                    <td colSpan="10" style={{ textAlign: 'center', padding: 32 }}>Đang nạp dữ liệu phiếu nhận...</td>
                                </tr>
                            ) : list.length === 0 ? (
                                <tr>
                                    <td colSpan="10" style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
                                        Không tìm thấy phiếu nhận hàng nào phù hợp với bộ lọc.
                                    </td>
                                </tr>
                            ) : (
                                list.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <button
                                                type="button"
                                                style={{ background: 'none', border: 'none', color: 'var(--primary, #0284c7)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                                                onClick={() => openDetail(item)}
                                            >
                                                {item.code}
                                            </button>
                                        </td>
                                        <td>{item.stockRequisitionCode || '—'}</td>
                                        <td>{item.fromStoreName || 'Kho Tổng Trung Tâm'}</td>
                                        <td>{item.carrier || '—'}</td>
                                        <td style={{ textAlign: 'right' }}>{item.totalItems ?? 0}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.totalQuantity ?? 0}</td>
                                        <td>{item.dispatchedAt ? new Date(item.dispatchedAt).toLocaleDateString('vi-VN') : '—'}</td>
                                        <td>{item.receivedAt ? new Date(item.receivedAt).toLocaleDateString('vi-VN') : '—'}</td>
                                        <td><StatusBadge status={item.status} /></td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', gap: 6 }}>
                                                <button
                                                    type="button"
                                                    className="btn-pms btn-pms-secondary"
                                                    style={{ fontSize: 12, padding: '4px 8px' }}
                                                    onClick={() => openDetail(item)}
                                                >
                                                    Chi tiết
                                                </button>
                                                {item.status === 1 && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="btn-pms"
                                                            style={{ fontSize: 12, padding: '4px 10px', background: '#16a34a', color: '#fff', border: '1px solid #16a34a', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                                                            onClick={() => openConfirmModal(item)}
                                                        >
                                                            ✅ Duyệt nhận
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-pms"
                                                            style={{ fontSize: 12, padding: '4px 10px', background: '#ef4444', color: '#fff', border: '1px solid #ef4444', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                                                            onClick={() => openRejectModal(item)}
                                                        >
                                                            🚫 Từ chối
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            Trang {page + 1} / {totalPages} (Tổng cộng {total} phiếu nhận)
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button
                                type="button"
                                className="btn-pms btn-pms-secondary"
                                disabled={page === 0}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Trang trước
                            </button>
                            <button
                                type="button"
                                className="btn-pms btn-pms-secondary"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Trang sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Các Modal */}
            <DetailModal
                show={detailModalOpen}
                item={selectedItem}
                loading={detailLoading}
                onHide={() => setDetailModalOpen(false)}
                onOpenConfirm={openConfirmModal}
                onOpenReject={openRejectModal}
            />

            <ConfirmModal
                show={confirmModalOpen}
                item={selectedItem}
                loading={detailLoading}
                submitting={submitting}
                onHide={() => setConfirmModalOpen(false)}
                onSubmit={handleConfirmReceipt}
            />

            <RejectModal
                show={rejectModalOpen}
                item={selectedItem}
                submitting={submitting}
                onHide={() => setRejectModalOpen(false)}
                onSubmit={handleRejectReceipt}
            />
        </div>
    );
}
