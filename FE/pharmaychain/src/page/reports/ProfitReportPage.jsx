import React, { useState, useEffect, useCallback } from 'react';
import { getProfitReport, generateProfitReport, exportProfitReportExcel } from '../../api/ProfitReportAPI';
import { formatDate } from '../../utils/format';

export default function ProfitReportPage() {
    // ── Date presets helper ──
    const getToday = () => new Date().toISOString().split('T')[0];
    const getFirstDayOfMonth = () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    };

    // Filter states
    const [startDate, setStartDate] = useState(getFirstDayOfMonth());
    const [endDate, setEndDate] = useState(getToday());
    const [storeId, setStoreId] = useState('');
    const [activeTab, setActiveTab] = useState('products'); // 'products' | 'stores' | 'timeline'
    const [searchTerm, setSearchTerm] = useState('');
    const [exporting, setExporting] = useState(false);

    // Async states
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // ── Auto-fetch report when filters (startDate, endDate, storeId) change ──
    const fetchReport = useCallback(async () => {
        // Validation check (Alternative flow AT01)
        if (startDate && endDate && startDate > endDate) {
            setErrorMsg('Validation Error: Start date cannot be after End date.');
            return;
        }

        setLoading(true);
        setErrorMsg(null);
        try {
            const data = await getProfitReport({
                startDate,
                endDate,
                storeId: storeId ? Number(storeId) : undefined,
            });
            setReport(data);
        } catch (err) {
            setErrorMsg(err?.message || 'Failed to load profit report.');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, storeId]);

    // Tự động gọi API mỗi khi startDate, endDate hoặc storeId thay đổi
    useEffect(() => {
        fetchReport();
    }, [fetchReport]);


    const handleExportExcel = async () => {
        setExporting(true);
        setErrorMsg(null);
        try {
            await exportProfitReportExcel({
                startDate,
                endDate,
                storeId: storeId ? Number(storeId) : undefined,
            });
            setSuccessMsg('Executive Excel report exported successfully!');
        } catch (err) {
            setErrorMsg(err?.message || 'Failed to export Excel report.');
        } finally {
            setExporting(false);
        }
    };

    // Quick Date Preset Selectors
    const handlePresetChange = (preset) => {
        const now = new Date();
        const end = getToday();
        let start = getToday();

        if (preset === 'today') {
            start = end;
        } else if (preset === '7days') {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            start = d.toISOString().split('T')[0];
        } else if (preset === 'thisMonth') {
            start = getFirstDayOfMonth();
        } else if (preset === 'lastMonth') {
            const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            start = firstOfLastMonth.toISOString().split('T')[0];
            setEndDate(lastOfLastMonth.toISOString().split('T')[0]);
            setStartDate(start);
            return;
        } else if (preset === 'quarter') {
            const currentQuarter = Math.floor(now.getMonth() / 3);
            const firstOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
            start = firstOfQuarter.toISOString().split('T')[0];
        }

        setStartDate(start);
        setEndDate(end);
    };

    // Alternative Flow AT02: Reset filters
    const handleReset = () => {
        setStartDate(getFirstDayOfMonth());
        setEndDate(getToday());
        setStoreId('');
        setErrorMsg(null);
        setSuccessMsg(null);
    };



    // Filter products by search term
    const filteredProducts = (report?.topProducts || []).filter((p) =>
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="pms-page">
            {/* ── Page Header ── */}
            <div className="pms-page-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h1 className="pms-page-title">Executive Profit & Margin Report</h1>
                        <span className="pms-badge pms-badge-info">General Manager</span>
                    </div>
                    <p className="pms-page-sub">
                        Analyze gross revenue, cost of goods sold (COGS), profit margins, and branch financial performance.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        type="button"
                        className="btn-pms btn-pms-secondary"
                        onClick={handleExportExcel}
                        disabled={exporting || loading}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <span>📊</span>
                        <span>{exporting ? 'Generating Excel…' : 'Export Executive Excel'}</span>
                    </button>
                </div>


            </div>

            {/* ── Alerts ── */}
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

            {/* ── Filter Controls Bar ── */}
            <div className="pms-card" style={{ marginBottom: 20 }}>
                <div className="pms-card-body" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Quick Period Presets */}
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginRight: 4 }}>Period:</span>
                            <button type="button" className="btn-pms btn-pms-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handlePresetChange('today')}>Today</button>
                            <button type="button" className="btn-pms btn-pms-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handlePresetChange('7days')}>Last 7 Days</button>
                            <button type="button" className="btn-pms btn-pms-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handlePresetChange('thisMonth')}>This Month</button>
                            <button type="button" className="btn-pms btn-pms-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handlePresetChange('lastMonth')}>Last Month</button>
                            <button type="button" className="btn-pms btn-pms-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handlePresetChange('quarter')}>This Quarter</button>
                        </div>

                        {/* Date Range & Store Selection */}
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>From:</label>
                                <input
                                    type="date"
                                    className="pms-input"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{ width: 140, padding: '4px 8px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>To:</label>
                                <input
                                    type="date"
                                    className="pms-input"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{ width: 140, padding: '4px 8px' }}
                                />
                            </div>

                            <select
                                className="pms-select"
                                value={storeId}
                                onChange={(e) => setStoreId(e.target.value)}
                                style={{ minWidth: 200, padding: '5px 10px' }}
                            >
                                <option value="">All Branches (Chain-wide)</option>
                                <option value="1">Store #1 — Central Pharmacy</option>
                                <option value="2">Store #2 — Cau Giay Pharmacy</option>
                                <option value="3">Store #3 — Dong Da Pharmacy</option>
                            </select>

                            <button
                                type="button"
                                className="btn-pms btn-pms-secondary"
                                onClick={handleReset}
                                title="Reset filters to default (AT02)"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Financial KPI Metric Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                {/* 1. Total Revenue */}
                <div className="pms-card" style={{ padding: '18px 20px', borderLeft: '4px solid #0284c7' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                        Total Revenue (Gross)
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 6 }}>
                        {Number(report?.totalRevenue || 0).toLocaleString('vi-VN')} ₫
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        From <strong>{report?.totalInvoices || 0}</strong> paid orders
                    </div>
                </div>

                {/* 2. Total COGS */}
                <div className="pms-card" style={{ padding: '18px 20px', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                        Cost of Goods Sold (COGS)
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#b45309', marginTop: 6 }}>
                        {Number(report?.totalCost || 0).toLocaleString('vi-VN')} ₫
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        Procurement base costs
                    </div>
                </div>

                {/* 3. Gross Profit */}
                <div className="pms-card" style={{ padding: '18px 20px', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                        Net Gross Profit
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#059669', marginTop: 6 }}>
                        {Number(report?.grossProfit || 0).toLocaleString('vi-VN')} ₫
                    </div>
                    <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 4 }}>
                        ✓ Revenue minus Cost
                    </div>
                </div>

                {/* 4. Profit Margin */}
                <div className="pms-card" style={{ padding: '18px 20px', borderLeft: '4px solid #8b5cf6' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                        Gross Margin %
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#6d28d9', marginTop: 6 }}>
                        {report?.grossMarginPercentage || 0}%
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        AOV: {Number(report?.averageOrderValue || 0).toLocaleString('vi-VN')} ₫
                    </div>
                </div>
            </div>

            {/* ── Navigation Tabs ── */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color, #e2e8f0)', marginBottom: 20 }}>
                <button
                    type="button"
                    style={{
                        padding: '10px 20px',
                        fontWeight: 600,
                        fontSize: 14,
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: activeTab === 'products' ? '#0284c7' : '#64748b',
                        borderBottom: activeTab === 'products' ? '3px solid #0284c7' : '3px solid transparent',
                    }}
                    onClick={() => setActiveTab('products')}
                >
                    💊 Product Profitability ({report?.topProducts?.length || 0})
                </button>

                <button
                    type="button"
                    style={{
                        padding: '10px 20px',
                        fontWeight: 600,
                        fontSize: 14,
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: activeTab === 'stores' ? '#0284c7' : '#64748b',
                        borderBottom: activeTab === 'stores' ? '3px solid #0284c7' : '3px solid transparent',
                    }}
                    onClick={() => setActiveTab('stores')}
                >
                    🏪 Store / Branch Comparison ({report?.storeBreakdown?.length || 0})
                </button>

                <button
                    type="button"
                    style={{
                        padding: '10px 20px',
                        fontWeight: 600,
                        fontSize: 14,
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: activeTab === 'timeline' ? '#0284c7' : '#64748b',
                        borderBottom: activeTab === 'timeline' ? '3px solid #0284c7' : '3px solid transparent',
                    }}
                    onClick={() => setActiveTab('timeline')}
                >
                    📅 Daily Timeline & Trends ({report?.dailyTrends?.length || 0})
                </button>
            </div>

            {/* ── TAB 1: Product Profitability Table ── */}
            {activeTab === 'products' && (
                <div className="pms-card" style={{ padding: 0 }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Medicine & Product Profit Breakdown</h3>
                            <span style={{ fontSize: 12, color: '#64748b' }}>Ranked by highest gross margin contribution</span>
                        </div>
                        <input
                            type="text"
                            className="pms-input"
                            placeholder="Search by product name or barcode..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: 300, fontSize: 13 }}
                        />
                    </div>

                    <div className="pms-table-container">
                        <table className="pms-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product / Medicine</th>
                                    <th>Barcode</th>
                                    <th>Unit</th>
                                    <th style={{ textAlign: 'right' }}>Qty Sold</th>
                                    <th style={{ textAlign: 'right' }}>Revenue (₫)</th>
                                    <th style={{ textAlign: 'right' }}>COGS (₫)</th>
                                    <th style={{ textAlign: 'right' }}>Gross Profit (₫)</th>
                                    <th style={{ textAlign: 'center' }}>Margin (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                                            <div className="pms-spinner" />
                                            <span style={{ display: 'block', marginTop: 10, color: '#64748b' }}>
                                                Computing profit metrics…
                                            </span>
                                        </td>
                                    </tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            No sales recorded for the selected filter parameters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((p, idx) => (
                                        <tr key={p.productId || idx}>
                                            <td style={{ color: '#94a3b8' }}>{idx + 1}</td>
                                            <td className="fw-700">{p.productName}</td>
                                            <td className="mono" style={{ fontSize: 12 }}>{p.barcode || '—'}</td>
                                            <td>{p.unit}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{p.quantitySold}</td>
                                            <td style={{ textAlign: 'right' }}>{Number(p.revenue || 0).toLocaleString('vi-VN')}</td>
                                            <td style={{ textAlign: 'right', color: '#64748b' }}>{Number(p.cost || 0).toLocaleString('vi-VN')}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                                                {Number(p.grossProfit || 0).toLocaleString('vi-VN')}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span
                                                    className={`pms-badge ${p.marginPercentage >= 30
                                                        ? 'pms-badge-success'
                                                        : p.marginPercentage >= 15
                                                            ? 'pms-badge-info'
                                                            : 'pms-badge-warning'
                                                        }`}
                                                >
                                                    {p.marginPercentage}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── TAB 2: Store / Branch Breakdown ── */}
            {activeTab === 'stores' && (
                <div className="pms-card" style={{ padding: 0 }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Store Branch Financial Performance</h3>
                        <span style={{ fontSize: 12, color: '#64748b' }}>Compare revenue, costs, and profit generated across chain branches</span>
                    </div>

                    <div className="pms-table-container">
                        <table className="pms-table">
                            <thead>
                                <tr>
                                    <th>Store Code</th>
                                    <th>Branch Name</th>
                                    <th style={{ textAlign: 'right' }}>Paid Invoices</th>
                                    <th style={{ textAlign: 'right' }}>Total Revenue (₫)</th>
                                    <th style={{ textAlign: 'right' }}>Total Cost (₫)</th>
                                    <th style={{ textAlign: 'right' }}>Gross Profit (₫)</th>
                                    <th style={{ textAlign: 'center' }}>Profit Margin (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                                            <div className="pms-spinner" />
                                        </td>
                                    </tr>
                                ) : (report?.storeBreakdown || []).length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            No branch sales data available.
                                        </td>
                                    </tr>
                                ) : (
                                    report.storeBreakdown.map((s) => (
                                        <tr key={s.storeId}>
                                            <td className="mono fw-700" style={{ color: '#0284c7' }}>{s.storeCode}</td>
                                            <td className="fw-600">{s.storeName}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{s.invoiceCount}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{Number(s.revenue || 0).toLocaleString('vi-VN')}</td>
                                            <td style={{ textAlign: 'right', color: '#64748b' }}>{Number(s.cost || 0).toLocaleString('vi-VN')}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669', fontSize: 15 }}>
                                                {Number(s.grossProfit || 0).toLocaleString('vi-VN')} ₫
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="pms-badge pms-badge-success">{s.marginPercentage}%</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── TAB 3: Daily Timeline Table ── */}
            {activeTab === 'timeline' && (
                <div className="pms-card" style={{ padding: 0 }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Daily Financial Progress & Margin Trend</h3>
                        <span style={{ fontSize: 12, color: '#64748b' }}>Chronological performance log for the active reporting period</span>
                    </div>

                    <div className="pms-table-container">
                        <table className="pms-table">
                            <thead>
                                <tr>
                                    <th>Business Date</th>
                                    <th style={{ textAlign: 'right' }}>Invoices</th>
                                    <th style={{ textAlign: 'right' }}>Gross Sales (₫)</th>
                                    <th style={{ textAlign: 'right' }}>COGS (₫)</th>
                                    <th style={{ textAlign: 'right' }}>Gross Profit (₫)</th>
                                    <th style={{ textAlign: 'center' }}>Margin (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                                            <div className="pms-spinner" />
                                        </td>
                                    </tr>
                                ) : (report?.dailyTrends || []).length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            No daily transaction history in this period.
                                        </td>
                                    </tr>
                                ) : (
                                    report.dailyTrends.map((t) => (
                                        <tr key={t.date}>
                                            <td className="fw-600">{formatDate(t.date)}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{t.invoiceCount}</td>
                                            <td style={{ textAlign: 'right' }}>{Number(t.revenue || 0).toLocaleString('vi-VN')}</td>
                                            <td style={{ textAlign: 'right', color: '#64748b' }}>{Number(t.cost || 0).toLocaleString('vi-VN')}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                                                {Number(t.grossProfit || 0).toLocaleString('vi-VN')}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="pms-badge pms-badge-neutral">{t.marginPercentage}%</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
