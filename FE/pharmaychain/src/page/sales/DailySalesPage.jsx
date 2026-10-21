import { useDailySales } from '../../hooks/sales/useDailySales';
import DailySalesStats from '../../component/sales/DailySalesStats';
import DailySalesInvoicesTable from '../../component/sales/DailySalesInvoicesTable';
import DailySalesShiftsTable from '../../component/sales/DailySalesShiftsTable';
import DailySalesReconcileModal from '../../component/sales/DailySalesReconcileModal';
import { money, formatDate } from '../../utils/format';

export default function DailySalesPage({ defaultTab = 'overview' }) {
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

    const isReconciled = overview?.status === 1;

    return (
        <div>
            {/* ── Page Header ── */}
            <div className="pms-page-header" style={{ marginBottom: 16 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h1 className="pms-page-title" style={{ margin: 0 }}>Daily Sales Report & Reconciliation</h1>
                        <span className="pms-badge pms-badge-info" style={{ fontSize: 11 }}>Store Manager</span>
                    </div>
                    <p className="pms-page-sub">
                        Monitor real-time sales revenue, reconcile cashier shift cash counts, and close the daily sales ledger.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={reloadAll} title="Refresh data">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        Refresh
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
                        {isReconciled ? 'Update Reconciliation' : 'Reconcile & Close Ledger'}
                    </button>
                </div>
            </div>

            {/* ── Filters & Selectors Bar ── */}
            <div className="pms-card" style={{ marginBottom: 20 }}>
                <div className="pms-card-body" style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            {/* Store Picker */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Store Branch:</label>
                                <select
                                    className="pms-select"
                                    style={{ minWidth: 240 }}
                                    value={storeId}
                                    onChange={(e) => setStoreId(e.target.value)}
                                >
                                    <option value="1">Store #1 — Central Pharmacy</option>
                                    <option value="2">Store #2 — Cau Giay Pharmacy</option>
                                    <option value="3">Store #3 — Dong Da Pharmacy</option>
                                </select>
                            </div>

                            {/* Date Picker */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Business Date:</label>
                                <input
                                    type="date"
                                    className="pms-input pms-input-bare"
                                    style={{ width: 'auto' }}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Reconcile Info Badge */}
                        {isReconciled && (
                            <div style={{ fontSize: 12.5, color: 'var(--color-success-text)', background: 'var(--color-success-bg)', padding: '6px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #a7f3d0' }}>
                                <span>✓ Reconciled by: <strong>{overview?.reconciledByName || 'Store Manager'}</strong></span>
                                {overview?.reconciledAt && <span>on {formatDate(overview.reconciledAt)}</span>}
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
                    onClick={() => setActiveTab('overview')}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Overview & Reconciliation
                </button>
                <button
                    type="button"
                    className={`pms-tab ${activeTab === 'invoices' ? 'active' : ''}`}
                    onClick={() => setActiveTab('invoices')}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Sales Invoices ({invTotal})
                </button>
                <button
                    type="button"
                    className={`pms-tab ${activeTab === 'shifts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('shifts')}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Cashier Shifts ({shifts?.length || 0})
                </button>
            </div>

            {/* ── Tab Content ── */}
            {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
                    {/* Left Column: Breakdown */}
                    <div className="pms-card">
                        <div className="pms-card-header">
                            <div>
                                <div className="pms-card-title">Revenue Reconciliation by Payment Method</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                    Compare system-recorded transactions against physical cash counts
                                </div>
                            </div>
                        </div>
                        <div className="pms-card-body" style={{ padding: 0 }}>
                            <table className="pms-table">
                                <thead>
                                    <tr>
                                        <th>Payment Method</th>
                                        <th style={{ textAlign: 'right' }}>System Recorded</th>
                                        <th style={{ textAlign: 'right' }}>Actual Counted</th>
                                        <th style={{ textAlign: 'right' }}>Variance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Cash at Register</strong></td>
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
                                        <td><strong>Bank Transfer</strong></td>
                                        <td style={{ textAlign: 'right' }}>{money(overview?.systemBank || 0)}</td>
                                        <td style={{ textAlign: 'right' }}>{money(overview?.systemBank || 0)}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--color-success)' }}>0 ₫</td>
                                    </tr>
                                    <tr>
                                        <td><strong>E-Wallet (VNPay)</strong></td>
                                        <td style={{ textAlign: 'right' }}>{money(overview?.systemVnpay || 0)}</td>
                                        <td style={{ textAlign: 'right' }}>{money(overview?.systemVnpay || 0)}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--color-success)' }}>0 ₫</td>
                                    </tr>
                                    <tr style={{ background: 'var(--bg-canvas)' }}>
                                        <td><strong style={{ fontSize: 13.5 }}>TOTAL</strong></td>
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
                                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Reconciliation Note: </span>
                                    <span>{overview.note}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Actions & Audit Trail */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="pms-card">
                            <div className="pms-card-header">
                                <div className="pms-card-title">Store Manager Action</div>
                            </div>
                            <div className="pms-card-body">
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                                    At the end of business hours and after receiving register drawers from cashiers, count actual cash and reconcile the ledger.
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
                                    {isReconciled ? 'Edit / Update Reconciliation' : 'Proceed to Reconcile Cash'}
                                </button>
                            </div>
                        </div>

                        <div className="pms-card">
                            <div className="pms-card-header" style={{ background: 'var(--bg-canvas)' }}>
                                <div className="pms-card-title">Audit Trail</div>
                            </div>
                            <div className="pms-card-body" style={{ background: 'var(--bg-canvas)' }}>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Status:</span>
                                        <span className={`pms-badge ${isReconciled ? 'pms-badge-success' : 'pms-badge-warning'}`}>
                                            {isReconciled ? 'Reconciled' : 'Pending Count'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Auditor:</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{overview?.reconciledByName || 'Not Reconciled'}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Timestamp:</span>
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
