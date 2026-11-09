import { formatDate, money } from '../../utils/format';

const formatDeliveryType = (label, type) => {
  if (type === 1 || label === 'Direct Delivery') return 'Giao trực tiếp';
  if (type === 2 || label === 'Freight Transport') return 'Vận chuyển hàng hóa';
  if (!label || label === 'Standard Delivery') return 'Giao hàng tiêu chuẩn';
  return label;
};

const formatReceiptStatus = (isConfirmed, label) => {
  if (isConfirmed || label === 'Confirmed' || label === 'Received / In Stock') return 'Đã nhập kho';
  if (label === 'Pending Inspection' || label === 'Draft') return 'Chờ kiểm nhận';
  if (label === 'Cancelled') return 'Đã hủy';
  return label || 'Chờ kiểm nhận';
};

export default function WarehousePurchaseHistoryTable({
  data,
  loading,
  onViewDetail,
  onConfirm,
  confirmLoading,
  onCancel,
  cancelLoading,
}) {
  if (loading) {
    return (
      <div className="pms-card">
        <div className="pms-spinner-wrap">
          <div className="pms-spinner" />
          <span className="pms-spinner-text">Đang tải lịch sử phiếu nhập kho…</span>
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div className="pms-empty-title">Không tìm thấy phiếu nhập kho</div>
          <div className="pms-empty-sub">Chưa có phiếu nhập mua nào được ghi nhận trên hệ thống.</div>
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
              <th>Mã Phiếu Nhập</th>
              <th>Phiếu Mua Hàng</th>
              <th>Nhà Cung Cấp</th>
              <th>Hình Thức Giao</th>
              <th className="text-right">Tổng Giá Trị</th>
              <th>Trạng Thái</th>
              <th>Ngày Tạo</th>
              <th>Ngày Nhập Kho</th>
              <th style={{ width: 140, textAlign: 'center' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const isConfirmed = row.status === 1 || row.statusLabel === 'Received / In Stock' || row.statusLabel === 'Đã nhập kho';
              const isCancelled = row.status === 2 || row.statusLabel === 'Cancelled' || row.statusLabel === 'Đã hủy' || (row.statusLabel && row.statusLabel.includes('Từ chối'));
              const isPending = !isConfirmed && !isCancelled;

              return (
                <tr key={row.id || i}>
                  <td className="text-xs text-muted-color" style={{ textAlign: 'center' }}>{i + 1}</td>
                  <td>
                    <span className="fw-700 mono" style={{ fontSize: 13, color: '#0f172a' }}>{row.code}</span>
                  </td>
                  <td>
                    {row.purchaseProposalCode ? (
                      <span className="pms-badge pms-badge-info mono" style={{ fontSize: 12 }}>
                        {row.purchaseProposalCode}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-color" style={{ fontStyle: 'italic' }}>
                        Trực tiếp
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="fw-600 text-sm" style={{ color: '#334155', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.supplierName || ''}>
                      {row.supplierName || '—'}
                    </div>
                  </td>
                  <td className="text-sm text-secondary-color">{formatDeliveryType(row.deliveryTypeLabel, row.deliveryType)}</td>
                  <td className="text-right fw-700" style={{ fontSize: 14, color: 'var(--brand-primary)' }}>{money(row.totalAmount)}</td>
                  <td>
                    {isConfirmed && (
                      <span className="pms-badge pms-badge-success">Đã nhập kho</span>
                    )}
                    {isCancelled && (
                      <span className="pms-badge pms-badge-danger" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                        Từ chối / Đã hủy
                      </span>
                    )}
                    {isPending && (
                      <span className="pms-badge pms-badge-warning">Chờ kiểm nhận</span>
                    )}
                  </td>
                  <td className="text-sm text-muted-color">{formatDate(row.createdAt)}</td>
                  <td className="text-sm text-muted-color">{formatDate(row.confirmedAt) || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                      {isPending && onConfirm && (
                        <button
                          className="btn-pms btn-pms-sm btn-pms-primary"
                          title="Duyệt nhận hàng và tạo mục mới trong kho tổng"
                          onClick={() => onConfirm(row.id)}
                          disabled={confirmLoading || cancelLoading}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--color-success)', borderColor: 'var(--color-success)', fontSize: 12 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Duyệt nhận
                        </button>
                      )}
                      {isPending && onCancel && (
                        <button
                          className="btn-pms btn-pms-sm"
                          title="Từ chối nhận hàng (không tăng tồn kho)"
                          onClick={() => onCancel(row)}
                          disabled={confirmLoading || cancelLoading}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5', fontSize: 12,
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                          Từ chối
                        </button>
                      )}
                      <button
                        className="btn-pms btn-pms-sm btn-pms-secondary"
                        title="Xem chi tiết phiếu nhập"
                        onClick={() => onViewDetail(row.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        Chi tiết
                      </button>
                    </div>
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
