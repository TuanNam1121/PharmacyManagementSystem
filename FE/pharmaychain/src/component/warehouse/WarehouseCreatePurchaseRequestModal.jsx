import { useState, useEffect } from 'react';
import { getWarehouseProducts } from '../../api/WarehouseInventoryAPI';

export default function WarehouseCreatePurchaseRequestModal({ show, onHide, onSubmit, loading }) {
  const [products, setProducts] = useState([]);
  const [reason, setReason] = useState('');
  const [items, setItems] = useState([
    { productId: '', requestedQuantity: 100, note: '' },
  ]);
  const [formError, setFormError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  useEffect(() => {
    if (show) {
      setFormError(null);
      setShowConfirm(false);
      setPendingPayload(null);
      getWarehouseProducts()
        .then((res) => setProducts(res || []))
        .catch((err) => console.error('Failed to load products', err));
    }
  }, [show]);

  if (!show) return null;

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { productId: '', requestedQuantity: 50, note: '' },
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Lấy đơn vị tính của dược phẩm đã chọn để hiển thị ngay bên cạnh tên thuốc
  const getProductUnit = (productId) => {
    const p = products.find((prod) => String(prod.id) === String(productId));
    return p?.unit || '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (items.length === 0) {
      setFormError('Vui lòng thêm ít nhất một mặt hàng thuốc');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.productId) {
        setFormError(`Dòng #${i + 1}: Vui lòng chọn thuốc`);
        return;
      }
      if (Number(it.requestedQuantity) <= 0) {
        setFormError(`Dòng #${i + 1}: Số lượng yêu cầu phải lớn hơn 0`);
        return;
      }
    }

    const payload = {
      reason: reason.trim() || undefined,
      items: items.map((it) => ({
        productId: Number(it.productId),
        requestedQuantity: Number(it.requestedQuantity),
        note: it.note ? it.note.trim() : undefined,
      })),
    };

    setPendingPayload(payload);
    setShowConfirm(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirm(false);
    onSubmit(pendingPayload);
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !loading) onHide(); }}>
      <div className="pms-modal pms-modal-lg">
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">Tạo Phiếu Yêu Cầu Mua Hàng Mới</div>
            <div className="pms-modal-sub">Gửi đề xuất bổ sung hàng hóa tồn kho tới phòng Mua hàng / Cung ứng</div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}
        >
          <div className="pms-modal-body">
            {formError && (
              <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {formError}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Danh Sách Thuốc Cần Mua ({items.length})
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
                Thêm Dược Phẩm
              </button>
            </div>

            <div className="pms-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="pms-table-wrap">
                <table className="pms-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>Tên Thuốc / Sản Phẩm *</th>
                      <th style={{ width: 150 }}>Đơn Vị</th>
                      <th style={{ width: 140 }} className="text-right">SL Yêu Cầu *</th>
                      <th>Ghi Chú</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="text-xs text-muted-color">{idx + 1}</td>
                        <td>
                          <select
                            className="pms-select"
                            style={{ fontSize: 12, padding: '4px 32px 4px 8px' }}
                            value={it.productId}
                            onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                            required
                          >
                            <option value="">— Chọn Dược Phẩm —</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          {it.productId ? (
                            <span className="pms-badge pms-badge-info">{getProductUnit(it.productId) || '—'}</span>
                          ) : (
                            <span className="text-muted-color">—</span>
                          )}
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            className="pms-input text-right"
                            style={{ fontSize: 12, padding: '4px 8px' }}
                            value={it.requestedQuantity}
                            onChange={(e) => handleItemChange(idx, 'requestedQuantity', e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="pms-input"
                            style={{ fontSize: 12, padding: '4px 8px' }}
                            placeholder="Ghi chú thêm..."
                            value={it.note}
                            onChange={(e) => handleItemChange(idx, 'note', e.target.value)}
                          />
                        </td>
                        <td className="text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              className="btn-pms btn-pms-sm"
                              style={{ padding: '3px 6px', color: 'var(--color-danger)' }}
                              onClick={() => removeItemRow(idx)}
                              title="Xóa mặt hàng này"
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pms-form-group" style={{ marginTop: 20 }}>
              <label className="pms-form-label">
                Lý Do / Giải Trình Nhu Cầu Mua Hàng <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(không bắt buộc)</span>
              </label>
              <textarea
                className="pms-input"
                rows={2}
                placeholder="VD: Cảnh báo tồn kho dưới ngưỡng an toàn, chuẩn bị nguồn hàng cho mùa dịch..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="btn-pms btn-pms-primary" disabled={loading}>
              {loading ? 'Đang gửi…' : 'Gửi Phiếu Yêu Cầu Mua Hàng'}
            </button>
          </div>
        </form>
      </div>

      {showConfirm && (
        <div
          className="pms-modal-overlay"
          style={{ zIndex: 1100 }}
          onClick={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) setShowConfirm(false); }}
        >
          <div className="pms-modal" style={{ maxWidth: 420 }}>
            <div className="pms-modal-header">
              <div className="pms-modal-title">Xác nhận tạo phiếu</div>
            </div>
            <div className="pms-modal-body" style={{ fontSize: 14, color: 'var(--text-primary)' }}>
              Bạn có muốn tạo phiếu yêu cầu mua hàng?
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                {items.length} mặt hàng sẽ được gửi tới phòng Mua hàng / Cung ứng.
              </div>
            </div>
            <div className="pms-modal-footer">
              <button
                type="button"
                className="btn-pms btn-pms-secondary"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Không
              </button>
              <button
                type="button"
                className="btn-pms btn-pms-primary"
                onClick={handleConfirmSubmit}
                disabled={loading}
              >
                {loading ? 'Đang gửi…' : 'Có'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
