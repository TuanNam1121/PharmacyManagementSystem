import { money, formatDate } from '../../utils/format';

export default function BranchInventoryDetailModal({ show, onHide, item }) {
    if (!show || !item) return null;

    return (
        <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
            <div className="pms-modal pms-modal-lg">
                <div className="pms-modal-header">
                    <div>
                        <div className="pms-modal-title">Medicine Batch & Stock Details</div>
                        <div className="pms-modal-sub">
                            Barcode: <strong>{item.barcode || 'N/A'}</strong> — Branch: <strong>{item.storeName}</strong>
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
                                Product Information
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                                <div>Drug Name: <strong style={{ color: 'var(--brand-primary-dark)' }}>{item.productName}</strong></div>
                                <div>Active Ingredient: <span>{item.activeIngredient || 'None'}</span></div>
                                <div>Unit of Measure: <span>{item.unit}</span></div>
                                <div>Manufacturer: <span>{item.manufacturer || 'N/A'}</span></div>
                                <div>Prescription [Rx]: <span>{item.isPrescription ? 'Prescription Required' : 'Over the Counter (OTC)'}</span></div>
                            </div>
                        </div>

                        <div className="pms-card" style={{ padding: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
                                Batch & Expiry Tracking
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                                <div>Batch Number: <strong style={{ fontFamily: 'monospace' }}>{item.batchNumber}</strong></div>
                                <div>Manufacture Date: <span>{formatDate(item.manufactureDate)}</span></div>
                                <div>Expiry Date: <strong style={{ color: item.expiryStatus === 'EXPIRED' ? 'var(--color-danger)' : 'var(--text-primary)' }}>{formatDate(item.expiryDate)}</strong></div>
                                <div>Days to Expiry: <span>{item.daysToExpiry != null ? `${item.daysToExpiry} days` : '-'}</span></div>
                                <div>Expiry Status:
                                    <span className={`pms-badge ${item.expiryStatus === 'EXPIRED' ? 'pms-badge-danger' : (item.expiryStatus === 'EXPIRING_SOON' ? 'pms-badge-warning' : 'pms-badge-success')}`} style={{ marginLeft: 6 }}>
                                        {item.expiryStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pms-card" style={{ padding: 14, background: 'var(--bg-canvas)' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
                            Inventory Quantity & Valuation
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, textAlign: 'center' }}>
                            <div>
                                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Actual Stock</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--brand-primary)' }}>{item.quantity} {item.unit}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Min Threshold</div>
                                <div style={{ fontSize: 18, fontWeight: 700 }}>{item.minQuantity} {item.unit}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Selling Price</div>
                                <div style={{ fontSize: 16, fontWeight: 700 }}>{money(item.sellingPrice)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Total Stock Value</div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-info)' }}>{money(item.totalValue)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pms-modal-footer">
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
