import { money, formatDateTime, formatPaymentMethod } from '../../utils/format';

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

export default function DailySalesInvoicesTable({ invoices, loading, total, page, size, onPage }) {

    return (
        <div className="pms-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                        Hóa Đơn Bán Lẻ Trong Ngày
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        Toàn bộ giao dịch bán lẻ phát sinh trong ngày làm việc của nhà thuốc
                    </div>
                </div>
                <span className="pms-badge pms-badge-neutral">{total} hóa đơn</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="pms-table">
                    <thead>
                        <tr>
                            <th>Mã Hóa Đơn</th>
                            <th>Mã Đơn Thuốc</th>
                            <th>Thời Gian</th>
                            <th>Hình Thức TT</th>
                            <th style={{ textAlign: 'right' }}>Tiền Hàng</th>
                            <th style={{ textAlign: 'right' }}>Giảm Giá</th>
                            <th style={{ textAlign: 'right' }}>Khách Phải Trả</th>
                            <th style={{ textAlign: 'center' }}>Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                                    Đang tải danh sách hóa đơn...
                                </td>
                            </tr>
                        ) : !invoices || invoices.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                                    Không có hóa đơn bán lẻ nào phát sinh trong ngày đã chọn
                                </td>
                            </tr>
                        ) : (
                            invoices.map((inv) => (
                                <tr key={inv.id}>
                                    <td>
                                        <span style={{ fontWeight: 700, color: 'var(--brand-primary-dark)' }}>{inv.code}</span>
                                    </td>
                                    <td>
                                        {inv.prescriptionCode ? (
                                            <span className="pms-badge pms-badge-neutral" style={{ fontSize: 11 }}>{inv.prescriptionCode}</span>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)' }}>-</span>
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
                                                    : (formatPaymentMethod(inv.paymentMethod) === 'Ví VietQR' || formatPaymentMethod(inv.paymentMethod) === 'VietQR / MoMo')
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
                                        <span className={`pms-badge ${inv.status === 1 ? 'pms-badge-success' : (inv.status === 2 ? 'pms-badge-danger' : 'pms-badge-warning')}`}>
                                            {inv.status === 1 ? 'Đã thanh toán' : (inv.status === 2 ? 'Đã hủy' : (inv.status === 3 ? 'Trả một phần' : (inv.status === 4 ? 'Đã hoàn trả' : 'Đang xử lý')))}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                <Pagination total={total} page={page} size={size} onPage={onPage} />
            </div>
        </div>
    );
}
