import { useState } from 'react';

export default function BranchStockAuditModal({ show, onHide, storeName, onConfirm, submitting }) {
    const [note, setNote] = useState('');
    const [error, setError] = useState(null);

    if (!show) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await onConfirm({ note });
        } catch (err) {
            setError(err?.message || 'An error occurred while confirming stock audit check.');
        }
    };

    return (
        <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !submitting) onHide(); }}>
            <div className="pms-modal" style={{ maxWidth: 500 }}>
                <div className="pms-modal-header">
                    <div>
                        <div className="pms-modal-title">Confirm Counter Stock Audit Check</div>
                        <div className="pms-modal-sub">Branch: <strong>{storeName}</strong></div>
                    </div>
                    <button type="button" className="pms-modal-close" onClick={onHide} disabled={submitting}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="pms-modal-body">
                        {error && (
                            <div className="pms-alert pms-alert-danger" style={{ marginBottom: 14 }}>
                                {error}
                            </div>
                        )}
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
                            The branch pharmacist / store manager confirms that physical shelves and expiring batches have been inspected and reconciled with system data.
                        </p>

                        <div className="pms-form-group" style={{ marginBottom: 4 }}>
                            <label className="pms-label">Inspection & Audit Notes</label>
                            <textarea
                                rows={3}
                                className="pms-input pms-input-bare"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Note quick inspection findings, batches requiring transfer, or actions taken..."
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    <div className="pms-modal-footer">
                        <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-pms btn-pms-primary" disabled={submitting}>
                            {submitting ? 'Recording...' : 'Confirm & Log Audit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
