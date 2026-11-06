import { useState, useEffect } from 'react';
import { getEligiblePurchaseRequests } from '../../api/PurchaseProposalAPI';

export default function PurchaseProposalCreateModal({ show, onHide, onSubmit, loading }) {
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (!show) return;
    setFormError(null);
    setSelectedIds([]);
    loadEligibleRequests();
  }, [show]);

  const loadEligibleRequests = async () => {
    try {
      const res = await getEligiblePurchaseRequests();
      setPurchaseRequests(res || []);
    } catch (err) {
      setFormError('Failed to load eligible purchase requests: ' + (err?.message || err));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (selectedIds.length === 0) {
      setFormError('Please select at least one purchase request');
      return;
    }

    onSubmit({ purchaseRequestIds: selectedIds.map(Number) });
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-lg">
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">Create Purchase Proposal</div>
            <div className="pms-modal-sub">Aggregate one or more purchase requests into a single proposal</div>
          </div>
          <button className="pms-modal-close" onClick={onHide}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="pms-modal-body">
            {formError && (
              <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                {formError}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                Purchase Requests * <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(select one or more)</span>
              </label>
              <div style={{
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: 8,
                maxHeight: 280,
                overflowY: 'auto',
              }}>
                {purchaseRequests.length === 0 ? (
                  <div style={{ padding: '16px 12px', fontSize: 12, color: 'var(--text-muted)' }}>
                    No eligible purchase requests found (must be SUBMITTED and not yet aggregated).
                  </div>
                ) : (
                  purchaseRequests.map((pr) => (
                    <label
                      key={pr.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', cursor: 'pointer',
                        borderBottom: '1px solid var(--border-color, #e5e7eb)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(pr.id)}
                        onChange={() => toggleSelect(pr.id)}
                      />
                      <span className="mono fw-700" style={{ fontSize: 13 }}>{pr.code}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {pr.statusText || 'Submitted'} • {pr.createdAt ? new Date(pr.createdAt).toLocaleDateString() : ''}
                      </span>
                    </label>
                  ))
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                {selectedIds.length} purchase request(s) selected
              </div>
            </div>
          </div>

          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-pms btn-pms-primary" disabled={loading || selectedIds.length === 0}>
              {loading ? 'Creating…' : 'Create Purchase Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
