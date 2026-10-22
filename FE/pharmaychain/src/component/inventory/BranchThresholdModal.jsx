import { useState, useEffect } from 'react';

export default function BranchThresholdModal({ show, onHide, item, onConfirm, submitting }) {
    const [minQuantity, setMinQuantity] = useState('');
    const [note, setNote] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show && item) {
            setMinQuantity(String(item.minQuantity || 20));
            setNote('');
            setError(null);
        }
    }, [show, item]);

    if (!show || !item) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const num = Number(minQuantity);
        if (isNaN(num) || num < 0) {
            setError('Minimum stock threshold cannot be negative');
            return;
        }
        try {
            await onConfirm({
                productId: item.productId,
                minQuantity: num,
                note,
            });
        } catch (err) {
            setError(err?.message || 'An error occurred while updating threshold');
        }
    };

    return (
        <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !submitting) onHide(); }}>
            <div className="pms-modal" style={{ maxWidth: 480 }}>
                <div className="pms-modal-header">
                    <div>
                        <div className="pms-modal-title">Adjust Minimum Stock Warning Threshold</div>
                        <div className="pms-modal-sub">{item.productName} ({item.unit})</div>
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

                        <div className="pms-form-group">
                            <label className="pms-label">Minimum Stock Quantity *</label>
                            <input
                                type="number"
                                min="0"
                                className="pms-input pms-input-bare"
                                value={minQuantity}
                                onChange={(e) => setMinQuantity(e.target.value)}
                                placeholder="e.g., 20"
                                required
                                disabled={submitting}
                            />
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                                When physical quantity at this branch is $\le$ this threshold, the system displays a yellow/red low stock indicator.
                            </div>
                        </div>

                        <div className="pms-form-group" style={{ marginBottom: 4 }}>
                            <label className="pms-label">Adjustment Reason (Audit Log)</label>
                            <textarea
                                rows={2}
                                className="pms-input pms-input-bare"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Note reason for changing minimum threshold..."
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    <div className="pms-modal-footer">
                        <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-pms btn-pms-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
