import { useState, useEffect, useMemo, useCallback } from 'react';
import { getWarehouseProducts } from '../../api/WarehouseInventoryAPI';
import { money } from '../../utils/format';
import { useNavigate } from 'react-router-dom';

export default function ProductCatalogPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWarehouseProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load product catalog');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Unique units for filtering
  const units = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.unit) set.add(p.unit);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search.trim() ||
        (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
        (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()));
      const matchUnit = !unitFilter || p.unit === unitFilter;
      return matchSearch && matchUnit;
    });
  }, [products, search, unitFilter]);

  // Paginated products
  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / pageSize);
  const pagedList = useMemo(() => {
    const start = page * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page, pageSize]);

  // Stats
  const totalItems = products.length;
  const withBarcode = products.filter((p) => p.barcode && p.barcode.trim().length > 0).length;
  const avgPrice =
    totalItems > 0
      ? products.reduce((acc, p) => acc + (Number(p.purchasePrice) || 0), 0) / totalItems
      : 0;

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="pms-page-header" style={{ marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h1 className="pms-page-title" style={{ margin: 0 }}>Product Catalog</h1>
            <span className="pms-badge pms-badge-info" style={{ fontSize: 11 }}>Master Data</span>
          </div>
          <p className="pms-page-sub">
            Browse registered pharmaceutical products, dispensing units, barcodes, and standard purchase prices.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" className="btn-pms btn-pms-secondary" onClick={fetchProducts} title="Refresh catalog">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Refresh
          </button>
          <button
            type="button"
            className="btn-pms btn-pms-primary"
            onClick={() => navigate('/procurement/requests')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            New Purchase Request
          </button>
        </div>
      </div>

      {/* ── Error Alert ── */}
      {error && (
        <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
          <button type="button" className="pms-alert-close" onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div className="pms-stat-grid" style={{ marginBottom: 20 }}>
        <div className="pms-stat-card">
          <div className="pms-stat-label">Total Registered Products</div>
          <div className="pms-stat-val">{totalItems}</div>
          <div className="pms-stat-sub">Active pharmaceutical items</div>
        </div>
        <div className="pms-stat-card">
          <div className="pms-stat-label">Barcoded Medicines</div>
          <div className="pms-stat-val" style={{ color: 'var(--brand-primary)' }}>{withBarcode}</div>
          <div className="pms-stat-sub">Ready for POS & barcode scanner</div>
        </div>
        <div className="pms-stat-card">
          <div className="pms-stat-label">Packaging Units</div>
          <div className="pms-stat-val">{units.length}</div>
          <div className="pms-stat-sub">Standard dispensing measures</div>
        </div>
        <div className="pms-stat-card">
          <div className="pms-stat-label">Average Purchase Cost</div>
          <div className="pms-stat-val" style={{ fontSize: 20 }}>{money(avgPrice)}</div>
          <div className="pms-stat-sub">Standard reference price</div>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="pms-card" style={{ marginBottom: 16 }}>
        <div className="pms-card-body" style={{ padding: '14px 20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              {/* Search Box */}
              <div style={{ position: 'relative', width: 280 }}>
                <input
                  type="text"
                  className="pms-input pms-input-bare"
                  placeholder="Search by name or barcode..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  style={{ paddingLeft: 34 }}
                />
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              {/* Unit Filter */}
              <select
                className="pms-select"
                value={unitFilter}
                onChange={(e) => {
                  setUnitFilter(e.target.value);
                  setPage(0);
                }}
                style={{ minWidth: 160 }}
              >
                <option value="">All Units ({units.length})</option>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>

              {(search || unitFilter) && (
                <button
                  type="button"
                  className="btn-pms btn-pms-secondary"
                  onClick={() => {
                    setSearch('');
                    setUnitFilter('');
                    setPage(0);
                  }}
                  style={{ fontSize: 12 }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Showing <strong>{filteredProducts.length}</strong> products
            </div>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="pms-card">
        <div className="pms-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading product catalog...
            </div>
          ) : pagedList.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              No products found matching your search criteria.
            </div>
          ) : (
            <table className="pms-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th>Product Name</th>
                  <th>Barcode</th>
                  <th>Dispensing Unit</th>
                  <th style={{ textAlign: 'right' }}>Standard Purchase Price</th>
                  <th style={{ textAlign: 'center', width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedList.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {page * pageSize + idx + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        ID #{item.id}
                      </div>
                    </td>
                    <td>
                      {item.barcode ? (
                        <span className="pms-badge pms-badge-neutral mono" style={{ letterSpacing: 0.5 }}>
                          {item.barcode}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className="pms-badge pms-badge-info" style={{ fontWeight: 600 }}>
                        {item.unit || 'Unit'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-primary)' }}>
                      {money(item.purchasePrice || 0)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-pms btn-pms-secondary"
                        style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={() => setSelectedProduct(item)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="pms-pagination" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="pms-page-btn"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            ‹
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`pms-page-btn ${page === i ? 'active' : ''}`}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            className="pms-page-btn"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            ›
          </button>
        </div>
      )}

      {/* ── Product Detail Modal ── */}
      {selectedProduct && (
        <div className="pms-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="pms-modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="pms-modal-header">
              <div>
                <h3 className="pms-modal-title">Product Details</h3>
                <div className="pms-modal-sub">Master medicine catalog specification</div>
              </div>
              <button
                type="button"
                className="pms-modal-close"
                onClick={() => setSelectedProduct(null)}
              >
                ✕
              </button>
            </div>
            <div className="pms-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Product Name</label>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedProduct.name}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Product ID</label>
                  <div style={{ fontWeight: 600 }}>#{selectedProduct.id}</div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Dispensing Unit</label>
                  <div>
                    <span className="pms-badge pms-badge-info">{selectedProduct.unit}</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Barcode</label>
                  <div className="mono" style={{ fontWeight: 600 }}>
                    {selectedProduct.barcode || '—'}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Purchase Price</label>
                  <div style={{ fontWeight: 800, color: 'var(--brand-primary)', fontSize: 15 }}>
                    {money(selectedProduct.purchasePrice || 0)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 20,
                  padding: 12,
                  background: 'var(--bg-canvas)',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                }}
              >
                💡 <strong>Inventory Quick Action:</strong> You can view stock levels across Central Warehouse or branch stores, or initiate a new procurement demand directly.
              </div>
            </div>
            <div className="pms-modal-footer">
              <button
                type="button"
                className="btn-pms btn-pms-secondary"
                onClick={() => setSelectedProduct(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-pms btn-pms-primary"
                onClick={() => {
                  setSelectedProduct(null);
                  navigate('/warehouse/inventory');
                }}
              >
                Check Warehouse Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
