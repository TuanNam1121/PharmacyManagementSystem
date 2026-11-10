import React, { useState, useEffect, useCallback } from 'react';
import { formatDate } from '../../utils/format';
import {
    getPurchaseOrders,
    getPurchaseOrderDetail,
    approvePurchaseOrder,
    rejectPurchaseOrder,
} from '../../api/PurchaseOrderAPI';
import PurchaseOrderDetailModal from '../../component/procurement/PurchaseOrderDetailModal';
import { useAuth } from '../../context/AuthContext';

const STATUS_TABS = [
    { label: 'Tất cả đơn hàng', value: '' },
    { label: 'Chờ phê duyệt', value: 1 },
    { label: 'Đã duyệt', value: 2 },
    { label: 'Đã từ chối', value: 3 },
    { label: 'Hoàn tất', value: 5 },
];

const getPoStatusBadge = (status, statusText) => {
    switch (Number(status)) {
        case 0:
            return <span className="pms-badge pms-badge-neutral">Bản nháp</span>;
        case 1:
            return <span className="pms-badge pms-badge-warning">Chờ phê duyệt</span>;
        case 2:
            return <span className="pms-badge pms-badge-success">Đã phê duyệt</span>;
        case 3:
            return <span className="pms-badge pms-badge-danger">Đã từ chối</span>;
        case 4:
            return <span className="pms-badge pms-badge-info">Nhập một phần</span>;
        case 5:
            return <span className="pms-badge pms-badge-success">Hoàn tất</span>;
        default:
            return <span className="pms-badge pms-badge-neutral">{statusText || 'Không xác định'}</span>;
    }
};

export default function PurchaseOrdersPage() {
    const [list, setList] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [search, setSearch] = useState('');
    const [statusTab, setStatusTab] = useState('');
    const [loading, setLoading] = useState(false);

    // Detail & Approval state
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Alerts
    const [successMsg, setSuccessMsg] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    const { user } = useAuth();

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await getPurchaseOrders({
                page,
                size,
                search,
                status: statusTab !== '' ? statusTab : undefined,
            });
            setList(res?.content || []);
            setTotal(res?.totalElements ?? 0);
        } catch (err) {
            setErrorMsg(err?.message || 'Không thể tải danh sách đơn đặt hàng thu mua.');
        } finally {
            setLoading(false);
        }
    }, [page, size, search, statusTab]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleOpenDetail = async (orderOrId) => {
        const order = typeof orderOrId === 'object' ? orderOrId : list.find((x) => x.id === orderOrId);
        if (order) {
            setSelectedDetail(order);
        }
        setDetailLoading(true);
        setDetailModalOpen(true);
        try {
            const targetId = order?.id || orderOrId;
            const res = await getPurchaseOrderDetail(targetId);
            setSelectedDetail(res);
        } catch (err) {
            setErrorMsg(err?.message || 'Không thể tải chi tiết đơn đặt hàng thu mua.');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleApprove = async (id, note) => {
        setActionLoading(true);
        setErrorMsg(null);
        try {
            const res = await approvePurchaseOrder(id, { actionByUsername: `${user.username}`, reason: note });
            setSuccessMsg(`Đơn đặt hàng thu mua ${res?.code || ''} đã được phê duyệt thành công!`);
            setSelectedDetail(res);
            await fetchOrders();
        } catch (err) {
            setErrorMsg(err?.message || 'Phê duyệt đơn đặt hàng thất bại.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id, reason) => {
        setActionLoading(true);
        setErrorMsg(null);
        try {
            const res = await rejectPurchaseOrder(id, { actionByUsername: `${user.username}`, reason });
            setSuccessMsg(`Đơn đặt hàng thu mua ${res?.code || ''} đã bị từ chối.`);
            setSelectedDetail(res);
            await fetchOrders();
        } catch (err) {
            setErrorMsg(err?.message || 'Từ chối đơn đặt hàng thất bại.');
        } finally {
            setActionLoading(false);
        }
    };

    const totalPages = Math.ceil(total / size);

    // Quick statistics
    const pendingCount = list.filter((x) => x.status === 1).length;
    const approvedCount = list.filter((x) => x.status === 2).length;

    return (
        <div className="pms-page">
            {/* Header */}
            <div className="pms-page-header">
                <div>
                    <h1 className="pms-page-title">Đơn Đặt Hàng Thu Mua (Ban Giám Đốc Phê Duyệt)</h1>
                    <p className="pms-page-sub">
                        Xem xét đề xuất mua sắm thuốc, thẩm định bảng so sánh báo giá nhà cung cấp và phê duyệt phát hành đơn PO chính thức.
                    </p>
                </div>
            </div>

            {/* Notifications */}
            {successMsg && (
                <div className="pms-alert pms-alert-success" style={{ marginBottom: 16 }}>
                    <span>✓ {successMsg}</span>
                    <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', float: 'right' }}
                        onClick={() => setSuccessMsg(null)}
                    >
                        ✕
                    </button>
                </div>
            )}
            {errorMsg && (
                <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{errorMsg}</span>
                    <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', float: 'right' }}
                        onClick={() => setErrorMsg(null)}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Metric Cards (Standardized) */}
            <div className="pms-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', width: '100%', marginBottom: 20 }}>
                <div className="pms-stat-card">
                    <div className="pms-stat-icon emerald">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">Tổng Số Đơn Hàng PO</div>
                        <div className="pms-stat-value" style={{ whiteSpace: 'nowrap' }}>{total}</div>
                        <div className="pms-stat-sub">Đơn đặt hàng nhà cung cấp</div>
                    </div>
                </div>
                <div className="pms-stat-card">
                    <div className="pms-stat-icon amber">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">Chờ Phê Duyệt</div>
                        <div className="pms-stat-value" style={{ whiteSpace: 'nowrap' }}>{pendingCount}</div>
                        <div className="pms-stat-sub">Cần Ban Giám Đốc duyệt</div>
                    </div>
                </div>
                <div className="pms-stat-card">
                    <div className="pms-stat-icon blue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">Đã Phê Duyệt</div>
                        <div className="pms-stat-value" style={{ whiteSpace: 'nowrap' }}>{approvedCount}</div>
                        <div className="pms-stat-sub">Sẵn sàng gửi nhà cung cấp</div>
                    </div>
                </div>
                <div className="pms-stat-card">
                    <div className="pms-stat-icon violet">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">Thẩm Quyền Ký Duyệt</div>
                        <div className="pms-stat-value" style={{ fontSize: 18, whiteSpace: 'nowrap' }}>Ban Giám Đốc</div>
                        <div className="pms-stat-sub">CEO / Giám Đốc Vận Hành</div>
                    </div>
                </div>
            </div>

            {/* Filter and Tab Bar */}
            <div className="pms-card" style={{ padding: '14px 18px', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    {/* Status Tabs */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        {STATUS_TABS.map((t) => (
                            <button
                                key={t.label}
                                className={`btn-pms ${statusTab === t.value ? 'btn-pms-primary' : 'btn-pms-secondary'}`}
                                style={{ fontSize: 13, padding: '6px 14px' }}
                                onClick={() => {
                                    setStatusTab(t.value);
                                    setPage(0);
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <input
                            type="text"
                            className="pms-input"
                            placeholder="Tìm theo mã PO, mã yêu cầu hoặc nhà cung cấp…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setPage(0);
                                    fetchOrders();
                                }
                            }}
                            style={{ width: 280 }}
                        />
                        <button
                            className="btn-pms btn-pms-primary"
                            onClick={() => {
                                setPage(0);
                                fetchOrders();
                            }}
                        >
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="pms-card" style={{ padding: 0 }}>
                <div className="pms-table-container">
                    <table className="pms-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Mã Đơn PO</th>
                                <th>Yêu Cầu Tham Chiếu</th>
                                <th>Nhà Cung Cấp</th>
                                <th style={{ textAlign: 'right' }}>Tổng Giá Trị (₫)</th>
                                <th>Trạng Thái</th>
                                <th>Ngày Lập Đơn</th>
                                <th>Người Phê Duyệt</th>
                                <th style={{ textAlign: 'center' }}>Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                                        <div className="pms-spinner" />
                                        <span style={{ display: 'block', marginTop: 10, color: '#64748b' }}>
                                            Đang tải danh sách đơn đặt hàng…
                                        </span>
                                    </td>
                                </tr>
                            ) : list.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        Không tìm thấy đơn đặt hàng thu mua nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                list.map((po, index) => {
                                    const isPending = po.status === 0 || po.status === 1;
                                    return (
                                        <tr key={po.id}>
                                            <td>{page * size + index + 1}</td>
                                            <td className="fw-700 mono" style={{ color: '#0284c7' }}>
                                                {po.code}
                                            </td>
                                            <td className="mono" style={{ fontSize: 13 }}>
                                                {po.purchaseRequestCode || '—'}
                                            </td>
                                            <td className="fw-600">{po.supplierName || '—'}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                                                {Number(po.totalAmount || 0).toLocaleString('vi-VN')}
                                                {!po.supplierQuotationCode && (
                                                    <div style={{ fontSize: 10.5, fontWeight: 600, color: '#94a3b8' }}>
                                                        tạm tính
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {getPoStatusBadge(po.status, po.statusText)}
                                            </td>
                                            <td>{formatDate(po.createdAt)}</td>
                                            <td style={{ fontSize: 13 }}>{po.approvedByUsername || '—'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    className={`btn-pms ${isPending ? 'btn-pms-primary' : 'btn-pms-secondary'}`}
                                                    style={{ fontSize: 12, padding: '4px 10px' }}
                                                    onClick={() => handleOpenDetail(po)}
                                                >
                                                    {isPending ? 'Xem xét / Phê duyệt' : 'Xem chi tiết'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Bar */}
                {totalPages > 1 && (
                    <div
                        style={{
                            padding: '12px 20px',
                            borderTop: '1px solid var(--border-color, #e2e8f0)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <span style={{ fontSize: 13, color: '#64748b' }}>
                            Hiển thị {list.length} / {total} đơn hàng
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button
                                className="btn-pms btn-pms-secondary"
                                disabled={page === 0}
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                            >
                                ← Trang trước
                            </button>
                            <span style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600 }}>
                                {page + 1} / {totalPages}
                            </span>
                            <button
                                className="btn-pms btn-pms-secondary"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Trang sau →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail & Approval Modal */}
            <PurchaseOrderDetailModal
                show={detailModalOpen}
                onHide={() => {
                    setDetailModalOpen(false);
                    setSelectedDetail(null);
                }}
                detail={selectedDetail}
                loading={detailLoading}
                onApprove={handleApprove}
                onReject={handleReject}
                actionLoading={actionLoading}
            />
        </div>
    );
}
