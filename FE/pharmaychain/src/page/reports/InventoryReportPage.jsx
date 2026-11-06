import React, { useState, useEffect, useCallback } from 'react';
import { getInventoryReport, exportInventoryReportExcel } from '../../api/InventoryReportAPI';
import { formatDate } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import { getAuthorizedStores } from '../../api/StoreAPI';

export default function InventoryReportPage() {
    const { user } = useAuth();
    // Filter states
    const [storeId, setStoreId] = useState('');
    const [stores, setStores] = useState([]);
    const [isSingleBranch, setIsSingleBranch] = useState(false);
    const [stockStatus, setStockStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('items'); // 'items' | 'stores' | 'movements'
    const [exporting, setExporting] = useState(false);

    // Fetch authorized stores for RBAC
    useEffect(() => {
        getAuthorizedStores().then((data) => {
            if (data && data.length > 0) {
                setStores(data);
                if (data.length === 1) {
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
            setErrorMsg(err?.message || 'Không thể tải báo cáo định giá tồn kho.');
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
            setSuccessMsg('Xuất báo cáo tồn kho & định giá Excel thành công!');
        } catch (err) {
            setErrorMsg(err?.message || 'Lỗi khi xuất tệp báo cáo tồn kho Excel.');
        } finally {
            setExporting(false);
        }
    };

    // Alternative Flow AT02: Reset filters
    const handleReset = () => {
        if (!isSingleBranch) {
            setStoreId('');
        }
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
                        <h1 className="pms-page-title">Báo Cáo Tồn Kho & Định Giá Dược Phẩm</h1>
                        <span className="pms-badge pms-badge-info">Ban Giám Đốc</span>
                    </div>
                    <p className="pms-page-sub">
                        Giám sát giá trị định giá tồn kho toàn chuỗi, cảnh báo ngưỡng an toàn, nguy cơ cận hạn lô thuốc và lịch sử biến động thẻ kho.
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
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', float: 'right' }} onClick={() => setSuccessMsg(null)}>✕</button>
                </div>
            )}
            {errorMsg && (
                <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{errorMsg}</span>
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
                                <label style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Chi nhánh:</label>
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
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Tình trạng kho:</label>
                                <select
                                    className="pms-select"
                                    value={stockStatus}
                                    onChange={(e) => setStockStatus(e.target.value)}
                                    style={{ minWidth: 200, padding: '5px 10px' }}
                                >
                                    <option value="ALL">Tất cả tình trạng kho</option>
                                    <option value="IN_STOCK">Tồn kho an toàn (Đạt chuẩn)</option>
                                    <option value="LOW_STOCK">Cảnh báo tồn dưới mức an toàn</option>
                                    <option value="OUT_OF_STOCK">Đã hết hàng trong kho (0)</option>
                                    <option value="EXPIRING_SOON">Thuốc cận hạn dùng (&lt; 90 ngày)</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                className="btn-pms btn-pms-secondary"
                                onClick={handleReset}
                                title="Đặt lại bộ lọc về mặc định"
                            >
                                Đặt lại
                            </button>
                        </div>

                        {/* Search Box */}
                        <div>
                            <input
                                type="text"
                                className="pms-input"
                                placeholder="Tìm tên thuốc, mã vạch, số lô..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 280, fontSize: 13 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── KPI Metric Cards (Standardized) ── */}
            <div className="pms-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', width: '100%', marginBottom: 20 }}>
                {/* 1. Valuation at Cost */}
                <div className="pms-stat-card">
                    <div className="pms-stat-icon emerald">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">Tổng Giá Trị Tồn Kho (Giá Vốn)</div>
                        <div className="pms-stat-value" style={{ whiteSpace: 'nowrap' }}>
                            {Number(report?.totalValuationCost || 0).toLocaleString('vi-VN')} ₫
                        </div>
                        <div className="pms-stat-sub">Vốn đầu tư nhập kho</div>
                    </div>
                </div>

                {/* 2. Valuation at Retail */}
                <div className="pms-stat-card">
                    <div className="pms-stat-icon blue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">Giá Trị Bán Lẻ Ước Tính</div>
                        <div className="pms-stat-value" style={{ whiteSpace: 'nowrap' }}>
                            {Number(report?.totalValuationRetail || 0).toLocaleString('vi-VN')} ₫
                        </div>
                        <div className="pms-stat-sub">Biên LN tiềm năng: {report?.potentialMarginPercentage || 0}%</div>
                    </div>
                </div>

                {/* 3. Total Physical Units */}
                <div className="pms-stat-card">
                    <div className="pms-stat-icon violet">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            <path d="M2 7l10-5 10 5" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">Tổng Số Lượng Tồn Thực Tế</div>
                        <div className="pms-stat-value" style={{ whiteSpace: 'nowrap' }}>
                            {Number(report?.totalUnitsInStock || 0).toLocaleString('vi-VN')}
                        </div>
                        <div className="pms-stat-sub">Trên {report?.totalSkus || 0} mặt hàng thuốc</div>
                    </div>
                </div>

                {/* 4. Risk & Safety Alerts */}
                <div className="pms-stat-card">
                    <div className="pms-stat-icon red">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                    <div>
                        <div className="pms-stat-label">Cảnh Báo Rủi Ro Tồn Kho</div>
                        <div className="pms-stat-value" style={{ whiteSpace: 'nowrap' }}>
                            {(report?.lowStockCount || 0) + (report?.expiringSoonCount || 0) + (report?.outOfStockCount || 0)}
                        </div>
                        <div className="pms-stat-sub">
                            {report?.lowStockCount || 0} dưới ngưỡng · {report?.expiringSoonCount || 0} cận hạn · {report?.outOfStockCount || 0} hết hàng
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Navigation Tabs (Enterprise Standard) ── */}
            <div className="pms-tabs" style={{ marginBottom: 20 }}>
                <button
                    type="button"
                    className={`pms-tab ${activeTab === 'items' ? 'active' : ''}`}
                    onClick={() => setActiveTab('items')}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    <span>Mức Tồn & Định Giá Lô Thuốc</span>
                    <span style={{
                        fontSize: 11,
                        padding: '1px 6px',
                        borderRadius: 10,
                        background: activeTab === 'items' ? 'rgba(5, 150, 105, 0.12)' : 'var(--bg-card)',
                        color: activeTab === 'items' ? 'var(--brand-primary)' : 'var(--text-muted)',
                        fontWeight: 600,
                    }}>
                        {report?.items?.length || 0}
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
                        <span>So Sánh Định Giá Theo Chi Nhánh</span>
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
                    className={`pms-tab ${activeTab === 'movements' ? 'active' : ''}`}
                    onClick={() => setActiveTab('movements')}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10" />
                        <polyline points="1 20 1 14 7 14" />
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    <span>Biến Động Thẻ Kho & Nhật Ký</span>
                    <span style={{
                        fontSize: 11,
                        padding: '1px 6px',
                        borderRadius: 10,
                        background: activeTab === 'movements' ? 'rgba(5, 150, 105, 0.12)' : 'var(--bg-card)',
                        color: activeTab === 'movements' ? 'var(--brand-primary)' : 'var(--text-muted)',
                        fontWeight: 600,
                    }}>
                        {report?.movements?.length || 0}
                    </span>
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
                                    <th>Tên Thuốc / Dược Phẩm</th>
                                    <th>Mã Vạch</th>
                                    <th>Số Lô (Batch)</th>
                                    <th>Hạn Dùng (EXP)</th>
                                    <th>Chi Nhánh / Kho</th>
                                    <th style={{ textAlign: 'right' }}>Số Lượng Tồn</th>
                                    <th style={{ textAlign: 'right' }}>Đơn Giá Vốn (₫)</th>
                                    <th style={{ textAlign: 'right' }}>Định Giá (Vốn)</th>
                                    <th style={{ textAlign: 'center' }}>Tình Trạng Kho</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={10} style={{ textAlign: 'center', padding: '40px' }}>
                                            <div className="pms-spinner" />
                                            <span style={{ display: 'block', marginTop: 10, color: '#64748b' }}>
                                                Đang tính toán số lượng tồn và định giá…
                                            </span>
                                        </td>
                                    </tr>
                                ) : filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            Không tìm thấy mặt hàng nào phù hợp với bộ lọc.
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
                                                    {isExpiring && <span style={{ fontSize: 11, display: 'block', color: '#dc2626' }}>(Còn {item.daysUntilExpiry} ngày)</span>}
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
                                                        {isOut ? 'Hết hàng' : isLow ? 'Sắp hết' : 'Đạt chuẩn'}
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
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Phân Bổ Định Giá Tồn Kho Giữa Các Chi Nhánh</h3>
                        <span style={{ fontSize: 12, color: '#64748b' }}>So sánh nguồn vốn tồn kho đang lưu trữ tại các chi nhánh và kho trung tâm</span>
                    </div>

                    <div className="pms-table-container">
                        <table className="pms-table">
                            <thead>
                                <tr>
                                    <th>Mã Chi Nhánh</th>
                                    <th>Tên Chi Nhánh / Kho</th>
                                    <th style={{ textAlign: 'right' }}>Số Mặt Hàng</th>
                                    <th style={{ textAlign: 'right' }}>Tổng Đơn Vị</th>
                                    <th style={{ textAlign: 'right' }}>Định Giá Theo Vốn (₫)</th>
                                    <th style={{ textAlign: 'right' }}>Giá Trị Bán Lẻ (₫)</th>
                                    <th style={{ textAlign: 'right' }}>Lợi Nhuận Tiềm Năng (₫)</th>
                                    <th style={{ textAlign: 'center' }}>Biên LN Tiềm Năng</th>
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
                                            Không có dữ liệu định giá của chi nhánh.
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
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Nhật Ký Biến Động Thẻ Kho Toàn Chuỗi</h3>
                        <span style={{ fontSize: 12, color: '#64748b' }}>Theo dõi theo thời gian thực các giao dịch nhập kho, bán hàng, điều chuyển và kiểm kê</span>
                    </div>

                    <div className="pms-table-container">
                        <table className="pms-table">
                            <thead>
                                <tr>
                                    <th>Thời Gian</th>
                                    <th>Chi Nhánh / Kho</th>
                                    <th>Tên Thuốc</th>
                                    <th>Số Lô</th>
                                    <th>Loại Biến Động</th>
                                    <th style={{ textAlign: 'right' }}>Biến Động (Qty)</th>
                                    <th style={{ textAlign: 'right' }}>Tồn Sau Động</th>
                                    <th>Chứng Từ Tham Chiếu</th>
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
                                            Không có bản ghi biến động kho trong khoảng thời gian này.
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
