import { useState, useEffect } from 'react';

export default function RfqDetailModal({
  show,
  onHide,
  detail,
  loading,
  onCompare,
}) {
  const [showItems, setShowItems] = useState(false);

  // Collapse the expanded items view every time the modal (re)opens
  useEffect(() => {
    setShowItems(false);
  }, [show]);

  if (!show) return null;

  const formatCurrency = (amount) => {
    if (!amount) return "0";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

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
      case "SELECTED":
        return <span className="pms-badge pms-badge-success">Đã chọn</span>;
      case "REJECTED":
        return <span className="pms-badge pms-badge-danger">Từ chối</span>;
      default:
        return <span className="pms-badge">Không xác định</span>;
    }
  };

  const sectionTitleStyle = {
    marginBottom: 8,
    fontSize: 13,
    color: "var(--text-secondary)",
  };

  return (
    <div
      className="pms-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onHide();
      }}
    >
      <div className="pms-modal pms-modal-lg">
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">Chi Tiết Yêu Cầu Báo Giá (RFQ)</div>
            <div className="pms-modal-sub">
              Xem thông tin báo giá, nhà cung cấp và danh mục dược phẩm đề xuất mua
            </div>
          </div>
          <button
            className="pms-modal-close"
            onClick={onHide}
            aria-label="Đóng"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {loading && (
          <div className="pms-spinner-wrap" style={{ padding: "40px 0" }}>
            <div className="pms-spinner" />
            <span className="pms-spinner-text">Đang tải chi tiết RFQ…</span>
          </div>
        )}

        {!loading && detail && (
          <>
            <div className="pms-modal-body">
              {/* Hàng 1: RFQ Information và Supplier Information */}
              <div style={{ display: "flex", gap: 32, marginBottom: 20 }}>
                {/* Cột trái: RFQ */}
                <div style={{ flex: 1 }}>
                  <h4 style={sectionTitleStyle}>Thông Tin RFQ</h4>
                  <div className="pms-info-row">
                    <div className="pms-info-label">Mã RFQ:</div>
                    <div className="pms-info-value">{detail.rfqCode}</div>
                  </div>
                  <div className="pms-info-row">
                    <div className="pms-info-label">Trạng Thái:</div>
                    <div className="pms-info-value">
                      {getStatusBadge(detail.status)}
                    </div>
                  </div>
                  <div className="pms-info-row">
                    <div className="pms-info-label">Ngày Gửi:</div>
                    <div className="pms-info-value">
                      {formatDate(detail?.purchaseProposal?.createdAt)}
                    </div>
                  </div>
                  <div className="pms-info-row">
                    <div className="pms-info-label">Hạn Chót Báo Giá:</div>
                    <div className="pms-info-value">
                      {formatDate(detail?.quotation?.validUntil)}
                    </div>
                  </div>
                </div>

                {/* Cột phải: Supplier */}
                <div style={{ flex: 1 }}>
                  <h4 style={sectionTitleStyle}>Nhà Cung Cấp</h4>
                  <div className="pms-info-row">
                    <div className="pms-info-label">Tên Nhà Cung Cấp:</div>
                    <div className="pms-info-value">
                      {detail.supplier?.name || "-"}
                    </div>
                  </div>
                  <div className="pms-info-row">
                    <div className="pms-info-label">Người Liên Hệ:</div>
                    <div className="pms-info-value">
                      {detail.supplier?.contactPerson || "-"}
                    </div>
                  </div>
                  {detail.supplier?.email && (
                    <div className="pms-info-row">
                      <div className="pms-info-label">Email:</div>
                      <div className="pms-info-value">
                        {detail.supplier.email}
                      </div>
                    </div>
                  )}
                  {detail.supplier?.phone && (
                    <div className="pms-info-row">
                      <div className="pms-info-label">Điện Thoại:</div>
                      <div className="pms-info-value">
                        {detail.supplier.phone}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hàng 2: Purchase Proposal full width */}
              <div
                style={{
                  marginBottom: 24,
                  paddingTop: 16,
                  borderTop: "1px solid var(--border-color, #e5e7eb)",
                }}
              >
                <h4 style={sectionTitleStyle}>Đề Xuất Mua Hàng Gốc</h4>
                <div className="pms-info-row">
                  <div className="pms-info-label">Mã Đề Xuất:</div>
                  <div className="pms-info-value">
                    {detail.purchaseProposal?.code || "-"}
                  </div>
                </div>
                <div className="pms-info-row">
                  <div className="pms-info-label">Phiếu Yêu Cầu Mua Hàng:</div>
                  <div className="pms-info-value" style={{ flex: 1 }}>
                    {detail.purchaseProposal?.purchaseRequests && detail.purchaseProposal.purchaseRequests.length > 0
                      ? detail.purchaseProposal.purchaseRequests.map((r) => r.code).join(", ")
                      : "-"}
                  </div>
                </div>
              </div>

              {/* Quotation Summary */}
              {detail.quotation && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <h4 style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      Tổng Quan Báo Giá:
                    </h4>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div className="pms-info-row">
                        <div className="pms-info-label">Ngày Báo Giá:</div>
                        <div className="pms-info-value">
                          {formatDate(detail.quotation.quotationDate)}
                        </div>
                      </div>
                      <div className="pms-info-row">
                        <div className="pms-info-label">Tổng Giá Trị:</div>
                        <div
                          className="pms-info-value"
                          style={{
                            fontWeight: 600,
                            color: "var(--brand-primary)",
                          }}
                        >
                          {formatCurrency(detail.quotation.totalAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      background: "var(--bg-secondary)",
                      padding: 12,
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <strong>{detail.items?.length || 0} mặt hàng</strong>
                      </div>
                      <button
                        className="btn-pms btn-pms-ghost"
                        onClick={() => setShowItems((v) => !v)}
                      >
                        {showItems ? "Thu gọn danh sách" : "Xem chi tiết từng mặt hàng"}
                      </button>
                    </div>

                    {showItems && (
                      <div className="pms-table-wrap" style={{ marginTop: 12 }}>
                        <table className="pms-table" style={{ fontSize: 13 }}>
                          <thead>
                            <tr>
                              <th style={{ width: 40 }}>#</th>
                              <th>Tên Thuốc / Sản Phẩm</th>
                              <th>Mã Thuốc</th>
                              <th>Đơn Vị Tính</th>
                              <th className="text-right">Số Lượng Yêu Cầu</th>
                              <th className="text-right">Đơn Giá/ đơn vị</th>
                              <th className="text-right">Thành Tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.items && detail.items.length > 0 ? (
                              detail.items.map((item, i) => (
                                <tr key={item.productId ?? i}>
                                  <td className="text-xs text-muted-color">{i + 1}</td>
                                  <td>
                                    <span className="fw-600" style={{ fontSize: 13 }}>
                                      {item.productName}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="pms-badge pms-badge-neutral mono">
                                      {item.productCode || "—"}
                                    </span>
                                  </td>
                                  <td className="text-sm text-secondary-color">{item.unit || "—"}</td>
                                  <td className="text-right">{item.requestedQuantity ?? 0}</td>
                                  <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                                  <td className="text-right fw-700" style={{ fontSize: 13 }}>
                                    {formatCurrency(item.subtotal)}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={7}
                                  style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}
                                >
                                  Không có mặt hàng nào trong báo giá này.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pms-modal-footer">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <div>
                  {detail.status === "RESPONDED" && (
                    <button
                      className="btn-pms btn-pms-primary"
                      onClick={onCompare}
                    >
                      So sánh với các báo giá khác
                    </button>
                  )}
                </div>
                <div>
                  <button
                    className="btn-pms btn-pms-secondary"
                    onClick={onHide}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}