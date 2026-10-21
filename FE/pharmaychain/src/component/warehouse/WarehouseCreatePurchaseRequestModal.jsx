import { useState, useEffect } from 'react';
import { getWarehouseProducts } from '../../api/WarehouseInventoryAPI';

export default function WarehouseCreatePurchaseRequestModal({ show, onHide, onSubmit, loading }) {
  const [products, setProducts] = useState([]);
  const [reason, setReason] = useState('');
  const [items, setItems] = useState([
    { productId: '', requestedQuantity: 100, note: '' },
  ]);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (show) {
      setFormError(null);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!reason || !reason.trim()) {
      setFormError('Please enter a business justification/reason for the purchase request');
      return;
    }

    if (items.length === 0) {
      setFormError('Please add at least one medicine item');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.productId) {
        setFormError(`Row #${i + 1}: Please select a medicine`);
        return;
      }
      if (Number(it.requestedQuantity) <= 0) {
        setFormError(`Row #${i + 1}: Requested quantity must be greater than 0`);
        return;
      }
    }

    const payload = {
      reason: reason.trim(),
      items: items.map((it) => ({
        productId: Number(it.productId),
        requestedQuantity: Number(it.requestedQuantity),
        note: it.note ? it.note.trim() : undefined,
      })),
    };

    onSubmit(payload);
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-lg">
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">New Purchase Request</div>
            <div className="pms-modal-sub">Submit inventory replenishment request to procurement department</div>
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

            <div className="pms-form-group" style={{ marginBottom: 20 }}>
              <label className="pms-form-label">
                Business Justification / Reason <span className="pms-required">*</span>
              </label>
              <textarea
                className="pms-input"
                rows={2}
                placeholder="e.g. Low stock alert for chronic disease medicines, safety stock replenishment..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Requested Medicines ({items.length})
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
                Add Medicine
              </button>
            </div>

            <div className="pms-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="pms-table-wrap">
                <table className="pms-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>Medicine / Product *</th>
                      <th style={{ width: 140 }} className="text-right">Req. Quantity *</th>
                      <th>Note</th>
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
                            style={{ fontSize: 12, padding: '4px 8px' }}
                            value={it.productId}
                            onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                            required
                          >
                            <option value="">— Select Medicine —</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.barcode || p.unit})
                              </option>
                            ))}
                          </select>
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
                            placeholder="Optional notes..."
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
                              title="Remove item"
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
          </div>

          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-pms btn-pms-primary" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Purchase Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
