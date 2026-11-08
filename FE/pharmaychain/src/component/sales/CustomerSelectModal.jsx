import React, { useState, useEffect } from 'react';
import { fetchCustomers, createCustomer } from '../../api/customerApi';

export default function CustomerSelectModal({
    isOpen,
    onClose,
    onSelectCustomer,
}) {
    const [search, setSearch] = useState('');
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Chế độ tạo mới nhanh khách hàng (Quick Create)
    const [isCreating, setIsCreating] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [newFullName, setNewFullName] = useState('');
    const [newGender, setNewGender] = useState('Nam');
    const [newAllergies, setNewAllergies] = useState('');
    const [createError, setCreateError] = useState('');
    const [createSubmitting, setCreateSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsCreating(false);
            setSearch('');
            setCreateError('');
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetchCustomers({
                    keyword: search.trim(),
                    status: 1, // only active
                    page: 0,
                    size: 10,
                });
                const list = res?.content || (Array.isArray(res) ? res : []);
                setCustomers(list);

                // Nếu người dùng nhập 10 chữ số điện thoại mà không thấy ai, gợi ý mở form tạo mới
                const isPhone = /^[0-9]{9,11}$/.test(search.trim());
                if (isPhone && list.length === 0) {
                    setNewPhone(search.trim());
                }
            } catch (err) {
                console.error('Error fetching customers in POS:', err);
                setCustomers([]);
            } finally {
                setLoading(false);
            }
        }, 180);

        return () => clearTimeout(timer);
    }, [isOpen, search]);

    if (!isOpen) return null;

    const handleStartCreate = (suggestedPhone = '') => {
        setIsCreating(true);
        setNewPhone(suggestedPhone || (/^[0-9]+$/.test(search.trim()) ? search.trim() : ''));
        setNewFullName('');
        setNewGender('Nam');
        setNewAllergies('');
        setCreateError('');
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setCreateError('');

        if (!newFullName.trim()) {
            setCreateError('Vui lòng nhập họ và tên khách hàng');
            return;
        }

        const cleanPhone = newPhone.trim();
        if (!cleanPhone || !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(cleanPhone)) {
            setCreateError('Số điện thoại không đúng định dạng Việt Nam (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09)');
            return;
        }

        setCreateSubmitting(true);
        try {
            const payload = {
                fullName: newFullName.trim(),
                phone: cleanPhone,
                gender: newGender,
                healthProfile: newAllergies.trim() ? {
                    allergies: newAllergies.trim(),
                } : null,
            };

            const created = await createCustomer(payload);
            const customerObj = created?.customer || created;
            onSelectCustomer(customerObj);
            onClose();
        } catch (err) {
            console.error('Lỗi khi tạo mới khách hàng:', err);
            setCreateError(err?.message || 'Không thể tạo mới khách hàng. Số điện thoại có thể đã tồn tại.');
        } finally {
            setCreateSubmitting(false);
        }
    };

    return (
        <div
            className="pms-modal-overlay"
            style={{ zIndex: 1200 }}
            onClick={(e) => {
                if (e.target === e.currentTarget && !createSubmitting) onClose();
            }}
        >
            <div className="pms-modal" style={{ maxWidth: 580, width: '100%' }}>
                {/* Header */}
                <div className="pms-modal-header" style={{ background: 'var(--brand-primary-light, #ecfdf5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: 'var(--brand-primary, #059669)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', boxShadow: '0 2px 6px rgba(5,150,105,0.2)'
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <div>
                            <div className="pms-modal-title" style={{ fontSize: 17, color: 'var(--brand-primary, #059669)' }}>
                                {isCreating ? 'Thêm Mới Khách Hàng Nhanh' : 'Xác Định Khách Hàng Bán Lẻ'}
                            </div>
                            <div className="pms-modal-sub">
                                {isCreating ? 'Đăng ký nhanh thông tin khách hàng mới để hoàn tất đơn' : 'Đọc số điện thoại để tích điểm và kiểm tra tiền sử dị ứng thuốc'}
                            </div>
                        </div>
                    </div>

                    <button type="button" className="pms-modal-close" onClick={onClose} disabled={createSubmitting}>
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="pms-modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* VIEW 1: FORM TẠO MỚI KHÁCH HÀNG NHANH */}
                    {isCreating ? (
                        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {createError && (
                                <div className="pms-alert pms-alert-danger" style={{ padding: '8px 12px', fontSize: 12.5 }}>
                                    {createError}
                                </div>
                            )}

                            <div className="pms-form-group">
                                <label className="pms-label" style={{ fontWeight: 700, fontSize: 13 }}>
                                    Số điện thoại khách hàng <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="tel"
                                    className="pms-input"
                                    style={{ height: 40, fontSize: 15, fontWeight: 700 }}
                                    placeholder="VD: 0987123456"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                    autoFocus={!newPhone}
                                    required
                                />
                            </div>

                            <div className="pms-form-group">
                                <label className="pms-label" style={{ fontWeight: 700, fontSize: 13 }}>
                                    Họ và tên khách hàng <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="pms-input"
                                    style={{ height: 40, fontSize: 14 }}
                                    placeholder="Nhập họ và tên đầy đủ..."
                                    value={newFullName}
                                    onChange={(e) => setNewFullName(e.target.value)}
                                    autoFocus={Boolean(newPhone)}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="pms-form-group">
                                    <label className="pms-label" style={{ fontSize: 12, fontWeight: 600 }}>Giới tính</label>
                                    <select
                                        className="pms-select"
                                        style={{ height: 38 }}
                                        value={newGender}
                                        onChange={(e) => setNewGender(e.target.value)}
                                    >
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>

                                <div className="pms-form-group">
                                    <label className="pms-label" style={{ fontSize: 12, fontWeight: 600 }}>Tiền sử dị ứng (nếu có)</label>
                                    <input
                                        type="text"
                                        className="pms-input"
                                        style={{ height: 38, fontSize: 13 }}
                                        placeholder="VD: Dị ứng Penicillin..."
                                        value={newAllergies}
                                        onChange={(e) => setNewAllergies(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                                <button
                                    type="button"
                                    className="btn-pms btn-pms-secondary"
                                    onClick={() => setIsCreating(false)}
                                    disabled={createSubmitting}
                                >
                                    ← Quay lại tìm kiếm
                                </button>
                                <button
                                    type="submit"
                                    className="btn-pms btn-pms-primary"
                                    style={{ minWidth: 150, fontWeight: 700 }}
                                    disabled={createSubmitting}
                                >
                                    {createSubmitting ? 'Đang lưu...' : 'Lưu & Chọn Khách (Enter)'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* VIEW 2: TÌM KIẾM THEO SỐ ĐIỆN THOẠI HOẶC TÊN */
                        <>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input
                                        type="text"
                                        className="pms-input"
                                        style={{ height: 44, fontSize: 14, paddingLeft: 14 }}
                                        placeholder="Đọc / Nhập số điện thoại khách hàng (VD: 0987123456)..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        autoFocus
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => setSearch('')}
                                            style={{
                                                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                                border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 14
                                            }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="btn-pms btn-pms-primary"
                                    style={{ height: 44, padding: '0 16px', fontWeight: 700, gap: 6 }}
                                    onClick={() => handleStartCreate(search)}
                                >
                                    + Thêm Mới
                                </button>
                            </div>

                            <div style={{ maxHeight: 340, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                                {loading && (
                                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                                        <div className="spinner-border spinner-border-sm" style={{ marginRight: 8, color: 'var(--brand-primary)' }} />
                                        Đang tra cứu số điện thoại khách hàng...
                                    </div>
                                )}

                                {!loading && customers.length === 0 && (
                                    <div style={{ padding: '28px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                                            {search ? `Không tìm thấy khách hàng với SĐT "${search}"` : 'Vui lòng đọc hoặc nhập số điện thoại khách hàng'}
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-pms btn-pms-primary"
                                            style={{ fontSize: 13, fontWeight: 700, padding: '8px 18px' }}
                                            onClick={() => handleStartCreate(search)}
                                        >
                                            + Tạo mới khách hàng với SĐT "{search || 'này'}"
                                        </button>
                                    </div>
                                )}

                                {!loading && customers.map((c) => (
                                    <div
                                        key={c.customerId || c.id}
                                        onClick={() => {
                                            onSelectCustomer(c);
                                            onClose();
                                        }}
                                        style={{
                                            padding: '12px 16px',
                                            borderBottom: '1px solid #f1f5f9',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            transition: 'background 0.12s ease',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--brand-primary-light, #ecfdf5)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <strong style={{ fontSize: 14, color: '#0f172a' }}>{c.fullName}</strong>
                                                <span className="pms-badge pms-badge-info" style={{ fontSize: 11 }}>
                                                    {c.phone}
                                                </span>
                                                {c.loyaltyPoints > 0 && (
                                                    <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
                                                        • {c.loyaltyPoints} điểm
                                                    </span>
                                                )}
                                            </div>

                                            {c.allergies && (
                                                <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4, fontWeight: 600 }}>
                                                    ⚠️ Tiền sử dị ứng: {c.allergies}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                                            <button
                                                type="button"
                                                className="btn-pms btn-pms-primary"
                                                style={{ fontSize: 11, padding: '4px 12px', height: 26, fontWeight: 700 }}
                                            >
                                                Chọn
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!isCreating && (
                    <div className="pms-modal-footer" style={{ padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                            * Đơn bán lẻ bắt buộc phải gắn với khách hàng
                        </div>
                        <button
                            type="button"
                            className="btn-pms btn-pms-secondary"
                            onClick={onClose}
                        >
                            Đóng cửa sổ
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
