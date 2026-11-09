import { formatDate } from "../../utils/format";

export default function RfqTable({
  data,
  loading,
  page = 0,
  size = 10,
  onViewDetail,
  onCompare,
  onSelectSupplier,
  selectingRfqId,
}) {
  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase().trim();
    if (s === 'SENT' || s === '0' || s === 'ĐÃ GỬI') {
      return <span className="pms-badge pms-badge-info">Đã gửi</span>;
    }
    if (s === 'RESPONDED' || s === '1' || s === 'ĐÃ NHẬN BÁO GIÁ' || s === 'ĐÃ PHẢN HỒI') {
      return <span className="pms-badge pms-badge-success">Đã phản hồi</span>;
    }
    if (s === 'SELECTED' || s === '2' || s === 'ĐÃ CHỌN') {
      return <span className="pms-badge pms-badge-success">Đã chọn</span>;
    }
    if (s === 'REJECTED' || s === '3' || s === 'TỪ CHỐI') {
      return <span className="pms-badge pms-badge-danger">Từ chối</span>;
    }
    if (s === 'EXPIRED' || s === '4' || s === 'HẾT HẠN' || s === 'ĐÃ HẾT HẠN') {
      return <span className="pms-badge pms-badge-warning">Đã hết hạn</span>;
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
                <th style={{ width: 150, textAlign: "center" }}>THAO TÁC</th>
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

                  // The server decides whether a winning quotation can still be
                  // chosen (RFQ responded + supplier active + proposal still in its
                  // sourcing phase). Keeps this in sync with the business rules.
                  const canSelectSupplier = rfq.supplierSelectable === true;

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
                          {canSelectSupplier && (
                            <button
                              className="pms-icon-btn edit"
                              style={{ color: "var(--color-success)" }}
                              onClick={() => onSelectSupplier && onSelectSupplier(rfq)}
                              disabled={selectingRfqId === rfq.id}
                              title="Chọn nhà cung cấp này"
                              aria-label="Chọn nhà cung cấp"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                          )}
                          {isResponded && !canSelectSupplier && (
                            <button
                              className="pms-icon-btn"
                              style={{ color: "var(--text-muted)", cursor: "not-allowed" }}
                              disabled
                              title="Đề xuất mua hàng đã chốt nhà cung cấp — không thể chọn lại"
                              aria-label="Đề xuất đã chốt nhà cung cấp"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <polyline points="20 6 9 17 4 12" />
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
