import { money } from '../../utils/format';

export default function BranchInventoryStats({ summary, loading, currentFilter, onSelectFilter }) {
    const stats = [
        {
            label: 'Mặt Hàng Tại Quầy (SKU)',
            value: loading ? '...' : (summary?.totalProducts || 0).toLocaleString('vi-VN'),
            iconColor: 'emerald',
            sub: `phân bổ trên ${(summary?.totalBatches || 0).toLocaleString('vi-VN')} lô thuốc thực tế`,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
            ),
            onClick: () => onSelectFilter && onSelectFilter('ALL'),
            active: currentFilter === 'ALL',
        },
        {
            label: 'Tổng Đơn Vị Tồn Kho',
            value: loading ? '...' : (summary?.totalUnits || 0).toLocaleString('vi-VN'),
            iconColor: 'blue',
            sub: 'đơn vị sẵn sàng bán tại quầy',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
            ),
            onClick: null,
            active: false,
        },
        {
            label: 'Lô Cận Hạn (≤90 ngày)',
            value: loading ? '...' : (summary?.expiringSoonCount || 0).toLocaleString('vi-VN'),
            iconColor: 'amber',
            sub: 'cần ưu tiên xuất trước FEFO',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            ),
            onClick: () => onSelectFilter && onSelectFilter('EXPIRING_SOON'),
            active: currentFilter === 'EXPIRING_SOON',
        },
        {
            label: 'Thiếu & Hết Hàng',
            value: loading ? '...' : ((summary?.lowStockCount || 0) + (summary?.outOfStockCount || 0)).toLocaleString('vi-VN'),
            iconColor: 'red',
            sub: `${summary?.outOfStockCount || 0} hết hàng — ${summary?.lowStockCount || 0} dưới định mức`,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
            ),
            onClick: () => onSelectFilter && onSelectFilter('LOW_STOCK'),
            active: currentFilter === 'LOW_STOCK',
        },
    ];

    return (
        <div className="pms-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
            {stats.map((s) => (
                <div
                    className="pms-stat-card"
                    key={s.label}
                    onClick={s.onClick}
                    style={{
                        cursor: s.onClick ? 'pointer' : 'default',
                        borderColor: s.active ? 'var(--brand-primary)' : 'var(--border-color)',
                        boxShadow: s.active ? '0 0 0 2px var(--brand-primary)' : 'var(--shadow-sm)',
                    }}
                >
                    <div className={`pms-stat-icon ${s.iconColor}`}>{s.icon}</div>
                    <div>
                        <div className="pms-stat-label">{s.label}</div>
                        <div className="pms-stat-value">{s.value}</div>
                        <div className="pms-stat-sub">{s.sub}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
