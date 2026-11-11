import { useState, useEffect } from 'react';
import { createProduct, updateProduct, getProductUnits } from '../../api/ProductAPI';

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
  units: [],
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
        const initialUnits = product.units && product.units.length > 0
          ? product.units.map((u) => ({ ...u }))
          : [{ unitName: product.unit || '', conversionFactor: 1, sellingPrice: product.sellingPrice || 0, isBaseUnit: true, barcode: product.barcode || '' }];

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
          units: initialUnits,
        });

        // Luôn fetch danh sách quy cách đơn vị mới nhất từ backend cho chế độ edit
        const targetId = product.id || product.productId;
        if (targetId) {
          getProductUnits(targetId)
            .then((fetchedUnits) => {
              if (Array.isArray(fetchedUnits) && fetchedUnits.length > 0) {
                setForm((prev) => ({
                  ...prev,
                  units: fetchedUnits.map((u) => ({ ...u })),
                }));
              }
            })
            .catch((err) => console.warn('Không thể tải units của sản phẩm:', err));
        }
      } else {
        setForm({
          ...initialForm,
          units: [{ unitName: '', conversionFactor: 1, sellingPrice: 0, isBaseUnit: true, barcode: '' }],
        });
      }
    }
  }, [show, isEdit, product]);

  if (!show) return null;

  const setField = (key, value) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      // Nếu thay đổi unit cơ bản ở input thông tin cơ bản, tự động đồng bộ tên unit của base unit trong danh sách units
      if (key === 'unit' && prev.units && prev.units.length > 0) {
        updated.units = prev.units.map((u) => (u.isBaseUnit ? { ...u, unitName: value } : u));
      }
      return updated;
    });
  };

  const handleAddUnit = () => {
    setForm((prev) => {
      const currentList = prev.units || [];
      const lastFactor = currentList.length > 0 ? (Number(currentList[currentList.length - 1].conversionFactor) || 1) : 1;
      return {
        ...prev,
        units: [
          ...currentList,
          {
            unitName: '',
            conversionFactor: lastFactor * 10,
            sellingPrice: 0,
            isBaseUnit: false,
            barcode: '',
          },
        ],
      };
    });
  };

  const handleUpdateUnitRow = (index, field, value) => {
    setForm((prev) => {
      const nextUnits = [...(prev.units || [])];
      nextUnits[index] = { ...nextUnits[index], [field]: value };

      let updatedUnitName = prev.unit;
      if (field === 'isBaseUnit' && value === true) {
        nextUnits.forEach((u, i) => {
          if (i !== index) u.isBaseUnit = false;
        });
        nextUnits[index].conversionFactor = 1;
        if (nextUnits[index].unitName) {
          updatedUnitName = nextUnits[index].unitName;
        }
      }

      if (field === 'unitName' && nextUnits[index].isBaseUnit) {
        updatedUnitName = value;
      }

      return { ...prev, unit: updatedUnitName, units: nextUnits };
    });
  };

  const handleRemoveUnit = (index) => {
    setForm((prev) => {
      const nextUnits = (prev.units || []).filter((_, i) => i !== index);
      if (nextUnits.length > 0 && !nextUnits.some((u) => u.isBaseUnit)) {
        nextUnits[0].isBaseUnit = true;
        nextUnits[0].conversionFactor = 1;
      }
      return { ...prev, units: nextUnits };
    });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Tên thuốc/sản phẩm không được để trống';
    if (!form.unit.trim()) e.unit = 'Đơn vị tính không được để trống';
    if (!form.categoryId) e.categoryId = 'Vui lòng chọn danh mục dược phẩm';

    // Validate units
    if (form.units && form.units.length > 0) {
      const emptyUnit = form.units.some((u) => !u.unitName || !u.unitName.trim());
      if (emptyUnit) {
        e.units = 'Tất cả các dòng quy cách cần phải có tên đơn vị';
      }
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
      // Chuẩn hóa danh sách units
      const cleanedUnits = (form.units || [])
        .filter((u) => u.unitName && u.unitName.trim())
        .map((u) => ({
          id: u.id || undefined,
          unitName: u.unitName.trim(),
          conversionFactor: Number(u.conversionFactor) > 0 ? Number(u.conversionFactor) : 1,
          sellingPrice: Number(u.sellingPrice) >= 0 ? Number(u.sellingPrice) : 0,
          isBaseUnit: Boolean(u.isBaseUnit),
          barcode: u.barcode && u.barcode.trim() ? u.barcode.trim() : null,
        }));

      if (cleanedUnits.length > 0 && !cleanedUnits.some((u) => u.isBaseUnit)) {
        cleanedUnits[0].isBaseUnit = true;
        cleanedUnits[0].conversionFactor = 1;
      }

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
        units: cleanedUnits,
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
                ? `Cập nhật thông tin danh mục và quy cách cho "${product?.name || ''}"`
                : 'Thêm mới sản phẩm/thuốc vào danh mục quản lý kho và bán lẻ'}
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
                  <label className="pms-label">Đơn Vị Tính Cơ Bản *</label>
                  <input
                    type="text"
                    className="pms-input pms-input-bare"
                    value={form.unit}
                    onChange={(e) => setField('unit', e.target.value)}
                    placeholder="Ví dụ: Viên, Gói, Chai, Ống, Tuýp"
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

            {/* ── Section 3: Product Units (Quy Cách Đóng Gói: Viên, Vỉ, Hộp...) ── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                {sectionTitle(3, 'Quy Cách Đóng Gói & Đơn Vị Bán Lẻ (Units)')}
                <button
                  type="button"
                  className="btn-pms btn-pms-secondary"
                  onClick={handleAddUnit}
                  style={{ height: 28, fontSize: 12, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Thêm Quy Cách
                </button>
              </div>

              {errors.units && (
                <div style={{ color: 'var(--status-danger)', fontSize: 12, marginBottom: 8 }}>
                  {errors.units}
                </div>
              )}

              <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, overflowX: 'auto', background: '#fff' }}>
                <table className="pms-table" style={{ margin: 0, fontSize: 12.5, minWidth: 620 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ width: 140 }}>Tên Quy Cách *</th>
                      <th style={{ width: 120 }}>Hệ Số Quy Đổi *</th>
                      <th style={{ width: 150 }}>Giá Bán Lẻ (VNĐ)</th>
                      <th style={{ width: 110, textAlign: 'center' }}>Đơn Vị Cơ Bản</th>
                      <th style={{ minWidth: 130 }}>Mã Vạch Riêng</th>
                      <th style={{ width: 50, textAlign: 'center' }}>Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!form.units || form.units.length === 0) ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
                          Chưa có quy cách nào. Bấm "+ Thêm Quy Cách" để bổ sung.
                        </td>
                      </tr>
                    ) : (
                      form.units.map((u, idx) => (
                        <tr key={u.id || idx}>
                          <td>
                            <input
                              type="text"
                              className="pms-input pms-input-bare"
                              style={{ height: 32, fontSize: 12.5 }}
                              placeholder="VD: Viên, Vỉ, Hộp..."
                              value={u.unitName}
                              onChange={(e) => handleUpdateUnitRow(idx, 'unitName', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              className="pms-input pms-input-bare"
                              style={{ height: 32, fontSize: 12.5 }}
                              value={u.conversionFactor}
                              disabled={u.isBaseUnit}
                              onChange={(e) => handleUpdateUnitRow(idx, 'conversionFactor', Math.max(1, Number(e.target.value) || 1))}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="500"
                              className="pms-input pms-input-bare"
                              style={{ height: 32, fontSize: 12.5, textAlign: 'right' }}
                              value={u.sellingPrice}
                              onChange={(e) => handleUpdateUnitRow(idx, 'sellingPrice', Number(e.target.value) || 0)}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="radio"
                              name="baseUnitSelection"
                              checked={Boolean(u.isBaseUnit)}
                              onChange={() => handleUpdateUnitRow(idx, 'isBaseUnit', true)}
                              style={{ cursor: 'pointer', width: 16, height: 16 }}
                              title="Chọn làm đơn vị cơ bản nhỏ nhất (hệ số quy đổi = 1)"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="pms-input pms-input-bare mono"
                              style={{ height: 32, fontSize: 11.5 }}
                              placeholder="Tùy chọn mã vạch"
                              value={u.barcode || ''}
                              onChange={(e) => handleUpdateUnitRow(idx, 'barcode', e.target.value)}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveUnit(idx)}
                              disabled={u.isBaseUnit && form.units.length <= 1}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: (u.isBaseUnit && form.units.length <= 1) ? '#cbd5e1' : '#ef4444',
                                cursor: (u.isBaseUnit && form.units.length <= 1) ? 'not-allowed' : 'pointer',
                                padding: 4,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              title={u.isBaseUnit && form.units.length <= 1 ? 'Không thể xóa đơn vị cơ bản duy nhất' : 'Xóa quy cách này'}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
                <span style={{ fontWeight: 600 }}>* Chú thích:</span> Đơn vị cơ bản (hệ số 1) là đơn vị nhỏ nhất lưu trong kho. Các quy cách lớn hơn (Vỉ, Hộp...) sẽ được tự động quy đổi tương ứng khi bán lẻ tại quầy POS hoặc nhập/xuất kho.
              </div>
            </div>

            {/* ── Section 4: Stock Settings ── */}
            <div style={{ marginBottom: 20 }}>
              {sectionTitle(4, 'Cài Đặt Định Mức Tồn Kho')}
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
                  Ngưỡng cảnh báo sắp hết hàng tại kho theo đơn vị tính cơ bản.
                </span>
              </div>
            </div>

            {/* ── Section 5: Media & Additional ── */}
            <div style={{ marginBottom: 8 }}>
              {sectionTitle(5, 'Hình Ảnh & Mô Tả Chi Tiết')}
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
