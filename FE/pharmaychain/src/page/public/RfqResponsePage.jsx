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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pms-spinner-wrap">
          <div className="pms-spinner" />
          <span className="pms-spinner-text">Đang tải thông tin yêu cầu báo giá...</span>
        </div>
      </div>
    );
  }

  if (error && !rfqData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pms-card" style={{ maxWidth: 500 }}>
          <div className="pms-alert pms-alert-danger">
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
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Vui lòng liên hệ bộ phận mua hàng PharmaChain để nhận liên kết hợp lệ.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pms-card" style={{ maxWidth: 500, textAlign: 'center' }}>
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
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', padding: 24 }}>
      <div className="pms-card" style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ marginBottom: 8 }}>{rfqData?.subject || 'Yêu Cầu Báo Giá Cung Ứng Dược Phẩm'}</h1>
              <div style={{ color: 'var(--text-secondary)' }}>
                Mã RFQ: <strong>{rfqData?.rfqCode}</strong> • 
                Đề xuất mua: <strong>{rfqData?.purchaseProposalCode}</strong> • 
                Hạn chót báo giá: <strong>{formatDate(rfqData?.expiredAt)}</strong>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>{rfqData?.supplierName}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {rfqData?.contactPerson && <div>Người liên hệ: {rfqData.contactPerson}</div>}
              </div>
            </div>
          </div>
          
          {rfqData?.content && (
            <div style={{ marginTop: 16, padding: 16, backgroundColor: 'var(--bg-tertiary)', borderRadius: 8 }}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{rfqData.content}</div>
            </div>
          )}
        </div>

        {error && (
          <div className="pms-alert pms-alert-danger" style={{ marginBottom: 20 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Items Table */}
        <form onSubmit={handleSubmit}>
          <div className="pms-table-wrap">
            <table className="pms-table">
              <thead>
                <tr>
                  <th>Tên Thuốc / Dược Phẩm</th>
                  <th>Mã Thuốc</th>
                  <th>Đơn Vị</th>
                  <th style={{ textAlign: 'center' }}>Số Lượng Yêu Cầu</th>
                  <th style={{ width: 170 }}>Đơn Giá Báo (₫) *</th>
                  <th>Ghi Chú NCC</th>
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
                    <td style={{ fontFamily: 'monospace' }}>{item.productCode}</td>
                    <td>{item.unit}</td>
                    <td style={{ textAlign: 'center' }}>{item.requestedQuantity}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 6, fontSize: 12, color: 'var(--text-muted)' }}>₫</span>
                        <input
                          type="text"
                          className="pms-form-input"
                          value={item.unitPrice}
                          onChange={(e) => handlePriceChange(index, e.target.value)}
                          style={{ textAlign: 'right' }}
                          placeholder="0"
                          required
                        />
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

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
            <div className="pms-form-hint" style={{ marginBottom: 16 }}>
              * Vui lòng nhập đơn giá báo theo VND cho từng mặt hàng dược phẩm.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="submit"
                className="btn-pms btn-pms-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="pms-spinner" style={{ width: 14, height: 14, marginRight: 8 }} />
                    Đang gửi báo giá...
                  </>
                ) : 'Xác Nhận Gửi Báo Giá'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}