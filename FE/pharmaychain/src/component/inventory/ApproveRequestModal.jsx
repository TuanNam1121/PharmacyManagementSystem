import React, { useState } from 'react';

export default function ApproveRequestModal({ show, audit, onHide, onConfirm, submitting }) {
    const [note, setNote] = useState('');
    const [error, setError] = useState(null);

    if (!show || !audit) return null;

    const handleAction = async (decision) => {
        setError(null);
        try {
            await onConfirm({
                auditId: audit.id,
                decision, // 1 = Approve to count, 4 = Reject
                note,
            });
            onHide();
        } catch (err) {
            setError(err?.message || 'Failed to review request.');
        }
    };

    return (
        <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !submitting) onHide(); }}>
            <div className="pms-modal" style={{ maxWidth: 500 }}>
                <div className="pms-modal-header">
                    <div>
                        <h3 className="pms-modal-title">Review Audit Request</h3>
                        <p className="pms-modal-sub" style={{ fontSize: 12, margin: 0, color: 'var(--text-secondary)' }}>
                            Role: <strong>Store Manager</strong>
                        </p>
                    </div>
                    <button type="button" className="pms-modal-close" onClick={onHide} disabled={submitting}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="pms-modal-body">
                    {error && (
                        <div className="pms-alert pms-alert-danger" style={{ marginBottom: 14 }}>
                            {error}
                        </div>
                    )}

                    <div style={{ background: 'var(--surface-sunken)', padding: 14, borderRadius: 8, marginBottom: 16 }}>
                        <div style={{ marginBottom: 6 }}><strong>Audit Code:</strong> {audit.code}</div>
                        <div style={{ marginBottom: 6 }}><strong>Requested By:</strong> {audit.requestedByUsername || 'Pharmacist'}</div>
                        <div style={{ marginBottom: 6 }}><strong>Audit Date:</strong> {audit.auditDate || '—'}</div>
                        <div><strong>Reason / Note:</strong> {audit.reviewNote || 'Standard periodic inventory count'}</div>
                    </div>

                    <div className="pms-form-group">
                        <label className="pms-label" style={{ fontWeight: 600 }}>Manager Instructions / Note (Optional)</label>
                        <textarea
                            rows={3}
                            className="pms-input"
                            placeholder="Enter notes or specific instructions for counting team..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            disabled={submitting}
                            style={{ width: '100%', resize: 'vertical' }}
                        />
                    </div>
                </div>

                <div className="pms-modal-footer">
                    <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn-pms btn-pms-danger"
                        onClick={() => handleAction(4)}
                        disabled={submitting}
                    >
                        Reject Request
                    </button>
                    <button
                        type="button"
                        className="btn-pms btn-pms-success"
                        onClick={() => handleAction(1)}
                        disabled={submitting}
                    >
                        {submitting ? 'Approving...' : 'Approve & Permit Counting'}
                    </button>
                </div>
            </div>
        </div>
    );
}
