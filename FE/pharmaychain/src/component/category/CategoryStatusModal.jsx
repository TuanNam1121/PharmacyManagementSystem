import { useState, useEffect } from 'react';

export default function CategoryStatusModal({
  show,
  onHide,
  category,
  onConfirm,
}) {
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isCurrentlyActive = Number(category?.status) === 1;

  useEffect(() => {
    if (show) {
      setErrorMsg(null);
    }
  }, [show]);

  if (!show || !category) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      // Toggle status: 1 -> 0 (Inactive), 0 -> 1 (Active)
      const targetStatus = isCurrentlyActive ? 0 : 1;
      await onConfirm(category.id, targetStatus);
      onHide();
    } catch (err) {
      setErrorMsg(err?.message || 'Status change operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-md">
        {/* Header */}
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">
              {isCurrentlyActive ? 'Disable Category' : 'Activate Category'}
            </div>
            <div className="pms-modal-sub">
              Category: <strong>{category.name}</strong>
            </div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="pms-modal-body">
            {errorMsg && (
              <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errorMsg}
              </div>
            )}

            {isCurrentlyActive ? (
              <div>
                <p style={{ fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 14 }}>
                  Are you sure you want to change the category <strong>"{category.name}"</strong> to{' '}
                  <span className="pms-badge pms-badge-danger">INACTIVE</span> status?
                </p>

                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--border-radius-md)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    fontSize: 12.5,
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                  }}
                >
                  <strong style={{ color: 'var(--status-danger)' }}>Business Note:</strong>
                  <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                    <li>Cannot disable if there are still active products belonging to this category.</li>
                    <li>Products belonging to this category remain safely preserved in the database.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 14 }}>
                  Are you sure you want to reactivate the category <strong>"{category.name}"</strong> to{' '}
                  <span className="pms-badge pms-badge-success">ACTIVE</span> status?
                </p>
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--border-radius-md)',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontSize: 12.5,
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                  }}
                >
                  <strong style={{ color: 'var(--brand-primary)' }}>Information:</strong> Once activated, staff can continue selecting this category when managing categories and product classifications.
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn-pms ${isCurrentlyActive ? 'btn-pms-danger' : 'btn-pms-primary'}`}
              disabled={submitting}
            >
              {submitting
                ? 'Processing…'
                : isCurrentlyActive
                ? 'Confirm Disable'
                : 'Activate Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}