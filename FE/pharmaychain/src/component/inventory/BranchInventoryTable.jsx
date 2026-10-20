import { money, formatDate } from '../../utils/format';

function Pagination({ total, page, size, onPage }) {
    if (total <= size) return null;
    const totalPages = Math.ceil(total / size);
    return (
        <div className="pms-pagination">
            <button type="button" className="pms-page-btn" disabled={page === 0} onClick={() => onPage(page - 1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                <button
                    type="button"
                    key={i}
                    className={`pms-page-btn ${page === i ? 'active' : ''}`}
                    onClick={() => onPage(i)}
                >
                    {i + 1}
                </button>
            ))}
            {totalPages > 7 && <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>}
            <button type="button" className="pms-page-btn" disabled={page + 1 >= totalPages} onClick={() => onPage(page + 1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </button>
        </div>
    );
}

export default function BranchInventoryTable({
    items,
    loading,
    total,
    page,
    size,
    onPage,
    onViewDetail,
    onEditThreshold,
}) {
    const renderStockBadge = (item) => {
        if (item.stockStatus === 'OUT_OF_STOCK') {
            return <span className="pms-badge pms-badge-danger">Hết hàng</span>;
        }
        if (item.stockStatus === 'LOW_STOCK') {
            return <span className="pms-badge pms-badge-warning">Sắp hết ({item.quantity}/{item.minQuantity})</span>;
        }
        return <span className="pms-badge pms-badge-success">Đủ hàng</span>;
    };

    const renderExpiryBadge = (item) => {
        if (item.expiryStatus === 'EXPIRED') {
            return (
                <span className="pms-badge pms-badge-danger" title={`Quá hạn ${Math.abs(item.daysToExpiry || 0)} ngày`}>
                    Hết hạn ({formatDate(item.expiryDate)})
                </span>
            );
        }
        if (item.expiryStatus === 'EXPIRING_SOON') {
            return (
                <span className="pms-badge pms-badge-warning" title={`Còn ${item.daysToExpiry} ngày`}>
                    Cận hạn ({item.daysToExpiry} ngày)
                </span>
            );
        }
        return (
            <span className="pms-badge pms-badge-neutral">
                {formatDate(item.expiryDate)}
            </span>
        );
    };

    return (
        <div className="pms-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="pms-card-header">
                <div>
                    <div className="pms-card-title">Danh mục thuốc & Lô hàng tồn kho chi nhánh</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        Hiển thị tình trạng tồn thực tế, hạn dùng và chỉ số cảnh báo rủi ro
                    </div>
                </div>
                <span className="pms-badge pms-badge-neutral">{total} lô thuốc</span>
            </div>

            <div className="pms-table-wrap">
                <table className="pms-table">
                    <thead>
                        <tr>
                            <th>Mã Barcode</th>
                            <th>Tên thuốc & Hoạt chất</th>
                            <th>Số Lô (Batch)</th>
                            <th>Hạn dùng & Cảnh báo</th>
                            <th style={{ textAlign: 'right' }}>Tồn kho / Ngưỡng</th>
                            <th style={{ textAlign: 'right' }}>Đơn giá bán</th>
                            <th style={{ textAlign: 'right' }}>Tổng giá trị</th>
                            <th style={{ textAlign: 'center' }}>Vị trí</th>
                            <th style={{ textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                                    Đang tải dữ liệu tồn kho chi nhánh...
                                </td>
                            </tr>
                        ) : !items || items.length === 0 ? (
                            <tr>
                                <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                                    Không tìm thấy mặt hàng tồn kho nào phù hợp
                                </td>
                            </tr>
                        ) : (
                            items.map((row) => (
                                <tr key={row.id}>
                                    <td>
                                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                                            {row.barcode || `PRD-${row.productId}`}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--brand-primary-dark)' }}>{row.productName}</div>
                                        <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                                            {row.activeIngredient ? `HC: ${row.activeIngredient}` : ''} ({row.unit})
                                            {row.isPrescription && <span style={{ color: 'var(--color-danger)', marginLeft: 6, fontWeight: 700 }}>[Rx]</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="pms-badge pms-badge-neutral" style={{ fontFamily: 'monospace' }}>
                                            {row.batchNumber || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        {renderExpiryBadge(row)}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: row.quantity === 0 ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                                            {row.quantity.toLocaleString()} {row.unit}
                                        </div>
                                        <div>{renderStockBadge(row)}</div>
                                    </td>
                                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                                        {money(row.sellingPrice)}
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {money(row.totalValue)}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                            {row.locationCode || 'Quầy chính'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'inline-flex', gap: 6 }}>
                                            <button
                                                type="button"
                                                className="btn-pms btn-pms-secondary btn-pms-sm"
                                                title="Xem chi tiết"
                                                onClick={() => onViewDetail(row)}
                                            >
                                                Chi tiết
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-pms btn-pms-ghost btn-pms-sm"
                                                title="Cập nhật mức cảnh báo tồn tối thiểu"
                                                onClick={() => onEditThreshold(row)}
                                            >
                                                Sửa Min
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                <Pagination total={total} page={page} size={size} onPage={onPage} />
            </div>
        </div>
    );
}
