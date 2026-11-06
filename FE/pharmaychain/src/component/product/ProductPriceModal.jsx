import { useState, useEffect } from 'react';
import { updateProductPrice } from '../../api/ProductAPI';
import { money } from '../../utils/format';

export default function ProductPriceModal({
  show,
  onHide,
  product,
  onSuccess,
}) {
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show && product) {
      setCostPrice(product.costPrice != null ? String(product.costPrice) : '');
      setSellingPrice(product.sellingPrice != null ? String(product.sellingPrice) : '');
      // Format current local datetime for datetime-local input
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setEffectiveFrom(now.toISOString().slice(0, 16));
      setReason('');
      setErrors({});
      setServerError(null);
    }
  }, [show, product]);

  if (!show || !product) return null;

  const validate = () => {
    const errs = {};
    const cost = parseFloat(costPrice);
    if (costPrice === '' || isNaN(cost) || cost < 0) {
      errs.costPrice = 'Valid cost price (≥ 0) is required';
    }

    const selling = parseFloat(sellingPrice);
    if (sellingPrice === '' || isNaN(selling) || selling < 0) {
      errs.sellingPrice = 'Valid selling price (≥ 0) is required';
    }

    if (!reason || !reason.trim()) {
      errs.reason = 'Please enter a reason for the price change (Required for audit history)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom).toISOString() : null,
        reason: reason.trim(),
      };

      await updateProductPrice(product.id, payload);
      if (onSuccess) await onSuccess();
      onHide();
    } catch (err) {
      setServerError(err?.message || 'Failed to update product price.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-md">
        {/* Header */}
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">Update Product Price</div>
            <div className="pms-modal-sub">
              Product: <strong>{product.name}</strong> {product.unit ? `(${product.unit})` : ''}
            </div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="pms-modal-body">
            {serverError && (
              <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {serverError}
              </div>
            )}

            {/* Current Reference Info */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                padding: '12px 14px',
                background: 'var(--bg-canvas)',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--border-color)',
                marginBottom: 16,
              }}
            >
              <div>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block' }}>Current Cost Price</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {money(product.costPrice)}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block' }}>Current Selling Price</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand-primary)' }}>
                  {money(product.sellingPrice)}
                </span>
              </div>
            </div>

            {/* Price Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className="pms-form-group">
                <label className="pms-label">New Cost Price (₫) *</label>
                <input
                  type="number"
                  className="pms-input pms-input-bare"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1"
                  required
                />
                {errors.costPrice && (
                  <div style={{ color: 'var(--status-danger)', fontSize: 11.5, marginTop: 4 }}>
                    {errors.costPrice}
                  </div>
                )}
              </div>

              <div className="pms-form-group">
                <label className="pms-label">New Selling Price (₫) *</label>
                <input
                  type="number"
                  className="pms-input pms-input-bare"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1"
                  required
                />
                {errors.sellingPrice && (
                  <div style={{ color: 'var(--status-danger)', fontSize: 11.5, marginTop: 4 }}>
                    {errors.sellingPrice}
                  </div>
                )}
              </div>
            </div>

            {/* Effective From */}
            <div className="pms-form-group" style={{ marginBottom: 14 }}>
              <label className="pms-label">Effective Date / Time</label>
              <input
                type="datetime-local"
                className="pms-input pms-input-bare"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                The time when the new price takes effect for POS sales.
              </span>
            </div>

            {/* Reason */}
            <div className="pms-form-group">
              <label className="pms-label">Reason for Price Change *</label>
              <textarea
                className="pms-input pms-input-bare"
                rows={3}
                placeholder="Enter the reason for price adjustment (e.g., Supplier price increase, Periodic promotion...)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
              {errors.reason && (
                <div style={{ color: 'var(--status-danger)', fontSize: 11.5, marginTop: 4 }}>
                  {errors.reason}
                </div>
              )}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                The system will automatically log a record in the product's Price History.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-pms btn-pms-primary" disabled={submitting}>
              {submitting ? 'Updating…' : 'Save New Price'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}