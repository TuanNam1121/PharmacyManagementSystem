import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDailySales } from '../../hooks/sales/useDailySales';
import DailySalesStats from '../../component/sales/DailySalesStats';
import DailySalesInvoicesTable from '../../component/sales/DailySalesInvoicesTable';
import DailySalesShiftsTable from '../../component/sales/DailySalesShiftsTable';
import DailySalesReconcileModal from '../../component/sales/DailySalesReconcileModal';
import { money, formatDate, formatDateTime, getLocalDateStr } from '../../utils/format';
import { getAuthorizedStores } from '../../api/StoreAPI';

export default function DailySalesPage({ defaultTab = 'overview' }) {
    const [searchParams] = useSearchParams();
    const [storeList, setStoreList] = useState([]);
    const {
        storeId,
        setStoreId,
        date,
        setDate,
        activeTab,
        setActiveTab,
        overview,
        overviewLoading,
        invoices,
        invPage,
        setInvPage,
        invSize,
        invTotal,
        invLoading,
        shifts,
        shiftsLoading,
        reconcileModalOpen,
        setReconcileModalOpen,
        reconciling,
        error,
        setError,
        successMsg,
        setSuccessMsg,
        reloadAll,
        handleReconcile,
    } = useDailySales({ initialTab: defaultTab });

    const { user } = useAuth();
    const rawRole = (user?.role || '').toUpperCase().replace(/^ROLE_/, '').trim();
    const isChainManager = rawRole === 'ADMIN' || rawRole === 'GENERAL_MANAGER' || user?.roleId === 1;

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/shifts') {
            setActiveTab('shifts');
        } else if (location.pathname === '/sales' && defaultTab === 'invoices') {
            setActiveTab((prev) => (prev === 'overview' ? 'overview' : 'invoices'));
        }
    }, [location.pathname, defaultTab, setActiveTab]);

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    useEffect(() => {
        getAuthorizedStores().then((data) => {
            if (data && data.length > 0) {
                setStoreList(data);
                const paramStoreId = searchParams.get('storeId');
                if (paramStoreId) {
                    setStoreId(paramStoreId);
                } else if (!storeId || !data.some(s => String(s.id) === String(storeId))) {
                    setStoreId(data[0].id);
                }
            }
        });
    }, [searchParams]);

    const isReconciled = overview?.status === 1;
    const activeStoreObj = storeList.find((s) => String(s.id) === String(storeId)) || storeList[0];

    return (
        <div>
            {/* ── Page Header ── */}
            <div className="pms-page-header" style={{ marginBottom: 16 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h1 className="pms-page-title" style={{ margin: 0 }}>Báo Cáo Doanh Thu &amp; Đối Soát Bán Hàng Hàng Ngày</h1>
                        <span className="pms-badge pms-badge-info" style={{ fontSize: 11 }}>Cửa Hàng Trưởng</span>
                        {activeStoreObj && (
                            <span
                                className="pms-badge pms-badge-neutral"
                                style={{
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                {activeStoreObj.name} ({activeStoreObj.code})
                            </span>
                        )}
                    </div>
                    <p className="pms-page-sub">
                        Theo dõi doanh thu bán hàng theo thời gian thực, đối soát doanh số và tiền mặt của các ca làm việc, chốt sổ bán hàng hàng ngày.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={reloadAll} title="Làm mới dữ liệu">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        Làm mới
                    </button>

                    <button
                        type="button"
                        className={`btn-pms ${isReconciled ? 'btn-pms-secondary' : 'btn-pms-primary'}`}
                        onClick={() => setReconcileModalOpen(true)}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        {isReconciled ? 'Cập nhật đối soát' : 'Đối soát & Chốt sổ ca'}
                    </button>
                </div>
            </div>

            {/* ── Filters & Selectors Bar ── */}
            <div className="pms-card" style={{ marginBottom: 20 }}>
                <div className="pms-card-body" style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            {/* Branch Selector for Multi-Store Managers (Admin/GM) */}
                            {isChainManager && storeList.length > 1 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Chi nhánh:</label>
                                    <select
                                        className="pms-select"
                                        style={{ width: 'auto', minWidth: 220, fontSize: 12.5, height: 36 }}
                                        value={storeId}
                                        onChange={(e) => setStoreId(e.target.value)}
                                        title="Chọn chi nhánh đối soát doanh thu"
                                    >
                                        {storeList.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.code} — {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Date Picker */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Ngày kinh doanh:</label>
                                <input
                                    type="date"
                                    className="pms-input pms-input-bare"
                                    style={{ width: 'auto' }}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className={`btn-pms ${date === getLocalDateStr() ? 'btn-pms-primary' : 'btn-pms-secondary'}`}
                                    style={{ fontSize: 12, padding: '4px 10px', height: 36 }}
                                    onClick={() => setDate(getLocalDateStr())}
                                    title="Xem ngày hôm nay"
                                >
                                    Hôm nay
                                </button>
                            </div>
                        </div>

                        {/* Reconcile Info Badge */}
                        {isReconciled && (
                            <div style={{ fontSize: 12.5, color: 'var(--color-success-text)', background: 'var(--color-success-bg)', padding: '6px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #a7f3d0' }}>
                                <span>✓ Đã đối soát bởi: <strong>{overview?.reconciledByName || 'Cửa Hàng Trưởng'}</strong></span>
                                {overview?.reconciledAt && <span>vào lúc {formatDateTime(overview.reconciledAt)}</span>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Alerts ── */}
            {successMsg && (
                <div className="pms-alert pms-alert-success" style={{ marginBottom: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {successMsg}
                    <button type="button" className="pms-alert-close" onClick={() => setSuccessMsg(null)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            )}

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

            {/* ── Stats Grid ── */}
            <DailySalesStats overview={overview} loading={overviewLoading} />

            {/* ── Tabs Navigation ── */}
            <div className="pms-tabs">
                <button
                    type="button"
                    className={`pms-tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => handleTabChange('overview')}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Tổng Quan & Đối Soát
                </button>
                <button
                    type="button"
                    className={`pms-tab ${activeTab === 'invoices' ? 'active' : ''}`}
                    onClick={() => handleTabChange('invoices')}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Hóa Đơn Bán Hàng ({invTotal})
                </button>
                <button
                    type="button"
                    className={`pms-tab ${activeTab === 'shifts' ? 'active' : ''}`}
                    onClick={() => handleTabChange('shifts')}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Ca Làm Việc Thu Ngân ({shifts?.length || 0})
                </button>
            </div>

            {/* ── Tab Content ── */}
            {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
                    {/* Left Column: Breakdown */}
                    <div className="pms-card">
                        <div className="pms-card-header">
                            <div>
                                <div className="pms-card-title">Đối Soát Doanh Thu Theo Phương Thức Thanh Toán</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                    So sánh số liệu ghi nhận trên hệ thống POS với số tiền mặt thực tế kiểm đếm
                                </div>
                            </div>
                        </div>
                        <div className="pms-card-body" style={{ padding: 0 }}>
                            <table className="pms-table">
                                <thead>
                                    <tr>
                                        <th>Phương Thức</th>
                                        <th style={{ textAlign: 'right' }}>Hệ Thống Ghi Nhận</th>
                                        <th style={{ textAlign: 'right' }}>Thực Tế Kiểm Đếm</th>
                                        <th style={{ textAlign: 'right' }}>Chênh Lệch</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Tiền mặt tại két</strong></td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{money(overview?.systemCash || 0)}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-primary-dark)' }}>
                                             {money(overview?.actualCash ?? overview?.systemCash ?? 0)}
                                        </td>
                                        <td style={{
                                            textAlign: 'right',
                                            fontWeight: 700,
                                            color: (overview?.difference || 0) === 0 ? 'var(--color-success)' : 'var(--color-danger)'
                                        }}>
                                            {money(overview?.difference || 0)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>Chuyển khoản ngân hàng</strong></td>
                                        <td style={{ textAlign: 'right' }}>{money(overview?.systemBank || 0)}</td>
                                        <td style={{ textAlign: 'right' }}>{money(overview?.systemBank || 0)}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--color-success)' }}>0 ₫</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Ví điện tử (VNPay/MoMo)</strong></td>
                                        <td style={{ textAlign: 'right' }}>{money(overview?.systemVnpay || 0)}</td>
                                        <td style={{ textAlign: 'right' }}>{money(overview?.systemVnpay || 0)}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--color-success)' }}>0 ₫</td>
                                    </tr>
                                    <tr style={{ background: 'var(--bg-canvas)' }}>
                                        <td><strong style={{ fontSize: 13.5 }}>TỔNG CỘNG</strong></td>
                                        <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--brand-primary)' }}>
                                            {money(overview?.systemTotal || 0)}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--brand-primary)' }}>
                                            {money((overview?.systemTotal || 0) + (overview?.difference || 0))}
                                        </td>
                                        <td style={{
                                            textAlign: 'right',
                                            fontWeight: 800,
                                            color: (overview?.difference || 0) === 0 ? 'var(--color-success)' : 'var(--color-danger)'
                                        }}>
                                            {money(overview?.difference || 0)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {overview?.note && (
                                <div style={{ padding: '14px 20px', background: 'var(--bg-canvas)', borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Ghi chú đối soát: </span>
                                    <span>{overview.note}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Actions & Audit Trail */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="pms-card">
                            <div className="pms-card-header">
                                <div className="pms-card-title">Hành Động Quản Lý</div>
                            </div>
                            <div className="pms-card-body">
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                                    Vào cuối ngày làm việc hoặc sau khi nhận bàn giao két thu ngân, đếm tiền mặt thực tế và xác nhận chốt sổ đối soát.
                                </p>
                                <button
                                    type="button"
                                    className="btn-pms btn-pms-primary"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                    onClick={() => setReconcileModalOpen(true)}
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                    {isReconciled ? 'Chỉnh Sửa / Cập Nhật Đối Soát' : 'Tiến Hành Đối Soát Tiền Mặt'}
                                </button>
                            </div>
                        </div>

                        <div className="pms-card">
                            <div className="pms-card-header" style={{ background: 'var(--bg-canvas)' }}>
                                <div className="pms-card-title">Nhật Ký Đối Soát</div>
                            </div>
                            <div className="pms-card-body" style={{ background: 'var(--bg-canvas)' }}>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Trạng thái:</span>
                                        <span className={`pms-badge ${isReconciled ? 'pms-badge-success' : 'pms-badge-warning'}`}>
                                            {isReconciled ? 'Đã đối soát' : 'Chờ kiểm đếm'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Người đối soát:</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{overview?.reconciledByName || 'Chưa đối soát'}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Thời điểm:</span>
                                        <strong>{overview?.reconciledAt ? formatDate(overview.reconciledAt) : 'N/A'}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'invoices' && (
                <DailySalesInvoicesTable
                    invoices={invoices}
                    loading={invLoading}
                    total={invTotal}
                    page={invPage}
                    size={invSize}
                    onPage={setInvPage}
                    onRefresh={reloadAll}
                />
            )}

            {activeTab === 'shifts' && (
                <DailySalesShiftsTable
                    shifts={shifts}
                    loading={shiftsLoading}
                />
            )}

            {/* ── Reconcile Modal ── */}
            <DailySalesReconcileModal
                show={reconcileModalOpen}
                onHide={() => setReconcileModalOpen(false)}
                overview={overview}
                date={date}
                onConfirm={handleReconcile}
                submitting={reconciling}
            />
        </div>
    );
}
