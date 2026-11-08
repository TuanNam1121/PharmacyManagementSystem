import { useState, useEffect } from 'react';

const INITIAL_FORM_STATE = {
  fullName: '',
  phone: '',
  gender: 'MALE',
  dateOfBirth: '',
  email: '',
  address: '',
  // Health profile
  heightCm: '',
  weightKg: '',
  allergies: '',
  chronicDiseases: '',
  currentMedications: '',
  isPregnant: false,
  isBreastfeeding: false,
  notes: '',
};

export default function CustomerFormModal({
  show,
  onHide,
  mode = 'create', // 'create' | 'edit'
  customer = null,
  onSubmit,
  loading = false,
  zIndex = 1300,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      if (mode === 'edit' && customer) {
        const hp = customer.healthProfile || {};
        let genderStr = 'MALE';
        if (customer.gender === 'FEMALE' || customer.genderCode === 0) genderStr = 'FEMALE';
        else if (customer.gender === 'OTHER' || customer.genderCode === 2) genderStr = 'OTHER';

        setFormData({
          fullName: customer.fullName || '',
          phone: customer.phone || '',
          gender: genderStr,
          dateOfBirth: customer.dateOfBirth || '',
          email: customer.email || '',
          address: customer.address || '',
          heightCm: hp.heightCm ?? '',
          weightKg: hp.weightKg ?? '',
          allergies: hp.allergies || '',
          chronicDiseases: hp.chronicDiseases || '',
          currentMedications: hp.currentMedications || '',
          isPregnant: Boolean(hp.isPregnant),
          isBreastfeeding: Boolean(hp.isBreastfeeding),
          notes: hp.notes || '',
        });
      } else {
        setFormData({
          ...INITIAL_FORM_STATE,
          phone: customer?.phone || '',
        });
      }
      setErrors({});
    }
  }, [show, mode, customer]);

  if (!show) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên khách hàng không được để trống';
    } else if (formData.fullName.length > 100) {
      newErrors.fullName = 'Họ và tên tối đa 100 ký tự';
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không đúng định dạng Việt Nam (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Email không đúng định dạng';
    }

    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      if (dob > new Date()) {
        newErrors.dateOfBirth = 'Ngày sinh phải trong quá khứ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth || null,
      email: formData.email.trim() || null,
      address: formData.address.trim() || null,
      healthProfile: {
        heightCm: formData.heightCm ? Number(formData.heightCm) : null,
        weightKg: formData.weightKg ? Number(formData.weightKg) : null,
        allergies: formData.allergies.trim() || null,
        chronicDiseases: formData.chronicDiseases.trim() || null,
        currentMedications: formData.currentMedications.trim() || null,
        isPregnant: formData.isPregnant,
        isBreastfeeding: formData.isBreastfeeding,
        notes: formData.notes.trim() || null,
      },
    };

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  const isEdit = mode === 'edit';

  return (
    <div
      className="pms-modal-overlay"
      style={{ zIndex }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onHide();
      }}
    >
      <div className="pms-modal pms-modal-lg" style={{ maxWidth: 780 }}>
        {/* Header */}
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">
              {isEdit ? 'Chỉnh Sửa Hồ Sơ Khách Hàng' : 'Đăng Ký Khách Hàng Mới'}
            </div>
            <div className="pms-modal-sub">
              {isEdit
                ? `Cập nhật thông tin và tiền sử bệnh lý cho khách hàng #${customer?.customerCode || ''}`
                : 'Thêm mới khách hàng vào chuỗi nhà thuốc để tích lũy điểm và theo dõi y tế'}
            </div>
          </div>
          <button className="pms-modal-close" onClick={onHide} disabled={loading} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="pms-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', padding: '20px 24px' }}>
            {/* Section 1: Thông tin định danh */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: 'var(--brand-primary)',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                1. Thông tin cá nhân cơ bản
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {/* Full name */}
                <div>
                  <label className="pms-label required" style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Họ và tên khách hàng *
                  </label>
                  <input
                    className={`pms-input ${errors.fullName ? 'error' : ''}`}
                    type="text"
                    placeholder="VD: Trần Thị Lan"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (errors.fullName) setErrors({ ...errors, fullName: null });
                    }}
                  />
                  {errors.fullName && <div style={{ color: '#f87171', fontSize: 11.5, marginTop: 3 }}>{errors.fullName}</div>}
                </div>

                {/* Phone */}
                <div>
                  <label className="pms-label required" style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Số điện thoại *
                  </label>
                  <input
                    className={`pms-input ${errors.phone ? 'error' : ''}`}
                    type="tel"
                    placeholder="VD: 0987123456"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: null });
                    }}
                  />
                  {errors.phone && <div style={{ color: '#f87171', fontSize: 11.5, marginTop: 3 }}>{errors.phone}</div>}
                </div>

                {/* Gender */}
                <div>
                  <label className="pms-label required" style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Giới tính *
                  </label>
                  <select
                    className="pms-select"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="MALE">Nam (Male)</option>
                    <option value="FEMALE">Nữ (Female)</option>
                    <option value="OTHER">Khác (Other)</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="pms-label" style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Ngày sinh
                  </label>
                  <input
                    className={`pms-input ${errors.dateOfBirth ? 'error' : ''}`}
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => {
                      setFormData({ ...formData, dateOfBirth: e.target.value });
                      if (errors.dateOfBirth) setErrors({ ...errors, dateOfBirth: null });
                    }}
                  />
                  {errors.dateOfBirth && <div style={{ color: '#f87171', fontSize: 11.5, marginTop: 3 }}>{errors.dateOfBirth}</div>}
                </div>

                {/* Email */}
                <div>
                  <label className="pms-label" style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Email liên hệ
                  </label>
                  <input
                    className={`pms-input ${errors.email ? 'error' : ''}`}
                    type="email"
                    placeholder="VD: lan.tran@gmail.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                  />
                  {errors.email && <div style={{ color: '#f87171', fontSize: 11.5, marginTop: 3 }}>{errors.email}</div>}
                </div>

                {/* Address */}
                <div>
                  <label className="pms-label" style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Địa chỉ thường trú
                  </label>
                  <input
                    className="pms-input"
                    type="text"
                    placeholder="VD: 15 Duy Tân, Cầu Giấy, Hà Nội"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Hồ sơ sức khỏe y tế */}
            <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: '#f87171',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                2. Hồ sơ y tế & Cảnh báo an toàn dùng thuốc
              </div>

              {/* Allergies Highlight */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#f87171', display: 'block', marginBottom: 4 }}>
                  Tiền sử dị ứng thuốc (Cực kỳ quan trọng)
                </label>
                <input
                  className="pms-input"
                  type="text"
                  placeholder="VD: Dị ứng Penicillin, Amoxicillin, Paracetamol..."
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  style={{
                    borderColor: formData.allergies ? 'rgba(239, 68, 68, 0.5)' : undefined,
                    background: formData.allergies ? 'rgba(239, 68, 68, 0.04)' : undefined,
                  }}
                />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Ghi chú này sẽ kích hoạt cảnh báo đỏ khi Dược sĩ kê đơn tại quầy POS.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 14 }}>
                {/* Chronic Diseases */}
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Bệnh lý mãn tính / Bệnh nền
                  </label>
                  <input
                    className="pms-input"
                    type="text"
                    placeholder="VD: Viêm loét dạ dày, Tiểu đường, Cao huyết áp"
                    value={formData.chronicDiseases}
                    onChange={(e) => setFormData({ ...formData, chronicDiseases: e.target.value })}
                  />
                </div>

                {/* Current medications */}
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Thuốc đang sử dụng định kỳ
                  </label>
                  <input
                    className="pms-input"
                    type="text"
                    placeholder="VD: Nexium 40mg, Glucophage 500mg"
                    value={formData.currentMedications}
                    onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                  />
                </div>

                {/* Height */}
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Chiều cao (cm)
                  </label>
                  <input
                    className="pms-input"
                    type="number"
                    step="0.1"
                    placeholder="VD: 165"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                  />
                </div>

                {/* Weight */}
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Cân nặng (kg)
                  </label>
                  <input
                    className="pms-input"
                    type="number"
                    step="0.1"
                    placeholder="VD: 58.5"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                  />
                </div>
              </div>

              {/* Special condition checkboxes */}
              <div style={{ display: 'flex', gap: 24, marginBottom: 14, padding: '10px 14px', background: 'var(--bg-canvas)', borderRadius: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={formData.isPregnant}
                    onChange={(e) => setFormData({ ...formData, isPregnant: e.target.checked })}
                  />
                  <span>Đang mang thai</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={formData.isBreastfeeding}
                    onChange={(e) => setFormData({ ...formData, isBreastfeeding: e.target.checked })}
                  />
                  <span>Đang nuôi con bằng sữa mẹ</span>
                </label>
              </div>

              {/* Pharmacist Notes */}
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Ghi chú chuyên môn của Dược sĩ
                </label>
                <textarea
                  className="pms-input"
                  rows={2}
                  placeholder="VD: Tránh kê đơn nhóm NSAIDs vì có tiền sử đau dạ dày cấp"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pms-modal-footer">
            <button type="button" className="pms-btn pms-btn-ghost" onClick={onHide} disabled={loading}>
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="pms-btn pms-btn-primary"
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 120, justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <div className="pms-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  <span>Đang lưu…</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{isEdit ? 'Lưu thay đổi' : 'Đăng ký khách hàng'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

