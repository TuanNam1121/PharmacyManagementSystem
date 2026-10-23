import React, { useState, useEffect, useCallback } from 'react';
import { formatDate } from '../../utils/format';
import {
    getPurchaseOrders,
    getPurchaseOrderDetail,
    approvePurchaseOrder,
    rejectPurchaseOrder,
} from '../../api/PurchaseOrderAPI';
import PurchaseOrderDetailModal from '../../component/procurement/PurchaseOrderDetailModal';

const STATUS_TABS = [
    { label: 'All Orders', value: '' },
    { label: 'Pending Approval', value: 1 },
    { label: 'Approved', value: 2 },
    { label: 'Rejected', value: 3 },
    { label: 'Completed', value: 5 },
];

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
            setErrorMsg(err?.message || 'Failed to load purchase orders.');
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
            setErrorMsg(err?.message || 'Failed to load purchase order details.');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleApprove = async (id, note) => {
        setActionLoading(true);
        setErrorMsg(null);
        try {
            const res = await approvePurchaseOrder(id, { actionByUsername: 'admin', reason: note });
            setSuccessMsg(`Purchase Order ${res?.code || ''} approved successfully!`);
            setSelectedDetail(res);
            await fetchOrders();
        } catch (err) {
            setErrorMsg(err?.message || 'Failed to approve purchase order.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id, reason) => {
        setActionLoading(true);
        setErrorMsg(null);
        try {
            const res = await rejectPurchaseOrder(id, { actionByUsername: 'admin', reason });
            setSuccessMsg(`Purchase Order ${res?.code || ''} was rejected.`);
            setSelectedDetail(res);
            await fetchOrders();
        } catch (err) {
            setErrorMsg(err?.message || 'Failed to reject purchase order.');
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
                    <h1 className="pms-page-title">Purchase Orders (General Manager Review)</h1>
                    <p className="pms-page-sub">
                        Review incoming supplier purchase proposals, inspect line-item quotations, and authorize procurement execution.
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
                    <span>⚠️ {errorMsg}</span>
                    <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', float: 'right' }}
                        onClick={() => setErrorMsg(null)}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                <div className="pms-card" style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Purchase Orders</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{total}</div>
                </div>
                <div className="pms-card" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600 }}>Pending Approval (Current View)</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706', marginTop: 4 }}>{pendingCount}</div>
                </div>
                <div className="pms-card" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontSize: 12, color: '#047857', fontWeight: 600 }}>Approved Orders</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#059669', marginTop: 4 }}>{approvedCount}</div>
                </div>
                <div className="pms-card" style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Role Context</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#2563eb', marginTop: 8 }}>
                        General Manager (Authorized)
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
                            placeholder="Search by PO code, PR, or supplier…"
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
                            Search
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
                                <th>PO Code</th>
                                <th>PR Reference</th>
                                <th>Supplier Name</th>
                                <th style={{ textAlign: 'right' }}>Total Amount (₫)</th>
                                <th>Status</th>
                                <th>Created Date</th>
                                <th>Approved By</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                                        <div className="pms-spinner" />
                                        <span style={{ display: 'block', marginTop: 10, color: '#64748b' }}>
                                            Loading Purchase Orders…
                                        </span>
                                    </td>
                                </tr>
                            ) : list.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No purchase orders found matching your criteria.
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
                                            </td>
                                            <td>
                                                <span
                                                    className={`pms-badge ${po.status === 1
                                                            ? 'pms-badge-warning'
                                                            : po.status === 2 || po.status === 5
                                                                ? 'pms-badge-success'
                                                                : po.status === 3
                                                                    ? 'pms-badge-danger'
                                                                    : 'pms-badge-neutral'
                                                        }`}
                                                >
                                                    {po.statusText}
                                                </span>
                                            </td>
                                            <td>{formatDate(po.createdAt)}</td>
                                            <td style={{ fontSize: 13 }}>{po.approvedByUsername || '—'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    className={`btn-pms ${isPending ? 'btn-pms-primary' : 'btn-pms-secondary'}`}
                                                    style={{ fontSize: 12, padding: '4px 10px' }}
                                                    onClick={() => handleOpenDetail(po)}
                                                >
                                                    {isPending ? 'Review / Approve' : 'View Details'}
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
                            Showing {list.length} of {total} orders
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button
                                className="btn-pms btn-pms-secondary"
                                disabled={page === 0}
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                            >
                                Previous
                            </button>
                            <span style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600 }}>
                                {page + 1} / {totalPages}
                            </span>
                            <button
                                className="btn-pms btn-pms-secondary"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
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
