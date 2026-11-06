import { formatDate } from "../../utils/format";

export default function RfqTable({
  data,
  loading,
  selectedRfqs = [],
  onViewDetail,
  onToggleSelect,
}) {
  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase().trim();
    if (s === 'SENT' || s === '0' || s === 'ĐÃ GỬI') {
      return <span className="pms-badge pms-badge-info">Đã gửi</span>;
    }
    if (s === 'RESPONDED' || s === '1' || s === 'ĐÃ NHẬN BÁO GIÁ' || s === 'ĐÃ PHẢN HỒI') {
      return <span className="pms-badge pms-badge-success">Đã phản hồi</span>;
    }
    if (s === 'EXPIRED' || s === '2' || s === 'HẾT HẠN') {
      return <span className="pms-badge pms-badge-warning">Đã hết hạn</span>;
    }
    if (s === 'CANCELLED' || s === '3' || s === 'ĐÃ HỦY') {
      return <span className="pms-badge pms-badge-neutral">Đã hủy</span>;
    }
    return <span className="pms-badge pms-badge-neutral">Chờ phản hồi</span>;
  };

  const columns = [
    { key: "id", label: "#", width: 50 },
    { key: "code", label: "Mã RFQ", width: 120 },
    { key: "supplier", label: "Nhà Cung Cấp", width: 180 },
    { key: "purchaseProposal", label: "Đề Xuất Mua Hàng", width: 140 },
    { key: "status", label: "Trạng Thái", width: 100 },
    { key: "sentAt", label: "Ngày Gửi", width: 100 },
    { key: "deadline", label: "Hạn Chót", width: 100 },
    { key: "actions", label: "Thao Tác", width: 120, align: "center" },
  ];

  if (loading) {
    return (
      <div className="pms-table-container">
        <table className="pms-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width, textAlign: col.align || 'left' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: "center", padding: 48 }}
              >
                <div className="pms-loading">
                  <div className="pms-loading-spinner"></div>
                  <div>Đang tải danh sách yêu cầu báo giá...</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="pms-table-container">
        <table className="pms-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width, textAlign: col.align || 'left' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: "center", padding: 48 }}
              >
                <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
                  Không tìm thấy yêu cầu báo giá nào phù hợp bộ lọc.
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="pms-table-container">
      <table className="pms-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((rfq) => (
            <tr
              key={rfq.id}
              className={
                selectedRfqs.includes(rfq.id) ? "pms-row-selected" : ""
              }
            >
              {/* Row ID */}
              <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                {rfq.id}
              </td>
              {/* RFQ Code */}
              <td>
                <div className="pms-table-cell-primary">{rfq.code}</div>
              </td>
              {/* Supplier */}
              <td>
                <div className="pms-table-cell-primary">
                  {rfq.supplierName || rfq.supplier?.name || "-"}
                </div>
                <div className="pms-table-cell-secondary">
                  {rfq.supplierCode || rfq.supplier?.code || ""}
                </div>
              </td>
              {/* Purchase Proposal */}
              <td>
                <div className="pms-table-cell-primary">
                  {rfq.purchaseProposalCode || "-"}
                </div>
                <div className="pms-table-cell-secondary"></div>
              </td>
              {/* Status */}
              <td>{getStatusBadge(rfq.status)}</td>
              {/* Sent Date */}
              <td>
                <div>{formatDate(rfq.sentAt)}</div>
              </td>
              {/* Deadline (expiredAt) */}
              <td>
                <div>{formatDate(rfq.expiredAt)}</div>
                {rfq.status === "SENT" && rfq.expiredAt && rfq.expiredAt !== 'Invalid Date' && (
                  <div
                    className="pms-table-cell-secondary"
                    style={{ fontSize: 11 }}
                  >
                    {(() => {
                      let d = new Date(rfq.expiredAt);
                      if (isNaN(d.getTime()) && typeof rfq.expiredAt === 'string') {
                        const parts = rfq.expiredAt.split(/[/\s:]/);
                        if (parts.length >= 3) {
                          d = new Date(parts[2], parts[1] - 1, parts[0]);
                        }
                      }
                      if (isNaN(d.getTime())) return null;
                      return d < new Date() ? "Quá hạn" : "Còn hiệu lực";
                    })()}
                  </div>
                )}
              </td>
              {/* Actions */}
              <td style={{ textAlign: "center" }}>
                <div
                  className="pms-table-actions"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {/* Compare selection */}
                  <input
                    type="checkbox"
                    checked={selectedRfqs.includes(rfq.id)}
                    onChange={() =>
                      onToggleSelect(rfq.id, rfq.purchaseProposalId)
                    }
                    disabled={rfq.status !== "RESPONDED"}
                    title={
                      rfq.status !== "RESPONDED"
                        ? "Chỉ các RFQ có trạng thái ĐÃ PHẢN HỒI mới có thể so sánh báo giá"
                        : "Chọn để so sánh báo giá"
                    }
                    aria-label="Chọn so sánh báo giá"
                  />
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
