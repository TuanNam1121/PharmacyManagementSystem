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
                        <span>📊</span>
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
                                <label style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Chi nhánh:</label>
                                <select
                                    className="pms-select"
                                    value={storeId}
                                    onChange={(e) => setStoreId(e.target.value)}
                                    style={{ minWidth: 240, padding: '5px 10px' }}
                                >
                                    <option value="">Toàn hệ thống (Tất cả chi nhánh)</option>
                                    <option value="3">Chi nhánh 01 — Nhà thuốc Cầu Giấy (ST01)</option>
                                    <option value="4">Chi nhánh 02 — Nhà thuốc Đống Đa (ST02)</option>
                                    <option value="1">Trụ sở chính — Văn phòng điều hành (HQ)</option>
                                    <option value="2">Kho tổng trung tâm Miền Bắc (WH01)</option>
                                </select>
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
                                    <option value="LOW_STOCK">⚠️ Cảnh báo tồn dưới mức an toàn</option>
                                    <option value="OUT_OF_STOCK">🚨 Đã hết hàng trong kho (0)</option>
                                    <option value="EXPIRING_SOON">⏰ Thuốc cận hạn dùng (&lt; 90 ngày)</option>
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

            {/* ── KPI Metric Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                {/* 1. Valuation at Cost */}
                <div className="pms-card" style={{ padding: '18px 20px', borderLeft: '4px solid #0284c7' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                        Tổng Giá Trị Tồn Kho (Giá Vốn)
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 6 }}>
                        {Number(report?.totalValuationCost || 0).toLocaleString('vi-VN')} ₫
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        Vốn đầu tư nhập kho
                    </div>
                </div>

                {/* 2. Valuation at Retail */}
                <div className="pms-card" style={{ padding: '18px 20px', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                        Giá Trị Bán Lẻ Ước Tính
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#059669', marginTop: 6 }}>
                        {Number(report?.totalValuationRetail || 0).toLocaleString('vi-VN')} ₫
                    </div>
                    <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 4 }}>
                        Biên LN tiềm năng: {report?.potentialMarginPercentage || 0}%
                    </div>
                </div>

                {/* 3. Total Physical Units */}
                <div className="pms-card" style={{ padding: '18px 20px', borderLeft: '4px solid #6366f1' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                        Tổng Số Lượng Tồn Thực Tế
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#4338ca', marginTop: 6 }}>
                        {Number(report?.totalUnitsInStock || 0).toLocaleString('vi-VN')}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        Trên <strong>{report?.totalSkus || 0}</strong> mặt hàng thuốc
                    </div>
                </div>

                {/* 4. Risk & Safety Alerts */}
                <div className="pms-card" style={{ padding: '18px 20px', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                        Cảnh Báo Rủi Ro Tồn Kho
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
                        <span className="pms-badge pms-badge-warning" style={{ fontSize: 12 }}>
                            {report?.lowStockCount || 0} Dưới ngưỡng
                        </span>
                        <span className="pms-badge pms-badge-danger" style={{ fontSize: 12 }}>
                            {report?.expiringSoonCount || 0} Cận hạn
                        </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                        Hết hàng: {report?.outOfStockCount || 0} mặt hàng
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
                    📦 Mức Tồn & Định Giá Lô Thuốc ({report?.items?.length || 0})
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
                    🏪 So Sánh Định Giá Theo Chi Nhánh ({report?.storeBreakdown?.length || 0})
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
                    🔄 Biến Động Thẻ Kho & Nhật Ký ({report?.movements?.length || 0})
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
