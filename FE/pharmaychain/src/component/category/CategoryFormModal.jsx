import { useState, useEffect } from 'react';
import { createCategory, updateCategory } from '../../api/CategoryAPI';

const initialForm = {
  name: '',
  description: '',
  status: '1',
};

export default function CategoryFormModal({
  show,
  onHide,
  onSuccess,
  mode = 'create', // 'create' | 'edit'
  category = null,
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
      if (isEdit && category) {
        setForm({
          name: category.name || '',
          description: category.description || '',
          status: String(category.status ?? '1'),
        });
      } else {
        setForm(initialForm);
      }
    }
  }, [show, isEdit, category]);

  if (!show) return null;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Category name is required';
    if (form.name.trim().length > 150) e.name = 'Category name must not exceed 150 characters';
    if (form.description.trim().length > 500) e.description = 'Description must not exceed 500 characters';
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
        description: form.description.trim() || null,
        ...(isEdit && { status: Number(form.status) }),
      };

      if (isEdit && category?.id) {
        await updateCategory(category.id, payload);
      } else {
        await createCategory(payload);
      }

      setForm(initialForm);
      setErrors({});
      if (onSuccess) await onSuccess();
      onHide();
    } catch (err) {
      setServerError(err?.message || (isEdit ? 'Failed to update category' : 'Failed to create category'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="pms-modal pms-modal-lg">
        {/* Header */}
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">
              {isEdit ? 'Edit Category' : 'New Product Category'}
            </div>
            <div className="pms-modal-sub">
              {isEdit
                ? `Update taxonomy details for "${category?.name || ''}"`
                : 'Add a new product category to the pharmaceutical catalog taxonomy'}
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

            {/* Category Details */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                Category Information
              </div>

              {/* Name */}
              <div className="pms-form-group" style={{ marginBottom: 14 }}>
                <label className="pms-label">Category Name *</label>
                <input
                  type="text"
                  className="pms-input pms-input-bare"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. Antibiotics, Vitamins & Supplements"
                  maxLength={150}
                  required
                />
                {errors.name && (
                  <div style={{ color: 'var(--status-danger)', fontSize: 11.5, marginTop: 4 }}>{errors.name}</div>
                )}
              </div>

              {/* Description */}
              <div className="pms-form-group" style={{ marginBottom: 14 }}>
                <label className="pms-label">Description</label>
                <textarea
                  className="pms-input pms-input-bare"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Brief description of what products belong to this category…"
                  maxLength={500}
                  style={{ resize: 'vertical' }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, textAlign: 'right' }}>
                  {form.description.length}/500
                </div>
                {errors.description && (
                  <div style={{ color: 'var(--status-danger)', fontSize: 11.5, marginTop: 4 }}>{errors.description}</div>
                )}
              </div>

              {/* Status — only shown in edit mode */}
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
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
