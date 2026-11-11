import React, { useState, useEffect, useRef } from 'react';
import { getBranchInventory } from '../../api/BranchInventoryAPI';
import { money, formatDate } from '../../utils/format';

/**
 * Kiểm tra xem một lô hàng trong kho đã hết hạn sử dụng hay chưa
 */
export const isBatchExpired = (item) => {
    if (!item) return false;
    if (item.expiryStatus === 'EXPIRED') return true;
    if (!item.expiryDate) return false;
    const exp = new Date(item.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return exp <= today;
};

export default function PosSearchBar({ storeId = 1, onSelectItem }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Debounced search
    useEffect(() => {
        if (!searchTerm.trim()) {
            setResults([]);
            setDropdownOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await getBranchInventory({
                    storeId,
                    search: searchTerm.trim(),
                    page: 0,
                    size: 15,
                });
                const items = res?.content || (Array.isArray(res) ? res : []);
                // Lọc bỏ hàng hết tồn kho
                const available = items.filter((item) => (item.quantity || 0) > 0);
                // Sắp xếp: Lô còn hạn lên trước (FEFO HSD gần nhất trước), lô hết hạn đẩy xuống cuối
                available.sort((a, b) => {
                    const expA = isBatchExpired(a);
                    const expB = isBatchExpired(b);
                    if (expA !== expB) return expA ? 1 : -1;
                    if (!a.expiryDate) return 1;
                    if (!b.expiryDate) return -1;
                    return new Date(a.expiryDate) - new Date(b.expiryDate);
                });
                setResults(available);
                setDropdownOpen(available.length > 0);
                setSelectedIndex(0);
            } catch (err) {
                console.error('POS search error:', err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [searchTerm, storeId]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                inputRef.current &&
                !inputRef.current.contains(e.target)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (item) => {
        if (isBatchExpired(item)) {
            alert(`⛔ CẢNH BÁO: Thuốc "${item.productName}" (Lô: ${item.batchNumber || 'N/A'}) đã HẾT HẠN SỬ DỤNG (${formatDate(item.expiryDate)})!\n\nQuy định y tế và dược phẩm nghiêm cấm xuất bán thuốc đã hết hạn.`);
            return;
        }

        onSelectItem({
            productId: item.productId,
            productName: item.productName,
            barcode: item.barcode,
            batchId: item.batchId,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
            unit: item.unit || 'Hộp',
            units: item.units || [],
            sellingPrice: item.sellingPrice,
            quantity: 1,
            availableQuantity: item.quantity,
            activeIngredient: item.activeIngredient,
            isPrescription: item.isPrescription,
        });
        setSearchTerm('');
        setResults([]);
        setDropdownOpen(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (!dropdownOpen || results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results[selectedIndex]) {
                handleSelect(results[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            setDropdownOpen(false);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', zIndex: 40 }}>
            <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                background: '#fff',
                borderRadius: '10px',
                border: '1.5px solid var(--border-color)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
            }}>
                {/* Search Icon */}
                <div style={{
                    paddingLeft: 14,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--brand-primary)',
                    pointerEvents: 'none'
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    style={{
                        flex: 1,
                        height: 46,
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        padding: '0 12px',
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                    }}
                    placeholder="Tìm kiếm thuốc theo tên, hoạt chất, số lô hoặc quét mã vạch Barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />

                {searchTerm && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearchTerm('');
                            setResults([]);
                            inputRef.current?.focus();
                        }}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: '#9ca3af',
                            padding: '4px 8px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        title="Xóa tìm kiếm"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}

                <div style={{
                    paddingRight: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#94a3b8'
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" title="Hỗ trợ máy quét mã vạch">
                        <path d="M3 5v4M3 15v4M21 5v4M21 15v4M7 8v8M11 8v8M14 8v8M17 8v8" />
                    </svg>
                </div>
            </div>

            {/* Dropdown search results */}
            {dropdownOpen && (
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        right: 0,
                        zIndex: 100,
                        background: '#fff',
                        borderRadius: 12,
                        boxShadow: '0 16px 36px -4px rgba(0,0,0,0.18), 0 6px 12px -2px rgba(0,0,0,0.08)',
                        border: '1px solid var(--border-color)',
                        maxHeight: 400,
                        overflowY: 'auto',
                    }}
                >
                    {loading && (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                            <div className="spinner-border spinner-border-sm" style={{ marginRight: 8, color: 'var(--brand-primary)' }} />
                            Đang tra cứu kho thuốc chi nhánh...
                        </div>
                    )}

                    {!loading && results.length === 0 && (
                        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                            Không tìm thấy thuốc khả dụng trong kho hoặc thuốc đã hết hàng
                        </div>
                    )}

                    {!loading && results.map((item, idx) => {
                        const expired = isBatchExpired(item);
                        const isSelected = idx === selectedIndex;
                        const firstValidIdx = results.findIndex((it) => !isBatchExpired(it));
                        const isFEFO = idx === firstValidIdx && !expired;

                        const itemBackground = expired
                            ? (isSelected ? '#fee2e2' : '#fef2f2')
                            : (isSelected ? 'var(--brand-primary-light, #ecfdf5)' : '#fff');

                        return (
                            <div
                                key={`${item.productId}-${item.batchId || idx}`}
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() => setSelectedIndex(idx)}
                                style={{
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: expired ? 'not-allowed' : 'pointer',
                                    background: itemBackground,
                                    borderBottom: '1px solid #f1f5f9',
                                    opacity: expired ? 0.78 : 1,
                                    transition: 'background 0.12s ease',
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: expired
                                                ? '#dc2626'
                                                : (isSelected ? 'var(--brand-primary, #059669)' : 'var(--text-primary)')
                                        }}>
                                            {item.productName}
                                        </span>
                                        <span className="pms-badge pms-badge-secondary" style={{ fontSize: 11, padding: '2px 7px' }}>
                                            {item.unit || 'Hộp'}
                                        </span>
                                        {item.isPrescription && (
                                            <span style={{
                                                fontSize: 10,
                                                fontWeight: 700,
                                                background: '#f3e8ff',
                                                color: '#7e22ce',
                                                padding: '2px 6px',
                                                borderRadius: 4,
                                                border: '1px solid #d8b4fe'
                                            }}>
                                                Rx Kê đơn
                                            </span>
                                        )}
                                        {expired ? (
                                            <span style={{
                                                fontSize: 10,
                                                fontWeight: 800,
                                                background: '#dc2626',
                                                color: '#fff',
                                                padding: '2px 8px',
                                                borderRadius: 4,
                                                boxShadow: '0 1px 3px rgba(220,38,38,0.3)'
                                            }}>
                                                ⛔ ĐÃ HẾT HẠN - CẤM BÁN
                                            </span>
                                        ) : isFEFO ? (
                                            <span style={{
                                                fontSize: 10,
                                                fontWeight: 700,
                                                background: '#dcfce7',
                                                color: '#15803d',
                                                padding: '2px 6px',
                                                borderRadius: 4,
                                                border: '1px solid #86efac'
                                            }}>
                                                ⚡ FEFO Xuất trước
                                            </span>
                                        ) : null}
                                    </div>

                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                                        {item.activeIngredient && (
                                            <span>Hoạt chất: <strong style={{ color: '#0f766e' }}>{item.activeIngredient}</strong></span>
                                        )}
                                        <span>Số lô: <strong style={{ color: '#334155' }}>{item.batchNumber || 'N/A'}</strong></span>
                                        <span>
                                            HSD:{' '}
                                            <strong style={{ color: expired ? '#dc2626' : '#334155' }}>
                                                {formatDate(item.expiryDate)}
                                            </strong>
                                            {expired && <span style={{ color: '#dc2626', fontWeight: 700, marginLeft: 4 }}>(Đã quá hạn)</span>}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: expired ? '#9ca3af' : 'var(--brand-primary, #059669)' }}>
                                        {money(item.sellingPrice)}
                                    </div>
                                    <div style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: expired ? '#dc2626' : (item.quantity <= 10 ? '#dc2626' : '#16a34a'),
                                        background: expired ? '#fee2e2' : (item.quantity <= 10 ? '#fef2f2' : '#f0fdf4'),
                                        padding: '1px 6px',
                                        borderRadius: 4,
                                        border: `1px solid ${expired ? '#fca5a5' : (item.quantity <= 10 ? '#fecaca' : '#bbf7d0')}`
                                    }}>
                                        {expired ? `Tồn quá hạn: ${item.quantity}` : `Tồn: ${item.quantity} ${item.unit || 'đơn vị'}`}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
