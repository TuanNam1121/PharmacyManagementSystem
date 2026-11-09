import { useState, useEffect } from 'react';
import { money } from '../../utils/format';
import { getWarehouseLocations, getWarehouseProducts, getApprovedPurchaseProposals } from '../../api/WarehouseInventoryAPI';
import { viewSupplierList } from '../../api/SupplierAPI';

const generateBatchHelper = () => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(100 + Math.random() * 900);
  return `LOT-${yy}${mm}${dd}-${rand}`;
};

const getTodayStr = () => new Date().toISOString().split('T')[0];
const getExpDateStr = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 2);
  return d.toISOString().split('T')[0];
};

export default function WarehouseCreateReceiptModal({ show, onHide, onSubmit, loading }) {
  const [purchaseProposals, setPurchaseProposals] = useState([]);
  const [selectedProposalId, setSelectedProposalId] = useState('');

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);

  const [supplierId, setSupplierId] = useState('');
  const [deliveryType, setDeliveryType] = useState('1');
  const [note, setNote] = useState('');
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [items, setItems] = useState([
    {
      productId: '',
      batchNumber: generateBatchHelper(),
      manufactureDate: getTodayStr(),
      expiryDate: getExpDateStr(),
      quantity: 10,
      unitCost: 0,
      locationId: '',
    },
  ]);
  const [formError, setFormError] = useState(null);

  // Load dropdown catalogs on show
  useEffect(() => {
    if (show) {
      setFormError(null);
      setSelectedProposalId('');

      // Fetch approved purchase proposals
      getApprovedPurchaseProposals()
        .then((res) => setPurchaseProposals(res || []))
        .catch((err) => console.error('Failed to load purchase proposals', err));

      // Fetch suppliers
      viewSupplierList({ page: 0, size: 100 })
        .then((res) => setSuppliers(res?.content || []))
        .catch((err) => console.error('Failed to load suppliers', err));

      // Fetch products (contains defaultLocationId from DB)
      getWarehouseProducts()
        .then((res) => setProducts(res || []))
        .catch((err) => console.error('Failed to load products', err));

      // Fetch locations
      getWarehouseLocations()
        .then((res) => {
          const locs = res || [];
          setLocations(locs);
          if (locs.length > 0) {
            setItems((prev) =>
              prev.map((it) => ({
                ...it,
                locationId: it.locationId || String(locs[0].id),
              }))
            );
          }
        })
        .catch((err) => console.error('Failed to load locations', err));
    }
  }, [show]);

  if (!show) return null;

  // Handle choosing a Purchase Proposal
  const handleProposalChange = (proposalId) => {
    setSelectedProposalId(proposalId);
    if (!proposalId) return;

    const pp = purchaseProposals.find((p) => String(p.id) === String(proposalId));
    if (!pp) return;

    // Set supplier from proposal
    if (pp.supplierId) {
      setSupplierId(String(pp.supplierId));
    }

    // Set note reference
    setNote(`Nhập kho theo đơn mua hàng ${pp.code}`);

    // Pre-populate items from proposal
    if (pp.items && pp.items.length > 0) {
      const defaultLocId = locations[0]?.id ? String(locations[0].id) : '';
      const mapped = pp.items.map((it) => {
        const prod = products.find((p) => String(p.id) === String(it.productId));
        const locId = it.suggestedLocationId
          ? String(it.suggestedLocationId)
          : prod?.defaultLocationId
          ? String(prod.defaultLocationId)
          : defaultLocId;

        return {
          productId: String(it.productId),
          batchNumber: generateBatchHelper(),
          manufactureDate: getTodayStr(),
          expiryDate: getExpDateStr(),
          quantity: it.quantity || 10,
          unitCost: Number(it.unitCost) || Number(prod?.purchasePrice) || 0,
          locationId: locId || defaultLocId,
        };
      });
      setItems(mapped);
    }
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };

      // When product is selected, auto-fill unitCost & auto-select location from DB
      if (field === 'productId') {
        const p = products.find((prod) => String(prod.id) === String(value));
        if (p) {
          copy[index].unitCost = Number(p.purchasePrice) || 0;
          // Lấy vị trí ô kệ theo DB của thuốc này (nếu có), hoặc lấy ô kệ đầu tiên
          const dbLocId = p.defaultLocationId ? String(p.defaultLocationId) : (locations[0]?.id ? String(locations[0].id) : '');
          if (dbLocId) {
            copy[index].locationId = dbLocId;
          }
        }
      }
      return copy;
    });
  };

  const addItemRow = () => {
    const defaultLocId = locations[0]?.id ? String(locations[0].id) : '';
    setItems((prev) => [
      ...prev,
      {
        productId: '',
        batchNumber: generateBatchHelper(),
        manufactureDate: getTodayStr(),
        expiryDate: getExpDateStr(),
        quantity: 10,
        unitCost: 0,
        locationId: defaultLocId,
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

    const defaultLocId = locations[0]?.id ? Number(locations[0].id) : undefined;

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
      if (!it.locationId && !defaultLocId) {
        setFormError(`Dòng #${i + 1}: Vui lòng chọn vị trí ô kệ lưu trữ`);
        return;
      }
    }

    const payload = {
      purchaseProposalId: selectedProposalId ? Number(selectedProposalId) : undefined,
      supplierId: Number(supplierId),
      deliveryType: Number(deliveryType),
      note: note.trim() || undefined,
      autoConfirm: Boolean(autoConfirm),
      items: items.map((it) => ({
        productId: Number(it.productId),
        batchNumber: it.batchNumber.trim().toUpperCase(),
        manufactureDate: it.manufactureDate || undefined,
        expiryDate: it.expiryDate,
        quantity: Number(it.quantity),
        unitCost: Number(it.unitCost) || 0,
        locationId: it.locationId ? Number(it.locationId) : defaultLocId,
        unitName: 'Hộp',
        conversionFactor: 1,
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
            <div className="pms-modal-sub">Ghi nhận lô hàng nhập từ nhà cung cấp theo phiếu mua hàng và gán vị trí ô kệ chuẩn xác</div>
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

            {/* Link to approved Purchase Proposal */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--border-radius-md)',
              padding: '12px 16px',
              marginBottom: 16,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, alignItems: 'center' }}>
                <div>
                  <label className="pms-form-label" style={{ fontWeight: 700, color: '#0f172a' }}>
                    Chọn Phiếu Mua Hàng Đã Phê Duyệt (Khuyên Dùng)
                  </label>
                  <select
                    className="pms-select"
                    value={selectedProposalId}
                    onChange={(e) => handleProposalChange(e.target.value)}
                    style={{ fontWeight: selectedProposalId ? 600 : 400 }}
                  >
                    <option value="">— Nhập trực tiếp (Không theo phiếu mua) —</option>
                    {purchaseProposals.map((pp) => (
                      <option key={pp.id} value={pp.id}>
                        {pp.code} — {pp.supplierName || 'NCC'} ({money(pp.totalAmount || 0)})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.4 }}>
                  Chọn phiếu mua hàng đã duyệt để tự động tải đúng Nhà Cung Cấp, danh sách thuốc và vị trí ô kệ lưu kho.
                </div>
              </div>
            </div>

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
                      <th style={{ minWidth: 200 }}>Tên Thuốc / Sản Phẩm *</th>
                      <th style={{ width: 90, textAlign: 'center' }}>ĐVT Nhập</th>
                      <th style={{ width: 120 }}>Số Lô (Batch) *</th>
                      <th style={{ width: 120 }}>Ngày SX (Mfg)</th>
                      <th style={{ width: 120 }}>Hạn Dùng (Exp) *</th>
                      <th style={{ width: 100 }} className="text-right">SL Nhập *</th>
                      <th style={{ width: 120 }} className="text-right">Đơn Giá Nhập</th>
                      <th style={{ width: 220 }}>Vị Trí Ô Kệ *</th>
                      <th style={{ width: 120 }} className="text-right">Thành Tiền</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => {
                      const subtotal = (Number(it.quantity) || 0) * (Number(it.unitCost) || 0);
                      const prod = products.find((p) => String(p.id) === String(it.productId));

                      return (
                        <tr key={idx}>
                          <td className="text-xs text-muted-color">{idx + 1}</td>
                          <td>
                            <select
                              className="pms-select"
                              style={{ fontSize: 12, padding: '5px 8px' }}
                              value={it.productId}
                              onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                              required
                            >
                              <option value="">— Chọn Dược Phẩm —</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.barcode || p.unit || 'Hộp'})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              className="pms-badge pms-badge-neutral"
                              style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', background: '#f1f5f9' }}
                            >
                              {prod?.unit || 'Hộp'}
                            </span>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="pms-input mono"
                              style={{ fontSize: 12, padding: '4px 8px' }}
                              placeholder="VD: LOT-2026A"
                              value={it.batchNumber}
                              onChange={(e) => handleItemChange(idx, 'batchNumber', e.target.value)}
                              required
                            />
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
                              style={{ fontSize: 12, padding: '4px 8px', fontWeight: 600 }}
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
                              style={{ fontSize: 11.5, padding: '4px 8px', fontWeight: 600, color: '#1e40af' }}
                              value={it.locationId}
                              onChange={(e) => handleItemChange(idx, 'locationId', e.target.value)}
                              required
                            >
                              {locations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                  {loc.code} (Dãy: {loc.aisle || '—'}, Kệ: {loc.shelf || '—'}, Hộc: {loc.bin || '—'})
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

          <div className="pms-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', userSelect: 'none', fontWeight: 600, color: '#334155' }}>
              <input
                type="checkbox"
                checked={autoConfirm}
                onChange={(e) => setAutoConfirm(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--color-success)', cursor: 'pointer' }}
              />
              <span>Xác nhận nhập kho và tăng tồn ngay</span>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={loading}>
                Hủy
              </button>
              <button
                type="submit"
                className="btn-pms btn-pms-primary"
                disabled={loading}
                style={{
                  background: autoConfirm ? 'var(--color-success)' : undefined,
                  borderColor: autoConfirm ? 'var(--color-success)' : undefined,
                }}
              >
                {loading ? 'Đang xử lý…' : (autoConfirm ? 'Xác Nhận Nhập Kho & Tăng Tồn' : 'Lưu Phiếu Chờ Kiểm Nhận')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
