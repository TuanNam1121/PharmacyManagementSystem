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
          <span className="pms-spinner-text">Loading RFQ details...</span>
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
              <strong>Unable to load RFQ</strong>
              <div style={{ marginTop: 8 }}>{error}</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Please contact the purchasing department for a valid link.
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
          <h2 style={{ marginBottom: 8 }}>Quotation Submitted Successfully!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            Thank you for submitting your quotation. Our purchasing team will review it and contact you soon.
          </p>
          <div className="pms-form-hint">
            RFQ Code: <strong>{rfqData?.rfqCode}</strong>
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
              <h1 style={{ marginBottom: 8 }}>{rfqData?.subject || 'Request for Quotation'}</h1>
              <div style={{ color: 'var(--text-secondary)' }}>
                RFQ Code: <strong>{rfqData?.rfqCode}</strong> • 
                Purchase Proposal: <strong>{rfqData?.purchaseProposalCode}</strong> • 
                Expires: <strong>{formatDate(rfqData?.expiredAt)}</strong>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>{rfqData?.supplierName}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {rfqData?.contactPerson && <div>Contact: {rfqData.contactPerson}</div>}
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
                  <th>Product</th>
                  <th>Code</th>
                  <th>Unit</th>
                  <th>Requested Quantity</th>
                  <th style={{ width: 150 }}>Unit Price *</th>
                  <th>Note</th>
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
                        <span style={{ marginRight: 4 }}>VND</span>
                        <input
                          type="text"
                          className="pms-form-input"
                          value={item.unitPrice}
                          onChange={(e) => handlePriceChange(index, e.target.value)}
                          style={{ textAlign: 'right' }}
                          placeholder="0.00"
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
                        placeholder="Optional note"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
            <div className="pms-form-hint" style={{ marginBottom: 16 }}>
              * Please enter unit price in VND. All fields are required.
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
                    Submitting...
                  </>
                ) : 'Submit Quotation'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}