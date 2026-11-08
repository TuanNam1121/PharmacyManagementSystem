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
        if (p) {
          const pUnits = p.units || [];
          if (pUnits.length > 0) {
            // Mặc định chọn đơn vị đóng gói lớn nhất (thường là Hộp khi nhập từ NCC)
            const highestUnit = [...pUnits].sort((a, b) => (b.conversionFactor || 1) - (a.conversionFactor || 1))[0];
            copy[index].unitId = highestUnit.id;
            copy[index].unitName = highestUnit.unitName;
            copy[index].conversionFactor = highestUnit.conversionFactor || 1;
            const baseCost = Number(p.purchasePrice) || 0;
            copy[index].unitCost = Math.round(baseCost * (highestUnit.conversionFactor || 1));
          } else {
            copy[index].unitId = '';
            copy[index].unitName = p.unit || '';
            copy[index].conversionFactor = 1;
            copy[index].unitCost = Number(p.purchasePrice) || 0;
          }
        }
      }
      return copy;
    });
  };

  const handleUnitChange = (index, unitId) => {
    setItems((prev) => {
      const copy = [...prev];
      const it = copy[index];
      const p = products.find((prod) => String(prod.id) === String(it.productId));
      const pUnits = p?.units || [];
      const selectedUnit = pUnits.find((u) => String(u.id) === String(unitId));

      if (selectedUnit) {
        copy[index].unitId = selectedUnit.id;
        copy[index].unitName = selectedUnit.unitName;
        copy[index].conversionFactor = selectedUnit.conversionFactor || 1;
        const baseCost = Number(p.purchasePrice) || 0;
        copy[index].unitCost = Math.round(baseCost * (selectedUnit.conversionFactor || 1));
      } else {
        copy[index].unitId = '';
        copy[index].unitName = p?.unit || '';
        copy[index].conversionFactor = 1;
        copy[index].unitCost = Number(p?.purchasePrice) || 0;
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
        unitId: '',
        unitName: '',
        conversionFactor: 1,
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
      setFormError('Vui lòng chọn nhà cung cấp');
      return;
    }

    if (items.length === 0) {
      setFormError('Phiếu nhập kho phải chứa ít nhất một mặt hàng');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.productId) {
        setFormError(`Dòng #${i + 1}: Vui lòng chọn thuốc / sản phẩm`);
        return;
      }
      if (!it.batchNumber || !it.batchNumber.trim()) {
        setFormError(`Dòng #${i + 1}: Số lô thuốc là bắt buộc`);
        return;
      }
      if (!it.expiryDate) {
        setFormError(`Dòng #${i + 1}: Hạn sử dụng là bắt buộc`);
        return;
      }
      if (Number(it.quantity) <= 0) {
        setFormError(`Dòng #${i + 1}: Số lượng nhập phải lớn hơn 0`);
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
        unitId: it.unitId ? Number(it.unitId) : undefined,
        unitName: it.unitName || undefined,
        conversionFactor: Number(it.conversionFactor) || 1,
      })),
    };

    onSubmit(payload);
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-xl">
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">Tạo Phiếu Nhập Kho (Nhập Hàng Mua)</div>
            <div className="pms-modal-sub">Ghi nhận lô hàng nhập từ nhà cung cấp với số lô, hạn dùng và định vị ô kệ</div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Đóng">
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
                  Nhà Cung Cấp <span className="pms-required">*</span>
                </label>
                <select
                  className="pms-select"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  required
                >
                  <option value="">— Chọn Nhà Cung Cấp —</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pms-form-group">
                <label className="pms-form-label">Hình Thức Giao Nhận</label>
                <select
                  className="pms-select"
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value)}
                >
                  <option value="1">Giao Đủ Toàn Bộ</option>
                  <option value="2">Giao Một Phần</option>
                </select>
              </div>

              <div className="pms-form-group">
                <label className="pms-form-label">Ghi Chú Nhập Kho / Số Vận Đơn / Hóa Đơn</label>
                <input
                  type="text"
                  className="pms-input"
                  placeholder="VD: Hóa đơn đỏ số #HD-8891, ghi chú kiểm phẩm..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            {/* Line items table */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Danh Mục Hàng Hóa Nhập Kho ({items.length})
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
                Thêm Mặt Hàng
              </button>
            </div>

            <div className="pms-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="pms-table-wrap">
                <table className="pms-table">
                  <thead>
                    <tr>
                      <th style={{ width: 30 }}>#</th>
                      <th style={{ minWidth: 180 }}>Tên Thuốc / Sản Phẩm *</th>
                      <th style={{ width: 120 }}>ĐVT Nhập</th>
                      <th style={{ width: 120 }}>Số Lô (Batch) *</th>
                      <th style={{ width: 120 }}>Ngày SX (Mfg)</th>
                      <th style={{ width: 120 }}>Hạn Dùng (Exp) *</th>
                      <th style={{ width: 110 }} className="text-right">SL Nhập *</th>
                      <th style={{ width: 120 }} className="text-right">Đơn Giá Nhập</th>
                      <th style={{ width: 120 }}>Vị Trí Ô Kệ</th>
                      <th style={{ width: 110 }} className="text-right">Thành Tiền</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => {
                      const subtotal = (Number(it.quantity) || 0) * (Number(it.unitCost) || 0);
                      const prod = products.find((p) => String(p.id) === String(it.productId));
                      const prodUnits = prod?.units || [];
                      const hasUnits = prodUnits.length > 0;

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
                              <option value="">— Chọn Dược Phẩm —</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.barcode || p.unit})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            {hasUnits ? (
                              <select
                                className="pms-select"
                                style={{ fontSize: 11.5, padding: '4px 6px', fontWeight: 600, color: '#0284c7' }}
                                value={it.unitId || ''}
                                onChange={(e) => handleUnitChange(idx, e.target.value)}
                              >
                                {prodUnits.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.unitName} (x{u.conversionFactor})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="pms-badge pms-badge-neutral" style={{ fontSize: 11 }}>
                                {it.unitName || prod?.unit || 'Đơn vị'}
                              </span>
                            )}
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
                            {it.conversionFactor > 1 && (
                              <div style={{ fontSize: 10.5, color: '#0284c7', fontWeight: 600, marginTop: 2, textAlign: 'right' }}>
                                = {((Number(it.quantity) || 0) * it.conversionFactor).toLocaleString()} {prod?.unit || 'viên'}
                              </div>
                            )}
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
                              <option value="">— Chưa gán vị trí —</option>
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
                                title="Xóa dòng này"
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
                Tổng Giá Trị Đơn Hàng Nhập Kho:
              </span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--brand-primary)' }}>
                {money(calculateTotal())}
              </span>
            </div>
          </div>

          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="btn-pms btn-pms-primary" disabled={loading}>
              {loading ? 'Đang tạo phiếu…' : 'Xác Nhận Tạo Phiếu Nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
