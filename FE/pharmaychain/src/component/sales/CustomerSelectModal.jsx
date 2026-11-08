import React, { useState, useEffect } from 'react';
import { fetchCustomers, createCustomer } from '../../api/customerApi';
import CustomerFormModal from '../customer/CustomerFormModal';

export default function CustomerSelectModal({
    isOpen,
    onClose,
    onSelectCustomer,
}) {
    const [search, setSearch] = useState('');
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Mở CustomerFormModal chuẩn của hệ thống
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setSearch('');
            setCreateModalOpen(false);
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
            } catch (err) {
                console.error('Lỗi khi tra cứu khách hàng trong POS:', err);
                setCustomers([]);
            } finally {
                setLoading(false);
            }
        }, 180);

        return () => clearTimeout(timer);
    }, [isOpen, search]);

    if (!isOpen) return null;

    const handleOpenCreateModal = () => {
        setCreateError('');
        setCreateModalOpen(true);
    };

    const handleCreateCustomerSubmit = async (payload) => {
        setCreateLoading(true);
        setCreateError('');
        try {
            const created = await createCustomer(payload);
            const customerObj = created?.customer || created;
            setCreateModalOpen(false);
            onSelectCustomer(customerObj);
            onClose();
        } catch (err) {
            console.error('Lỗi khi tạo mới khách hàng từ CustomerFormModal:', err);
            alert(err?.message || 'Không thể tạo mới khách hàng. Số điện thoại có thể đã tồn tại.');
        } finally {
            setCreateLoading(false);
        }
    };

    const cleanSearchPhone = /^[0-9]+$/.test(search.trim()) ? search.trim() : '';

    return (
        <>
            <div
                className="pms-modal-overlay"
                style={{ zIndex: 1200 }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
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
                                    Xác Định Khách Hàng Bán Lẻ
                                </div>
                                <div className="pms-modal-sub">
                                    Đọc số điện thoại để tích điểm và kiểm tra tiền sử dị ứng thuốc
                                </div>
                            </div>
                        </div>

                        <button type="button" className="pms-modal-close" onClick={onClose}>
                            ✕
                        </button>
                    </div>

                    {/* Body */}
                    <div className="pms-modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {createError && (
                            <div className="pms-alert pms-alert-danger" style={{ padding: '8px 12px', fontSize: 12.5 }}>
                                {createError}
                            </div>
                        )}

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
                                onClick={handleOpenCreateModal}
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
                                        onClick={handleOpenCreateModal}
                                    >
                                        + Tạo mới khách hàng {cleanSearchPhone ? `với SĐT "${cleanSearchPhone}"` : ''}
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
                    </div>

                    {/* Footer */}
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
                </div>
            </div>

            {/* Modal tạo mới khách hàng chuẩn của hệ thống (CustomerFormModal) */}
            <CustomerFormModal
                show={createModalOpen}
                onHide={() => setCreateModalOpen(false)}
                mode="create"
                customer={cleanSearchPhone ? { phone: cleanSearchPhone } : null}
                onSubmit={handleCreateCustomerSubmit}
                loading={createLoading}
            />
        </>
    );
}
