import React from 'react';
import { useStockRequisition } from '../../hooks/inventory/useStockRequisition';
import CreateRequisitionModal from '../../component/inventory/CreateRequisitionModal';

// ── Cấu hình trạng thái tiếng Việt chuẩn FSM ─────────────────────────────────────────────
const STATUS_MAP = {
    0: { label: 'Bản nháp', cls: 'pms-badge pms-badge-neutral' },
    1: { label: 'Chờ xét duyệt', cls: 'pms-badge pms-badge-warning' },
    2: { label: 'Đã phê duyệt', cls: 'pms-badge pms-badge-info' },
    3: { label: 'Đã từ chối', cls: 'pms-badge pms-badge-danger' },
    4: { label: 'Đã xuất kho / Đang giao', cls: 'pms-badge pms-badge-info' },
    5: { label: 'Đã nhận hàng', cls: 'pms-badge pms-badge-success' },
    6: { label: 'Đã hủy', cls: 'pms-badge pms-badge-neutral' },
};

function StatusBadge({ status }) {
    const s = STATUS_MAP[status] ?? { label: 'Không xác định', cls: 'pms-badge pms-badge-neutral' };
    return <span className={s.cls}>{s.label}</span>;
}

// ── Tiến trình xử lý yêu cầu điều chuyển ───────────────────────────────────────
function RequisitionTimeline({ item }) {
    const steps = [
        { label: 'Tạo yêu cầu', time: item.createdAt, done: true },
        { label: 'Phê duyệt', time: item.approvedAt, done: item.status >= 2 && item.status !== 3 && item.status !== 6 },
        { label: 'Kho tổng xuất hàng', time: item.dispatchedAt, done: item.status === 4 || item.status === 5 },
        { label: 'Chi nhánh đã nhận', time: item.receivedAt, done: item.status === 5 },
    ];

    const fmt = (dt) => dt ? new Date(dt).toLocaleString('vi-VN') : '—';

    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 24, overflowX: 'auto' }}>
            {steps.map((s, i) => (
                <React.Fragment key={i}>
                    <div style={{ textAlign: 'center', minWidth: 120, flex: 1 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%', margin: '0 auto 6px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: s.done ? 'var(--brand-primary, #0284c7)' : 'var(--bg-secondary, #f1f5f9)',
                            border: `2px solid ${s.done ? 'var(--brand-primary, #0284c7)' : 'var(--border, #cbd5e1)'}`,
                            color: s.done ? '#fff' : 'var(--text-muted, #64748b)',
                            fontSize: 13, fontWeight: 700,
                        }}>
                            {s.done
                                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                : i + 1
                            }
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: s.done ? 'var(--text-primary, #0f172a)' : 'var(--text-muted, #64748b)' }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted, #64748b)', marginTop: 2 }}>{fmt(s.time)}</div>
                    </div>
                    {i < steps.length - 1 && (
                        <div style={{
                            height: 2, flex: 0.5, marginTop: 15, alignSelf: 'flex-start',
                            background: steps[i + 1].done ? 'var(--brand-primary, #0284c7)' : 'var(--border, #cbd5e1)',
                            transition: 'background 0.3s',
                        }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

// ── Modal chi tiết yêu cầu ─────────────────────────────────────────────────────
function DetailModal({ show, item, loading, onHide }) {
    if (!show) return null;
    return (
        <div className="pms-modal-overlay" onClick={onHide}>
            <div className="pms-modal" style={{ maxWidth: 820 }} onClick={e => e.stopPropagation()}>
                <div className="pms-modal-header">
                    <h3 className="pms-modal-title">Chi Tiết Yêu Cầu Điều Chuyển Hàng</h3>
                    <button type="button" className="pms-modal-close" onClick={onHide}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="pms-modal-body">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 48 }}>Đang tải thông tin...</div>
                    ) : item ? (
                        <>
                            {/* Timeline */}
                            <RequisitionTimeline item={item} />

                            {/* Info grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Mã phiếu yêu cầu</span>
                                    <div style={{ fontWeight: 700 }}>{item.code}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Chi nhánh yêu cầu</span>
                                    <div style={{ fontWeight: 600 }}>{item.storeName ?? '—'}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Trạng thái</span>
                                    <div><StatusBadge status={item.status} /></div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Người lập phiếu</span>
                                    <div style={{ fontWeight: 600 }}>{item.createdByUsername ?? '—'}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Người phê duyệt</span>
                                    <div style={{ fontWeight: 600 }}>{item.approvedByUsername ?? '—'}</div>
                                </div>
                                {item.rejectReason && (
                                    <div style={{ gridColumn: '1/-1' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Lý do từ chối</span>
                                        <div style={{ color: 'var(--danger)', fontWeight: 600 }}>{item.rejectReason}</div>
                                    </div>
                                )}
                            </div>

                            {/* Detail table */}
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Danh Sách Thuốc Yêu Cầu Cấp Phát</h4>
                            {item.details?.length > 0 ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="pms-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Tên Thuốc / Sản Phẩm</th>
                                                <th>Mã Vạch</th>
                                                <th>ĐVT</th>
                                                <th style={{ textAlign: 'right' }}>SL Yêu Cầu</th>
                                                <th style={{ textAlign: 'right' }}>SL Phê Duyệt</th>
                                                <th style={{ textAlign: 'right' }}>SL Thực Nhận</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {item.details.map((d, i) => (
                                                <tr key={d.id}>
                                                    <td>{i + 1}</td>
                                                    <td><strong>{d.productName}</strong></td>
                                                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{d.barcode ?? '—'}</td>
                                                    <td>{d.productUnit}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{d.requestedQty}</td>
                                                    <td style={{ textAlign: 'right', color: d.approvedQty != null ? 'var(--success)' : 'var(--text-muted)' }}>
                                                        {d.approvedQty ?? '—'}
                                                    </td>
                                                    <td style={{ textAlign: 'right', color: d.receivedQty != null ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                                                        {d.receivedQty ?? '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-secondary)' }}>Không có sản phẩm nào trong phiếu yêu cầu này.</p>
                            )}
                        </>
                    ) : null}
                </div>
                <div className="pms-modal-footer">
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide}>Đóng</button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function StockRequisitionsPage() {
    const {
        list, total, page, setPage, size,
        search, setSearch,
        storeId, setStoreId,
        statusFilter, setStatusFilter,
        listLoading,
        selectedItem,
        detailModalOpen, setDetailModalOpen,
        detailLoading,
        openDetail,
        createModalOpen, setCreateModalOpen,
        submitting,
        handleCreateRequisition,
        error, setError,
        successMsg, setSuccessMsg,
        fetchList,
    } = useStockRequisition();

    const totalPages = Math.ceil(total / size);

    const STATUS_TABS = [
        { value: '', label: 'Tất cả' },
        { value: '1', label: 'Chờ duyệt' },
        { value: '2', label: 'Đã duyệt' },
        { value: '4', label: 'Đang giao' },
        { value: '5', label: 'Đã nhận' },
        { value: '3', label: 'Từ chối' },
        { value: '0', label: 'Bản nháp' },
    ];

    return (
        <div>
            {/* ── Page Header ── */}
            <div className="pms-page-header">
                <div>
                    <h1 className="pms-page-title">Yêu Cầu Lĩnh Thuốc Chi Nhánh</h1>
                    <p className="pms-page-sub">
                        Quản lý phiếu xin cấp phát thuốc từ chi nhánh gửi lên Kho Tổng Trung Tâm theo quy chuẩn GSP.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={fetchList} title="Làm mới">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        Làm mới
                    </button>
                    <button
                        type="button"
                        className="btn-pms btn-pms-primary"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Tạo Yêu Cầu Lĩnh Thuốc
                    </button>
                </div>
            </div>

            {/* ── Error alert ── */}
            {error && (
                <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                    <button type="button" className="pms-alert-close" onClick={() => setError(null)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            )}

            {/* ── KPI Stats Cards — Chuẩn chung đồng bộ FSM ── */}
            <div className="pms-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
                <div className="pms-stat-card">
                    <div className="pms-stat-icon blue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">CHỜ BAN QUẢN LÝ DUYỆT</div>
                        <div className="pms-stat-value">{list.filter(x => x.status === 1).length}</div>
                        <div className="pms-stat-sub">phiếu đang chờ kho tổng phê duyệt</div>
                    </div>
                </div>

                <div className="pms-stat-card">
                    <div className="pms-stat-icon emerald">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">KHO TỔNG ĐÃ PHÊ DUYỆT</div>
                        <div className="pms-stat-value">{list.filter(x => x.status === 2).length}</div>
                        <div className="pms-stat-sub">đã duyệt, sẵn sàng xuất kho</div>
                    </div>
                </div>

                <div className="pms-stat-card">
                    <div className="pms-stat-icon amber">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="1" y="3" width="15" height="13" />
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                            <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">ĐÃ XUẤT KHO / ĐANG GIAO</div>
                        <div className="pms-stat-value">{list.filter(x => x.status === 4).length}</div>
                        <div className="pms-stat-sub">kho tổng đã xuất, đang vận chuyển</div>
                    </div>
                </div>

                <div className="pms-stat-card">
                    <div className="pms-stat-icon emerald">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">ĐÃ NHẬP KHO CHI NHÁNH</div>
                        <div className="pms-stat-value">{list.filter(x => x.status === 5).length}</div>
                        <div className="pms-stat-sub">chi nhánh đã kiểm nhận hoàn tất</div>
                    </div>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="pms-card" style={{ marginBottom: 20 }}>
                <div className="pms-card-body" style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
                        {/* Branch Indicator Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Chi nhánh:</span>
                            <span
                                className="pms-badge pms-badge-neutral"
                                style={{
                                    fontSize: 12,
                                    padding: '5px 12px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    background: '#f1f5f9',
                                    color: '#0f172a',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 6,
                                    fontWeight: 600,
                                }}
                                title="Chi nhánh yêu cầu đang xem (đồng bộ theo Bảng điều hướng Sidebar)"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                {String(storeId) === '3' ? 'Chi nhánh 01 - Cầu Giấy (ST01)' : String(storeId) === '4' ? 'Chi nhánh 02 - Đống Đa (ST02)' : 'Theo phân quyền'}
                            </span>
                        </div>

                        {/* Search */}
                        <div className="pms-input-wrap" style={{ flex: 1, minWidth: 240 }}>
                            <span className="pms-input-icon">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                className="pms-input"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(0); }}
                                placeholder="Tìm theo mã yêu cầu điều chuyển..."
                            />
                        </div>

                        {/* Status tabs */}
                        <div className="pms-tabs" style={{ margin: 0 }}>
                            {STATUS_TABS.map(tab => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    className={`pms-tab ${statusFilter === tab.value ? 'active' : ''}`}
                                    onClick={() => { setStatusFilter(tab.value); setPage(0); }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="pms-card">
                <div className="pms-card-body" style={{ padding: 0 }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="pms-table">
                            <thead>
                                <tr>
                                    <th>Mã Yêu Cầu</th>
                                    <th>Chi Nhánh</th>
                                    <th>Người Lập</th>
                                    <th>Trạng Thái</th>
                                    <th>Ngày Tạo</th>
                                    <th>Ngày Duyệt</th>
                                    <th>Ngày Xuất Kho</th>
                                    <th>Ngày Nhận Hàng</th>
                                    <th style={{ textAlign: 'center' }}>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listLoading ? (
                                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40 }}>Đang tải danh sách...</td></tr>
                                ) : list.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
                                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 8px', opacity: 0.4 }}>
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                            Không tìm thấy yêu cầu điều chuyển nào
                                        </td>
                                    </tr>
                                ) : list.map(item => (
                                    <tr key={item.id}>
                                        <td><strong>{item.code}</strong></td>
                                        <td>{item.storeName ?? '—'}</td>
                                        <td>{item.createdByUsername ?? '—'}</td>
                                        <td><StatusBadge status={item.status} /></td>
                                        <td style={{ fontSize: 13 }}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                                        <td style={{ fontSize: 13 }}>{item.approvedAt ? new Date(item.approvedAt).toLocaleDateString('vi-VN') : '—'}</td>
                                        <td style={{ fontSize: 13 }}>{item.dispatchedAt ? new Date(item.dispatchedAt).toLocaleDateString('vi-VN') : '—'}</td>
                                        <td style={{ fontSize: 13 }}>{item.receivedAt ? new Date(item.receivedAt).toLocaleDateString('vi-VN') : '—'}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                type="button"
                                                className="btn-pms btn-pms-secondary"
                                                style={{ padding: '4px 12px', fontSize: 12 }}
                                                onClick={() => openDetail(item)}
                                            >
                                                Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                Hiển thị {list.length} / {total} yêu cầu
                            </span>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button type="button" className="btn-pms btn-pms-secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                                    ← Trang trước
                                </button>
                                <span style={{ padding: '4px 10px', fontSize: 13 }}>Trang {page + 1}/{totalPages}</span>
                                <button type="button" className="btn-pms btn-pms-secondary" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                                    Trang sau →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Detail Modal ── */}
            <DetailModal
                show={detailModalOpen}
                item={selectedItem}
                loading={detailLoading}
                onHide={() => setDetailModalOpen(false)}
            />

            <CreateRequisitionModal
                show={createModalOpen}
                onHide={() => setCreateModalOpen(false)}
                defaultStoreId={storeId || 3}
                onConfirm={handleCreateRequisition}
                submitting={submitting}
            />
        </div>
    );
}
