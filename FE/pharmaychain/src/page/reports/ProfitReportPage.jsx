import React, { useState, useEffect, useCallback } from 'react';
import { getProfitReport, generateProfitReport, exportProfitReportExcel } from '../../api/ProfitReportAPI';
import { formatDate, getLocalDateStr } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import { getAuthorizedStores } from '../../api/StoreAPI';

export default function ProfitReportPage() {
    const { user } = useAuth();
    // ── Date presets helper ──
    const getToday = () => getLocalDateStr();
    const getFirstDayOfMonth = () => {
        const now = new Date();
        return getLocalDateStr(new Date(now.getFullYear(), now.getMonth(), 1));
    };

    // Filter states
    const [startDate, setStartDate] = useState(getFirstDayOfMonth());
    const [endDate, setEndDate] = useState(getToday());
    const [storeId, setStoreId] = useState('');
    const [stores, setStores] = useState([]);
    const [isSingleBranch, setIsSingleBranch] = useState(false);
    const [activeTab, setActiveTab] = useState('products'); // 'products' | 'stores' | 'timeline'
    const [searchTerm, setSearchTerm] = useState('');
    const [exporting, setExporting] = useState(false);

    // Fetch authorized stores for RBAC
    useEffect(() => {
        getAuthorizedStores().then((data) => {
            if (data && data.length > 0) {
                setStores(data);
                if (data.length === 1) {
                    // Cửa hàng trưởng: chỉ quản lý 1 chi nhánh
                    setIsSingleBranch(true);
                    setStoreId(String(data[0].id));
                } else {
                    setIsSingleBranch(false);
                }
            }
        });
    }, []);

    // Async states
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // ── Auto-fetch report when filters (startDate, endDate, storeId) change ──
    const fetchReport = useCallback(async () => {
        // Validation check (Alternative flow AT01)
        if (startDate && endDate && startDate > endDate) {
            setErrorMsg('Lỗi xác thực: Ngày bắt đầu không thể sau ngày kết thúc.');
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
            setErrorMsg(err?.message || 'Không thể tải báo cáo lợi nhuận.');
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
            setSuccessMsg('Xuất báo cáo tài chính Excel thành công!');
        } catch (err) {
            setErrorMsg(err?.message || 'Lỗi khi xuất tệp báo cáo Excel.');
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
            start = getLocalDateStr(d);
        } else if (preset === 'thisMonth') {
            start = getFirstDayOfMonth();
        } else if (preset === 'lastMonth') {
            const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            start = getLocalDateStr(firstOfLastMonth);
            setEndDate(getLocalDateStr(lastOfLastMonth));
            setStartDate(start);
            return;
        } else if (preset === 'quarter') {
            const currentQuarter = Math.floor(now.getMonth() / 3);
            const firstOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
            start = getLocalDateStr(firstOfQuarter);
        }

        setStartDate(start);
        setEndDate(end);
    };

    // Alternative Flow AT02: Reset filters
    const handleReset = () => {
        setStartDate(getFirstDayOfMonth());
        setEndDate(getToday());
        if (!isSingleBranch) {
            setStoreId('');
        }
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
                        <h1 className="pms-page-title">Báo Cáo Doanh Thu & Biên Lợi Nhuận</h1>
                        <span className="pms-badge pms-badge-info">Ban Giám Đốc</span>
                    </div>
                    <p className="pms-page-sub">
                        Phân tích doanh thu gộp, giá vốn hàng bán (COGS), biên lợi nhuận và hiệu quả tài chính chuỗi nhà thuốc.
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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <span>{exporting ? 'Đang tạo Excel…' : 'Xuất Báo Cáo Excel'}</span>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{errorMsg}</span>
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
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginRight: 4 }}>Kỳ báo cáo:</span>
                            <button type="button" className="btn-pms btn-pms-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handlePresetChange('today')}>Hôm nay</button>
                            <button type="button" className="btn-pms btn-pms-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handlePresetChange('7days')}>7 ngày qua</button>
                            <button type="button" className="btn-pms btn-pms-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handlePresetChange('thisMonth')}>Tháng này</button>
                            <button type="button" className="btn-pms btn-pms-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handlePresetChange('lastMonth')}>Tháng trước</button>
                            <button type="button" className="btn-pms btn-pms-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handlePresetChange('quarter')}>Quý này</button>
                        </div>

                        {/* Date Range & Store Selection */}
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Từ ngày:</label>
                                <input
                                    type="date"
                                    className="pms-input"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{ width: 140, padding: '4px 8px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Đến ngày:</label>
                                <input
                                    type="date"
                                    className="pms-input"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{ width: 140, padding: '4px 8px' }}
                                />
                            </div>

                            {isSingleBranch ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '5px 12px',
                                        background: 'rgba(16, 185, 129, 0.08)',
                                        border: '1px solid rgba(16, 185, 129, 0.25)',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        color: '#059669',
                                        fontWeight: 600,
                                    }}
                                    title="Chi nhánh được phân công quản lý"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    <span>{stores[0]?.code} — {stores[0]?.name}</span>
                                </div>
                            ) : (
                                <select
                                    className="pms-select"
                                    value={storeId}
                                    onChange={(e) => setStoreId(e.target.value)}
                                    style={{ minWidth: 240, padding: '5px 10px' }}
                                >
                                    <option value="">Toàn hệ thống (Tất cả chi nhánh)</option>
                                    {stores.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.code} — {s.name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <button
                                type="button"
                                className="btn-pms btn-pms-secondary"
                                onClick={handleReset}
                                title="Đặt lại bộ lọc về mặc định"
                            >
                                Đặt lại
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Financial KPI Metric Cards (Standardized) ── */}
            <div className="pms-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', width: '100%', marginBottom: 20 }}>
                {/* 1. Total Revenue */}
                <div className="pms-stat-card">
                    <div className="pms-stat-icon emerald">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">Tổng Doanh Thu (Gross)</div>
                        <div className="pms-stat-value" style={{ whiteSpace: 'nowrap' }}>
                            {Number(report?.totalRevenue || 0).toLocaleString('vi-VN')} ₫
                        </div>
                        <div className="pms-stat-sub">
                            Từ {report?.totalInvoices || 0} hóa đơn hoàn tất
                        </div>
                    </div>
                </div>

                {/* 2. Total COGS */}
                <div className="pms-stat-card">
                    <div className="pms-stat-icon amber">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            <path d="M2 7l10-5 10 5" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">Giá Vốn Hàng Bán (COGS)</div>
                        <div className="pms-stat-value" style={{ whiteSpace: 'nowrap' }}>
                            {Number(report?.totalCost || 0).toLocaleString('vi-VN')} ₫
                        </div>
                        <div className="pms-stat-sub">Giá vốn nhập kho cơ sở</div>
                    </div>
                </div>

                {/* 3. Gross Profit */}
                <div className="pms-stat-card">
                    <div className="pms-stat-icon blue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">Lợi Nhuận Gộp Thuần</div>
                        <div className="pms-stat-value" style={{ whiteSpace: 'nowrap' }}>
                            {Number(report?.grossProfit || 0).toLocaleString('vi-VN')} ₫
                        </div>
                        <div className="pms-stat-sub">Doanh thu trừ Giá vốn</div>
                    </div>
                </div>

                {/* 4. Profit Margin */}
                <div className="pms-stat-card">
                    <div className="pms-stat-icon violet">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">Tỷ Suất Lợi Nhuận Gộp %</div>
                        <div className="pms-stat-value" style={{ whiteSpace: 'nowrap' }}>
                            {report?.grossMarginPercentage || 0}%
                        </div>
                        <div className="pms-stat-sub">
                            Đơn TB: {Number(report?.averageOrderValue || 0).toLocaleString('vi-VN')} ₫
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Navigation Tabs (Enterprise Standard) ── */}
            <div className="pms-tabs" style={{ marginBottom: 20 }}>
                <button
                    type="button"
                    className={`pms-tab ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    <span>Lợi Nhuận Theo Thuốc / Sản Phẩm</span>
                    <span style={{
                        fontSize: 11,
                        padding: '1px 6px',
                        borderRadius: 10,
                        background: activeTab === 'products' ? 'rgba(5, 150, 105, 0.12)' : 'var(--bg-card)',
                        color: activeTab === 'products' ? 'var(--brand-primary)' : 'var(--text-muted)',
                        fontWeight: 600,
                    }}>
                        {report?.topProducts?.length || 0}
                    </span>
                </button>

                {!isSingleBranch && (
                    <button
                        type="button"
                        className={`pms-tab ${activeTab === 'stores' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stores')}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        <span>So Sánh Giữa Các Chi Nhánh</span>
                        <span style={{
                            fontSize: 11,
                            padding: '1px 6px',
                            borderRadius: 10,
                            background: activeTab === 'stores' ? 'rgba(5, 150, 105, 0.12)' : 'var(--bg-card)',
                            color: activeTab === 'stores' ? 'var(--brand-primary)' : 'var(--text-muted)',
                            fontWeight: 600,
                        }}>
                            {report?.storeBreakdown?.length || 0}
                        </span>
                    </button>
                )}

                <button
                    type="button"
                    className={`pms-tab ${activeTab === 'timeline' ? 'active' : ''}`}
                    onClick={() => setActiveTab('timeline')}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Xu Hướng & Tiến Độ Theo Ngày</span>
                    <span style={{
                        fontSize: 11,
                        padding: '1px 6px',
                        borderRadius: 10,
                        background: activeTab === 'timeline' ? 'rgba(5, 150, 105, 0.12)' : 'var(--bg-card)',
                        color: activeTab === 'timeline' ? 'var(--brand-primary)' : 'var(--text-muted)',
                        fontWeight: 600,
                    }}>
                        {report?.dailyTrends?.length || 0}
                    </span>
                </button>
            </div>

            {/* ── TAB 1: Product Profitability Table ── */}
            {activeTab === 'products' && (
                <div className="pms-card" style={{ padding: 0 }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Chi Tiết Lợi Nhuận Theo Thuốc & Sản Phẩm</h3>
                            <span style={{ fontSize: 12, color: '#64748b' }}>Xếp theo đóng góp tỷ suất lợi nhuận cao nhất</span>
                        </div>
                        <input
                            type="text"
                            className="pms-input"
                            placeholder="Tìm theo tên thuốc hoặc mã vạch..."
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
                                    <th>Tên Thuốc / Sản Phẩm</th>
                                    <th>Mã Vạch</th>
                                    <th>Đơn Vị</th>
                                    <th style={{ textAlign: 'right' }}>Số Lượng Bán</th>
                                    <th style={{ textAlign: 'right' }}>Doanh Thu (₫)</th>
                                    <th style={{ textAlign: 'right' }}>Giá Vốn (₫)</th>
                                    <th style={{ textAlign: 'right' }}>Lợi Nhuận Gộp (₫)</th>
                                    <th style={{ textAlign: 'center' }}>Biên LN (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                                            <div className="pms-spinner" />
                                            <span style={{ display: 'block', marginTop: 10, color: '#64748b' }}>
                                                Đang tính toán số liệu lợi nhuận…
                                            </span>
                                        </td>
                                    </tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            Không có dữ liệu bán hàng cho bộ lọc đã chọn.
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
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Hiệu Quả Doanh Thu Các Chi Nhánh</h3>
                        <span style={{ fontSize: 12, color: '#64748b' }}>So sánh doanh thu, giá vốn và lợi nhuận giữa các chi nhánh trong chuỗi</span>
                    </div>

                    <div className="pms-table-container">
                        <table className="pms-table">
                            <thead>
                                <tr>
                                    <th>Mã Chi Nhánh</th>
                                    <th>Tên Chi Nhánh</th>
                                    <th style={{ textAlign: 'right' }}>Hóa Đơn Hoàn Tất</th>
                                    <th style={{ textAlign: 'right' }}>Tổng Doanh Thu (₫)</th>
                                    <th style={{ textAlign: 'right' }}>Tổng Giá Vốn (₫)</th>
                                    <th style={{ textAlign: 'right' }}>Lợi Nhuận Gộp (₫)</th>
                                    <th style={{ textAlign: 'center' }}>Tỷ Suất LN (%)</th>
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
                                            Không có dữ liệu bán hàng của chi nhánh.
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
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Tiến Độ Tài Chính & Biên Lợi Nhuận Hàng Ngày</h3>
                        <span style={{ fontSize: 12, color: '#64748b' }}>Nhật ký số liệu kinh doanh theo từng ngày trong kỳ báo cáo</span>
                    </div>

                    <div className="pms-table-container">
                        <table className="pms-table">
                            <thead>
                                <tr>
                                    <th>Ngày Kinh Doanh</th>
                                    <th style={{ textAlign: 'right' }}>Số Hóa Đơn</th>
                                    <th style={{ textAlign: 'right' }}>Doanh Thu (₫)</th>
                                    <th style={{ textAlign: 'right' }}>Giá Vốn (₫)</th>
                                    <th style={{ textAlign: 'right' }}>Lợi Nhuận Gộp (₫)</th>
                                    <th style={{ textAlign: 'center' }}>Tỷ Suất (%)</th>
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
                                            Không có giao dịch bán hàng trong khoảng thời gian này.
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
