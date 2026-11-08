import React, { useState } from 'react';
import { money, formatDateTime, formatPaymentMethod } from '../../utils/format';
import InvoiceDetailModal from './InvoiceDetailModal';
import SalesReturnModal from './SalesReturnModal';

function Pagination({ total, page, size, onPage }) {
    if (total <= size) return null;
    const totalPages = Math.ceil(total / size);
    return (
        <div className="pms-pagination">
            <button className="pms-page-btn" disabled={page === 0} onClick={() => onPage(page - 1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                <button key={i} className={`pms-page-btn ${page === i ? 'active' : ''}`} onClick={() => onPage(i)}>
                    {i + 1}
                </button>
            ))}
            {totalPages > 7 && <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>}
            <button className="pms-page-btn" disabled={page + 1 >= totalPages} onClick={() => onPage(page + 1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </button>
        </div>
    );
}

export default function DailySalesInvoicesTable({ invoices, loading, total, page, size, onPage, onRefresh }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState(null);
    const [selectedInvoiceForReturn, setSelectedInvoiceForReturn] = useState(null);

    // Filter tìm kiếm theo mã hóa đơn, tên khách hàng hoặc số điện thoại
    const filteredInvoices = (invoices || []).filter((inv) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.trim().toLowerCase();
        const codeMatch = inv.code && inv.code.toLowerCase().includes(term);
        const nameMatch = inv.customerName && inv.customerName.toLowerCase().includes(term);
        const phoneMatch = inv.customerPhone && inv.customerPhone.toLowerCase().includes(term);
        const prescMatch = inv.prescriptionCode && inv.prescriptionCode.toLowerCase().includes(term);
        return codeMatch || nameMatch || phoneMatch || prescMatch;
    });

    const handleOpenDetail = (inv) => {
        setSelectedInvoiceForDetail(inv.code || inv.id);
    };

    const handleOpenReturn = (inv) => {
        setSelectedInvoiceForReturn(inv);
    };

    return (
        <div className="pms-card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header + Search Bar */}
            <div style={{
                padding: '16px 20px', borderBottom: '1px solid var(--border-color)',
                display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 14
            }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                        Hóa Đơn Bán Lẻ Trong Ngày
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        Toàn bộ giao dịch bán lẻ phát sinh trong ngày làm việc của nhà thuốc
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Search Input Box */}
                    <div style={{ position: 'relative', width: 320 }}>
                        <svg
                            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            className="pms-input"
                            style={{ height: 36, paddingLeft: 34, fontSize: 12.5, borderRadius: 8 }}
                            placeholder="Tìm theo mã HĐ, tên khách hàng, SĐT..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                style={{
                                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                    border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 14
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <span className="pms-badge pms-badge-neutral" style={{ height: 32, display: 'flex', alignItems: 'center' }}>
                        {searchTerm ? `${filteredInvoices.length} / ${total}` : `${total}`} hóa đơn
                    </span>
                </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table className="pms-table">
                    <thead>
                        <tr>
                            <th>Mã Hóa Đơn</th>
                            <th>Mã Đơn Thuốc</th>
                            <th>Khách Hàng</th>
                            <th>Thời Gian</th>
                            <th>Hình Thức TT</th>
                            <th style={{ textAlign: 'right' }}>Tiền Hàng</th>
                            <th style={{ textAlign: 'right' }}>Giảm Giá</th>
                            <th style={{ textAlign: 'right' }}>Khách Phải Trả</th>
                            <th style={{ textAlign: 'center' }}>Trạng Thái</th>
                            <th style={{ textAlign: 'center', width: 150 }}>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                                    Đang tải danh sách hóa đơn...
                                </td>
                            </tr>
                        ) : filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                                    {searchTerm ? `Không tìm thấy hóa đơn nào khớp với "${searchTerm}"` : 'Không có hóa đơn bán lẻ nào phát sinh trong ngày đã chọn'}
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map((inv) => {
                                const canReturn = inv.status === 1 || inv.status === 3;
                                return (
                                    <tr key={inv.id}>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenDetail(inv)}
                                                style={{
                                                    background: 'none', border: 'none', padding: 0,
                                                    fontWeight: 700, color: 'var(--brand-primary-dark, #065f46)',
                                                    cursor: 'pointer', textDecoration: 'underline'
                                                }}
                                                title="Bấm để xem chi tiết hóa đơn"
                                            >
                                                {inv.code}
                                            </button>
                                        </td>
                                        <td>
                                            {inv.prescriptionCode ? (
                                                <span className="pms-badge pms-badge-neutral" style={{ fontSize: 11 }}>{inv.prescriptionCode}</span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            {inv.customerName ? (
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>
                                                        {inv.customerName}
                                                    </div>
                                                    {inv.customerPhone && (
                                                        <div style={{ fontSize: 11.5, color: '#64748b' }}>
                                                            {inv.customerPhone}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Khách lẻ</span>
                                            )}
                                        </td>
                                        <td style={{ fontSize: 12.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                            {formatDateTime(inv.paidAt || inv.createdAt)}
                                        </td>
                                        <td>
                                            <span
                                                className={`pms-badge ${
                                                    formatPaymentMethod(inv.paymentMethod) === 'Tiền mặt'
                                                        ? 'pms-badge-success'
                                                        : (formatPaymentMethod(inv.paymentMethod) === 'Ví VietQR' || formatPaymentMethod(inv.paymentMethod) === 'VietQR / MoMo' || formatPaymentMethod(inv.paymentMethod) === 'Chuyển khoản')
                                                        ? 'pms-badge-violet'
                                                        : 'pms-badge-info'
                                                }`}
                                                style={{ fontSize: 11.5 }}
                                            >
                                                {formatPaymentMethod(inv.paymentMethod)}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                                            {money(inv.totalAmount)}
                                        </td>
                                        <td style={{ textAlign: 'right', color: inv.discount > 0 ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                                            {inv.discount > 0 ? `-${money(inv.discount)}` : '-'}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                                            {money(inv.finalAmount)}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`pms-badge ${inv.status === 1 ? 'pms-badge-success' : (inv.status === 2 ? 'pms-badge-danger' : (inv.status === 3 ? 'pms-badge-warning' : 'pms-badge-neutral'))}`}>
                                                {inv.status === 1 ? 'Đã thanh toán' : (inv.status === 2 ? 'Đã hủy' : (inv.status === 3 ? 'Trả một phần' : (inv.status === 4 ? 'Đã hoàn trả' : 'Đang xử lý')))}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                {/* Nút Xem Chi Tiết */}
                                                <button
                                                    type="button"
                                                    className="btn-pms btn-pms-secondary"
                                                    style={{ padding: '4px 8px', fontSize: 11.5, height: 28 }}
                                                    onClick={() => handleOpenDetail(inv)}
                                                    title="Xem chi tiết hóa đơn"
                                                >
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                    Chi tiết
                                                </button>

                                                {/* Nút Trả Hàng */}
                                                <button
                                                    type="button"
                                                    className="btn-pms"
                                                    style={{
                                                        padding: '4px 8px', fontSize: 11.5, height: 28,
                                                        background: canReturn ? '#fff7ed' : '#f1f5f9',
                                                        color: canReturn ? '#c2410c' : '#94a3b8',
                                                        border: `1px solid ${canReturn ? '#fed7aa' : '#e2e8f0'}`,
                                                        cursor: canReturn ? 'pointer' : 'not-allowed'
                                                    }}
                                                    onClick={() => canReturn && handleOpenReturn(inv)}
                                                    disabled={!canReturn}
                                                    title={canReturn ? 'Tiến hành đổi trả thuốc / hoàn tiền' : 'Hóa đơn không thể trả'}
                                                >
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="1 4 1 10 7 10" />
                                                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                                    </svg>
                                                    Trả hàng
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Pagination */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                <Pagination total={total} page={page} size={size} onPage={onPage} />
            </div>

            {/* Modal Chi tiết Hóa đơn */}
            <InvoiceDetailModal
                isOpen={Boolean(selectedInvoiceForDetail)}
                onClose={() => setSelectedInvoiceForDetail(null)}
                invoiceCodeOrId={selectedInvoiceForDetail}
                onReturnInvoice={(inv) => {
                    setSelectedInvoiceForDetail(null);
                    setSelectedInvoiceForReturn(inv);
                }}
            />

            {/* Modal Đổi Trả Thuốc (UC25) */}
            <SalesReturnModal
                isOpen={Boolean(selectedInvoiceForReturn)}
                onClose={() => setSelectedInvoiceForReturn(null)}
                invoiceData={selectedInvoiceForReturn}
                onReturnSuccess={() => {
                    setSelectedInvoiceForReturn(null);
                    if (onRefresh) onRefresh();
                }}
            />
        </div>
    );
}
