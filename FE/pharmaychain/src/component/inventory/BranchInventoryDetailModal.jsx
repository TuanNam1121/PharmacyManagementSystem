import { money, formatDate } from '../../utils/format';

export default function BranchInventoryDetailModal({ show, onHide, item }) {
    if (!show || !item) return null;

    return (
        <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
            <div className="pms-modal pms-modal-lg">
                <div className="pms-modal-header">
                    <div>
                        <div className="pms-modal-title">Thông tin chi tiết Lô thuốc & Tồn kho</div>
                        <div className="pms-modal-sub">
                            Mã vạch: <strong>{item.barcode || 'N/A'}</strong> — Chi nhánh: <strong>{item.storeName}</strong>
                        </div>
                    </div>
                    <button type="button" className="pms-modal-close" onClick={onHide} aria-label="Close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="pms-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 16 }}>
                        <div className="pms-card" style={{ padding: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
                                Thông tin dược phẩm
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                                <div>Tên biệt dược: <strong style={{ color: 'var(--brand-primary-dark)' }}>{item.productName}</strong></div>
                                <div>Hoạt chất chính: <span>{item.activeIngredient || 'Không có'}</span></div>
                                <div>Đơn vị tính: <span>{item.unit}</span></div>
                                <div>Nhà sản xuất: <span>{item.manufacturer || 'Đang cập nhật'}</span></div>
                                <div>Kê đơn [Rx]: <span>{item.isPrescription ? 'Bắt buộc kê đơn' : 'Không kê đơn (OTC)'}</span></div>
                            </div>
                        </div>

                        <div className="pms-card" style={{ padding: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
                                Số lô & Hạn sử dụng
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                                <div>Số lô sản xuất: <strong style={{ fontFamily: 'monospace' }}>{item.batchNumber}</strong></div>
                                <div>Ngày sản xuất: <span>{formatDate(item.manufactureDate)}</span></div>
                                <div>Hạn dùng: <strong style={{ color: item.expiryStatus === 'EXPIRED' ? 'var(--color-danger)' : 'var(--text-primary)' }}>{formatDate(item.expiryDate)}</strong></div>
                                <div>Số ngày còn lại: <span>{item.daysToExpiry != null ? `${item.daysToExpiry} ngày` : '-'}</span></div>
                                <div>Trạng thái hạn:
                                    <span className={`pms-badge ${item.expiryStatus === 'EXPIRED' ? 'pms-badge-danger' : (item.expiryStatus === 'EXPIRING_SOON' ? 'pms-badge-warning' : 'pms-badge-success')}`} style={{ marginLeft: 6 }}>
                                        {item.expiryStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pms-card" style={{ padding: 14, background: 'var(--bg-canvas)' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
                            Số lượng tồn kho & Giá trị kinh doanh
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, textAlign: 'center' }}>
                            <div>
                                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Tồn thực tế</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--brand-primary)' }}>{item.quantity} {item.unit}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Ngưỡng tối thiểu</div>
                                <div style={{ fontSize: 18, fontWeight: 700 }}>{item.minQuantity} {item.unit}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Đơn giá bán</div>
                                <div style={{ fontSize: 16, fontWeight: 700 }}>{money(item.sellingPrice)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Tổng giá trị tồn</div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-info)' }}>{money(item.totalValue)}</div>
                            </div>
                        </div>
                    </div>
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
