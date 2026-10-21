import { money } from '../../utils/format';

export default function BranchInventoryStats({ summary, loading, currentFilter, onSelectFilter }) {
    return (
        <div className="pms-stats-grid" style={{ marginBottom: 20 }}>
            {/* KPI 1: Total SKUs & Batches */}
            <div className="pms-stat-card">
                <div className="pms-stat-top">
                    <span className="pms-stat-label">Products at Counter</span>
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
                    Across <strong>{(summary?.totalBatches || 0).toLocaleString()}</strong> active batches
                </div>
            </div>

            {/* KPI 2: Total Units */}
            <div className="pms-stat-card">
                <div className="pms-stat-top">
                    <span className="pms-stat-label">Total Stock Units</span>
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
                <div className="pms-stat-sub">Physical package units in store</div>
            </div>

            {/* KPI 3: Total Stock Value */}
            <div className="pms-stat-card">
                <div className="pms-stat-top">
                    <span className="pms-stat-label">Total Inventory Value</span>
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
                <div className="pms-stat-sub">Calculated by listed retail price</div>
            </div>

            {/* KPI 4: Low Stock Warnings */}
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
                    <span className="pms-stat-label" style={{ color: 'var(--color-warning-text)' }}>Low & Out of Stock</span>
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
                    <strong>{summary?.outOfStockCount || 0}</strong> out of stock — <strong>{summary?.lowStockCount || 0}</strong> at min threshold
                </div>
            </div>

            {/* KPI 5: Expiry Alerts */}
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
                    <span className="pms-stat-label" style={{ color: 'var(--color-danger-text)' }}>Expiring & Expired</span>
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
                    <strong>{summary?.expiringSoonCount || 0}</strong> expiring soon (≤90d) — <strong>{summary?.expiredCount || 0}</strong> expired
                </div>
            </div>
        </div>
    );
}
