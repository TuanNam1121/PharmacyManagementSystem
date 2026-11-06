import React, { useState } from 'react';

export default function RequestAuditModal({ show, onHide, onConfirm, submitting }) {
    const [storeId, setStoreId] = useState('1');
    const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]);
    const [reason, setReason] = useState('');
    const [error, setError] = useState(null);

    if (!show) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!storeId || !auditDate) {
            setError('Please select branch store and audit date.');
            return;
        }
        try {
            await onConfirm({
                storeId: Number(storeId),
                auditDate,
                reason,
            });
            onHide();
        } catch (err) {
            setError(err?.message || 'Failed to submit audit session request.');
        }
    };

    return (
        <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !submitting) onHide(); }}>
            <div className="pms-modal" style={{ maxWidth: 520 }}>
                <div className="pms-modal-header">
                    <div>
                        <h3 className="pms-modal-title">Request Stocktaking Session</h3>
                        <p className="pms-modal-sub" style={{ fontSize: 12, margin: 0, color: 'var(--text-secondary)' }}>
                            Role: <strong>Pharmacist</strong> — Request will be forwarded to Store Manager for approval
                        </p>
                    </div>
                    <button type="button" className="pms-modal-close" onClick={onHide} disabled={submitting}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="pms-modal-body">
                        {error && (
                            <div className="pms-alert pms-alert-danger" style={{ marginBottom: 14 }}>
                                {error}
                            </div>
                        )}

                        <div className="pms-alert pms-alert-info" style={{ marginBottom: 16, fontSize: 13 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            Creating this request will snapshot system stock for all active items in the branch. Counting can only begin <strong>after the Store Manager accepts</strong> this request.
                        </div>

                        <div className="pms-form-group" style={{ marginBottom: 14 }}>
                            <label className="pms-label" style={{ fontWeight: 600 }}>Branch Pharmacy <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <select
                                className="pms-select"
                                value={storeId}
                                onChange={(e) => setStoreId(e.target.value)}
                                disabled={submitting}
                                style={{ width: '100%' }}
                            >
                                <option value="1">Store #1 — Central Pharmacy</option>
                                <option value="2">Store #2 — Cau Giay Pharmacy</option>
                                <option value="3">Store #3 — Dong Da Pharmacy</option>
                            </select>
                        </div>

                        <div className="pms-form-group" style={{ marginBottom: 14 }}>
                            <label className="pms-label" style={{ fontWeight: 600 }}>Planned Audit Date <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <input
                                type="date"
                                className="pms-input"
                                value={auditDate}
                                onChange={(e) => setAuditDate(e.target.value)}
                                disabled={submitting}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div className="pms-form-group">
                            <label className="pms-label" style={{ fontWeight: 600 }}>Audit Purpose & Notes</label>
                            <textarea
                                rows={3}
                                className="pms-input"
                                placeholder="E.g., Monthly scheduled audit, prescription drug check, or discrepancy investigation..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                disabled={submitting}
                                style={{ width: '100%', resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    <div className="pms-modal-footer">
                        <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-pms btn-pms-primary" disabled={submitting}>
                            {submitting ? 'Submitting Request...' : 'Send Request to Manager'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
