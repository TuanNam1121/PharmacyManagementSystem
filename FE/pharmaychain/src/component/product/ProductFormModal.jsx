import { useState, useEffect } from 'react';
import { createProduct, updateProduct } from '../../api/ProductAPI';

const initialForm = {
  barcode: '',
  name: '',
  unit: '',
  activeIngredient: '',
  manufacturer: '',
  isPrescription: false,
  minQuantity: 20,
  description: '',
  imageUrl: '',
  status: '1',
  categoryId: '',
};

export default function ProductFormModal({
  show,
  onHide,
  onSuccess,
  mode = 'create', // 'create' | 'edit'
  product = null,
  categories = [],
}) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      setErrors({});
      setServerError(null);
      if (isEdit && product) {
        setForm({
          barcode: product.barcode || '',
          name: product.name || '',
          unit: product.unit || '',
          activeIngredient: product.activeIngredient || '',
          manufacturer: product.manufacturer || '',
          isPrescription: product.isPrescription === true,
          minQuantity: product.minQuantity != null ? product.minQuantity : 20,
          description: product.description || '',
          imageUrl: product.imageUrl || '',
          status: String(product.status ?? '1'),
          categoryId: product.categoryId ? String(product.categoryId) : '',
        });
      } else {
        setForm(initialForm);
      }
    }
  }, [show, isEdit, product]);

  if (!show) return null;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.unit.trim()) e.unit = 'Unit is required';
    if (!form.categoryId) e.categoryId = 'Please select a category';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleClose = () => {
    if (submitting) return;
    setForm(initialForm);
    setErrors({});
    setServerError(null);
    onHide();
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        unit: form.unit.trim(),
        categoryId: Number(form.categoryId),
        minQuantity: Number(form.minQuantity) || 20,
        isPrescription: form.isPrescription,
        barcode: form.barcode.trim() || null,
        activeIngredient: form.activeIngredient.trim() || null,
        manufacturer: form.manufacturer.trim() || null,
        description: form.description.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        status: Number(form.status),
      };

      if (isEdit && product?.id) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }

      setForm(initialForm);
      setErrors({});
      if (onSuccess) await onSuccess();
      onHide();
    } catch (err) {
      setServerError(err?.message || (isEdit ? 'Failed to update product' : 'Failed to create product'));
    } finally {
      setSubmitting(false);
    }
  };

  const sectionTitle = (num, label) => (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--brand-primary)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: 12,
      }}
    >
      {num}. {label}
    </div>
  );

  const fieldErr = (key) =>
    errors[key] ? (
      <div style={{ color: 'var(--status-danger)', fontSize: 11.5, marginTop: 4 }}>{errors[key]}</div>
    ) : null;

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="pms-modal pms-modal-lg">
        {/* Header */}
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </div>
            <div className="pms-modal-sub">
              {isEdit
                ? `Update catalog details for "${product?.name || ''}"`
                : 'Add a new product or medication to the central catalog'}
            </div>
          </div>
          <button className="pms-modal-close" onClick={handleClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="pms-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {serverError && (
              <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {serverError}
                <button type="button" className="pms-alert-close" onClick={() => setServerError(null)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}

            {/* ── Section 1: Basic Info ── */}
            <div style={{ marginBottom: 20 }}>
              {sectionTitle(1, 'Basic Information')}
              <div className="pms-form-group" style={{ marginBottom: 14 }}>
                <label className="pms-label">Product Name *</label>
                <input
                  type="text"
                  className="pms-input pms-input-bare"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. Paracetamol 500mg, Amoxicillin 250mg"
                  maxLength={250}
                  required
                />
                {fieldErr('name')}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="pms-form-group">
                  <label className="pms-label">Category *</label>
                  <select
                    className="pms-select"
                    style={{ width: '100%' }}
                    value={form.categoryId}
                    onChange={(e) => setField('categoryId', e.target.value)}
                    required
                  >
                    <option value="">— Select Category —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {fieldErr('categoryId')}
                </div>
                <div className="pms-form-group">
                  <label className="pms-label">Unit of Measure *</label>
                  <input
                    type="text"
                    className="pms-input pms-input-bare"
                    value={form.unit}
                    onChange={(e) => setField('unit', e.target.value)}
                    placeholder="e.g. Box, Blister, Bottle, Tube"
                    maxLength={30}
                    required
                  />
                  {fieldErr('unit')}
                </div>
              </div>

              <div className="pms-form-group">
                <label className="pms-label">Barcode / GTIN</label>
                <input
                  type="text"
                  className="pms-input pms-input-bare mono"
                  value={form.barcode}
                  onChange={(e) => setField('barcode', e.target.value)}
                  placeholder="e.g. 8935001234567"
                  maxLength={50}
                />
              </div>
            </div>

            {/* ── Section 2: Clinical Details ── */}
            <div style={{ marginBottom: 20 }}>
              {sectionTitle(2, 'Clinical Details')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="pms-form-group">
                  <label className="pms-label">Active Ingredient</label>
                  <input
                    type="text"
                    className="pms-input pms-input-bare"
                    value={form.activeIngredient}
                    onChange={(e) => setField('activeIngredient', e.target.value)}
                    placeholder="e.g. Paracetamol, Ibuprofen"
                    maxLength={250}
                  />
                </div>
                <div className="pms-form-group">
                  <label className="pms-label">Manufacturer</label>
                  <input
                    type="text"
                    className="pms-input pms-input-bare"
                    value={form.manufacturer}
                    onChange={(e) => setField('manufacturer', e.target.value)}
                    placeholder="e.g. DHG Pharma, Sanofi"
                    maxLength={200}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  id="isPrescription"
                  checked={form.isPrescription}
                  onChange={(e) => setField('isPrescription', e.target.checked)}
                  style={{ width: 15, height: 15, cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
                />
                <label htmlFor="isPrescription" style={{ fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>
                  Requires Prescription (Rx)
                </label>
              </div>
            </div>

            {/* ── Section 3: Stock Settings ── */}
            <div style={{ marginBottom: 20 }}>
              {sectionTitle(3, 'Inventory & Stock')}
              <div className="pms-form-group" style={{ maxWidth: 320 }}>
                <label className="pms-label">Min. Stock Alert Quantity</label>
                <input
                  type="number"
                  className="pms-input pms-input-bare"
                  value={form.minQuantity}
                  onChange={(e) => setField('minQuantity', e.target.value)}
                  placeholder="20"
                  min="0"
                  step="1"
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Ngưỡng cảnh báo sắp hết hàng tại kho. Giá sản phẩm được quản lý riêng biệt tại mục <em>"Set/Update Price"</em>.
                </span>
              </div>
            </div>

            {/* ── Section 4: Media & Additional ── */}
            <div style={{ marginBottom: 8 }}>
              {sectionTitle(4, 'Media & Details')}
              <div className="pms-form-group" style={{ marginBottom: 14 }}>
                <label className="pms-label">Product Image URL</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <input
                    type="text"
                    className="pms-input pms-input-bare"
                    value={form.imageUrl}
                    onChange={(e) => setField('imageUrl', e.target.value)}
                    placeholder="https://example.com/product-image.jpg"
                    style={{ flex: 1 }}
                  />
                  {form.imageUrl && form.imageUrl.trim() && (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        border: '1px solid var(--border-color)',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Nhập link ảnh trực tuyến (JPEG, PNG, WebP) để hiển thị trên danh mục và chi tiết sản phẩm.
                </span>
              </div>

              <div className="pms-form-group" style={{ marginBottom: 12 }}>
                <label className="pms-label">Description</label>
                <textarea
                  className="pms-input pms-input-bare"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Optional product description, usage notes, warnings…"
                  style={{ resize: 'vertical' }}
                />
              </div>
              {isEdit && (
                <div className="pms-form-group">
                  <label className="pms-label">Status</label>
                  <select
                    className="pms-select"
                    style={{ width: '100%' }}
                    value={form.status}
                    onChange={(e) => setField('status', e.target.value)}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                    <option value="2">Discontinued</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={handleClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-pms btn-pms-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
