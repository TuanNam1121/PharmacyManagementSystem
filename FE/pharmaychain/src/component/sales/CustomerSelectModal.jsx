import React, { useState, useEffect } from 'react';
import { fetchCustomers } from '../../api/customerApi';

export default function CustomerSelectModal({
    isOpen,
    onClose,
    onSelectCustomer,
}) {
    const [search, setSearch] = useState('');
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

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
                console.error('Error fetching customers in POS:', err);
                setCustomers([]);
            } finally {
                setLoading(false);
            }
        }, 180);

        return () => clearTimeout(timer);
    }, [isOpen, search]);

    if (!isOpen) return null;

    return (
        <div
            className="pms-modal-overlay"
            style={{ zIndex: 1200 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="pms-modal" style={{ maxWidth: 580, width: '100%' }}>
                <div className="pms-modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: 'var(--brand-primary-light, #ecfdf5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--brand-primary, #059669)'
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <div>
                            <div className="pms-modal-title" style={{ fontSize: 17 }}>
                                Chọn Khách Hàng / Hội Viên
                            </div>
                            <div className="pms-modal-sub">
                                Tích điểm thành viên và kiểm tra cảnh báo tiền sử dị ứng thuốc
                            </div>
                        </div>
                    </div>

                    <button type="button" className="pms-modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="pms-modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="pms-input"
                            style={{ height: 44, fontSize: 14, paddingLeft: 14 }}
                            placeholder="Nhập số điện thoại hoặc họ tên khách hàng..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div style={{ maxHeight: 340, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                        {loading && (
                            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                                <div className="spinner-border spinner-border-sm" style={{ marginRight: 8, color: 'var(--brand-primary)' }} />
                                Đang tìm kiếm khách hàng...
                            </div>
                        )}

                        {!loading && customers.length === 0 && (
                            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                                Không tìm thấy khách hàng phù hợp với từ khóa
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
                                        <span className="pms-badge pms-badge-secondary" style={{ fontSize: 10 }}>
                                            {c.membershipTier || 'Thành viên'}
                                        </span>
                                    </div>

                                    {c.allergies && (
                                        <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4, fontWeight: 600 }}>
                                            ⚠️ Tiền sử dị ứng: {c.allergies}
                                        </div>
                                    )}
                                </div>

                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--brand-primary, #059669)' }}>
                                        {c.rewardPoints || 0} điểm
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-pms btn-pms-primary"
                                        style={{ fontSize: 11, padding: '3px 10px', height: 26 }}
                                    >
                                        Chọn
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pms-modal-footer" style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between' }}>
                    <button
                        type="button"
                        className="btn-pms btn-pms-secondary"
                        onClick={() => {
                            onSelectCustomer(null);
                            onClose();
                        }}
                    >
                        Bỏ chọn (Khách vãng lai)
                    </button>
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
    );
}
