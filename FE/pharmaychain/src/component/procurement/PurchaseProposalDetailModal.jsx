import { formatDate } from '../../utils/format';

export default function PurchaseProposalDetailModal({ show, onHide, detail, loading }) {
  if (!show) return null;

  const renderStatusBadge = (status) => {
    const s = Number(status);
    if (s === 1) return <span className="pms-badge pms-badge-success">Sẵn sàng tạo RFQ</span>;
    if (s === 2) return <span className="pms-badge pms-badge-danger">Đã hủy</span>;
    if (s === 3) return <span className="pms-badge pms-badge-neutral">Hoàn tất</span>;
    return <span className="pms-badge pms-badge-info">Đã lập đề xuất</span>;
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-lg" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="pms-modal-header" style={{ flexShrink: 0 }}>
          <div>
            <div className="pms-modal-title">
              Chi Tiết Đề Xuất Mua Hàng {detail?.code ? `— ${detail.code}` : ''}
            </div>
            <div className="pms-modal-sub">Tổng hợp các yêu cầu mua hàng từ bộ phận kho để chào giá RFQ</div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="pms-modal-body" style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
          {loading ? (
            <div className="pms-spinner-wrap">
              <div className="pms-spinner" />
              <span className="pms-spinner-text">Đang tải chi tiết đề xuất mua hàng…</span>
            </div>
          ) : detail ? (
            <div>
              {/* Summary cards */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
                background: 'var(--bg-canvas)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)', padding: '16px 20px', marginBottom: 20,
              }}>
                <div className="pms-detail-row">
                  <div className="pms-detail-label">Mã Đề Xuất</div>
                  <div className="pms-detail-value mono fw-700">{detail.code}</div>
                </div>
                <div className="pms-detail-row">
                  <div className="pms-detail-label">Trạng Thái</div>
                  <div style={{ marginTop: 2 }}>
                    {renderStatusBadge(detail.status)}
                  </div>
                </div>
                <div className="pms-detail-row">
                  <div className="pms-detail-label">Ngày Lập</div>
                  <div className="pms-detail-value">{formatDate(detail.createdAt)}</div>
                </div>
              </div>

              {/* Aggregated Purchase Requests */}
              <div style={{
                padding: '12px 16px', background: 'var(--bg-card)',
                borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)',
                marginBottom: 20, fontSize: 13,
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Yêu Cầu Mua Hàng Liên Kết: </strong>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {detail.purchaseRequests && detail.purchaseRequests.length > 0
                    ? detail.purchaseRequests.map((r) => r.code).join(', ')
                    : '—'}
                </span>
              </div>

              {/* Consolidated items */}
              {detail.items && detail.items.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                    Danh Sách Thuốc & Sản Phẩm Tổng Hợp ({detail.items.length})
                  </div>
                  <div className="pms-table-wrap">
                    <table className="pms-table" style={{ fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th>Tên Thuốc / Sản Phẩm</th>
                          <th>Mã Thuốc</th>
                          <th>Đơn Vị Tính</th>
                          <th style={{ textAlign: 'right' }}>Số Lượng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.items.map((item) => (
                          <tr key={item.productId}>
                            <td>{item.productName}</td>
                            <td className="mono">{item.productCode}</td>
                            <td>{item.unit}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }}>{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Reject reason if any */}
              {detail.rejectReason && (
                <div style={{
                  padding: '12px 16px', background: '#fdf3f3',
                  borderRadius: 'var(--border-radius-md)', border: '1px solid #ffe5e5',
                  marginBottom: 20, fontSize: 13,
                }}>
                  <strong style={{ color: 'var(--color-danger)' }}>Lý Do Từ Chối: </strong>
                  <span style={{ color: 'var(--text-secondary)' }}>{detail.rejectReason}</span>
                </div>
              )}

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)',
              }}>
                <div>
                  <strong>Người Lập: </strong>{detail.createdByUsername || '—'}
                </div>
                <div>
                  <strong>Ngày Lập: </strong>{formatDate(detail.createdAt)}
                </div>
              </div>
            </div>
          ) : (
            <div className="pms-empty">
              <div className="pms-empty-title">Không có dữ liệu đề xuất</div>
            </div>
          )}
        </div>

        <div className="pms-modal-footer" style={{ padding: '16px 24px', flexShrink: 0, borderTop: '1px solid #e2e8f0', background: '#fff' }}>
          <button className="btn-pms btn-pms-secondary" onClick={onHide}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
