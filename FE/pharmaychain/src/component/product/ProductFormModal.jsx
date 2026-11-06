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
    if (!form.name.trim()) e.name = 'Tên thuốc/sản phẩm không được để trống';
    if (!form.unit.trim()) e.unit = 'Đơn vị tính không được để trống';
    if (!form.categoryId) e.categoryId = 'Vui lòng chọn danh mục dược phẩm';

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
        // Status is managed separately via the Inactive/Active action button; do not include in edit payload
        ...(!isEdit && { status: Number(form.status) }),
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
      setServerError(err?.message || (isEdit ? 'Cập nhật thông tin thuốc thất bại' : 'Thêm mới thuốc thất bại'));
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
              {isEdit ? 'Chỉnh Sửa Thông Tin Thuốc' : 'Thêm Thuốc Mới Vào Danh Mục'}
            </div>
            <div className="pms-modal-sub">
              {isEdit
                ? `Cập nhật thông tin danh mục cho "${product?.name || ''}"`
                : 'Thêm mới sản phẩm/thuốc vào danh mục quản lý kho trung tâm'}
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

            {/* ── Section 1: Basic Info ── */}
            <div style={{ marginBottom: 20 }}>
              {sectionTitle(1, 'Thông Tin Cơ Bản')}
              <div className="pms-form-group" style={{ marginBottom: 14 }}>
                <label className="pms-label">Tên Thuốc / Sản Phẩm *</label>
                <input
                  type="text"
                  className="pms-input pms-input-bare"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="Ví dụ: Panadol Extra, Augmentin 1g, Paracetamol 500mg"
                  maxLength={250}
                  required
                />
                {fieldErr('name')}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="pms-form-group">
                  <label className="pms-label">Nhóm Danh Mục *</label>
                  <select
                    className="pms-select"
                    style={{ width: '100%' }}
                    value={form.categoryId}
                    onChange={(e) => setField('categoryId', e.target.value)}
                    required
                  >
                    <option value="">— Chọn nhóm danh mục —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {fieldErr('categoryId')}
                </div>
                <div className="pms-form-group">
                  <label className="pms-label">Đơn Vị Tính *</label>
                  <input
                    type="text"
                    className="pms-input pms-input-bare"
                    value={form.unit}
                    onChange={(e) => setField('unit', e.target.value)}
                    placeholder="Ví dụ: Hộp, Vỉ, Chai, Ống, Tuýp"
                    maxLength={30}
                    required
                  />
                  {fieldErr('unit')}
                </div>
              </div>

              <div className="pms-form-group">
                <label className="pms-label">Mã Vạch / Mã GTIN</label>
                <input
                  type="text"
                  className="pms-input pms-input-bare mono"
                  value={form.barcode}
                  onChange={(e) => setField('barcode', e.target.value)}
                  placeholder="Ví dụ: 8935001234567"
                  maxLength={50}
                />
              </div>
            </div>

            {/* ── Section 2: Clinical Details ── */}
            <div style={{ marginBottom: 20 }}>
              {sectionTitle(2, 'Thông Tin Dược Lý & Lâm Sàng')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="pms-form-group">
                  <label className="pms-label">Hoạt Chất Chính</label>
                  <input
                    type="text"
                    className="pms-input pms-input-bare"
                    value={form.activeIngredient}
                    onChange={(e) => setField('activeIngredient', e.target.value)}
                    placeholder="Ví dụ: Paracetamol, Amoxicillin + Clavulanic Acid"
                    maxLength={250}
                  />
                </div>
                <div className="pms-form-group">
                  <label className="pms-label">Nhà Sản Xuất</label>
                  <input
                    type="text"
                    className="pms-input pms-input-bare"
                    value={form.manufacturer}
                    onChange={(e) => setField('manufacturer', e.target.value)}
                    placeholder="Ví dụ: Dược Hậu Giang (DHG), Sanofi, GSK"
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
                  Thuốc Kê Đơn Bắt Buộc (Thuốc Đơn Rx)
                </label>
              </div>
            </div>

            {/* ── Section 3: Stock Settings ── */}
            <div style={{ marginBottom: 20 }}>
              {sectionTitle(3, 'Cài Đặt Định Mức Tồn Kho')}
              <div className="pms-form-group" style={{ maxWidth: 320 }}>
                <label className="pms-label">Định Mức Tồn Tối Thiểu (Cảnh Báo)</label>
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
                  Ngưỡng cảnh báo sắp hết hàng tại kho. Đơn giá bán được thiết lập tại chức năng <em>"Thiết Lập Giá"</em>.
                </span>
              </div>
            </div>

            {/* ── Section 4: Media & Additional ── */}
            <div style={{ marginBottom: 8 }}>
              {sectionTitle(4, 'Hình Ảnh & Mô Tả Chi Tiết')}
              <div className="pms-form-group" style={{ marginBottom: 14 }}>
                <label className="pms-label">Đường Dẫn Hình Ảnh (URL)</label>
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
                        alt="Xem trước ảnh thuốc"
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
                <label className="pms-label">Mô Tả & Hướng Dẫn Sử Dụng</label>
                <textarea
                  className="pms-input pms-input-bare"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Ghi chú công dụng, chống chỉ định, cảnh báo đặc biệt (nếu có)…"
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={handleClose} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn-pms btn-pms-primary" disabled={submitting}>
              {submitting ? 'Đang lưu…' : isEdit ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
