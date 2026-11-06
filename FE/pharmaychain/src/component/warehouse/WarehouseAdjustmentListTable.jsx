import { useState } from 'react';
import { formatDate, money } from '../../utils/format';

const formatAdjustmentType = (type, label) => {
  if (type === 1 || label === 'Count Variance') return 'Chênh lệch kiểm kê';
  if (type === 2 || label === 'Damage / Spoilage' || label === 'Damaged / Broken') return 'Hư hỏng / Hao hụt';
  if (type === 3 || label === 'Breakage') return 'Vỡ nứt';
  if (type === 4 || label === 'Expired Write-Off' || label === 'Expired — Disposal') return 'Hết hạn — Tiêu hủy';
  if (label === 'Cycle Count') return 'Kiểm kê định kỳ';
  if (label === 'Other Discrepancy' || label === 'Other') return 'Khác';
  return label || 'Kiểm kê định kỳ';
};

const formatAdjustmentStatus = (isApproved, isRejected, label) => {
  if (isApproved || label === 'Approved' || label === 'Đã duyệt') return 'Đã duyệt';
  if (isRejected || label === 'Rejected' || label === 'Đã từ chối') return 'Đã từ chối';
  return 'Chờ phê duyệt';
};

export default function WarehouseAdjustmentListTable({ data, loading, onApprove, onReject, actionLoading }) {
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const confirmReject = (id) => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối phiếu điều chỉnh');
      return;
    }
    if (onReject) {
      onReject(id, rejectReason.trim());
    }
    setRejectingId(null);
    setRejectReason('');
  };

  if (loading) {
    return (
      <div className="pms-card">
        <div className="pms-spinner-wrap">
          <div className="pms-spinner" />
          <span className="pms-spinner-text">Đang tải danh sách điều chỉnh tồn kho…</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="pms-card">
        <div className="pms-empty">
          <div className="pms-empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
            </svg>
          </div>
          <div className="pms-empty-title">Không tìm thấy phiếu điều chỉnh tồn kho</div>
          <div className="pms-empty-sub">Chưa có phiếu điều chỉnh tồn kho nào được tạo trên hệ thống.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pms-card">
      <div className="pms-table-wrap">
        <table className="pms-table">
          <thead>
            <tr>
              <th style={{ width: 40, textAlign: 'center' }}>#</th>
              <th>Thuốc / Sản Phẩm</th>
              <th>Số Lô</th>
              <th>Loại Điều Chỉnh</th>
              <th className="text-right">Tồn Trước</th>
              <th className="text-right">Tồn Sau</th>
              <th className="text-right">Chênh Lệch</th>
              <th className="text-right">Giá Trị Ảnh Hưởng</th>
              <th>Lý Do</th>
              <th>Người Lập</th>
              <th>Trạng Thái</th>
              <th style={{ width: 140, textAlign: 'center' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const diff = row.difference || 0;
              const diffColor = diff < 0 ? 'var(--color-danger)' : diff > 0 ? 'var(--color-success)' : 'var(--text-muted)';
              const isPending = row.status === 0 || row.status === 'PENDING' || row.statusLabel === 'Pending Approval' || row.statusLabel === 'Pending Review' || row.statusLabel === 'Chờ phê duyệt' || row.statusLabel === 'Chờ xét duyệt';
              const isApproved = row.status === 1 || row.status === 'APPROVED' || row.statusLabel === 'Approved' || row.statusLabel === 'Đã duyệt';
              const isRejected = row.status === 2 || row.status === 'REJECTED' || row.statusLabel === 'Rejected' || row.statusLabel === 'Đã từ chối';

              return (
                <tr key={row.id || i}>
                  <td className="text-xs text-muted-color" style={{ textAlign: 'center' }}>{i + 1}</td>
                  <td>
                    <div className="fw-600" style={{ fontSize: 13 }}>{row.productName}</div>
                    <div className="text-xs text-muted-color mono">{row.productCode || '—'}</div>
                  </td>
                  <td>
                    <span className="pms-badge pms-badge-neutral mono">{row.batchNumber}</span>
                  </td>
                  <td>
                    <span className="pms-badge pms-badge-neutral" style={{ fontSize: 11 }}>
                      {formatAdjustmentType(row.type, row.typeLabel)}
                    </span>
                  </td>
                  <td className="text-right text-muted-color">{row.quantityBefore}</td>
                  <td className="text-right fw-600">{row.quantityAfter}</td>
                  <td className="text-right">
                    <span style={{ fontWeight: 700, color: diffColor }}>
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  </td>
                  <td className="text-right text-sm fw-500 text-secondary-color">
                    {money(row.valueImpact)}
                  </td>
                  <td style={{ maxWidth: 200 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.reason}>
                      {row.reason || '—'}
                    </div>
                  </td>
                  <td className="text-sm text-muted-color">{row.createdByName || '—'}</td>
                  <td>
                    <span className={`pms-badge ${isApproved ? 'pms-badge-success' : isRejected ? 'pms-badge-danger' : 'pms-badge-warning'}`}>
                      {formatAdjustmentStatus(isApproved, isRejected, row.statusLabel)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {isPending ? (
                      rejectingId === row.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
                          <input
                            type="text"
                            className="pms-input"
                            style={{ fontSize: 11, padding: '3px 6px' }}
                            placeholder="Nhập lý do từ chối..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            autoFocus
                          />
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                            <button
                              className="btn-pms btn-pms-sm btn-pms-danger"
                              style={{ fontSize: 11, padding: '2px 6px' }}
                              onClick={() => confirmReject(row.id)}
                              disabled={actionLoading}
                            >
                              Xác nhận
                            </button>
                            <button
                              className="btn-pms btn-pms-sm btn-pms-secondary"
                              style={{ fontSize: 11, padding: '2px 6px' }}
                              onClick={() => { setRejectingId(null); setRejectReason(''); }}
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'center' }}>
                          <button
                            className="btn-pms btn-pms-sm btn-pms-primary"
                            title="Duyệt điều chỉnh và cập nhật tồn kho"
                            onClick={() => onApprove && onApprove(row.id)}
                            disabled={actionLoading}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--color-success)', borderColor: 'var(--color-success)', fontSize: 12 }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Duyệt
                          </button>
                          <button
                            className="btn-pms btn-pms-sm btn-pms-secondary"
                            title="Từ chối điều chỉnh tồn kho"
                            onClick={() => { setRejectingId(row.id); setRejectReason(''); }}
                            disabled={actionLoading}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-danger)', fontSize: 12 }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            Từ chối
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="text-xs text-muted-color">
                        {row.approvedByName ? `Bởi ${row.approvedByName}` : '—'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
