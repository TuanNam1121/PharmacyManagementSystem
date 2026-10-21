import { useState, useEffect } from 'react';
import { money } from '../../utils/format';
import { getWarehouseLocations, getWarehouseProducts } from '../../api/WarehouseInventoryAPI';
import { viewSupplierList } from '../../api/SupplierAPI';

export default function WarehouseCreateReceiptModal({ show, onHide, onSubmit, loading }) {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);

  const [supplierId, setSupplierId] = useState('');
  const [deliveryType, setDeliveryType] = useState('1');
  const [note, setNote] = useState('');
  const [items, setItems] = useState([
    {
      productId: '',
      batchNumber: '',
      manufactureDate: '',
      expiryDate: '',
      quantity: 100,
      unitCost: 0,
      locationId: '',
    },
  ]);
  const [formError, setFormError] = useState(null);

  // Load dropdown catalogs on show
  useEffect(() => {
    if (show) {
      setFormError(null);
      // Fetch suppliers
      viewSupplierList({ page: 0, size: 100 })
        .then((res) => setSuppliers(res?.content || []))
        .catch((err) => console.error('Failed to load suppliers', err));

      // Fetch products
      getWarehouseProducts()
        .then((res) => setProducts(res || []))
        .catch((err) => console.error('Failed to load products', err));

      // Fetch locations
      getWarehouseLocations()
        .then((res) => setLocations(res || []))
        .catch((err) => console.error('Failed to load locations', err));
    }
  }, [show]);

  if (!show) return null;

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };

      // If user selected a product, auto-fill unitCost if available
      if (field === 'productId') {
        const p = products.find((prod) => String(prod.id) === String(value));
        if (p && p.purchasePrice) {
          copy[index].unitCost = p.purchasePrice;
        }
      }
      return copy;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: '',
        batchNumber: '',
        manufactureDate: '',
        expiryDate: '',
        quantity: 50,
        unitCost: 0,
        locationId: '',
      },
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, it) => {
      const q = Number(it.quantity) || 0;
      const c = Number(it.unitCost) || 0;
      return sum + q * c;
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!supplierId) {
      setFormError('Please select a supplier');
      return;
    }

    if (items.length === 0) {
      setFormError('Receipt must contain at least one item');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.productId) {
        setFormError(`Row #${i + 1}: Please select a medicine/product`);
        return;
      }
      if (!it.batchNumber || !it.batchNumber.trim()) {
        setFormError(`Row #${i + 1}: Batch number is required`);
        return;
      }
      if (!it.expiryDate) {
        setFormError(`Row #${i + 1}: Expiry date is required`);
        return;
      }
      if (Number(it.quantity) <= 0) {
        setFormError(`Row #${i + 1}: Quantity must be greater than 0`);
        return;
      }
    }

    const payload = {
      supplierId: Number(supplierId),
      deliveryType: Number(deliveryType),
      note: note.trim() || undefined,
      items: items.map((it) => ({
        productId: Number(it.productId),
        batchNumber: it.batchNumber.trim().toUpperCase(),
        manufactureDate: it.manufactureDate || undefined,
        expiryDate: it.expiryDate,
        quantity: Number(it.quantity),
        unitCost: Number(it.unitCost) || 0,
        locationId: it.locationId ? Number(it.locationId) : undefined,
      })),
    };

    onSubmit(payload);
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-xl">
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">Create Purchase Receipt (Goods Inward)</div>
            <div className="pms-modal-sub">Log incoming shipment from supplier with lot numbers and quantities</div>
          </div>
          <button className="pms-modal-close" onClick={onHide}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="pms-modal-body">
            {formError && (
              <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {formError}
              </div>
            )}

            {/* Header info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 2fr', gap: 16, marginBottom: 20 }}>
              <div className="pms-form-group">
                <label className="pms-form-label">
                  Supplier <span className="pms-required">*</span>
                </label>
                <select
                  className="pms-select"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  required
                >
                  <option value="">— Select Supplier —</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pms-form-group">
                <label className="pms-form-label">Delivery Type</label>
                <select
                  className="pms-select"
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value)}
                >
                  <option value="1">Full Shipment</option>
                  <option value="2">Partial Shipment</option>
                </select>
              </div>

              <div className="pms-form-group">
                <label className="pms-form-label">Receiving Notes / Bill of Lading</label>
                <input
                  type="text"
                  className="pms-input"
                  placeholder="e.g. Invoice #INV-8891, driver info..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            {/* Line items table */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Shipment Line Items ({items.length})
              </div>
              <button
                type="button"
                className="btn-pms btn-pms-sm btn-pms-secondary"
                onClick={addItemRow}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Item Row
              </button>
            </div>

            <div className="pms-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="pms-table-wrap">
                <table className="pms-table">
                  <thead>
                    <tr>
                      <th style={{ width: 30 }}>#</th>
                      <th style={{ minWidth: 200 }}>Medicine / Product *</th>
                      <th style={{ width: 130 }}>Batch No. *</th>
                      <th style={{ width: 130 }}>Mfg Date</th>
                      <th style={{ width: 130 }}>Expiry Date *</th>
                      <th style={{ width: 90 }} className="text-right">Qty *</th>
                      <th style={{ width: 120 }} className="text-right">Unit Cost</th>
                      <th style={{ width: 130 }}>Shelf / Bin</th>
                      <th style={{ width: 110 }} className="text-right">Subtotal</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => {
                      const subtotal = (Number(it.quantity) || 0) * (Number(it.unitCost) || 0);
                      return (
                        <tr key={idx}>
                          <td className="text-xs text-muted-color">{idx + 1}</td>
                          <td>
                            <select
                              className="pms-select"
                              style={{ fontSize: 12, padding: '4px 8px' }}
                              value={it.productId}
                              onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                              required
                            >
                              <option value="">— Select Product —</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.barcode || p.unit})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="pms-input mono"
                              style={{ fontSize: 12, padding: '4px 8px' }}
                              placeholder="e.g. LOT-2026A"
                              value={it.batchNumber}
                              onChange={(e) => handleItemChange(idx, 'batchNumber', e.target.value)}
                              required
                            >
                            </input>
                          </td>
                          <td>
                            <input
                              type="date"
                              className="pms-input"
                              style={{ fontSize: 11, padding: '4px 6px' }}
                              value={it.manufactureDate}
                              onChange={(e) => handleItemChange(idx, 'manufactureDate', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              className="pms-input"
                              style={{ fontSize: 11, padding: '4px 6px' }}
                              value={it.expiryDate}
                              onChange={(e) => handleItemChange(idx, 'expiryDate', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              className="pms-input text-right"
                              style={{ fontSize: 12, padding: '4px 8px' }}
                              value={it.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              className="pms-input text-right"
                              style={{ fontSize: 12, padding: '4px 8px' }}
                              value={it.unitCost}
                              onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                            />
                          </td>
                          <td>
                            <select
                              className="pms-select"
                              style={{ fontSize: 11, padding: '4px 6px' }}
                              value={it.locationId}
                              onChange={(e) => handleItemChange(idx, 'locationId', e.target.value)}
                            >
                              <option value="">— Unassigned —</option>
                              {locations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                  {loc.code} ({loc.aisle || ''}-{loc.shelf || ''})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="text-right fw-600 text-sm">
                            {money(subtotal)}
                          </td>
                          <td className="text-center">
                            {items.length > 1 && (
                              <button
                                type="button"
                                className="btn-pms btn-pms-sm"
                                style={{ padding: '3px 6px', color: 'var(--color-danger)' }}
                                title="Remove row"
                                onClick={() => removeItemRow(idx)}
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Amount Summary */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
              gap: 16, marginTop: 16, padding: '12px 16px',
              background: 'var(--bg-canvas)', borderRadius: 'var(--border-radius-md)',
              border: '1px solid var(--border-color)',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Total Receipt Shipment Value:
              </span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--brand-primary)' }}>
                {money(calculateTotal())}
              </span>
            </div>
          </div>

          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-pms btn-pms-primary" disabled={loading}>
              {loading ? 'Creating Receipt…' : 'Create Purchase Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
