import { useEffect } from 'react';
import { useSendRfq } from '../../hooks/rfq/useRfq';

export default function SendRfqModal({ show, onHide, supplier, supplierSelectMode = false, onSuccess }) {
  const {
    proposals,
    loading,
    submitting,
    error,
    selectedProposalId,
    setSelectedProposalId,
    subject,
    setSubject,
    content,
    setContent,
    suppliers,
    suppliersLoading,
    selectedSupplierId,
    setSelectedSupplierId,
    fetchProposals,
    fetchSuppliers,
    handleSubmit,
    resetForm,
  } = useSendRfq(supplier);

  useEffect(() => {
    if (!show) return;
    fetchProposals();
    if (supplierSelectMode) {
      fetchSuppliers();
    }
    // Pre-fill subject with default
    setSubject(`Request for Quotation${supplier?.name ? ` - ${supplier.name}` : ''}`);
    setContent(`Dear ${supplier?.contactPerson || 'Supplier'},

We would like to request a quotation for the following items:

Please submit your quotation via the link provided in this email.

Best regards,
Purchasing Team`);
  }, [show, supplier, supplierSelectMode, fetchProposals, fetchSuppliers, setSubject, setContent]);

  const handleClose = () => {
    resetForm();
    onHide();
  };

  if (!show) return null;

  return (
    <div className="pms-modal-overlay">
      <div className="pms-modal" style={{ maxWidth: 600 }}>
        <div className="pms-modal-header">
          <h3 className="pms-modal-title">Send RFQ to Supplier</h3>
          <button className="pms-modal-close" onClick={handleClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="pms-modal-body">
          {/* Supplier Info / Selection */}
          <div className="pms-form-group">
            <label className="pms-form-label" htmlFor="supplier">Supplier *</label>
            {supplierSelectMode ? (
              suppliersLoading ? (
                <div className="pms-spinner-wrap">
                  <div className="pms-spinner" />
                  <span className="pms-spinner-text">Loading suppliers...</span>
                </div>
              ) : (
                <select
                  id="supplier"
                  className="pms-form-select"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  required
                >
                  <option value="">-- Select a supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              )
            ) : (
              <div className="pms-readonly-field">
                <strong>{supplier.name}</strong> ({supplier.code})<br />
                {supplier.contactPerson && <span>Contact: {supplier.contactPerson}</span>}<br />
                {supplier.email && <span>Email: {supplier.email}</span>}
              </div>
            )}
            {supplierSelectMode && suppliers.length === 0 && !suppliersLoading && (
              <div className="pms-form-hint">No active suppliers available.</div>
            )}
          </div>

          {error && (
            <div className="pms-alert pms-alert-danger">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={async (e) => {
            const success = await handleSubmit(e);
            if (success) {
              if (onSuccess) {
                onSuccess();
              } else {
                alert('RFQ sent successfully!');
              }
              onHide();
            }
          }}>
            {/* Purchase Proposal Selection */}
            <div className="pms-form-group">
              <label className="pms-form-label" htmlFor="purchaseProposal">
                Purchase Proposal *
              </label>
              {loading ? (
                <div className="pms-spinner-wrap">
                  <div className="pms-spinner" />
                  <span className="pms-spinner-text">Loading purchase proposals...</span>
                </div>
              ) : (
                <select
                  id="purchaseProposal"
                  className="pms-form-select"
                  value={selectedProposalId}
                  onChange={(e) => setSelectedProposalId(e.target.value)}
                  required
                >
                  <option value="">-- Select a purchase proposal --</option>
                  {proposals.map(proposal => (
                    <option key={proposal.id} value={proposal.id}>
                      {proposal.code} ({proposal.purchaseRequests?.length || 0} PRs)
                    </option>
                  ))}
                </select>
              )}
              {proposals.length === 0 && !loading && (
                <div className="pms-form-hint">No available purchase proposals.</div>
              )}
            </div>

            {/* Subject */}
            <div className="pms-form-group">
              <label className="pms-form-label" htmlFor="subject">
                Email Subject *
              </label>
              <input
                id="subject"
                type="text"
                className="pms-form-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                required
              />
            </div>

            {/* Content */}
            <div className="pms-form-group">
              <label className="pms-form-label" htmlFor="content">
                Email Content *
              </label>
              <textarea
                id="content"
                className="pms-form-textarea"
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter email content. A link for quotation submission will be automatically appended."
                required
              />
            </div>

            <div className="pms-form-hint">
              A secure link for quotation submission will be included in the email automatically.
              The link will expire in 3 days.
            </div>

            {/* Modal Footer */}
            <div className="pms-modal-footer">
              <button
                type="button"
                className="btn-pms btn-pms-ghost"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-pms btn-pms-primary"
                disabled={submitting || loading}
              >
                {submitting ? (
                  <>
                    <div className="pms-spinner" style={{ width: 14, height: 14, marginRight: 8 }} />
                    Sending...
                  </>
                ) : 'Send RFQ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}