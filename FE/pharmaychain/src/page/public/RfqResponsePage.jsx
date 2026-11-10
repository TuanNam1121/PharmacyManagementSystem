import { useSearchParams } from 'react-router-dom';
import { useRfqResponse } from '../../hooks/rfq/useRfq';

export default function RfqResponsePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const {
    rfqData,
    items,
    loading,
    submitting,
    error,
    success,
    handlePriceChange,
    handleNoteChange,
    handleSubmit,
    formatDate,
  } = useRfqResponse(token);

  if (loading) {
    return (
      <div className="rfq-portal rfq-portal-center">
        <div className="pms-spinner-wrap">
          <div className="pms-spinner" />
          <span className="pms-spinner-text">Đang tải thông tin yêu cầu báo giá...</span>
        </div>
      </div>
    );
  }

  if (error && !rfqData) {
    return (
      <div className="rfq-portal rfq-portal-center">
        <div className="pms-card" style={{ maxWidth: 500, width: '100%' }}>
          <div className="pms-card-body">
            <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <strong>Không thể tải yêu cầu báo giá</strong>
                <div style={{ marginTop: 8 }}>{error}</div>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
              Vui lòng liên hệ bộ phận mua hàng PharmaChain để nhận liên kết hợp lệ.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rfq-portal rfq-portal-center">
        <div className="pms-card" style={{ maxWidth: 500, width: '100%', textAlign: 'center' }}>
          <div className="pms-card-body">
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--brand-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ marginBottom: 8 }}>Gửi Báo Giá Thành Công!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Cảm ơn quý nhà cung ứng đã gửi báo giá. Bộ phận thu mua PharmaChain sẽ đối chiếu và liên hệ sớm nhất.
            </p>
            <div className="pms-form-hint">
              Mã yêu cầu RFQ: <strong>{rfqData?.rfqCode}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rfq-portal">
      <div className="rfq-portal-inner">
        <div className="pms-card">
          {/* Header */}
          <div className="pms-card-header rfq-portal-header">
            <div className="rfq-portal-heading">
              <div className="rfq-portal-brand">
                <span className="rfq-portal-brand-mark">Rx</span>
                <span className="rfq-portal-brand-name">PharmaChain</span>
                <span className="pms-badge pms-badge-info">Cổng báo giá nhà cung cấp</span>
              </div>
              <h1 className="rfq-portal-title">
                {rfqData?.subject || 'Yêu Cầu Báo Giá Cung Ứng Dược Phẩm'}
              </h1>
              <div className="rfq-portal-meta">
                <div className="rfq-portal-meta-item">
                  <span className="rfq-portal-meta-label">Mã RFQ</span>
                  <span className="rfq-portal-meta-value">{rfqData?.rfqCode || '—'}</span>
                </div>
                <div className="rfq-portal-meta-item">
                  <span className="rfq-portal-meta-label">Đề xuất mua hàng</span>
                  <span className="rfq-portal-meta-value">{rfqData?.purchaseProposalCode || '—'}</span>
                </div>
                <div className="rfq-portal-meta-item">
                  <span className="rfq-portal-meta-label">Hạn chót báo giá</span>
                  <span className="rfq-portal-meta-value rfq-portal-deadline">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <polyline points="12 7 12 12 15 14" />
                    </svg>
                    {formatDate(rfqData?.expiredAt) || '—'}
                  </span>
                </div>
              </div>
            </div>
            <div className="rfq-portal-supplier">
              <div className="rfq-portal-supplier-name">{rfqData?.supplierName || 'Nhà cung cấp'}</div>
              {rfqData?.supplierCode && (
                <div className="rfq-portal-supplier-sub">Mã NCC: {rfqData.supplierCode}</div>
              )}
              {rfqData?.contactPerson && (
                <div className="rfq-portal-supplier-sub">Người liên hệ: {rfqData.contactPerson}</div>
              )}
              {rfqData?.supplierEmail && (
                <div className="rfq-portal-supplier-sub">{rfqData.supplierEmail}</div>
              )}
            </div>
          </div>

          {/* Letter body */}
          {rfqData?.content && (
            <div className="pms-card-body" style={{ paddingBottom: 0 }}>
              <div className="rfq-portal-letter">{rfqData.content}</div>
            </div>
          )}

          {/* Inline error */}
          {error && (
            <div className="pms-card-body" style={{ paddingBottom: 0 }}>
              <div className="pms-alert pms-alert-danger" style={{ marginBottom: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Items Table */}
          <form onSubmit={handleSubmit}>
            <div className="pms-card-body" style={{ padding: 0, marginTop: 20 }}>
              <div className="pms-table-wrap">
                <table className="pms-table rfq-portal-table">
                  <thead>
                    <tr>
                      <th>Tên Thuốc / Dược Phẩm</th>
                      <th>Mã Thuốc</th>
                      <th>Đơn Vị</th>
                      <th style={{ textAlign: 'right' }}>Số Lượng Yêu Cầu</th>
                      <th style={{ width: 190, textAlign: 'right' }}>Đơn Giá /đơn vị (₫) *</th>
                      <th style={{ width: 240 }}>Ghi Chú NCC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item.productName}</div>
                          {item.note && (
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                              {item.note}
                            </div>
                          )}
                        </td>
                        <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{item.productCode}</td>
                        <td>{item.unit}</td>
                        <td style={{ textAlign: 'right' }}>{item.requestedQuantity}</td>
                        <td>
                          <div className="rfq-portal-price">
                            <input
                              type="text"
                              inputMode="decimal"
                              className="pms-form-input rfq-portal-price-input"
                              value={item.unitPrice}
                              onChange={(e) => handlePriceChange(index, e.target.value)}
                              placeholder="0"
                              aria-label={`Đơn giá báo cho ${item.productName}`}
                              required
                            />
                            <span className="rfq-portal-price-suffix">₫</span>
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="pms-form-input"
                            value={item.supplierNote}
                            onChange={(e) => handleNoteChange(index, e.target.value)}
                            placeholder="Ghi chú thêm nếu có..."
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="rfq-portal-footer">
              <div className="pms-form-hint rfq-portal-hint">
                * Vui lòng nhập đơn giá báo theo VND cho từng mặt hàng dược phẩm.
              </div>
              <div className="rfq-portal-actions">
                <button
                  type="submit"
                  className="btn-pms btn-pms-primary rfq-portal-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div
                        className="pms-spinner"
                        style={{ width: 14, height: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.45)', borderTopColor: '#fff' }}
                      />
                      Đang gửi báo giá...
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Xác Nhận Gửi Báo Giá
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

