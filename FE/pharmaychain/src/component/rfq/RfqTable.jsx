export default function RfqTable({
  data,
  loading,
  selectedRfqs = [],
  onViewDetail,
  onToggleSelect,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "SENT":
        return <span className="pms-badge pms-badge-info">Đã gửi</span>;
      case "RESPONDED":
        return <span className="pms-badge pms-badge-success">Đã phản hồi</span>;
      case "EXPIRED":
        return <span className="pms-badge pms-badge-warning">Đã hết hạn</span>;
      default:
        return <span className="pms-badge">Không xác định</span>;
    }
  };

  const columns = [
    { key: "id", label: "#", width: 50 },
    { key: "code", label: "Mã RFQ", width: 120 },
    { key: "supplier", label: "Nhà Cung Cấp", width: 180 },
    { key: "purchaseProposal", label: "Đề Xuất Mua Hàng", width: 140 },
    { key: "status", label: "Trạng Thái", width: 100 },
    { key: "sentAt", label: "Ngày Gửi", width: 100 },
    { key: "deadline", label: "Hạn Chót", width: 100 },
    { key: "actions", label: "THAO TÁC", width: 120 },
  ];

  if (loading) {
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
                <th key={col.key} style={{ width: col.width }}>
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
                {rfq.status === "SENT" && (
                  <div
                    className="pms-table-cell-secondary"
                    style={{ fontSize: 11 }}
                  >
                    {rfq.expiredAt && new Date(rfq.expiredAt) < new Date()
                      ? "Quá hạn"
                      : "Còn hiệu lực"}
                  </div>
                )}
              </td>
              {/* Actions */}
              <td>
                <div
                  className="pms-table-actions"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
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
                  />
                  <button
                    className="btn-pms btn-pms-ghost btn-pms-sm"
                    onClick={() => onViewDetail(rfq.id)}
                    title="Xem chi tiết"
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
