import React, { useState, useEffect, useRef } from 'react';
import { searchProductsForRequisition } from '../../api/StockRequisitionAPI';

export default function CreateRequisitionModal({ show, onHide, defaultStoreId = 1, onConfirm, submitting }) {
    const [storeId, setStoreId] = useState(defaultStoreId);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [formError, setFormError] = useState(null);

    const searchRef = useRef(null);

    // Reset state & load initial list from Backend when Modal opens
    useEffect(() => {
        if (show) {
            setStoreId(defaultStoreId || 1);
            setSelectedItems([]);
            setSearchTerm('');
            setIsDropdownOpen(false);
            setFormError(null);
            fetchProductsFromBackend('');
        }
    }, [show, defaultStoreId]);

    // Click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── DEBOUNCE SEARCH: Send search query to Backend after 300ms ──────────────────
    useEffect(() => {
        if (!show) return;
        const handler = setTimeout(() => {
            fetchProductsFromBackend(searchTerm);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, show]);

    const fetchProductsFromBackend = async (query) => {
        setLoadingProducts(true);
        try {
            const data = await searchProductsForRequisition(query);
            setProducts(data || []);
        } catch (err) {
            console.error('Error fetching products from server:', err);
        } finally {
            setLoadingProducts(false);
        }
    };

    // Select product from Backend results -> Add to table
    const handleSelectProduct = (product) => {
        setFormError(null);
        setSelectedItems(prev => {
            const existingIndex = prev.findIndex(item => item.productId === product.id);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    requestedQty: Number(updated[existingIndex].requestedQty || 0) + 10
                };
                return updated;
            }
            return [
                ...prev,
                {
                    productId: product.id,
                    productName: product.name,
                    barcode: product.barcode,
                    unit: product.unit || 'Unit',
                    requestedQty: 10
                }
            ];
        });
        setSearchTerm('');
        setIsDropdownOpen(false);
    };

    // Increase/decrease quantity
    const handleQtyChange = (productId, value) => {
        const qty = value === '' ? '' : Math.max(1, parseInt(value, 10) || 1);
        setSelectedItems(prev => prev.map(item =>
            item.productId === productId ? { ...item, requestedQty: qty } : item
        ));
    };

    const handleStepQty = (productId, step) => {
        setSelectedItems(prev => prev.map(item => {
            if (item.productId === productId) {
                const current = Number(item.requestedQty) || 1;
                const nextVal = Math.max(1, current + step);
                return { ...item, requestedQty: nextVal };
            }
            return item;
        }));
    };

    const handleRemoveItem = (productId) => {
        setSelectedItems(prev => prev.filter(item => item.productId !== productId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (!storeId) {
            setFormError('Please select a requesting branch.');
            return;
        }

        if (selectedItems.length === 0) {
            setFormError('Please search and add at least one product item to the requisition.');
            return;
        }

        for (const item of selectedItems) {
            const qty = Number(item.requestedQty);
            if (isNaN(qty) || qty <= 0) {
                setFormError(`Requested quantity for product "${item.productName}" must be greater than 0.`);
                return;
            }
        }

        const payload = {
            storeId: Number(storeId),
            createdByUsername: 'manager',
            items: selectedItems.map(item => ({
                productId: item.productId,
                requestedQty: Number(item.requestedQty)
            }))
        };

        try {
            await onConfirm(payload);
        } catch (err) {
            setFormError(err.message || 'An error occurred while submitting the stock requisition.');
        }
    };

    const totalUnits = selectedItems.reduce((sum, item) => sum + (Number(item.requestedQty) || 0), 0);

    if (!show) return null;

    return (
        <div className="pms-modal-overlay" onClick={onHide}>
            <div className="pms-modal" style={{ maxWidth: 840, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    {/* Header */}
                    <div className="pms-modal-header" style={{ flexShrink: 0 }}>
                        <div>
                            <h3 className="pms-modal-title">Create Stock Requisition</h3>
                            <div className="pms-modal-sub">Submit a request to transfer pharmaceuticals from Main Warehouse to Branch</div>
                        </div>
                        <button type="button" className="pms-modal-close" onClick={onHide} disabled={submitting}>✕</button>
                    </div>

                    {/* Body */}
                    <div className="pms-modal-body" style={{ overflowY: 'auto', flex: 1, padding: 20 }}>
                        {formError && (
                            <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {formError}
                            </div>
                        )}

                        {/* Top Controls: Store selector & Server-side Search */}
                        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, marginBottom: 16 }}>
                            {/* Branch Picker */}
                            <div className="pms-form-group" style={{ margin: 0 }}>
                                <label className="pms-label" style={{ fontWeight: 600, fontSize: 13 }}>
                                    Receiving Branch *
                                </label>
                                <select
                                    className="pms-select"
                                    style={{ width: '100%' }}
                                    value={storeId}
                                    onChange={e => setStoreId(e.target.value)}
                                    disabled={submitting}
                                    required
                                >
                                    <option value="1">Store #1 — Central Pharmacy</option>
                                    <option value="2">Store #2 — Cau Giay Pharmacy</option>
                                    <option value="3">Store #3 — Dong Da Pharmacy</option>
                                </select>
                            </div>

                            {/* Server Search Autocomplete Box */}
                            <div className="pms-form-group" style={{ margin: 0, position: 'relative' }} ref={searchRef}>
                                <label className="pms-label" style={{ fontWeight: 600, fontSize: 13 }}>
                                    Search system products (Type to search from DB) *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="pms-input"
                                        style={{ width: '100%', paddingLeft: 34, paddingRight: 36 }}
                                        placeholder="Enter product name, active ingredient, barcode to search..."
                                        value={searchTerm}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        onChange={e => {
                                            setSearchTerm(e.target.value);
                                            setIsDropdownOpen(true);
                                        }}
                                        disabled={submitting}
                                    />
                                    {/* Search icon */}
                                    <svg
                                        width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                                    >
                                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    {/* Loading spinner or Clear button */}
                                    {loadingProducts ? (
                                        <div style={{
                                            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                            width: 14, height: 14, border: '2px solid #ccc', borderTopColor: 'var(--brand-primary)',
                                            borderRadius: '50%', animation: 'spin 0.6s linear infinite'
                                        }} />
                                    ) : searchTerm ? (
                                        <button
                                            type="button"
                                            onClick={() => { setSearchTerm(''); setIsDropdownOpen(false); }}
                                            style={{
                                                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14
                                            }}
                                        >
                                            ✕
                                        </button>
                                    ) : null}
                                </div>

                                {/* Autocomplete Results Dropdown */}
                                {isDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        zIndex: 1000,
                                        marginTop: 4,
                                        background: '#fff',
                                        border: '1px solid var(--border)',
                                        borderRadius: 8,
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                        maxHeight: 280,
                                        overflowY: 'auto'
                                    }}>
                                        {loadingProducts ? (
                                            <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
                                                Searching products in database...
                                            </div>
                                        ) : products.length === 0 ? (
                                            <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
                                                No products found matching "{searchTerm}"
                                            </div>
                                        ) : (
                                            products.map(p => {
                                                const isAdded = selectedItems.some(item => item.productId === p.id);
                                                return (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => handleSelectProduct(p)}
                                                        style={{
                                                            padding: '10px 14px',
                                                            borderBottom: '1px solid var(--border-color, #f1f5f9)',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            transition: 'background 0.15s ease',
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-canvas, #f8fafc)'}
                                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    >
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)' }}>
                                                                {p.name}
                                                            </div>
                                                            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2, display: 'flex', gap: 10 }}>
                                                                <span>Unit: <strong>{p.unit || 'Unit'}</strong></span>
                                                                {p.barcode && <span>Barcode: <code style={{ fontSize: 11 }}>{p.barcode}</code></span>}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            {isAdded ? (
                                                                <span className="pms-badge pms-badge-info" style={{ fontSize: 11 }}>
                                                                    + Add (+10)
                                                                </span>
                                                            ) : (
                                                                <span className="pms-badge pms-badge-neutral" style={{ fontSize: 11 }}>
                                                                    + Select
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selected Medicines Table */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                                SELECTED PRODUCTS LIST ({selectedItems.length} items)
                            </span>
                            {selectedItems.length > 0 && (
                                <button
                                    type="button"
                                    className="btn-pms btn-pms-secondary btn-pms-sm"
                                    onClick={() => setSelectedItems([])}
                                    style={{ fontSize: 11.5 }}
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                            <table className="pms-table" style={{ margin: 0 }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: 40, textAlign: 'center' }}>#</th>
                                        <th>Brand Name & Specification</th>
                                        <th style={{ width: 140 }}>Barcode</th>
                                        <th style={{ width: 90, textAlign: 'center' }}>Unit</th>
                                        <th style={{ width: 180, textAlign: 'center' }}>Requested Qty</th>
                                        <th style={{ width: 50, textAlign: 'center' }}>Remove</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                                                <div style={{ fontSize: 13, marginBottom: 4 }}>No items added to the requisition yet.</div>
                                                <div style={{ fontSize: 12 }}>Type product name in the search box above to find from system and add to requisition.</div>
                                            </td>
                                        </tr>
                                    ) : (
                                        selectedItems.map((row, idx) => (
                                            <tr key={row.productId}>
                                                <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>{idx + 1}</td>
                                                <td>
                                                    <strong style={{ color: 'var(--brand-primary-dark, #0f172a)' }}>{row.productName}</strong>
                                                </td>
                                                <td>
                                                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                                                        {row.barcode || '—'}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className="pms-badge pms-badge-neutral">{row.unit}</span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStepQty(row.productId, -10)}
                                                            style={{ border: 'none', background: '#f8fafc', padding: '4px 8px', cursor: 'pointer', fontWeight: 700 }}
                                                            title="Decrease 10"
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            className="pms-input-bare"
                                                            style={{ width: 65, textAlign: 'center', fontWeight: 700, padding: '4px 0', border: 'none' }}
                                                            value={row.requestedQty}
                                                            onChange={e => handleQtyChange(row.productId, e.target.value)}
                                                            disabled={submitting}
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStepQty(row.productId, 10)}
                                                            style={{ border: 'none', background: '#f8fafc', padding: '4px 8px', cursor: 'pointer', fontWeight: 700 }}
                                                            title="Increase 10"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button
                                                        type="button"
                                                        className="btn-pms btn-pms-secondary btn-pms-sm"
                                                        onClick={() => handleRemoveItem(row.productId)}
                                                        disabled={submitting}
                                                        title="Remove this item"
                                                        style={{ color: 'var(--color-danger, #ef4444)', padding: '4px 8px' }}
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Bar */}
                        {selectedItems.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 24, marginTop: 12, padding: '10px 14px', background: 'var(--bg-canvas, #f8fafc)', borderRadius: 6, fontSize: 13 }}>
                                <div>Total item types: <strong>{selectedItems.length}</strong></div>
                                <div>Total requested quantity: <strong style={{ color: 'var(--brand-primary)' }}>{totalUnits.toLocaleString()} units</strong></div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="pms-modal-footer" style={{ flexShrink: 0 }}>
                        <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-pms btn-pms-primary" disabled={submitting || selectedItems.length === 0}>
                            {submitting ? 'Submitting request...' : `Submit Stock Requisition (${selectedItems.length})`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}