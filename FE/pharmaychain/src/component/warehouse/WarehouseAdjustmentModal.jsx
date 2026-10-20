import { useState, useEffect } from 'react';
import { money } from '../../utils/format';

const ADJUSTMENT_TYPES = [
  { value: '3', label: 'Cycle Count — Inventory Discrepancy' },
  { value: '1', label: 'Damaged / Broken / Quality Degraded' },
  { value: '2', label: 'Expired — Disposal Required' },
  { value: '4', label: 'Other Reason' },
];

export default function WarehouseAdjustmentModal({ show, onHide, inventory, onSubmit, loading }) {
  const [quantityAfter, setQuantityAfter] = useState('');
  const [type, setType]     = useState('3');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (inventory) {
      setQuantityAfter(String(inventory.quantity != null ? inventory.quantity : 0));
      setType('3'); setReason(''); setErrorMsg(null);
    }
  }, [inventory]);

  if (!show || !inventory) return null;

  const currentQty  = inventory.quantity != null ? inventory.quantity : 0;
  const parsedAfter = parseInt(quantityAfter, 10);
  const validAfter  = !isNaN(parsedAfter) && parsedAfter >= 0;
  const difference  = validAfter ? parsedAfter - currentQty : 0;
  const unitCost    = inventory.costPrice || 0;
  const valueImpact = difference * unitCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validAfter) { setErrorMsg('Please enter a valid actual quantity (≥ 0).'); return; }
    if (!reason.trim()) { setErrorMsg('Please provide a reason for the adjustment.'); return; }
    setErrorMsg(null);
    try {
      await onSubmit({
        productId: inventory.productId,
        batchId: inventory.batchId,
        quantityAfter: parsedAfter,
        type: parseInt(type, 10),
        reason: reason.trim(),
      });
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to create adjustment record.');
    }
  };

  const diffColor = difference < 0
    ? 'var(--color-danger)' : difference > 0
    ? 'var(--color-success)' : 'var(--text-muted)';

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-lg">
        {/* Header */}
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">Create Inventory Adjustment</div>
            <div className="pms-modal-sub">Record count discrepancies, damaged stock, or disposal</div>
          </div>
          <button className="pms-modal-close" onClick={onHide}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className="pms-modal-body">
            {errorMsg && (
              <div className="pms-alert pms-alert-danger">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {errorMsg}
                <button type="button" className="pms-alert-close" onClick={() => setErrorMsg(null)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Product info */}
            <div style={{
              background: 'var(--bg-canvas)', border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-md)', padding: '14px 16px', marginBottom: 20,
            }}>
              <div className="pms-detail-grid">
                <div className="pms-detail-row">
                  <div className="pms-detail-label">Product</div>
                  <div className="pms-detail-value">{inventory.productName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inventory.productCode || '—'}</div>
                </div>
                <div className="pms-detail-row">
                  <div className="pms-detail-label">Batch / Expiry</div>
                  <div className="pms-detail-value mono">{inventory.batchNumber}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Exp: {inventory.expiryDate || '—'}</div>
                </div>
              </div>
            </div>

            {/* Quantity inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="pms-form-group" style={{ margin: 0 }}>
                <label className="pms-label">System Quantity</label>
                <input className="pms-input pms-input-bare" value={currentQty} readOnly disabled
                  style={{ background: 'var(--bg-canvas)', cursor: 'not-allowed', color: 'var(--text-muted)' }} />
              </div>
              <div className="pms-form-group" style={{ margin: 0 }}>
                <label className="pms-label">Actual Count *</label>
                <input
                  className="pms-input pms-input-bare"
                  type="number" min="0"
                  value={quantityAfter}
                  onChange={(e) => setQuantityAfter(e.target.value)}
                  required
                />
              </div>
              <div className="pms-form-group" style={{ margin: 0 }}>
                <label className="pms-label">Difference</label>
                <div style={{
                  padding: '9px 14px', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-sm)', fontWeight: 700,
                  color: diffColor, background: 'var(--bg-card)', fontSize: 14,
                }}>
                  {difference > 0 ? `+${difference}` : difference} {inventory.unit}
                </div>
              </div>
            </div>

            {/* Financial impact */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-md)', marginBottom: 20, background: 'var(--bg-card)',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Estimated Financial Impact:</span>
              <span style={{ fontWeight: 700, fontSize: 15, color: diffColor }}>{money(valueImpact)}</span>
            </div>

            {/* Type & Reason */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
              <div className="pms-form-group" style={{ margin: 0 }}>
                <label className="pms-label">Adjustment Type *</label>
                <select className="pms-select" style={{ width: '100%' }} value={type} onChange={(e) => setType(e.target.value)}>
                  {ADJUSTMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="pms-form-group" style={{ margin: 0 }}>
                <label className="pms-label">Reason / Details *</label>
                <textarea
                  className="pms-input pms-input-bare"
                  rows="2"
                  placeholder="Describe the cause of discrepancy or damage details…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-pms btn-pms-primary" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
