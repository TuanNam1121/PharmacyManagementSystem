import { money } from '../../utils/format';

export default function DailySalesStats({ overview, loading }) {
    const isReconciled = overview?.status === 1;
    const difference = overview?.difference ?? 0;

    const getDifferenceStyle = () => {
        if (difference === 0) return { text: 'Cân bằng khớp 100%' };
        if (difference > 0) return { text: `Thừa tiền +${money(difference)}` };
        return { text: `Thiếu tiền ${money(difference)}` };
    };

    const diffInfo = getDifferenceStyle();

    const stats = [
        {
            label: 'Tổng Doanh Thu Trong Ngày',
            value: loading ? '...' : money(overview?.systemTotal || 0),
            iconColor: 'emerald',
            sub: `+${overview?.growthPercentageVsYesterday || 0}% so với hôm trước`,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            ),
        },
        {
            label: 'Tổng Hóa Đơn Bán Lẻ',
            value: loading ? '...' : (overview?.totalInvoices || 0).toLocaleString('vi-VN'),
            iconColor: 'blue',
            sub: `phân bổ trên ${overview?.totalShifts || 1} ca làm việc`,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
            ),
        },
        {
            label: 'Tiền Mặt Tại Két Quầy',
            value: loading ? '...' : money(overview?.systemCash || 0),
            iconColor: 'amber',
            sub: `chuyển khoản & thẻ: ${money(overview?.systemBank || 0)}`,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
            ),
        },
        {
            label: 'Trạng Thái Đối Soát Cuối Ca',
            value: isReconciled ? 'Đã Đối Soát' : 'Chờ Đối Soát',
            iconColor: isReconciled ? 'emerald' : 'red',
            sub: diffInfo.text,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            ),
        },
    ];

    return (
        <div className="pms-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
            {stats.map((s) => (
                <div className="pms-stat-card" key={s.label}>
                    <div className={`pms-stat-icon ${s.iconColor}`}>{s.icon}</div>
                    <div>
                        <div className="pms-stat-label">{s.label}</div>
                        <div className="pms-stat-value" style={{ whiteSpace: 'nowrap' }}>{s.value}</div>
                        <div className="pms-stat-sub">{s.sub}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
