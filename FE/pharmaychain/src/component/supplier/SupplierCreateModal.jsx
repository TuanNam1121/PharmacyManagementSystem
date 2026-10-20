import { useState } from 'react';
import { createSupplier } from '../../api/SupplierAPI';

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

export default function SupplierCreateModal({ show, onHide, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = 'Mã NCC không được để trống';
    if (!form.name.trim()) e.name = 'Tên NCC không được để trống';
    if (!form.phone.trim()) e.phone = 'SDT không được để trống';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'Email không đúng định dạng';
    }
    if (form.taxCode.trim() && !/^[0-9]{10}(-[0-9]{3})?$/.test(form.taxCode.trim())) {
      e.taxCode = 'MST phải gồm 10 hoặc 13 số';
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
      await createSupplier(payload);
      setForm(initialForm);
      setErrors({});
      if (onSuccess) await onSuccess();
      onHide();
    } catch (err) {
      setServerError(err?.message || 'Tạo NCC thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header">
            <h5 className="modal-title fw-bold text-dark">Thêm NCC</h5>
            <button type="button" className="btn-close" onClick={handleClose} aria-label="Close" />
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body">
              {serverError && (
                <div className="alert alert-danger" role="alert">{serverError}</div>
              )}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">Mã NCC *</label>
                  <input type="text" className="form-control" value={form.code} onChange={(e) => setField('code', e.target.value)} placeholder="VD: NCC001" />
                  {errors.code && <div className="text-danger small mt-1">{errors.code}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Tên NCC *</label>
                  <input type="text" className="form-control" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="VD: Cty Duoc An Khang" />
                  {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Liên hệ</label>
                  <input type="text" className="form-control" value={form.contactPerson} onChange={(e) => setField('contactPerson', e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">SDT *</label>
                  <input type="text" className="form-control" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="VD: 0901234567" />
                  {errors.phone && <div className="text-danger small mt-1">{errors.phone}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Email</label>
                  <input type="email" className="form-control" value={form.email} onChange={(e) => setField('email', e.target.value)} />
                  {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Mã số thuế</label>
                  <input type="text" className="form-control" value={form.taxCode} onChange={(e) => setField('taxCode', e.target.value)} />
                  {errors.taxCode && <div className="text-danger small mt-1">{errors.taxCode}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">Địa chỉ</label>
                  <input type="text" className="form-control" value={form.address} onChange={(e) => setField('address', e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">Ghi chú</label>
                  <textarea className="form-control" rows={3} value={form.note} onChange={(e) => setField('note', e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={handleClose} disabled={submitting}>Hủy</button>
              <button type="submit" className="btn btn-success" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Lưu nhà cung cấp'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
