import React from 'react';
import { money, formatDate } from '../../utils/format';

export default function PosCartTable({
    items,
    onUpdateUnit,
    onUpdateQuantity,
    onUpdateDosage,
    onRemoveItem,
    onClearCart,
}) {
    if (!items || items.length === 0) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 24px',
                background: '#fff',
                borderRadius: 12,
                border: '1.5px dashed #cbd5e1',
                textAlign: 'center',
                minHeight: 340,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
                <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'var(--brand-primary-light, #ecfdf5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                    color: 'var(--brand-primary, #059669)'
                }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Đơn hàng chưa có sản phẩm nào
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', maxWidth: 420, lineHeight: 1.5 }}>
                    Tìm kiếm tên thuốc ở thanh tìm kiếm phía trên hoặc quét mã vạch sản phẩm để thêm vào đơn hàng.
                </p>
            </div>
        );
    }

    const totalUnits = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

    return (
        <div style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Table Header Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 18px',
                background: '#f8fafc',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Danh Sách Thuốc & Sản Phẩm
                    </span>
                    <span className="pms-badge pms-badge-secondary" style={{ fontSize: 11, padding: '2px 8px' }}>
                        {items.length} mặt hàng ({totalUnits} đơn vị)
                    </span>
                </div>

                <button
                    type="button"
                    className="btn-pms btn-pms-secondary"
                    style={{ fontSize: 12, padding: '4px 10px', color: '#ef4444', height: 30 }}
                    onClick={onClearCart}
                    title="Xóa toàn bộ giỏ hàng"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 4 }}>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Xóa tất cả
                </button>
            </div>

            {/* Scrollable Table Area */}
            <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 420px)', minHeight: 280 }}>
                <table className="pms-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, margin: 0 }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                        <tr>
                            <th style={{ width: 44, textAlign: 'center', padding: '10px 8px' }}>#</th>
                            <th style={{ minWidth: 220, textAlign: 'left', padding: '10px 12px' }}>THUỐC & LÔ HÀNG</th>
                            <th style={{ width: 85, textAlign: 'center', padding: '10px 8px' }}>ĐVT</th>
                            <th style={{ width: 110, textAlign: 'right', padding: '10px 12px' }}>ĐƠN GIÁ</th>
                            <th style={{ width: 130, textAlign: 'center', padding: '10px 8px' }}>SỐ LƯỢNG</th>
                            <th style={{ minWidth: 180, textAlign: 'left', padding: '10px 12px' }}>HƯỚNG DẪN LIỀU DÙNG</th>
                            <th style={{ width: 120, textAlign: 'right', padding: '10px 14px' }}>THÀNH TIỀN</th>
                            <th style={{ width: 44, textAlign: 'center', padding: '10px 8px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => {
                            const isExpired = () => {
                                if (!item) return false;
                                if (item.expiryStatus === 'EXPIRED') return true;
                                if (!item.expiryDate) return false;
                                const exp = new Date(item.expiryDate);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return exp <= today;
                            };
                            const expired = isExpired();

                            return (
                            <tr key={`${item.productId}-${item.batchId}`} style={{ borderBottom: '1px solid #f1f5f9', background: expired ? '#fef2f2' : '#fff' }}>
                                <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
                                    {index + 1}
                                </td>
                                <td style={{ padding: '10px 12px' }}>
                                    <div style={{ fontWeight: 700, color: expired ? '#dc2626' : '#0f172a', fontSize: 13.5 }}>
                                        {item.productName}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 3 }}>
                                        <span>Lô: <strong style={{ color: '#334155' }}>{item.batchNumber}</strong></span>
                                        {item.expiryDate && (
                                            <span>
                                                HSD: <strong style={{ color: expired ? '#dc2626' : '#334155' }}>{formatDate(item.expiryDate)}</strong>
                                                {expired && (
                                                    <span style={{
                                                        marginLeft: 6,
                                                        padding: '1px 6px',
                                                        borderRadius: 4,
                                                        background: '#dc2626',
                                                        color: '#fff',
                                                        fontWeight: 800,
                                                        fontSize: 10
                                                    }}>
                                                        ⛔ ĐÃ HẾT HẠN
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                        {item.activeIngredient && (
                                            <span style={{ color: '#0d9488', fontWeight: 600 }}>[{item.activeIngredient}]</span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                                    {item.units && item.units.length > 0 ? (
                                        <select
                                            value={item.unitId || ''}
                                            onChange={(e) => onUpdateUnit && onUpdateUnit(item.productId, item.batchId, e.target.value)}
                                            style={{
                                                fontSize: 11.5,
                                                padding: '2px 4px',
                                                height: 28,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                borderRadius: 6,
                                                background: '#f0fdf4',
                                                border: '1px solid #86efac',
                                                color: '#166534',
                                                outline: 'none',
                                            }}
                                            title="Bấm để đổi đơn vị tính (Viên / Vỉ / Hộp)"
                                        >
                                            {item.units.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.unitName}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="pms-badge pms-badge-secondary" style={{ fontSize: 11 }}>
                                            {item.unit}
                                        </span>
                                    )}
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 600, padding: '10px 12px', color: '#334155' }}>
                                    {money(item.unitPrice)}
                                </td>
                                <td style={{ padding: '10px 8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                        <button
                                            type="button"
                                            className="pos-stepper-btn"
                                            onClick={() => onUpdateQuantity(item.productId, item.batchId, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max={item.availableQuantity}
                                            value={item.quantity}
                                            onChange={(e) => onUpdateQuantity(item.productId, item.batchId, e.target.value)}
                                            style={{
                                                width: 48,
                                                height: 28,
                                                textAlign: 'center',
                                                fontWeight: 700,
                                                fontSize: 13,
                                                border: '1px solid var(--border-color)',
                                                borderRadius: 6,
                                                padding: 0,
                                                color: 'var(--text-primary)'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="pos-stepper-btn"
                                            onClick={() => onUpdateQuantity(item.productId, item.batchId, item.quantity + 1)}
                                            disabled={item.availableQuantity && item.quantity >= item.availableQuantity}
                                        >
                                            +
                                        </button>
                                    </div>
                                </td>
                                <td style={{ padding: '10px 12px' }}>
                                    <input
                                        type="text"
                                        className="pms-input"
                                        style={{ height: 32, fontSize: 12, padding: '4px 10px', background: '#f8fafc', borderRadius: 6 }}
                                        placeholder="VD: Sáng 1v, Tối 1v sau ăn..."
                                        value={item.dosageInstruction || ''}
                                        onChange={(e) => onUpdateDosage(item.productId, item.batchId, e.target.value)}
                                    />
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--brand-primary, #059669)', fontSize: 14, padding: '10px 14px' }}>
                                    {money(item.lineTotal)}
                                </td>
                                <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                                    <button
                                        type="button"
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            color: '#94a3b8',
                                            padding: 6,
                                            borderRadius: 6,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'color 0.15s, background 0.15s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = '#ef4444';
                                            e.currentTarget.style.background = '#fef2f2';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = '#94a3b8';
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                        onClick={() => onRemoveItem(item.productId, item.batchId)}
                                        title="Xóa thuốc"
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
