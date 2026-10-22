import { useState, useEffect } from 'react';
import { money } from '../../utils/format';

export default function DailySalesReconcileModal({
    show,
    onHide,
    overview,
    date,
    onConfirm,
    submitting,
}) {
    const [actualCash, setActualCash] = useState('');
    const [note, setNote] = useState('');
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(null);

    const systemCash = overview?.systemCash ?? 0;

    useEffect(() => {
        if (show) {
            setErrors({});
            setServerError(null);
            const currentActual = overview?.actualCash != null ? overview.actualCash : systemCash;
            setActualCash(String(currentActual));
            setNote(overview?.note || '');
        }
    }, [show, overview, systemCash]);

    if (!show) return null;

    const numActual = Number(actualCash) || 0;
    const difference = numActual - systemCash;

    const validate = () => {
        const e = {};
        if (actualCash === '' || actualCash == null) {
            e.actualCash = 'Please enter the physical cash counted in drawers';
        } else if (isNaN(numActual) || numActual < 0) {
            e.actualCash = 'Physical cash amount cannot be negative';
        }
        if (note && note.length > 1000) {
            e.note = 'Reconciliation note must not exceed 1000 characters';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError(null);
        if (!validate()) return;
        try {
            await onConfirm({ actualCash: numActual, note });
        } catch (err) {
            setServerError(err?.message || 'An error occurred while reconciling daily sales.');
        }
    };

    return (
        <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !submitting) onHide(); }}>
            <div className="pms-modal" style={{ maxWidth: 560 }}>
                {/* Header */}
                <div className="pms-modal-header">
                    <div>
                        <div className="pms-modal-title">Confirm Daily Sales Reconciliation & Closing</div>
                        <div className="pms-modal-sub">
                            Branch: <strong>{overview?.storeName || 'Store Branch'}</strong> — Date: <strong>{date}</strong>
                        </div>
                    </div>
                    <button type="button" className="pms-modal-close" onClick={onHide} disabled={submitting} aria-label="Close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div className="pms-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                        {serverError && (
                            <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {serverError}
                            </div>
                        )}

                        {/* System Recorded Figures */}
                        <div style={{ background: 'var(--bg-canvas)', padding: 14, borderRadius: 10, marginBottom: 16, border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>
                                System Recorded Figures
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                                <div>System Cash:</div>
                                <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-primary)' }}>{money(systemCash)}</div>

                                <div>Bank Transfer:</div>
                                <div style={{ textAlign: 'right', fontWeight: 600 }}>{money(overview?.systemBank || 0)}</div>

                                <div>VNPay E-Wallet:</div>
                                <div style={{ textAlign: 'right', fontWeight: 600 }}>{money(overview?.systemVnpay || 0)}</div>

                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 6, fontWeight: 700 }}>Total Revenue:</div>
                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 6, textAlign: 'right', fontWeight: 800, color: 'var(--brand-primary-dark)' }}>
                                    {money(overview?.systemTotal || 0)}
                                </div>
                            </div>
                        </div>

                        {/* Input Physical Cash */}
                        <div className="pms-form-group">
                            <label className="pms-label">Actual Physical Cash Counted in Safe / Drawers (VND) *</label>
                            <input
                                type="number"
                                min="0"
                                step="1000"
                                className="pms-input pms-input-bare"
                                value={actualCash}
                                onChange={(e) => setActualCash(e.target.value)}
                                placeholder="Enter physical cash amount counted..."
                                required
                                disabled={submitting}
                            />
                            {errors.actualCash && (
                                <div style={{ color: 'var(--color-danger)', fontSize: 12, marginTop: 4 }}>
                                    {errors.actualCash}
                                </div>
                            )}
                        </div>

                        {/* Real-time Variance Preview */}
                        <div style={{
                            padding: '12px 14px',
                            borderRadius: 8,
                            marginBottom: 16,
                            background: difference === 0 ? 'var(--color-success-bg)' : difference > 0 ? 'var(--color-info-bg)' : 'var(--color-danger-bg)',
                            border: `1px solid ${difference === 0 ? '#a7f3d0' : difference > 0 ? '#bfdbfe' : '#fecaca'}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                Cash Variance (Actual - System):
                            </span>
                            <span style={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: difference === 0 ? 'var(--color-success-text)' : difference > 0 ? 'var(--color-info-text)' : 'var(--color-danger-text)',
                            }}>
                                {difference === 0 ? '100% Balanced (0 ₫)' : (difference > 0 ? `+${money(difference)}` : money(difference))}
                            </span>
                        </div>

                        {/* Notes & Explanation */}
                        <div className="pms-form-group" style={{ marginBottom: 4 }}>
                            <label className="pms-label">Reconciliation Notes & Explanation (Required if discrepancy)</label>
                            <textarea
                                rows={3}
                                className="pms-input pms-input-bare"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="e.g., Safe drawer counted, cash matches shift handover, transferred to bank drop..."
                                disabled={submitting}
                            />
                            {errors.note && (
                                <div style={{ color: 'var(--color-danger)', fontSize: 12, marginTop: 4 }}>
                                    {errors.note}
                                </div>
                            )}
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                                * This closing action will be irrevocably logged in the system Audit Log.
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="pms-modal-footer">
                        <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-pms btn-pms-primary" disabled={submitting}>
                            {submitting ? 'Closing Ledger...' : 'Confirm & Close Sales'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
