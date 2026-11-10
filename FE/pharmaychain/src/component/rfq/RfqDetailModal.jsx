import { useState, useEffect } from "react";
import { formatDateLong, getInitials } from "../../utils/format";

const cardStyle = {
  border: "1px solid var(--border-color)",
  borderRadius: "var(--border-radius-md)",
  padding: 16,
};

const sectionTitleStyle = {
  marginBottom: 12,
  fontSize: 12,
  fontWeight: 700,
  color: "var(--brand-primary)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const infoListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  fontSize: 13,
};

const statBoxStyle = {
  background: "var(--bg-canvas)",
  border: "1px solid var(--border-color)",
  borderRadius: "var(--border-radius-sm)",
  padding: "10px 12px",
};

const statLabelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
};

const formatCurrency = (amount) => {
  if (!amount) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
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
      return <span className="pms-badge pms-badge-neutral">Không xác định</span>;
  }
};

/** Dòng "Nhãn: giá trị" — đồng bộ cách trình bày với modal chi tiết nhà cung cấp */
function InfoLine({ label, children }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "baseline", flexWrap: "wrap" }}>
      <span style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>{label}:</span>
      <span style={{ color: "var(--text-primary)", fontWeight: 600, wordBreak: "break-word" }}>
        {children}
      </span>
    </div>
  );
}

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

  const proposalRequests = detail?.purchaseProposal?.purchaseRequests || [];

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
              {/* Banner: mã RFQ + trạng thái + nhà cung cấp */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: 16,
                  background: "var(--bg-canvas)",
                  borderRadius: "var(--border-radius-md)",
                  border: "1px solid var(--border-color)",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    background:
                      "linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(59, 130, 246, 0.25))",
                    color: "var(--brand-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 16,
                    flexShrink: 0,
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                  }}
                >
                  {getInitials(detail.rfqCode)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h3
                      className="mono"
                      style={{
                        margin: 0,
                        fontSize: 17,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      {detail.rfqCode || "—"}
                    </h3>
                    {getStatusBadge(detail.status)}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--text-muted)",
                      marginTop: 4,
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <span>
                      Nhà cung cấp:{" "}
                      <strong style={{ color: "var(--text-primary)" }}>
                        {detail.supplier?.name || "—"}
                      </strong>
                    </span>
                    {detail.supplier?.code && (
                      <span>
                        Mã NCC:{" "}
                        <strong className="mono" style={{ color: "var(--text-primary)" }}>
                          {detail.supplier.code}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Thông Tin RFQ + Nhà Cung Cấp */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                  marginBottom: 20,
                }}
              >
                <div style={cardStyle}>
                  <div style={sectionTitleStyle}>Thông Tin RFQ</div>
                  <div style={infoListStyle}>
                    <InfoLine label="Mã RFQ">
                      <span className="mono">{detail.rfqCode || "—"}</span>
                    </InfoLine>
                    <InfoLine label="Trạng thái">{getStatusBadge(detail.status)}</InfoLine>
                    <InfoLine label="Ngày tạo đề xuất">
                      {formatDateLong(detail.purchaseProposal?.createdAt)}
                    </InfoLine>
                    <InfoLine label="Hiệu lực báo giá đến">
                      {formatDateLong(detail.quotation?.validUntil)}
                    </InfoLine>
                  </div>
                </div>

                <div style={cardStyle}>
                  <div style={sectionTitleStyle}>Nhà Cung Cấp</div>
                  <div style={infoListStyle}>
                    <InfoLine label="Tên nhà cung cấp">{detail.supplier?.name || "—"}</InfoLine>
                    <InfoLine label="Người liên hệ">{detail.supplier?.contactPerson || "—"}</InfoLine>
                    <InfoLine label="Điện thoại">{detail.supplier?.phone || "—"}</InfoLine>
                    <InfoLine label="Email">{detail.supplier?.email || "—"}</InfoLine>
                    {detail.supplier?.taxCode && (
                      <InfoLine label="Mã số thuế">
                        <span className="mono">{detail.supplier.taxCode}</span>
                      </InfoLine>
                    )}
                  </div>
                </div>
              </div>

              {/* Đề Xuất Mua Hàng Gốc */}
              <div style={{ ...cardStyle, marginBottom: 20 }}>
                <div style={sectionTitleStyle}>Đề Xuất Mua Hàng Gốc</div>
                <div style={infoListStyle}>
                  <InfoLine label="Mã đề xuất">
                    <span className="mono">{detail.purchaseProposal?.code || "—"}</span>
                  </InfoLine>
                  <InfoLine label="Trạng thái đề xuất">
                    {detail.purchaseProposal?.statusText || "—"}
                  </InfoLine>
                  <div style={{ display: "flex", gap: 6, alignItems: "baseline", flexWrap: "wrap" }}>
                    <span style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      Phiếu yêu cầu mua hàng:
                    </span>
                    <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {proposalRequests.length > 0 ? (
                        proposalRequests.map((req, idx) => (
                          <span
                            key={req.id ?? req.code ?? idx}
                            className="pms-badge pms-badge-neutral mono"
                          >
                            {req.code || "—"}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>—</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tổng Quan Báo Giá */}
              {detail.quotation ? (
                <div style={cardStyle}>
                  <div style={sectionTitleStyle}>Tổng Quan Báo Giá</div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div style={statBoxStyle}>
                      <div style={statLabelStyle}>Mã báo giá</div>
                      <div
                        className="mono"
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          marginTop: 4,
                        }}
                      >
                        {detail.quotation.code || "—"}
                      </div>
                    </div>
                    <div style={statBoxStyle}>
                      <div style={statLabelStyle}>Ngày báo giá</div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          marginTop: 4,
                        }}
                      >
                        {formatDateLong(detail.quotation.quotationDate)}
                      </div>
                    </div>
                    <div
                      style={{
                        ...statBoxStyle,
                        background: "var(--brand-primary-glow)",
                        borderColor: "rgba(16, 185, 129, 0.4)",
                      }}
                    >
                      <div style={statLabelStyle}>Tổng giá trị</div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: "var(--brand-primary)",
                          marginTop: 4,
                        }}
                      >
                        {formatCurrency(detail.quotation.totalAmount)}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                      marginTop: 16,
                      paddingTop: 14,
                      borderTop: "1px solid var(--border-color)",
                    }}
                  >
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      <strong style={{ color: "var(--text-primary)" }}>
                        {detail.items?.length || 0} mặt hàng
                      </strong>{" "}
                      trong báo giá này
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
                                    <div className="fw-600" style={{ fontSize: 13 }}>
                                      {item.productName}
                                    </div>
                                    {item.productCode && (
                                      <div className="mono text-xs text-muted-color" style={{ marginTop: 2 }}>
                                        {item.productCode}
                                      </div>
                                    )}
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
                                  colSpan={6}
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
              ) : (
                <div style={{ ...cardStyle, borderStyle: "dashed", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                    Nhà cung cấp chưa gửi báo giá cho yêu cầu này.
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    {detail.items?.length || 0} mặt hàng đang chờ nhà cung cấp báo giá
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

        {!loading && !detail && (
          <div className="pms-modal-body">
            <div className="pms-empty">
              <div className="pms-empty-title">Không tìm thấy thông tin yêu cầu báo giá</div>
              <div className="pms-empty-sub">
                Yêu cầu báo giá có thể đã bị xoá hoặc bạn không còn quyền xem.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}