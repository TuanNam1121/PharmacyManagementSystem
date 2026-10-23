import React, { useState, useEffect, useCallback } from 'react';
import { getInventoryReport, exportInventoryReportExcel } from '../../api/InventoryReportAPI';
import { formatDate } from '../../utils/format';

export default function InventoryReportPage() {
    // Filter states
    const [storeId, setStoreId] = useState('');
    const [stockStatus, setStockStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('items'); // 'items' | 'stores' | 'movements'
    const [exporting, setExporting] = useState(false);

    // Async states
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // ── Auto-fetch report whenever storeId or stockStatus changes ──
    const fetchReport = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const data = await getInventoryReport({
                storeId: storeId ? Number(storeId) : undefined,
                stockStatus,
            });
            setReport(data);
        } catch (err) {
            setErrorMsg(err?.message || 'Failed to load inventory valuation report.');
        } finally {
            setLoading(false);
        }
    }, [storeId, stockStatus]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // Handle Export Excel
    const handleExportExcel = async () => {
        setExporting(true);
        setErrorMsg(null);
        try {
            await exportInventoryReportExcel({
                storeId: storeId ? Number(storeId) : undefined,
                stockStatus,
            });
            setSuccessMsg('Executive Inventory Excel report exported successfully! Audit log committed.');
        } catch (err) {
            setErrorMsg(err?.message || 'Failed to export inventory Excel report.');
        } finally {
            setExporting(false);
        }
    };

    // Alternative Flow AT02: Reset filters
    const handleReset = () => {
        setStoreId('');
        setStockStatus('ALL');
        setSearchTerm('');
        setErrorMsg(null);
        setSuccessMsg(null);
    };

    // Filter items by search keyword
    const filteredItems = (report?.items || []).filter((item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.barcode && item.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.batchNumber && item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="pms-page">
            {/* ── Page Header ── */}
            <div className="pms-page-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h1 className="pms-page-title">Executive Inventory & Stock Valuation Report</h1>
                        <span className="pms-badge pms-badge-info">General Manager</span>
                    </div>
                    <p className="pms-page-sub">
                        Monitor chain-wide inventory valuation, safety stock alerts, batch expiry risks, and stock movement trails.
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
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', float: 'right' }} onClick={() => setSuccessMsg(null)}>✕</button>
                </div>
            )}
            {errorMsg && (
                <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                    <span>⚠️ {errorMsg}</span>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', float: 'right' }} onClick={() => setErrorMsg(null)}>✕</button>
                </div>
            )}

            {/* ── Filter Controls Bar ── */}
            <div className="pms-card" style={{ marginBottom: 20 }}>
                <div className="pms-card-body" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Branch & Status Selection */}
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Branch:</label>
                                <select
                                    className="pms-select"
                                    value={storeId}
                                    onChange={(e) => setStoreId(e.target.value)}
                                    style={{ minWidth: 220, padding: '5px 10px' }}
                                >
                                    <option value="">All Branches (Chain-wide)</option>
                                    <option value="1">Store #1 — Central Pharmacy</option>
                                    <option value="2">Store #2 — Cau Giay Pharmacy</option>
                                    <option value="3">Store #3 — Dong Da Pharmacy</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Stock Status:</label>
                                <select
                                    className="pms-select"
                                    value={stockStatus}
                                    onChange={(e) => setStockStatus(e.target.value)}
                                    style={{ minWidth: 180, padding: '5px 10px' }}
                                >
                                    <option value="ALL">All Stock Conditions</option>
                                    <option value="IN_STOCK">Healthy Stock</option>
                                    <option value="LOW_STOCK">⚠️ Low Stock Warning</option>
                                    <option value="OUT_OF_STOCK">🚨 Out of Stock (Zero)</option>
                                    <option value="EXPIRING_SOON">⏰ Expiring Soon (&lt; 90 Days)</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                className="btn-pms btn-pms-secondary"
                                onClick={handleReset}
                                title="Reset filters to default (AT02)"
                            >
                                Reset
                            </button>
                        </div>

                        {/* Search Box */}
                        <div>
                            <input
                                type="text"
                                className="pms-input"
                                placeholder="Search medicine, barcode, batch..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 280, fontSize: 13 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── KPI Metric Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                {/* 1. Valuation at Cost */}
                <div className="pms-card" style={{ padding: '18px 20px', borderLeft: '4px solid #0284c7' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                        Total Inventory Value (Cost)
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 6 }}>
                        {Number(report?.totalValuationCost || 0).toLocaleString('vi-VN')} ₫
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        Procurement capital invested
                    </div>
                </div>

                {/* 2. Valuation at Retail */}
                <div className="pms-card" style={{ padding: '18px 20px', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                        Potential Retail Value
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#059669', marginTop: 6 }}>
                        {Number(report?.totalValuationRetail || 0).toLocaleString('vi-VN')} ₫
                    </div>
                    <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 4 }}>
                        Potential Margin: {report?.potentialMarginPercentage || 0}%
                    </div>
                </div>

                {/* 3. Total Physical Units */}
                <div className="pms-card" style={{ padding: '18px 20px', borderLeft: '4px solid #6366f1' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                        Total Physical Volume
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#4338ca', marginTop: 6 }}>
                        {Number(report?.totalUnitsInStock || 0).toLocaleString('vi-VN')}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        Across <strong>{report?.totalSkus || 0}</strong> active medicines
                    </div>
                </div>

                {/* 4. Risk & Safety Alerts */}
                <div className="pms-card" style={{ padding: '18px 20px', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                        Inventory Risk Alerts
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
                        <span className="pms-badge pms-badge-warning" style={{ fontSize: 12 }}>
                            {report?.lowStockCount || 0} Low Stock
                        </span>
                        <span className="pms-badge pms-badge-danger" style={{ fontSize: 12 }}>
                            {report?.expiringSoonCount || 0} Expiring
                        </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                        Out of stock: {report?.outOfStockCount || 0} items
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
                        color: activeTab === 'items' ? '#0284c7' : '#64748b',
                        borderBottom: activeTab === 'items' ? '3px solid #0284c7' : '3px solid transparent',
                    }}
                    onClick={() => setActiveTab('items')}
                >
                    📦 Stock Levels & Valuation ({report?.items?.length || 0})
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
                    🏪 Branch Valuation Comparison ({report?.storeBreakdown?.length || 0})
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
                        color: activeTab === 'movements' ? '#0284c7' : '#64748b',
                        borderBottom: activeTab === 'movements' ? '3px solid #0284c7' : '3px solid transparent',
                    }}
                    onClick={() => setActiveTab('movements')}
                >
                    🔄 Stock Movements & Audit Trail ({report?.movements?.length || 0})
                </button>
            </div>

            {/* ── TAB 1: Stock Levels Table ── */}
            {activeTab === 'items' && (
                <div className="pms-card" style={{ padding: 0 }}>
                    <div className="pms-table-container">
                        <table className="pms-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product / Medicine</th>
                                    <th>Barcode</th>
                                    <th>Batch No</th>
                                    <th>Expiry Date</th>
                                    <th>Branch</th>
                                    <th style={{ textAlign: 'right' }}>Stock Qty</th>
                                    <th style={{ textAlign: 'right' }}>Cost Price (₫)</th>
                                    <th style={{ textAlign: 'right' }}>Valuation (Cost)</th>
                                    <th style={{ textAlign: 'center' }}>Stock Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={10} style={{ textAlign: 'center', padding: '40px' }}>
                                            <div className="pms-spinner" />
                                            <span style={{ display: 'block', marginTop: 10, color: '#64748b' }}>
                                                Computing stock levels and valuations…
                                            </span>
                                        </td>
                                    </tr>
                                ) : filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            No inventory items matching your selected criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item, idx) => {
                                        const isLow = item.stockStatus === 'LOW_STOCK';
                                        const isOut = item.stockStatus === 'OUT_OF_STOCK';
                                        const isExpiring = item.expiryStatus === 'EXPIRING_SOON' || item.expiryStatus === 'EXPIRED';

                                        return (
                                            <tr key={item.inventoryId || idx}>
                                                <td style={{ color: '#94a3b8' }}>{idx + 1}</td>
                                                <td className="fw-700">{item.productName}</td>
                                                <td className="mono" style={{ fontSize: 12 }}>{item.barcode || '—'}</td>
                                                <td className="mono" style={{ fontSize: 12 }}>{item.batchNumber}</td>
                                                <td>
                                                    <span style={{ color: isExpiring ? '#dc2626' : 'inherit', fontWeight: isExpiring ? 700 : 400 }}>
                                                        {item.expiryDate ? formatDate(item.expiryDate) : '—'}
                                                    </span>
                                                    {isExpiring && <span style={{ fontSize: 11, display: 'block', color: '#dc2626' }}>({item.daysUntilExpiry}d left)</span>}
                                                </td>
                                                <td>{item.storeName}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 700, color: isOut ? '#dc2626' : isLow ? '#d97706' : '#0f172a' }}>
                                                    {item.quantity} {item.unit}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>{Number(item.costPrice || 0).toLocaleString('vi-VN')}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>
                                                    {Number(item.valuationCost || 0).toLocaleString('vi-VN')} ₫
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className={`pms-badge ${isOut ? 'pms-badge-danger' : isLow ? 'pms-badge-warning' : 'pms-badge-success'}`}>
                                                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Healthy'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── TAB 2: Branch Comparison Table ── */}
            {activeTab === 'stores' && (
                <div className="pms-card" style={{ padding: 0 }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Store Branch Inventory Valuation Breakdown</h3>
                        <span style={{ fontSize: 12, color: '#64748b' }}>Comparison of capital held in stock across all chain branches</span>
                    </div>

                    <div className="pms-table-container">
                        <table className="pms-table">
                            <thead>
                                <tr>
                                    <th>Store Code</th>
                                    <th>Store Branch Name</th>
                                    <th style={{ textAlign: 'right' }}>Active SKUs</th>
                                    <th style={{ textAlign: 'right' }}>Total Units</th>
                                    <th style={{ textAlign: 'right' }}>Valuation at Cost (₫)</th>
                                    <th style={{ textAlign: 'right' }}>Retail Value (₫)</th>
                                    <th style={{ textAlign: 'right' }}>Potential Profit (₫)</th>
                                    <th style={{ textAlign: 'center' }}>Potential Margin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                                            <div className="pms-spinner" />
                                        </td>
                                    </tr>
                                ) : (report?.storeBreakdown || []).length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            No branch valuation data available.
                                        </td>
                                    </tr>
                                ) : (
                                    report.storeBreakdown.map((s) => (
                                        <tr key={s.storeId}>
                                            <td className="mono fw-700" style={{ color: '#0284c7' }}>{s.storeCode}</td>
                                            <td className="fw-600">{s.storeName}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{s.totalSkus}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{Number(s.totalUnits).toLocaleString('vi-VN')}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>
                                                {Number(s.valuationCost || 0).toLocaleString('vi-VN')} ₫
                                            </td>
                                            <td style={{ textAlign: 'right' }}>{Number(s.valuationRetail || 0).toLocaleString('vi-VN')} ₫</td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                                                {Number(s.potentialProfit || 0).toLocaleString('vi-VN')} ₫
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="pms-badge pms-badge-success">{s.potentialMarginPercentage}%</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── TAB 3: Stock Movements Table ── */}
            {activeTab === 'movements' && (
                <div className="pms-card" style={{ padding: 0 }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Chain Stock Movements Audit Log</h3>
                        <span style={{ fontSize: 12, color: '#64748b' }}>Real-time audit log of stock inflows, sales deductions, transfers, and adjustments</span>
                    </div>

                    <div className="pms-table-container">
                        <table className="pms-table">
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>Branch</th>
                                    <th>Product Name</th>
                                    <th>Batch No</th>
                                    <th>Movement Type</th>
                                    <th style={{ textAlign: 'right' }}>Qty Change</th>
                                    <th style={{ textAlign: 'right' }}>Ending Stock</th>
                                    <th>Reference</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                                            <div className="pms-spinner" />
                                        </td>
                                    </tr>
                                ) : (report?.movements || []).length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            No stock movement logs recorded in this period.
                                        </td>
                                    </tr>
                                ) : (
                                    report.movements.map((m) => (
                                        <tr key={m.id}>
                                            <td className="mono" style={{ fontSize: 12 }}>{m.createdAt ? m.createdAt.replace('T', ' ').substring(0, 19) : '—'}</td>
                                            <td className="fw-600">{m.storeName}</td>
                                            <td className="fw-700">{m.productName}</td>
                                            <td className="mono" style={{ fontSize: 12 }}>{m.batchNumber}</td>
                                            <td>
                                                <span className="pms-badge pms-badge-neutral">{m.movementTypeName}</span>
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: m.quantityChange > 0 ? '#059669' : '#dc2626' }}>
                                                {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{m.quantityAfter}</td>
                                            <td className="mono" style={{ fontSize: 12 }}>
                                                {m.referenceType} #{m.referenceId}
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
