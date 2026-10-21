import { useState, useEffect } from 'react';
import { createSupplier, updateSupplier } from '../../api/SupplierAPI';

const initialForm = {
  code: '',
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  taxCode: '',
  note: '',
};

export default function SupplierCreateModal({
  show,
  onHide,
  onSuccess,
  mode = 'create', // 'create' | 'edit'
  supplier = null,
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
      if (isEdit && supplier) {
        setForm({
          code: supplier.code || '',
          name: supplier.name || '',
          contactPerson: supplier.contactPerson || '',
          phone: supplier.phone || '',
          email: supplier.email || '',
          address: supplier.address || '',
          taxCode: supplier.taxCode || '',
          note: supplier.note || '',
        });
      } else {
        setForm(initialForm);
      }
    }
  }, [show, isEdit, supplier]);

  if (!show) return null;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const e = {};
    if (!isEdit && !form.code.trim()) e.code = 'Supplier code is required';
    if (!form.name.trim()) e.name = 'Supplier name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'Please provide a valid email address';
    }
    if (form.taxCode.trim() && !/^[0-9]{10}(-[0-9]{3})?$/.test(form.taxCode.trim())) {
      e.taxCode = 'Tax ID must be 10 or 13 digits (e.g. 0101234567)';
    }
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
        code: form.code.trim(),
        name: form.name.trim(),
        contactPerson: form.contactPerson.trim() || null,
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        taxCode: form.taxCode.trim() || null,
        note: form.note.trim() || null,
      };

      if (isEdit && supplier?.id) {
        await updateSupplier(supplier.id, payload);
      } else {
        await createSupplier(payload);
      }

      setForm(initialForm);
      setErrors({});
      if (onSuccess) await onSuccess();
      onHide();
    } catch (err) {
      setServerError(err?.message || (isEdit ? 'Failed to update supplier' : 'Failed to create supplier'));
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
              {isEdit ? 'Edit Supplier Partner' : 'Register New Supplier'}
            </div>
            <div className="pms-modal-sub">
              {isEdit
                ? `Update procurement and legal credentials for ${supplier?.name || supplier?.code}`
                : 'Add a new pharmaceutical or medical equipment vendor to the network'}
            </div>
          </div>
          <button className="pms-modal-close" onClick={handleClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="pms-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {serverError && (
              <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {serverError}
                <button type="button" className="pms-alert-close" onClick={() => setServerError(null)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Section 1: Identification */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                1. Supplier Identification & Tax
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
                <div className="pms-form-group">
                  <label className="pms-label">Supplier Code *</label>
                  <input
                    type="text"
                    className="pms-input pms-input-bare"
                    value={form.code}
                    onChange={(e) => setField('code', e.target.value)}
                    placeholder="e.g. NCC001"
                    disabled={isEdit}
                    required
                  />
                  {errors.code && <div style={{ color: 'var(--status-danger)', fontSize: 11.5, marginTop: 4 }}>{errors.code}</div>}
                </div>

                <div className="pms-form-group">
                  <label className="pms-label">Company / Supplier Name *</label>
                  <input
                    type="text"
                    className="pms-input pms-input-bare"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="e.g. Pharma Global Corporation"
                    required
                  />
                  {errors.name && <div style={{ color: 'var(--status-danger)', fontSize: 11.5, marginTop: 4 }}>{errors.name}</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12 }}>
                <div className="pms-form-group">
                  <label className="pms-label">Tax Code (MST)</label>
                  <input
                    type="text"
                    className="pms-input pms-input-bare"
                    value={form.taxCode}
                    onChange={(e) => setField('taxCode', e.target.value)}
                    placeholder="10 or 13 digits (e.g. 0101234567)"
                  />
                  {errors.taxCode && <div style={{ color: 'var(--status-danger)', fontSize: 11.5, marginTop: 4 }}>{errors.taxCode}</div>}
                </div>

                <div className="pms-form-group">
                  <label className="pms-label">Contact Person</label>
                  <input
                    type="text"
                    className="pms-input pms-input-bare"
                    value={form.contactPerson}
                    onChange={(e) => setField('contactPerson', e.target.value)}
                    placeholder="e.g. David Nguyen"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                2. Contact & Headquarters Address
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 12 }}>
                <div className="pms-form-group">
                  <label className="pms-label">Phone Number *</label>
                  <input
                    type="text"
                    className="pms-input pms-input-bare"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    placeholder="e.g. +84 901 234 567"
                    required
                  />
                  {errors.phone && <div style={{ color: 'var(--status-danger)', fontSize: 11.5, marginTop: 4 }}>{errors.phone}</div>}
                </div>

                <div className="pms-form-group">
                  <label className="pms-label">Email Address</label>
                  <input
                    type="email"
                    className="pms-input pms-input-bare"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    placeholder="e.g. orders@supplier.com"
                  />
                  {errors.email && <div style={{ color: 'var(--status-danger)', fontSize: 11.5, marginTop: 4 }}>{errors.email}</div>}
                </div>
              </div>

              <div className="pms-form-group" style={{ marginBottom: 12 }}>
                <label className="pms-label">Business Address</label>
                <input
                  type="text"
                  className="pms-input pms-input-bare"
                  value={form.address}
                  onChange={(e) => setField('address', e.target.value)}
                  placeholder="e.g. 123 Nguyen Trai, District 1, Ho Chi Minh City"
                />
              </div>

              <div className="pms-form-group">
                <label className="pms-label">Internal Procurement Notes</label>
                <textarea
                  className="pms-input pms-input-bare"
                  rows={3}
                  value={form.note}
                  onChange={(e) => setField('note', e.target.value)}
                  placeholder="Special pricing terms, payment terms (e.g. Net 30), delivery lead times…"
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={handleClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-pms btn-pms-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
