import React, { useEffect, useState } from 'react';
import { formatDate } from '../../utils/format';

const STATUS_BADGES = {
    0: { label: 'Bản nháp', cls: 'pms-badge pms-badge-neutral' },
    1: { label: 'Đang chào giá RFQ', cls: 'pms-badge pms-badge-info' },
    2: { label: 'Chờ phê duyệt', cls: 'pms-badge pms-badge-warning' },
    3: { label: 'Đã phê duyệt', cls: 'pms-badge pms-badge-success' },
    4: { label: 'Đã từ chối', cls: 'pms-badge pms-badge-danger' },
};

export default function PurchaseOrderDetailModal({
    show,
    onHide,
    detail,
    loading,
    onApprove,
    onReject,
    actionLoading,
}) {
    const [rejectMode, setRejectMode] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [approveNote, setApproveNote] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Component luôn mounted (chỉ return null khi ẩn) nên state nội bộ sẽ tồn tại
    // qua các lần mở. Reset lại mỗi khi mở modal để nút "Duyệt"/"Từ chối" luôn hiển thị đúng.
    useEffect(() => {
        if (show) {
            setRejectMode(false);
            setRejectReason('');
            setApproveNote('');
            setErrorMsg('');
        }
    }, [show, detail?.id]);

    if (!show) return null;

    const badge = STATUS_BADGES[detail?.status] || {
        label: detail?.statusText || 'Không xác định',
        cls: 'pms-badge pms-badge-neutral',
    };

    const isPending = detail?.status === 0 || detail?.status === 2;

    // Chỉ coi là giá đã chốt khi đơn đã gắn báo giá của nhà cung cấp
    const hasQuotation = Boolean(detail?.supplierQuotationCode);

    const handleConfirmReject = () => {
        if (!rejectReason.trim()) {
            setErrorMsg('Vui lòng nhập lý do từ chối đơn đặt hàng.');
            return;
        }
        setErrorMsg('');
        onReject(detail.id, rejectReason.trim());
    };

    console.log(detail);

    const handleConfirmApprove = () => {
        setErrorMsg('');
        onApprove(detail.id, approveNote.trim());
    };

    return (
        <div
            className="pms-modal-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget && !actionLoading) onHide();
            }}
        >
            <div className="pms-modal pms-modal-lg" style={{ maxWidth: 880 }}>
                {/* Header */}
                <div className="pms-modal-header">
                    <div>
                        <div className="pms-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span>Đơn Đặt Hàng: {detail?.code || '—'}</span>
                            <span className={badge.cls}>{badge.label}</span>
                        </div>
                        <div className="pms-modal-sub">
                            Kiểm tra danh mục hàng hóa báo giá từ nhà cung cấp và phê duyệt hoặc từ chối đơn đặt hàng
                        </div>
                    </div>
                    <button className="pms-modal-close" onClick={onHide} disabled={actionLoading}>
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="pms-modal-body">
                    {loading ? (
                        <div className="pms-spinner-wrap" style={{ padding: '40px 0', textAlign: 'center' }}>
                            <div className="pms-spinner" />
                            <span className="pms-spinner-text" style={{ display: 'block', marginTop: 10 }}>
                                Đang tải danh sách hàng hóa trong đơn đặt hàng…
                            </span>
                        </div>
                    ) : detail ? (
                        <div>
                            {errorMsg && (
                                <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                                    ⚠️ {errorMsg}
                                </div>
                            )}

                            {/* Order Metadata Grid */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: 16,
                                    background: 'var(--bg-canvas, #f8fafc)',
                                    border: '1px solid var(--border-color, #e2e8f0)',
                                    borderRadius: 'var(--border-radius-md, 8px)',
                                    padding: '16px 20px',
                                    marginBottom: 20,
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                                        Nhà Cung Cấp
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginTop: 2 }}>
                                        {detail.supplierName || '—'}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>{detail.supplierCode}</div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                                        Phiếu Yêu Cầu Gốc
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>
                                        {detail.purchaseRequestCode || 'Trực tiếp'}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>
                                        Báo giá: {detail.supplierQuotationCode || '—'}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                                        {hasQuotation ? 'Tổng Giá Trị Đơn Hàng' : 'Tạm Tính Đơn Hàng'}
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: 16, color: '#059669', marginTop: 2 }}>
                                        {Number(detail.totalAmount || 0).toLocaleString('vi-VN')} ₫
                                    </div>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>
                                        {hasQuotation ? 'Chưa gồm thuế GTGT' : 'Chưa có báo giá — chỉ là tạm tính'}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                                        Người Lập / Ngày Lập
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>
                                        {detail.createdByUsername || 'Nhân viên Mua hàng'}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>
                                        {formatDate(detail.createdAt)}
                                    </div>
                                </div>
                            </div>

                            {/* Status Notice if Rejected or Approved */}
                            {detail.status === 4 && detail.rejectReason && (
                                <div
                                    style={{
                                        background: '#fef2f2',
                                        border: '1px solid #fecaca',
                                        borderRadius: 8,
                                        padding: '12px 16px',
                                        marginBottom: 20,
                                    }}
                                >
                                    <strong style={{ color: '#b91c1c' }}>Lý Do Từ Chối: </strong>
                                    <span style={{ color: '#7f1d1d' }}>{detail.rejectReason}</span>
                                </div>
                            )}

                            {detail.status === 3 && detail.approvedByUsername && (
                                <div
                                    style={{
                                        background: '#f0fdf4',
                                        border: '1px solid #bbf7d0',
                                        borderRadius: 8,
                                        padding: '10px 16px',
                                        marginBottom: 20,
                                        fontSize: 13,
                                        color: '#15803d',
                                    }}
                                >
                                    ✓ Đã phê duyệt bởi <strong>{detail.approvedByUsername}</strong> vào ngày {formatDate(detail.approvedAt)}
                                </div>
                            )}

                            {/* Items Table */}
                            <div style={{ marginBottom: 20 }}>
                                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Danh Sách Mặt Hàng Đặt Mua</h4>
                                <div className="pms-table-container">
                                    <table className="pms-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Tên Thuốc / Sản Phẩm</th>
                                                <th>Mã Vạch</th>
                                                <th>ĐVT</th>
                                                <th style={{ textAlign: 'right' }}>Số Lượng</th>
                                                <th style={{ textAlign: 'right' }}>Đơn Giá (₫)</th>
                                                <th style={{ textAlign: 'right' }}>Thuế (%)</th>
                                                <th style={{ textAlign: 'right' }}>Thành Tiền (₫)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detail.items && detail.items.length > 0 ? (
                                                detail.items.map((it, idx) => (
                                                    <tr key={it.id || idx}>
                                                        <td>{idx + 1}</td>
                                                        <td className="fw-600">{it.productName || '—'}</td>
                                                        <td className="mono" style={{ fontSize: 12 }}>{it.productBarcode || '—'}</td>
                                                        <td>{it.unit || 'Hộp'}</td>
                                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{it.quantity}</td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            {Number(it.unitPrice || 0).toLocaleString('vi-VN')}
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>{it.taxRate}%</td>
                                                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                                            {Number(it.subtotal || 0).toLocaleString('vi-VN')}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                                                        Không có dữ liệu mặt hàng chi tiết cho đơn này.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot>
                                            <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                                                <td colSpan={7} style={{ textAlign: 'right' }}>
                                                    {hasQuotation ? 'Tổng Tiền (Chưa Gồm VAT):' : 'Tạm Tính (Chưa Có Báo Giá):'}
                                                </td>
                                                <td style={{ textAlign: 'right', color: '#059669', fontSize: 15 }}>
                                                    {Number(detail.totalAmount || 0).toLocaleString('vi-VN')} ₫
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Reject Form Block (if user clicked Reject) */}
                            {rejectMode && (
                                <div
                                    style={{
                                        background: '#fff1f2',
                                        border: '1px solid #fda4af',
                                        borderRadius: 8,
                                        padding: '16px',
                                        marginTop: 16,
                                    }}
                                >
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#9f1239', marginBottom: 6 }}>
                                        Lý Do Từ Chối Đơn Hàng *
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="pms-input"
                                        placeholder="Nhập lý do từ chối đơn đặt hàng này (ví dụ: Giá báo vượt ngân sách, điều khoản giao hàng không phù hợp)..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        style={{ width: '100%', marginBottom: 10 }}
                                    />
                                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                        <button
                                            type="button"
                                            className="btn-pms btn-pms-secondary"
                                            onClick={() => {
                                                setRejectMode(false);
                                                setRejectReason('');
                                                setErrorMsg('');
                                            }}
                                            disabled={actionLoading}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-pms btn-pms-danger"
                                            onClick={handleConfirmReject}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? 'Đang từ chối…' : 'Xác Nhận Từ Chối'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Footer Actions */}
                <div className="pms-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="btn-pms btn-pms-secondary" onClick={onHide} disabled={actionLoading}>
                        Đóng
                    </button>

                    {isPending && !rejectMode && (
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                type="button"
                                className="btn-pms btn-pms-danger"
                                onClick={() => setRejectMode(true)}
                                disabled={actionLoading}
                            >
                                Từ Chối Đơn…
                            </button>
                            <button
                                type="button"
                                className="btn-pms btn-pms-primary"
                                onClick={handleConfirmApprove}
                                disabled={actionLoading}
                                style={{ background: '#059669', borderColor: '#059669' }}
                            >
                                {actionLoading ? 'Đang duyệt…' : '✓ Duyệt Đơn Đặt Hàng'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
