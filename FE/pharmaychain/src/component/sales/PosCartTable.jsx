import React from 'react';
import { money, formatDate } from '../../utils/format';

export default function PosCartTable({
    items,
    onUpdateQuantity,
    onUpdateDosage,
    onRemoveItem,
    onClearCart,
}) {
    if (!items || items.length === 0) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '60px 20px', background: '#fff', borderRadius: 8, border: '1px dashed var(--border-color)',
                textAlign: 'center', minHeight: 320
            }}>
                <div style={{
                    width: 56, height: 56, borderRadius: '50%', background: 'var(--brand-primary-light, #ecfdf5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                    color: 'var(--brand-primary, #059669)'
                }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Giỏ hàng đang trống
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', maxWidth: 360 }}>
                    Quét mã vạch hoặc bấm <kbd style={{ padding: '2px 6px', background: '#e5e7eb', borderRadius: 4, fontWeight: 600 }}>F2</kbd> để tìm kiếm thuốc và thêm vào đơn hàng.
                </p>
            </div>
        );
    }

    return (
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 16px', background: '#f9fafb', borderBottom: '1px solid var(--border-color)'
            }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Danh sách thuốc ({items.length} mặt hàng)
                </span>
                <button
                    type="button"
                    className="btn-pms btn-pms-secondary"
                    style={{ fontSize: 12, padding: '4px 10px', color: '#ef4444' }}
                    onClick={onClearCart}
                    title="Xóa toàn bộ giỏ hàng (ESC)"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Xóa tất cả
                </button>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 380px)', minHeight: 250 }}>
                <table className="pms-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
                        <tr>
                            <th style={{ width: 40, textAlign: 'center' }}>#</th>
                            <th style={{ minWidth: 200 }}>Tên thuốc & Thông tin Lô</th>
                            <th style={{ width: 80, textAlign: 'center' }}>ĐVT</th>
                            <th style={{ width: 100, textAlign: 'right' }}>Đơn giá</th>
                            <th style={{ width: 130, textAlign: 'center' }}>Số lượng</th>
                            <th style={{ minWidth: 160 }}>Liều dùng / Hướng dẫn</th>
                            <th style={{ width: 110, textAlign: 'right' }}>Thành tiền</th>
                            <th style={{ width: 40, textAlign: 'center' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={`${item.productId}-${item.batchId}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    {index + 1}
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600, color: '#111827' }}>{item.productName}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', gap: 8, marginTop: 2 }}>
                                        <span>Lô: <strong>{item.batchNumber}</strong></span>
                                        {item.expiryDate && (
                                            <span>HSD: <strong>{formatDate(item.expiryDate)}</strong></span>
                                        )}
                                        {item.activeIngredient && (
                                            <span style={{ color: '#059669' }}>[{item.activeIngredient}]</span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span className="pms-badge pms-badge-secondary" style={{ fontSize: 11 }}>
                                        {item.unit}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                    {money(item.unitPrice)}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                        <button
                                            type="button"
                                            className="btn-pms btn-pms-secondary"
                                            style={{ width: 26, height: 26, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                                                width: 44, height: 26, textAlign: 'center', fontWeight: 700,
                                                border: '1px solid var(--border-color)', borderRadius: 4,
                                                padding: 0
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn-pms btn-pms-secondary"
                                            style={{ width: 26, height: 26, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            onClick={() => onUpdateQuantity(item.productId, item.batchId, item.quantity + 1)}
                                            disabled={item.availableQuantity && item.quantity >= item.availableQuantity}
                                        >
                                            +
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="pms-input"
                                        style={{ height: 28, fontSize: 12, padding: '2px 8px' }}
                                        placeholder="VD: Sáng 1v, Tối 1v sau ăn..."
                                        value={item.dosageInstruction || ''}
                                        onChange={(e) => onUpdateDosage(item.productId, item.batchId, e.target.value)}
                                    />
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-primary, #059669)' }}>
                                    {money(item.lineTotal)}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <button
                                        type="button"
                                        style={{
                                            border: 'none', background: 'transparent', cursor: 'pointer',
                                            color: '#9ca3af', padding: 4, borderRadius: 4
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
