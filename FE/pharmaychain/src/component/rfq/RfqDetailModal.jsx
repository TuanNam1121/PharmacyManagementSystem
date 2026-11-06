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
        return <span className="pms-badge pms-badge-info">Sent</span>;
      case "RESPONDED":
        return <span className="pms-badge pms-badge-success">Responded</span>;
      case "EXPIRED":
        return <span className="pms-badge pms-badge-warning">Expired</span>;
      default:
        return <span className="pms-badge">Unknown</span>;
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
            <div className="pms-modal-title">RFQ Details</div>
            <div className="pms-modal-sub">
              View quotation summary, supplier information, and purchase request
              details
            </div>
          </div>
          <button
            className="pms-modal-close"
            onClick={onHide}
            aria-label="Close"
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
            <span className="pms-spinner-text">Loading RFQ details…</span>
          </div>
        )}

        {!loading && detail && (
          <>
            <div className="pms-modal-body">
              {/* Hàng 1: RFQ Information và Supplier Information */}
              <div style={{ display: "flex", gap: 32, marginBottom: 20 }}>
                {/* Cột trái: RFQ */}
                <div style={{ flex: 1 }}>
                  <h4 style={sectionTitleStyle}>RFQ Information</h4>
                  <div className="pms-info-row">
                    <div className="pms-info-label">RFQ Code:</div>
                    <div className="pms-info-value">{detail.rfqCode}</div>
                  </div>
                  <div className="pms-info-row">
                    <div className="pms-info-label">Status:</div>
                    <div className="pms-info-value">
                      {getStatusBadge(detail.status)}
                    </div>
                  </div>
                  <div className="pms-info-row">
                    <div className="pms-info-label">Sent Date:</div>
                    <div className="pms-info-value">
                      {formatDate(detail?.purchaseProposal?.createdAt)}
                    </div>
                  </div>
                  <div className="pms-info-row">
                    <div className="pms-info-label">Deadline:</div>
                    <div className="pms-info-value">
                      {formatDate(detail?.quotation?.validUntil)}
                    </div>
                  </div>
                </div>

                {/* Cột phải: Supplier */}
                <div style={{ flex: 1 }}>
                  <h4 style={sectionTitleStyle}>Supplier Information</h4>
                  <div className="pms-info-row">
                    <div className="pms-info-label">Supplier:</div>
                    <div className="pms-info-value">
                      {detail.supplier?.name || "-"}
                    </div>
                  </div>
                  <div className="pms-info-row">
                    <div className="pms-info-label">Contact:</div>
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
                      <div className="pms-info-label">Phone:</div>
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
                <h4 style={sectionTitleStyle}>Purchase Proposal</h4>
                <div className="pms-info-row">
                  <div className="pms-info-label">Proposal Code:</div>
                  <div className="pms-info-value">
                    {detail.purchaseProposal?.code || "-"}
                  </div>
                </div>
                <div className="pms-info-row">
                  <div className="pms-info-label">Purchase Requests:</div>
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
                      Quotation Summary:
                    </h4>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div className="pms-info-row">
                        <div className="pms-info-label">Quotation Date:</div>
                        <div className="pms-info-value">
                          {formatDate(detail.quotation.quotationDate)}
                        </div>
                      </div>
                      <div className="pms-info-row">
                        <div className="pms-info-label">Total:</div>
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
                        <strong>{detail.items?.length || 0} item(s)</strong>
                      </div>
                      <button
                        className="btn-pms btn-pms-ghost"
                        onClick={() => setShowItems((v) => !v)}
                      >
                        {showItems ? "Hide Items" : "View Full Items"}
                      </button>
                    </div>

                    {showItems && (
                      <div className="pms-table-wrap" style={{ marginTop: 12 }}>
                        <table className="pms-table" style={{ fontSize: 13 }}>
                          <thead>
                            <tr>
                              <th style={{ width: 40 }}>#</th>
                              <th>Medicine / Product</th>
                              <th>Code</th>
                              <th>Unit</th>
                              <th className="text-right">Requested Qty</th>
                              <th className="text-right">Unit Price</th>
                              <th className="text-right">Subtotal</th>
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
                                  No items in this quotation.
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
                      Compare with other RFQs
                    </button>
                  )}
                </div>
                <div>
                  <button
                    className="btn-pms btn-pms-secondary"
                    onClick={onHide}
                  >
                    Close
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