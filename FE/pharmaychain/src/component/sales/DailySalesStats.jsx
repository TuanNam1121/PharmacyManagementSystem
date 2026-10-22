import { money } from '../../utils/format';

export default function DailySalesStats({ overview, loading }) {
    const isReconciled = overview?.status === 1;
    const difference = overview?.difference ?? 0;

    const getDifferenceStyle = () => {
        if (difference === 0) return { color: 'var(--color-success)', text: '100% Balanced' };
        if (difference > 0) return { color: 'var(--color-info)', text: `Surplus +${money(difference)}` };
        return { color: 'var(--color-danger)', text: `Shortage ${money(difference)}` };
    };

    const diffInfo = getDifferenceStyle();

    return (
        <div className="pms-stats-grid" style={{ marginBottom: 20 }}>
            {/* KPI 1: Total System Revenue */}
            <div className="pms-stat-card">
                <div className="pms-stat-top">
                    <span className="pms-stat-label">Total System Revenue</span>
                    <div className="pms-stat-icon" style={{ background: 'var(--brand-primary-glow)', color: 'var(--brand-primary)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                </div>
                <div className="pms-stat-value" style={{ color: 'var(--brand-primary)' }}>
                    {loading ? '...' : money(overview?.systemTotal || 0)}
                </div>
                <div className="pms-stat-sub" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="pms-badge pms-badge-success" style={{ fontSize: 11 }}>
                        +{overview?.growthPercentageVsYesterday || 0}%
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>vs yesterday</span>
                </div>
            </div>

            {/* KPI 2: Payment Breakdown */}
            <div className="pms-stat-card">
                <div className="pms-stat-top">
                    <span className="pms-stat-label">Payment Breakdown</span>
                    <div className="pms-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-info)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Cash:</span>
                        <strong>{loading ? '...' : money(overview?.systemCash || 0)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Bank Transfer:</span>
                        <strong>{loading ? '...' : money(overview?.systemBank || 0)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>VNPay Wallet:</span>
                        <strong>{loading ? '...' : money(overview?.systemVnpay || 0)}</strong>
                    </div>
                </div>
            </div>

            {/* KPI 3: Invoices & Shifts */}
            <div className="pms-stat-card">
                <div className="pms-stat-top">
                    <span className="pms-stat-label">Invoices & Shifts</span>
                    <div className="pms-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-warning)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {loading ? '...' : (overview?.totalInvoices || 0)}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Daily Invoices</div>
                    </div>
                    <div style={{ width: 1, background: 'var(--border-color)' }} />
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {loading ? '...' : (overview?.totalShifts || 0)}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Cashier Shifts</div>
                    </div>
                </div>
            </div>

            {/* KPI 4: Reconciliation Status */}
            <div className="pms-stat-card">
                <div className="pms-stat-top">
                    <span className="pms-stat-label">Reconciliation Status</span>
                    <span className={`pms-badge ${isReconciled ? 'pms-badge-success' : 'pms-badge-warning'}`}>
                        {isReconciled ? '✓ Reconciled' : '⏳ Pending'}
                    </span>
                </div>
                <div style={{ marginTop: 6 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Actual Physical Cash:</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {loading ? '...' : money(overview?.actualCash ?? overview?.systemCash ?? 0)}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: diffInfo.color, marginTop: 2 }}>
                        {diffInfo.text}
                    </div>
                </div>
            </div>
        </div>
    );
}
