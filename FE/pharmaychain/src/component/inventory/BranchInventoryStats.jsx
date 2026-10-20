import { money } from '../../utils/format';

export default function BranchInventoryStats({ summary, loading, currentFilter, onSelectFilter }) {
    return (
        <div className="pms-stats-grid" style={{ marginBottom: 20 }}>
            {/* KPI 1: Tổng mặt hàng & Số lô */}
            <div className="pms-stat-card">
                <div className="pms-stat-top">
                    <span className="pms-stat-label">Mặt hàng tại quầy</span>
                    <div className="pms-stat-icon emerald">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        </svg>
                    </div>
                </div>
                <div className="pms-stat-value">
                    {loading ? '...' : (summary?.totalProducts || 0).toLocaleString()}
                </div>
                <div className="pms-stat-sub">
                    Tổng <strong>{(summary?.totalBatches || 0).toLocaleString()}</strong> lô hàng quản lý
                </div>
            </div>

            {/* KPI 2: Tổng số lượng đơn vị */}
            <div className="pms-stat-card">
                <div className="pms-stat-top">
                    <span className="pms-stat-label">Tổng lượng thuốc</span>
                    <div className="pms-stat-icon blue">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                    </div>
                </div>
                <div className="pms-stat-value" style={{ color: 'var(--color-info)' }}>
                    {loading ? '...' : (summary?.totalUnits || 0).toLocaleString()}
                </div>
                <div className="pms-stat-sub">Đơn vị đóng gói thực tế</div>
            </div>

            {/* KPI 3: Tổng giá trị tồn */}
            <div className="pms-stat-card">
                <div className="pms-stat-top">
                    <span className="pms-stat-label">Tổng giá trị tồn kho</span>
                    <div className="pms-stat-icon violet">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                </div>
                <div className="pms-stat-value" style={{ fontSize: 22, color: 'var(--text-primary)' }}>
                    {loading ? '...' : money(summary?.totalInventoryValue || 0)}
                </div>
                <div className="pms-stat-sub">Tính theo đơn giá bán niêm yết</div>
            </div>

            {/* KPI 4: Cảnh báo sắp hết hàng */}
            <div
                className="pms-stat-card"
                onClick={() => onSelectFilter('LOW_STOCK')}
                style={{
                    cursor: 'pointer',
                    borderColor: currentFilter === 'LOW_STOCK' ? 'var(--color-warning)' : 'var(--border-color)',
                    background: currentFilter === 'LOW_STOCK' ? 'var(--color-warning-bg)' : 'var(--bg-card)'
                }}
            >
                <div className="pms-stat-top">
                    <span className="pms-stat-label" style={{ color: 'var(--color-warning-text)' }}>Sắp hết & Hết hàng</span>
                    <div className="pms-stat-icon amber">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                </div>
                <div className="pms-stat-value" style={{ color: 'var(--color-warning)' }}>
                    {loading ? '...' : ((summary?.lowStockCount || 0) + (summary?.outOfStockCount || 0))}
                </div>
                <div className="pms-stat-sub">
                    <strong>{summary?.outOfStockCount || 0}</strong> hết hẳn — <strong>{summary?.lowStockCount || 0}</strong> chạm ngưỡng min
                </div>
            </div>

            {/* KPI 5: Cảnh báo hạn dùng */}
            <div
                className="pms-stat-card"
                onClick={() => onSelectFilter('EXPIRING_SOON')}
                style={{
                    cursor: 'pointer',
                    borderColor: currentFilter === 'EXPIRING_SOON' ? 'var(--color-danger)' : 'var(--border-color)',
                    background: currentFilter === 'EXPIRING_SOON' ? 'var(--color-danger-bg)' : 'var(--bg-card)'
                }}
            >
                <div className="pms-stat-top">
                    <span className="pms-stat-label" style={{ color: 'var(--color-danger-text)' }}>Cận date & Quá hạn</span>
                    <div className="pms-stat-icon red">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                </div>
                <div className="pms-stat-value" style={{ color: 'var(--color-danger)' }}>
                    {loading ? '...' : ((summary?.expiringSoonCount || 0) + (summary?.expiredCount || 0))}
                </div>
                <div className="pms-stat-sub">
                    <strong>{summary?.expiringSoonCount || 0}</strong> cận hạn $\le$ 90 ngày — <strong>{summary?.expiredCount || 0}</strong> hết hạn
                </div>
            </div>
        </div>
    );
}
