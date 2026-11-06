export default function QuotationCompareModal({ show, onHide, data, loading }) {
  if (!show) return null;
  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  return (
    <div
      className="pms-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}
    >
      <div className="pms-modal pms-modal-xl">
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">Quotation Comparison</div>
            <div className="pms-modal-sub">Compare supplier quotations side by side for the same Purchase Proposal</div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {loading && (
          <div className="pms-spinner-wrap" style={{ padding: '40px 0' }}>
            <div className="pms-spinner" />
            <span className="pms-spinner-text">Generating comparison…</span>
          </div>
        )}
        {!loading && data && (
          <>
            <div className="pms-modal-body">
              <div style={{ marginBottom: 16 }}>
                <div className="pms-info-row"><div className="pms-info-label">Purchase Proposal:</div><div className="pms-info-value">{data.purchaseProposalCode}</div></div>
                <div className="pms-info-row"><div className="pms-info-label">Compared RFQs:</div><div className="pms-info-value">{data.columns.length} RFQ(s)</div></div>
              </div>
              <div className="pms-table-container">
                <table className="pms-table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th rowSpan="2" style={{ width: 200 }}>Product</th>
                      <th rowSpan="2" style={{ width: 60 }}>Qty</th>
                      {data.columns.map(col => (
                        <th key={col.rfqId} style={{ textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                          <div style={{ fontWeight: 600 }}>{col.supplier?.name || 'Supplier'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{col.rfqCode}</div>
                        </th>
                      ))}
                      <th rowSpan="2" style={{ width: 100, borderLeft: '1px solid var(--border)' }}>Lowest</th>
                    </tr>
                    <tr>
                      {data.columns.map(col => (
                        <th key={col.rfqId} style={{ textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                          <span className={`pms-badge pms-badge-${col.status === 'RESPONDED' ? 'success' : 'info'}`}>{col.status}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map(row => {
                      const prices = Object.values(row.unitPrices).filter(p => p != null).map(p => parseFloat(p));
                      const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
                      return (
                        <tr key={row.productId}>
                          <td><div style={{ fontWeight: 500 }}>{row.productName}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.productCode} ({row.unit})</div></td>
                          <td>{row.requestedQuantity}</td>
                          {data.columns.map(col => {
                            const price = row.unitPrices[col.rfqId];
                            const isLowest = price != null && lowestPrice != null && parseFloat(price) === lowestPrice;
                            return (
                              <td key={col.rfqId} style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', backgroundColor: isLowest ? 'var(--brand-primary-light)' : 'transparent', fontWeight: isLowest ? 600 : 'normal' }}>
                                {price ? formatCurrency(price) : '-'}
                              </td>
                            );
                          })}
                          <td style={{ borderLeft: '1px solid var(--border)', fontWeight: 600, color: 'var(--brand-primary)' }}>
                            {lowestPrice ? formatCurrency(lowestPrice) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                    <tr style={{ borderTop: '2px solid var(--border)' }}>
                      <td colSpan="2" style={{ fontWeight: 600 }}>Total Amount</td>
                      {data.columns.map(col => (
                        <td key={col.rfqId} style={{ textAlign: 'center', fontWeight: 600, borderLeft: '1px solid var(--border)' }}>
                          {data.totals[col.rfqId] ? formatCurrency(data.totals[col.rfqId]) : '-'}
                        </td>
                      ))}
                      <td style={{ borderLeft: '1px solid var(--border)' }}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="pms-modal-footer">
              <button className="btn-pms btn-pms-secondary" onClick={onHide}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}