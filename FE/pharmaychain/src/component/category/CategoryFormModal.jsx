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
    if (!form.name.trim()) e.name = 'Tên danh mục không được để trống';
    if (form.name.trim().length > 150) e.name = 'Tên danh mục không được vượt quá 150 ký tự';
    if (form.description.trim().length > 500) e.description = 'Mô tả không được vượt quá 500 ký tự';
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
      setServerError(err?.message || (isEdit ? 'Cập nhật danh mục thất bại' : 'Thêm mới danh mục thất bại'));
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
              {isEdit ? 'Chỉnh Sửa Nhóm Danh Mục' : 'Thêm Nhóm Danh Mục Mới'}
            </div>
            <div className="pms-modal-sub">
              {isEdit
                ? `Cập nhật thông tin phân loại cho "${category?.name || ''}"`
                : 'Thêm nhóm phân loại dược phẩm mới vào hệ thống danh mục chuỗi nhà thuốc'}
            </div>
          </div>
          <button className="pms-modal-close" onClick={handleClose} aria-label="Đóng">
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
                Thông Tin Phân Loại Danh Mục
              </div>

              {/* Name */}
              <div className="pms-form-group" style={{ marginBottom: 14 }}>
                <label className="pms-label">Tên Nhóm Danh Mục *</label>
                <input
                  type="text"
                  className="pms-input pms-input-bare"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="Ví dụ: Kháng Sinh & Kháng Khuẩn, Giảm Đau Hạ Sốt, Tim Mạch…"
                  maxLength={150}
                  required
                />
                {errors.name && (
                  <div style={{ color: 'var(--status-danger)', fontSize: 11.5, marginTop: 4 }}>{errors.name}</div>
                )}
              </div>

              {/* Description */}
              <div className="pms-form-group" style={{ marginBottom: 14 }}>
                <label className="pms-label">Mô Tả Nghiệp Vụ</label>
                <textarea
                  className="pms-input pms-input-bare"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Mô tả phạm vi áp dụng, điều kiện bảo quản GSP hoặc các nhóm hoạt chất thuộc danh mục này…"
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
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={handleClose} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn-pms btn-pms-primary" disabled={submitting}>
              {submitting ? 'Đang lưu…' : isEdit ? 'Lưu Thay Đổi' : 'Tạo Danh Mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
