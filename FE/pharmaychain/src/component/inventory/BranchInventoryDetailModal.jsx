import { money, formatDate } from '../../utils/format';

export default function BranchInventoryDetailModal({ show, onHide, item }) {
    if (!show || !item) return null;

    return (
        <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
            <div className="pms-modal pms-modal-lg">
                <div className="pms-modal-header">
                    <div>
                        <div className="pms-modal-title">Chi Tiết Lô Thuốc & Tồn Kho Chi Nhánh</div>
                        <div className="pms-modal-sub">
                            Mã vạch: <strong>{item.barcode || 'N/A'}</strong> — Chi nhánh: <strong>{item.storeName}</strong>
                        </div>
                    </div>
                    <button type="button" className="pms-modal-close" onClick={onHide} aria-label="Đóng">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="pms-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 16 }}>
                        <div className="pms-card" style={{ padding: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
                                Thông Tin Dược Phẩm
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                                <div>Tên thuốc: <strong style={{ color: 'var(--brand-primary-dark)' }}>{item.productName}</strong></div>
                                <div>Hoạt chất: <span>{item.activeIngredient || 'Không có'}</span></div>
                                <div>Đơn vị tính: <span>{item.unit}</span></div>
                                <div>Nhà sản xuất: <span>{item.manufacturer || 'N/A'}</span></div>
                                <div>Phân loại kê đơn: <span>{item.isPrescription ? 'Thuốc kê đơn (Rx)' : 'Thuốc không kê đơn (OTC)'}</span></div>
                            </div>
                        </div>

                        <div className="pms-card" style={{ padding: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
                                Theo Dõi Lô Hạn Dùng
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                                <div>Số lô sản xuất: <strong style={{ fontFamily: 'monospace' }}>{item.batchNumber}</strong></div>
                                <div>Ngày sản xuất: <span>{formatDate(item.manufactureDate)}</span></div>
                                <div>Hạn sử dụng: <strong style={{ color: item.expiryStatus === 'EXPIRED' ? 'var(--color-danger)' : 'var(--text-primary)' }}>{formatDate(item.expiryDate)}</strong></div>
                                <div>Thời hạn còn lại: <span>{item.daysToExpiry != null ? `${item.daysToExpiry} ngày` : '-'}</span></div>
                                <div>Tình trạng hạn:
                                    <span className={`pms-badge ${item.expiryStatus === 'EXPIRED' ? 'pms-badge-danger' : (item.expiryStatus === 'EXPIRING_SOON' ? 'pms-badge-warning' : 'pms-badge-success')}`} style={{ marginLeft: 6 }}>
                                        {item.expiryStatus === 'EXPIRED' ? 'Đã hết hạn' : (item.expiryStatus === 'EXPIRING_SOON' ? 'Cận hạn' : 'Còn hạn tốt')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pms-card" style={{ padding: 14, background: 'var(--bg-canvas)' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
                            Số Lượng Tồn Kho & Giá Trị
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, textAlign: 'center' }}>
                            <div>
                                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Tồn thực tế</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--brand-primary)' }}>
                                    {item.quantity?.toLocaleString()} {item.baseUnitName || item.unit}
                                </div>
                                {item.packagingBreakdown && (
                                    <div style={{ fontSize: 11, color: '#0284c7', fontWeight: 600, marginTop: 2 }}>
                                        (~ {item.packagingBreakdown})
                                    </div>
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Định mức tối thiểu</div>
                                <div style={{ fontSize: 18, fontWeight: 700 }}>{item.minQuantity} {item.baseUnitName || item.unit}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Giá bán lẻ</div>
                                <div style={{ fontSize: 16, fontWeight: 700 }}>{money(item.sellingPrice)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Tổng giá trị tồn kho</div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-info)' }}>{money(item.totalValue)}</div>
                            </div>
                        </div>
                    </div>

                    {item.units && item.units.length > 0 && (
                        <div className="pms-card" style={{ padding: 14, marginTop: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10 }}>
                                Bảng Quy Đổi Đơn Vị & Tồn Khả Dụng
                            </div>
                            <div className="pms-table-wrap">
                                <table className="pms-table" style={{ fontSize: 12.5 }}>
                                    <thead>
                                        <tr>
                                            <th>Đơn Vị Bán</th>
                                            <th style={{ textAlign: 'center' }}>Hệ Số Quy Đổi</th>
                                            <th style={{ textAlign: 'right' }}>Giá Bán</th>
                                            <th style={{ textAlign: 'right' }}>Tồn Tối Đa Có Thể Bán</th>
                                            <th style={{ textAlign: 'center' }}>Loại Đơn Vị</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {item.units.map((u) => {
                                            const maxStock = Math.floor((item.quantity || 0) / (u.conversionFactor || 1));
                                            return (
                                                <tr key={u.id || u.unitName}>
                                                    <td style={{ fontWeight: 600 }}>{u.unitName}</td>
                                                    <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                                                        1 {u.unitName} = {u.conversionFactor} {item.baseUnitName || 'đơn vị'}
                                                    </td>
                                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{money(u.sellingPrice)}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 700, color: maxStock > 0 ? 'var(--brand-primary)' : 'var(--color-danger)' }}>
                                                        {maxStock.toLocaleString()} {u.unitName}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {u.isBaseUnit || u.conversionFactor === 1 ? (
                                                            <span className="pms-badge pms-badge-success" style={{ fontSize: 11 }}>Đơn vị cơ bản</span>
                                                        ) : (
                                                            <span className="pms-badge pms-badge-neutral" style={{ fontSize: 11 }}>Đơn vị quy đổi</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pms-modal-footer">
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
