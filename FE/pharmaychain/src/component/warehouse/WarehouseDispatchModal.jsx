import { useState } from 'react';

export default function WarehouseDispatchModal({ show, onHide, requisition, onConfirm, loading }) {
  const [carrier, setCarrier] = useState('Central Warehouse Fleet');
  const [note, setNote] = useState('');

  if (!show || !requisition) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(requisition.id, {
      carrier: carrier.trim(),
      note: note.trim() || undefined,
    });
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal pms-modal-md">
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">Confirm Goods Dispatch (Issue Stock)</div>
            <div className="pms-modal-sub">
              Requisition {requisition.code} → Destination: {requisition.storeName}
            </div>
          </div>
          <button className="pms-modal-close" onClick={onHide}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="pms-modal-body">
            <div className="pms-alert pms-alert-info" style={{ marginBottom: 16 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>
                Confirming dispatch will allocate inventory batches by <strong>FEFO (First Expired First Out)</strong> and deduct central warehouse stock immediately.
              </span>
            </div>

            <div className="pms-form-group" style={{ marginBottom: 16 }}>
              <label className="pms-form-label">
                Carrier / Transport Method <span className="pms-required">*</span>
              </label>
              <select
                className="pms-select"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                required
              >
                <option value="Central Warehouse Fleet">Central Warehouse Dedicated Fleet</option>
                <option value="Cold Chain Logistics Partner">Cold Chain Pharma Logistics (Refrigerated)</option>
                <option value="Standard Express Delivery">Standard Express Pharma Courier</option>
                <option value="Branch Store Pickup">Branch Store Self-Pickup</option>
              </select>
            </div>

            <div className="pms-form-group">
              <label className="pms-form-label">Dispatch Notes / Consignment Details</label>
              <textarea
                className="pms-input"
                rows={3}
                placeholder="Driver name, vehicle license plate, seal number, delivery instructions..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-pms btn-pms-primary"
              disabled={loading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--brand-primary)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              {loading ? 'Dispatching…' : 'Confirm Dispatch & Deduct Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
