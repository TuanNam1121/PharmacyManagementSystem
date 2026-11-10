import React, { use, useEffect, useState } from 'react';
import { useInventoryAudit } from '../../hooks/inventory/useInventoryAudit';
import RequestAuditModal from '../../component/inventory/RequestAuditModal';
import ApproveRequestModal from '../../component/inventory/ApproveRequestModal';
import AuditCountingModal from '../../component/inventory/AuditCountingModal';
import ReviewAuditModal from '../../component/inventory/ReviewAuditModal';
import { useAuth } from '../../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { getAuthorizedStores } from '../../api/StoreAPI';

// ── Cấu hình trạng thái kiểm kê ─────────────────────────────────────────────
const STATUS_CONFIG = {
    0: { label: 'Chờ Quản Lý Duyệt', cls: 'pms-badge pms-badge-warning' },
    1: { label: 'Đang Thực Hiện Đếm', cls: 'pms-badge pms-badge-info' },
    2: { label: 'Chờ Đối Soát Chênh Lệch', cls: 'pms-badge pms-badge-primary' },
    3: { label: 'Đã Xác Nhận & Cân Bằng', cls: 'pms-badge pms-badge-success' },
    4: { label: 'Từ Chối / Kiểm Đếm Lại', cls: 'pms-badge pms-badge-danger' },
};

function StatusBadge({ status }) {
    const s = STATUS_CONFIG[status] ?? { label: 'Không xác định', cls: 'pms-badge' };
    return <span className={s.cls}>{s.label}</span>;
}

// ── Modal chi tiết phiên kiểm kê ───────────────────────────────────────────────
function DetailModal({ show, audit, loading, onHide }) {
    if (!show) return null;
    return (
        <div className="pms-modal-overlay" onClick={onHide}>
            <div className="pms-modal" style={{ maxWidth: 820 }} onClick={e => e.stopPropagation()}>
                <div className="pms-modal-header">
                    <h3 className="pms-modal-title">Chi Tiết Phiên Kiểm Kê Kho</h3>
                    <button type="button" className="pms-modal-close" onClick={onHide}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="pms-modal-body">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40 }}>Đang tải dữ liệu kiểm kê...</div>
                    ) : audit ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div><span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Mã phiên kiểm</span><br /><strong>{audit.code}</strong></div>
                                <div><span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Trạng thái</span><br /><StatusBadge status={audit.status} /></div>
                                <div><span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Ngày kiểm kê</span><br /><strong>{audit.auditDate ?? '—'}</strong></div>
                                <div><span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Dược sĩ đề xuất</span><br /><strong>{audit.requestedByUsername || '—'}</strong></div>
                                <div><span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Người kiểm đếm</span><br /><strong>{audit.countedByUsername || '—'}</strong></div>
                                <div><span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Người đối soát</span><br /><strong>{audit.reviewedByUsername || '—'}</strong></div>
                                {audit.reviewNote && (
                                    <div style={{ gridColumn: '1/-1' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Ghi chú / Mục đích</span><br />
                                        <strong>{audit.reviewNote}</strong>
                                    </div>
                                )}
                            </div>

                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Bảng Đối Soát Số Liệu Tồn Kho &amp; Chênh Lệch</h4>
                            {audit.details?.length > 0 ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="pms-table">
                                        <thead>
                                            <tr>
                                                <th>Tên Thuốc / Dược Phẩm</th>
                                                <th>Số Lô Thuốc</th>
                                                <th style={{ textAlign: 'right' }}>Tồn Sổ Sách</th>
                                                <th style={{ textAlign: 'right' }}>SL Thực Đếm</th>
                                                <th style={{ textAlign: 'right' }}>Chênh Lệch</th>
                                                <th>Ghi Chú Nghiệp Vụ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {audit.details.map(d => (
                                                <tr key={d.id}>
                                                    <td>{d.productName}</td>
                                                    <td><span className="pms-badge pms-badge-neutral">{d.batchNumber || 'N/A'}</span></td>
                                                    <td style={{ textAlign: 'right' }}>{d.systemQuantity}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{d.countedQuantity ?? 'Chờ đếm'}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 700, color: d.variance > 0 ? 'var(--success)' : d.variance < 0 ? 'var(--danger)' : undefined }}>
                                                        {d.variance != null ? (d.variance > 0 ? `+${d.variance}` : d.variance) : '—'}
                                                    </td>
                                                    <td>{d.note || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-secondary)' }}>Không có sản phẩm nào trong phiên kiểm kê này.</p>
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
export default function InventoryAuditPage() {
    const {
        auditList, total, page, setPage, size,

        search, setSearch,
        storeId,
        statusFilter, setStatusFilter,
        listLoading,
        selectedAudit,
        detailModalOpen, setDetailModalOpen,
        detailLoading,
        openDetail,
        // Modals
        requestModalOpen, setRequestModalOpen,
        handleRequestAudit,
        approveModalOpen, setApproveModalOpen,
        openApproveModal,
        handleApproveRequest,
        countModalOpen, setCountModalOpen,
        openCountModal,
        handleSubmitCount,
        reviewModalOpen, setReviewModalOpen,
        openReviewModal,
        handleFinalReview,
        submitting,
        error, setError,
        successMsg, setSuccessMsg,
        fetchList,
    } = useInventoryAudit();


    const STATUS_TABS = [
        { value: '', label: 'Tất cả phiên' },
        { value: '0', label: 'Chờ duyệt' },
        { value: '1', label: 'Đang đếm' },
        { value: '2', label: 'Chờ đối soát' },
        { value: '3', label: 'Đã hoàn tất' },
        { value: '4', label: 'Từ chối' },
    ];


    const { user } = useAuth();

    const rawRole = (user?.role || '').toUpperCase().replace(/^ROLE_/, '').trim();

    // Chỉ Admin và Quản lý cửa hàng mới được duyệt / đối soát
    const canApprove = ['ADMIN', 'STORE_MANAGER'].includes(rawRole);

    const appearAuditSession = ['PHARMACIST'].includes(rawRole);

    return (
        <div>
            {/* ── Page Header ── */}
            <div className="pms-page-header">
                <div>
                    <h1 className="pms-page-title">Kiểm Kê Kho Định Kỳ &amp; Cân Bằng Tồn</h1>
                    <p className="pms-page-sub">
                        Quy trình lập đề xuất kiểm kê, phê duyệt, đếm thực tế tại kệ và đối soát chênh lệch tồn kho GSP.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={fetchList} title="Làm mới">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        Làm mới
                    </button>
                    {/* Pharmacist Action Button */}
                    <button
                        type="button"
                        className="btn-pms btn-pms-primary"
                        onClick={() => setRequestModalOpen(true)}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Đề Xuất Phiên Kiểm Kê
                    </button>
                </div>
            </div>

            {/* ── Alerts ── */}
            {successMsg && (
                <div className="pms-alert pms-alert-success" style={{ marginBottom: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {successMsg}
                    <button type="button" className="pms-alert-close" onClick={() => setSuccessMsg(null)}>×</button>
                </div>
            )}
            {error && (
                <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                    {error}
                    <button type="button" className="pms-alert-close" onClick={() => setError(null)}>×</button>
                </div>
            )}

            {/* ── KPI Stats Cards — Chuẩn chung đồng bộ ── */}
            <div className="pms-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
                <div className="pms-stat-card">
                    <div className="pms-stat-icon emerald">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">TỔNG PHIÊN KIỂM KÊ</div>
                        <div className="pms-stat-value">{total}</div>
                        <div className="pms-stat-sub">phiên kiểm kê tại chi nhánh</div>
                    </div>
                </div>

                <div className="pms-stat-card">
                    <div className="pms-stat-icon blue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">ĐANG KIỂM ĐẾM THỰC TẾ</div>
                        <div className="pms-stat-value">{auditList.filter(x => x.status === 1).length}</div>
                        <div className="pms-stat-sub">dược sĩ đang kiểm đếm tại kệ</div>
                    </div>
                </div>

                <div className="pms-stat-card">
                    <div className="pms-stat-icon amber">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">CHỜ QUẢN LÝ ĐỐI SOÁT</div>
                        <div className="pms-stat-value">{auditList.filter(x => x.status === 2).length}</div>
                        <div className="pms-stat-sub">đã gửi số liệu đếm thực tế</div>
                    </div>
                </div>

                <div className="pms-stat-card">
                    <div className="pms-stat-icon emerald">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">ĐÃ HOÀN TẤT &amp; CÂN BẰNG</div>
                        <div className="pms-stat-value">{auditList.filter(x => x.status === 3).length}</div>
                        <div className="pms-stat-sub">đã cân bằng khớp tồn sổ sách</div>
                    </div>
                </div>
            </div>

            {/* ── Filter Card ── */}
            <div className="pms-card" style={{ marginBottom: 20 }}>
                <div className="pms-card-body" style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, flex: 1 }}>
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
                                    title="Chi nhánh kiểm kê đang xem (đồng bộ theo Bảng điều hướng Sidebar)"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>

                                    {user ? `${user.storeName}` : 'Nhà thuốc chi nhánh'}
                                    {/* {String(storeId) === '3' ? 'Chi nhánh 01 - Cầu Giấy (ST01)' : String(storeId) === '4' ? 'Chi nhánh 02 - Đống Đa (ST02)' : 'Theo phân quyền'} */}

                                </span>
                            </div>

                            <div className="pms-input-wrap" style={{ flex: 1, minWidth: 240 }}>
                                <input
                                    type="text"
                                    className="pms-input"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(0); }}
                                    placeholder="Tìm theo mã phiên kiểm kê..."
                                />
                            </div>
                        </div>

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

            {/* ── Audit Table ── */}
            <div className="pms-card">
                <div className="pms-card-body" style={{ padding: 0 }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="pms-table">
                            <thead>
                                <tr>
                                    <th>Mã Phiên Kiểm</th>
                                    <th>Chi Nhánh / Kho</th>
                                    <th>Ngày Kiểm Kê</th>
                                    <th>Trạng Thái</th>
                                    <th>Người Đề Xuất</th>
                                    <th>Ngày Tạo</th>
                                    <th style={{ textAlign: 'center' }}>Thao Tác Nghiệp Vụ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listLoading ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>Đang tải danh sách kiểm kê...</td>
                                    </tr>
                                ) : auditList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                            Không tìm thấy phiên kiểm kê nào.
                                        </td>
                                    </tr>
                                ) : (
                                    auditList.map(item => (
                                        <tr key={item.id}>
                                            <td style={{ fontWeight: 600 }}>{item.code}</td>
                                            <td>{item.storeName || 'Chi nhánh nhà thuốc'}</td>
                                            <td>{item.auditDate || '—'}</td>
                                            <td><StatusBadge status={item.status} /></td>
                                            <td>{item.requestedByUsername || 'Dược sĩ'}</td>
                                            <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                    {/* View Detail button */}
                                                    <button
                                                        type="button"
                                                        className="btn-pms btn-pms-secondary btn-pms-sm"
                                                        onClick={() => openDetail(item)}
                                                    >
                                                        Chi tiết
                                                    </button>

                                                    {/* STEP 2: Store Manager approves opening request */}
                                                    {canApprove && item.status === 0 && (
                                                        <button
                                                            type="button"
                                                            className="btn-pms btn-pms-warning btn-pms-sm"
                                                            onClick={() => openApproveModal(item)}
                                                            title="Quản lý duyệt mở phiên đếm"
                                                        >
                                                            Phê duyệt
                                                        </button>
                                                    )}

                                                    {/* STEP 3: Pharmacist can ONLY count if Manager approved (status 1) */}
                                                    {item.status === 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn-pms btn-pms-primary btn-pms-sm"
                                                            onClick={() => openCountModal(item)}
                                                            title="Dược sĩ nhập số đếm thực tế"
                                                        >
                                                            Nhập số đếm
                                                        </button>
                                                    )}

                                                    {/* STEP 4: Store Manager final confirmation & variance check */}
                                                    {canApprove && item.status === 2 && (
                                                        <button
                                                            type="button"
                                                            className="btn-pms btn-pms-success btn-pms-sm"
                                                            onClick={() => openReviewModal(item)}
                                                            title="Quản lý đối soát & cân bằng kho"
                                                        >
                                                            Đối soát
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Modals ── */}
            <RequestAuditModal
                show={requestModalOpen}
                defaultStoreId={storeId}
                onHide={() => setRequestModalOpen(false)}
                onConfirm={handleRequestAudit}
                submitting={submitting}
            />

            <ApproveRequestModal
                show={approveModalOpen}
                audit={selectedAudit}
                onHide={() => setApproveModalOpen(false)}
                onConfirm={handleApproveRequest}
                submitting={submitting}
            />

            <AuditCountingModal
                show={countModalOpen}
                audit={selectedAudit}
                onHide={() => setCountModalOpen(false)}
                onSubmitCount={handleSubmitCount}
                submitting={submitting}
            />

            <DetailModal
                show={detailModalOpen}
                audit={selectedAudit}
                loading={detailLoading}
                onHide={() => setDetailModalOpen(false)}
            />

            <ReviewAuditModal
                show={reviewModalOpen}
                audit={selectedAudit}
                loading={detailLoading}
                onHide={() => setReviewModalOpen(false)}
                onConfirm={handleFinalReview}
                submitting={submitting}
            />
        </div>
    );
}
