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

export default function WarehousePurchaseHistoryTable({ data, loading, onViewDetail, onConfirm, confirmLoading }) {
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
              <th>Hình Thức Giao Hàng</th>
              <th className="text-right">Tổng Giá Trị</th>
              <th>Trạng Thái</th>
              <th>Ngày Tạo</th>
              <th>Ngày Xác Nhận</th>
              <th style={{ width: 120, textAlign: 'center' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const isConfirmed = row.status === 1 || row.statusLabel === 'Received / In Stock' || row.statusLabel === 'Đã nhập kho';
              return (
                <tr key={row.id || i}>
                  <td className="text-xs text-muted-color" style={{ textAlign: 'center' }}>{i + 1}</td>
                  <td><span className="fw-600 mono" style={{ fontSize: 13 }}>{row.code}</span></td>
                  <td className="text-sm text-secondary-color">{formatDeliveryType(row.deliveryTypeLabel, row.deliveryType)}</td>
                  <td className="text-right fw-700" style={{ fontSize: 14 }}>{money(row.totalAmount)}</td>
                  <td>
                    <span className={`pms-badge ${isConfirmed ? 'pms-badge-success' : 'pms-badge-warning'}`}>
                      {formatReceiptStatus(isConfirmed, row.statusLabel)}
                    </span>
                  </td>
                  <td className="text-sm text-muted-color">{formatDate(row.createdAt)}</td>
                  <td className="text-sm text-muted-color">{formatDate(row.confirmedAt) || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                      {!isConfirmed && onConfirm && (
                        <button
                          className="btn-pms btn-pms-sm btn-pms-primary"
                          title="Xác nhận kiểm nhận và nhập tồn kho"
                          onClick={() => onConfirm(row.id)}
                          disabled={confirmLoading}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--color-success)', borderColor: 'var(--color-success)', fontSize: 12 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Xác nhận
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
