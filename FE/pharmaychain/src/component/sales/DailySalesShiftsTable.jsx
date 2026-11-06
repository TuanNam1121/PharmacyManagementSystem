import { money, formatDate } from '../../utils/format';

export default function DailySalesShiftsTable({ shifts, loading }) {
    const formatTime = (iso) => {
        if (!iso) return '-';
        try {
            const d = new Date(iso);
            return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + formatDate(iso);
        } catch {
            return iso;
        }
    };

    return (
        <div className="pms-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                        Chi Tiết Các Ca Làm Việc Thu Ngân
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        Theo dõi tiền đầu ca, doanh số tiền mặt thực tế và chênh lệch két theo từng ca trực
                    </div>
                </div>
                <span className="pms-badge pms-badge-neutral">{shifts?.length || 0} ca trực</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="pms-table">
                    <thead>
                        <tr>
                            <th>Mã Ca</th>
                            <th>Dược sĩ / Thu ngân</th>
                            <th>Giờ Mở Ca</th>
                            <th>Giờ Chốt Ca</th>
                            <th style={{ textAlign: 'right' }}>Tiền Đầu Ca</th>
                            <th style={{ textAlign: 'right' }}>Dự Kiến Két</th>
                            <th style={{ textAlign: 'right' }}>Thực Kiểm Két</th>
                            <th style={{ textAlign: 'right' }}>Chênh Lệch</th>
                            <th style={{ textAlign: 'center' }}>Trạng Thái</th>
                            <th>Ghi Chú Ca</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                                    Đang tải dữ liệu ca làm việc...
                                </td>
                            </tr>
                        ) : !shifts || shifts.length === 0 ? (
                            <tr>
                                <td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                                    Không có ca làm việc nào được ghi nhận trong ngày này
                                </td>
                            </tr>
                        ) : (
                            shifts.map((s) => {
                                const diff = s.difference ?? 0;
                                return (
                                    <tr key={s.id}>
                                        <td style={{ fontWeight: 700 }}>#{s.id}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.cashierUsername}</div>
                                        </td>
                                        <td style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{formatTime(s.openedAt)}</td>
                                        <td style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{formatTime(s.closedAt)}</td>
                                        <td style={{ textAlign: 'right' }}>{money(s.openingCash)}</td>
                                        <td style={{ textAlign: 'right' }}>{money(s.expectedCash)}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{money(s.closingCash)}</td>
                                        <td style={{
                                            textAlign: 'right',
                                            fontWeight: 700,
                                            color: diff === 0 ? 'var(--color-success)' : diff > 0 ? 'var(--color-info)' : 'var(--color-danger)'
                                        }}>
                                            {diff === 0 ? '0 ₫' : (diff > 0 ? `+${money(diff)}` : money(diff))}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`pms-badge ${s.status === 2 ? 'pms-badge-neutral' : (s.status === 3 ? 'pms-badge-success' : 'pms-badge-warning')}`}>
                                                {s.status === 2 ? 'Đã chốt ca' : (s.status === 3 ? 'Đã đối soát' : 'Đang mở')}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 180 }}>
                                            {s.note || '-'}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
