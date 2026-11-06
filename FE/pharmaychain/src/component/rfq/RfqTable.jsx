import { formatDate } from "../../utils/format";

export default function RfqTable({
  data,
  loading,
  page = 0,
  size = 10,
  onViewDetail,
  onCompare,
  onRecordQuote,
}) {
  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase().trim();
    if (s === 'SENT' || s === '0' || s === 'ĐÃ GỬI') {
      return <span className="pms-badge pms-badge-info">Đã gửi</span>;
    }
    if (s === 'RESPONDED' || s === '1' || s === 'ĐÃ NHẬN BÁO GIÁ' || s === 'ĐÃ PHẢN HỒI') {
      return <span className="pms-badge pms-badge-success">Đã phản hồi</span>;
    }
    if (s === 'EXPIRED' || s === '2' || s === 'HẾT HẠN' || s === 'ĐÃ HẾT HẠN') {
      return <span className="pms-badge pms-badge-warning">Đã hết hạn</span>;
    }
    if (s === 'CANCELLED' || s === '3' || s === 'ĐÃ HỦY') {
      return <span className="pms-badge pms-badge-danger">Đã hủy</span>;
    }
    return <span className="pms-badge pms-badge-neutral">{status || '—'}</span>;
  };

  return (
    <div className="pms-card">
      <div className="pms-card-body" style={{ padding: 0 }}>
        <div className="pms-table-wrap">
          <table className="pms-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>STT</th>
                <th>MÃ RFQ</th>
                <th>NHÀ CUNG CẤP</th>
                <th>ĐỀ XUẤT MUA HÀNG LIÊN KẾT</th>
                <th>TRẠNG THÁI</th>
                <th>NGÀY GỬI</th>
                <th>HẠN CHÓT</th>
                <th style={{ width: 120, textAlign: "center" }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}
                  >
                    Đang tải danh sách yêu cầu báo giá...
                  </td>
                </tr>
              ) : !data || data.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}
                  >
                    Không tìm thấy yêu cầu báo giá nào phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                data.map((rfq, idx) => {
                  const isResponded =
                    rfq.status === 'RESPONDED' ||
                    rfq.status === '1' ||
                    String(rfq.status).toUpperCase() === 'ĐÃ PHẢN HỒI';

                  return (
                    <tr key={rfq.id}>
                      {/* STT */}
                      <td className="text-xs text-muted-color">
                        {page * size + idx + 1}
                      </td>

                      {/* RFQ Code */}
                      <td>
                        <span className="mono fw-700" style={{ fontSize: 13 }}>
                          {rfq.code}
                        </span>
                      </td>

                      {/* Supplier */}
                      <td>
                        <div style={{ fontWeight: 500 }}>
                          {rfq.supplierName || rfq.supplier?.name || "—"}
                        </div>
                        {(rfq.supplierCode || rfq.supplier?.code) && (
                          <div className="text-xs text-muted-color">
                            {rfq.supplierCode || rfq.supplier?.code}
                          </div>
                        )}
                      </td>

                      {/* Purchase Proposal */}
                      <td>
                        <span className="mono" style={{ fontSize: 12 }}>
                          {rfq.purchaseProposalCode || "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td>{getStatusBadge(rfq.status)}</td>

                      {/* Sent Date */}
                      <td className="text-sm text-muted-color">
                        {formatDate(rfq.sentAt)}
                      </td>

                      {/* Deadline */}
                      <td className="text-sm text-muted-color">
                        {formatDate(rfq.expiredAt || rfq.deadline)}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "center" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            gap: 6,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {!isResponded && (
                            <button
                              className="pms-icon-btn edit"
                              style={{ color: "var(--brand-primary)" }}
                              onClick={() => onRecordQuote && onRecordQuote(rfq)}
                              title="Ghi nhận báo giá phản hồi từ nhà cung cấp"
                              aria-label="Ghi nhận báo giá"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                              </svg>
                            </button>
                          )}
                          {isResponded && (
                            <button
                              className="pms-icon-btn edit"
                              style={{ color: "var(--brand-primary)" }}
                              onClick={() => onCompare && onCompare(rfq)}
                              title="So sánh bảng báo giá của đề xuất này"
                              aria-label="So sánh báo giá"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M18 20V10M12 20V4M6 20v-6" />
                              </svg>
                            </button>
                          )}
                          <button
                            className="pms-icon-btn view"
                            onClick={() => onViewDetail(rfq.id)}
                            title="Xem chi tiết báo giá"
                            aria-label="Xem chi tiết"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
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
      </div>
    </div>
  );
}
