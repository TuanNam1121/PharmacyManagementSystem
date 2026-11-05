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
                    search: search.trim(),
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
        }, 200);

        return () => clearTimeout(timer);
    }, [isOpen, search]);

    if (!isOpen) return null;

    return (
        <div className="pms-modal-backdrop" style={{ zIndex: 1050 }}>
            <div className="pms-modal" style={{ maxWidth: 560, width: '100%' }}>
                <div className="pms-modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'var(--brand-primary-light, #ecfdf5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--brand-primary, #059669)'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="pms-modal-title" style={{ margin: 0 }}>Chọn Khách Hàng / Hội Viên (F4)</h3>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                Tích điểm thành viên và kiểm tra tiền sử dị ứng thuốc
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pms-modal-body" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="pms-input"
                            style={{ height: 42, fontSize: 14 }}
                            placeholder="Nhập số điện thoại hoặc tên khách hàng..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 8 }}>
                        {loading && (
                            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                                Đang tìm kiếm khách hàng...
                            </div>
                        )}

                        {!loading && customers.length === 0 && (
                            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                                Không tìm thấy khách hàng phù hợp
                            </div>
                        )}

                        {!loading && customers.map((c) => (
                            <div
                                key={c.id}
                                onClick={() => {
                                    onSelectCustomer(c);
                                    onClose();
                                }}
                                style={{
                                    padding: '10px 14px',
                                    borderBottom: '1px solid #f3f4f6',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'background 0.15s ease',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--brand-primary-light, #ecfdf5)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                            >
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <strong style={{ fontSize: 14, color: '#111827' }}>{c.fullName}</strong>
                                        <span className="pms-badge pms-badge-info" style={{ fontSize: 11 }}>
                                            {c.phone}
                                        </span>
                                        <span className="pms-badge pms-badge-secondary" style={{ fontSize: 10 }}>
                                            {c.membershipTier || 'Thành viên'}
                                        </span>
                                    </div>

                                    {c.allergies && (
                                        <div style={{ fontSize: 12, color: '#ef4444', marginTop: 3 }}>
                                            ⚠️ Dị ứng: <strong>{c.allergies}</strong>
                                        </div>
                                    )}
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-primary, #059669)' }}>
                                        {c.rewardPoints || 0} điểm
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-pms btn-pms-primary"
                                        style={{ fontSize: 11, padding: '3px 8px', marginTop: 4 }}
                                    >
                                        Chọn
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pms-modal-footer" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between' }}>
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
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
