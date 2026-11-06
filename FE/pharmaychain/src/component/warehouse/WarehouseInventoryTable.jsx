import { formatDate, getInitials, money } from '../../utils/format';

const AVATAR_COLORS = ['teal', 'blue', 'violet', 'amber', 'rose'];

function ExpiryBadge({ status, daysToExpiry }) {
  if (status === 'EXPIRED') {
    return (
      <span className="pms-badge pms-badge-danger">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        Hết hạn
      </span>
    );
  }
  if (status === 'EXPIRING_SOON') {
    return (
      <span className="pms-badge pms-badge-warning">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        Còn {daysToExpiry} ngày
      </span>
    );
  }
  return (
    <span className="pms-badge pms-badge-success">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Đạt chuẩn
    </span>
  );
}

export default function WarehouseInventoryTable({ data, loading, onAssignLocation, onAdjustStock }) {
  if (loading) {
    return (
      <div className="pms-card">
        <div className="pms-spinner-wrap">
          <div className="pms-spinner" />
          <span className="pms-spinner-text">Đang tải dữ liệu tồn kho…</span>
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
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
            </svg>
          </div>
          <div className="pms-empty-title">Không tìm thấy dữ liệu tồn kho</div>
          <div className="pms-empty-sub">Vui lòng thử điều chỉnh lại từ khóa hoặc bộ lọc tìm kiếm.</div>
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
              <th style={{ width: 40 }}>#</th>
              <th>Tên Thuốc / Sản Phẩm</th>
              <th>Hoạt Chất / ĐVT</th>
              <th>Số Lô (Batch)</th>
              <th>Hạn Dùng</th>
              <th>Vị Trí Ô Kệ</th>
              <th className="text-right">SL Tồn</th>
              <th className="text-right">Giá Trị Tồn</th>
              <th style={{ width: 140, textAlign: 'center' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <tr key={row.id || i}>
                  <td className="text-xs text-muted-color">{i + 1}</td>

                  {/* Product info */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className={`pms-avatar pms-avatar-${color}`}>
                        {getInitials(row.productName || row.productCode)}
                      </div>
                      <div>
                        <div className="fw-600" style={{ fontSize: 13 }}>{row.productName || 'Unnamed'}</div>
                        <div className="text-xs text-muted-color mono">{row.productCode || '—'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Active ingredient */}
                  <td>
                    <div style={{ fontSize: 13 }}>{row.activeIngredient || '—'}</div>
                    <span className="pms-badge pms-badge-neutral" style={{ marginTop: 2 }}>
                      {row.unit || 'Unit'}
                    </span>
                  </td>

                  {/* Batch */}
                  <td>
                    <span className="pms-badge pms-badge-neutral mono">{row.batchNumber || 'N/A'}</span>
                  </td>

                  {/* Expiry */}
                  <td>
                    <div className="fw-500" style={{ fontSize: 13 }}>{formatDate(row.expiryDate)}</div>
                    <div style={{ marginTop: 4 }}>
                      <ExpiryBadge status={row.expiryStatus} daysToExpiry={row.daysToExpiry} />
                    </div>
                  </td>

                  {/* Bin location */}
                  <td>
                    {row.locationId ? (
                      <div>
                        <span className="pms-badge pms-badge-info">{row.locationCode}</span>
                        <div className="text-xs text-muted-color" style={{ marginTop: 3 }}>
                          Dãy {row.aisle || '—'} · Kệ {row.shelf || '—'} · Hộc {row.bin || '—'}
                        </div>
                      </div>
                    ) : (
                      <span className="pms-badge pms-badge-neutral" style={{ opacity: 0.7 }}>
                        Chưa gán vị trí
                      </span>
                    )}
                  </td>

                  {/* Qty */}
                  <td className="text-right">
                    <span className="fw-700" style={{ fontSize: 15 }}>
                      {(row.quantity || 0).toLocaleString('vi-VN')}
                    </span>
                  </td>

                  {/* Value */}
                  <td className="text-right text-sm fw-500 text-secondary-color">
                    {money(row.totalValue)}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: 4, justifyContent: 'center' }}>
                      <button
                        className="btn-pms btn-pms-sm btn-pms-secondary"
                        title="Gán vị trí ô kệ cho lô thuốc"
                        onClick={() => onAssignLocation(row)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        Vị trí
                      </button>
                      <button
                        className="btn-pms btn-pms-sm btn-pms-secondary"
                        title="Tạo phiếu điều chỉnh tồn kho"
                        onClick={() => onAdjustStock(row)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
                          <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
                          <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
                          <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
                          <line x1="17" y1="16" x2="23" y2="16"/>
                        </svg>
                        Điều chỉnh
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
