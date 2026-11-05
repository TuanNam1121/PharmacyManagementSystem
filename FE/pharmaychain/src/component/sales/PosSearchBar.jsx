import React, { useState, useEffect, useRef } from 'react';
import { getBranchInventory } from '../../api/BranchInventoryAPI';
import { money, formatDate } from '../../utils/format';

export default function PosSearchBar({ storeId = 1, onSelectItem }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Global shortcut F2 to focus
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                inputRef.current?.focus();
                inputRef.current?.select();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
                // Filter out out-of-stock items
                const available = items.filter((item) => (item.quantity || 0) > 0);
                setResults(available);
                setDropdownOpen(available.length > 0);
                setSelectedIndex(0);
            } catch (err) {
                console.error('POS search error:', err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 250);

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
        onSelectItem({
            productId: item.productId,
            productName: item.productName,
            barcode: item.barcode,
            batchId: item.batchId,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
            unit: item.unit || 'Hộp',
            sellingPrice: item.sellingPrice,
            quantity: 1,
            availableQuantity: item.quantity,
            activeIngredient: item.activeIngredient,
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
        <div style={{ position: 'relative', width: '100%' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{
                    position: 'absolute', left: 14, color: 'var(--brand-primary, #059669)',
                    display: 'flex', alignItems: 'center', pointerEvents: 'none'
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </span>

                <input
                    ref={inputRef}
                    type="text"
                    className="pms-input"
                    style={{
                        paddingLeft: 42,
                        paddingRight: 80,
                        height: 44,
                        fontSize: 14,
                        fontWeight: 500,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                    placeholder="Quét mã vạch Barcode hoặc tìm tên thuốc, hoạt chất... (F2)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />

                <span style={{
                    position: 'absolute', right: 12, fontSize: 11, fontWeight: 700,
                    background: '#e5e7eb', color: '#4b5563', padding: '2px 8px', borderRadius: 4,
                    pointerEvents: 'none'
                }}>
                    F2
                </span>
            </div>

            {/* Dropdown search results */}
            {dropdownOpen && (
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        background: '#fff',
                        borderRadius: 8,
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
                        border: '1px solid var(--border-color)',
                        marginTop: 4,
                        maxHeight: 380,
                        overflowY: 'auto',
                    }}
                >
                    {loading && (
                        <div style={{ padding: 14, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                            Đang tìm kiếm kho thuốc...
                        </div>
                    )}

                    {!loading && results.length === 0 && (
                        <div style={{ padding: 14, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                            Không tìm thấy thuốc khả dụng trong kho chi nhánh
                        </div>
                    )}

                    {!loading && results.map((item, idx) => {
                        const isSelected = idx === selectedIndex;
                        return (
                            <div
                                key={`${item.productId}-${item.batchId || idx}`}
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() => setSelectedIndex(idx)}
                                style={{
                                    padding: '10px 14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    background: isSelected ? 'var(--brand-primary-light, #ecfdf5)' : '#fff',
                                    borderBottom: '1px solid #f3f4f6',
                                    transition: 'background 0.15s ease',
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <strong style={{ fontSize: 14, color: isSelected ? 'var(--brand-primary, #059669)' : '#111827' }}>
                                            {item.productName}
                                        </strong>
                                        <span className="pms-badge pms-badge-secondary" style={{ fontSize: 11 }}>
                                            {item.unit || 'Hộp'}
                                        </span>
                                        {idx === 0 && (
                                            <span className="pms-badge pms-badge-success" style={{ fontSize: 10 }}>
                                                FEFO Ưu tiên
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 12 }}>
                                        {item.activeIngredient && (
                                            <span>Hoạt chất: <strong>{item.activeIngredient}</strong></span>
                                        )}
                                        <span>Lô: <strong>{item.batchNumber || 'N/A'}</strong></span>
                                        <span>HSD: <strong>{formatDate(item.expiryDate)}</strong></span>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand-primary, #059669)' }}>
                                        {money(item.sellingPrice)}
                                    </div>
                                    <div style={{ fontSize: 11, color: item.quantity <= 10 ? '#ef4444' : '#6b7280' }}>
                                        Còn: <strong>{item.quantity}</strong> {item.unit || 'đơn vị'}
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
