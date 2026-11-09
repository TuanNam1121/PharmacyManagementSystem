import { useState, useEffect } from 'react';

export default function WarehouseLocationModal({
  show, onHide, inventory, locations, onAssign, onCreateLocation, loading,
}) {
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCode, setNewCode]   = useState('');
  const [newAisle, setNewAisle] = useState('');
  const [newShelf, setNewShelf] = useState('');
  const [newBin, setNewBin]     = useState('');
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (inventory) {
      setSelectedLocationId(inventory.locationId ? String(inventory.locationId) : '');
      setErrorMsg(null);
      setShowCreateForm(false);
    }
  }, [inventory, show]);

  if (!show || !inventory) return null;

  const handleSave = async () => {
    if (!selectedLocationId) { setErrorMsg('Vui lòng chọn một vị trí ô kệ lưu trữ.'); return; }
    setErrorMsg(null);
    try { await onAssign(inventory.id, selectedLocationId); }
    catch (err) { setErrorMsg(err?.message || 'Không thể gán vị trí lưu kho.'); }
  };

  const handleCreateNewLocation = async (e) => {
    e.preventDefault();
    if (!newCode.trim()) { setErrorMsg('Mã vị trí ô kệ là bắt buộc.'); return; }
    setCreating(true); setErrorMsg(null);
    try {
      const created = await onCreateLocation({
        code: newCode.trim(), aisle: newAisle.trim(), shelf: newShelf.trim(), bin: newBin.trim(),
      });
      setSelectedLocationId(created.id);
      setShowCreateForm(false);
      setNewCode(''); setNewAisle(''); setNewShelf(''); setNewBin('');
    } catch (err) {
      setErrorMsg(err?.message || 'Không thể tạo vị trí ô kệ mới.');
    } finally { setCreating(false); }
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="pms-modal">
        {/* Header */}
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">Gán Vị Trí Ô Kệ Kho Tổng</div>
            <div className="pms-modal-sub">Thiết lập tọa độ lưu trữ cho lô dược phẩm này</div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="pms-modal-body">
          {errorMsg && (
            <div className="pms-alert pms-alert-danger">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errorMsg}
              <button className="pms-alert-close" onClick={() => setErrorMsg(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          )}

          {/* Product info card */}
          <div style={{
            background: 'var(--bg-canvas)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-md)', padding: '14px 16px', marginBottom: 20,
          }}>
            <div className="fw-600" style={{ fontSize: 14 }}>{inventory.productName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 12 }}>
              <span>Mã thuốc: <strong>{inventory.productCode || '—'}</strong></span>
              <span>Lô: <span className="pms-badge pms-badge-neutral mono">{inventory.batchNumber}</span></span>
              <span>Tồn: <strong>{inventory.quantity} {inventory.unit}</strong></span>
            </div>
          </div>

          {/* Select existing or create */}
          {!showCreateForm ? (
            <div>
              <label className="pms-label">Chọn Vị Trí Ô Kệ Hiện Có</label>
              <select
                className="pms-select"
                style={{ width: '100%', marginBottom: 12 }}
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
              >
                <option value="">— Chọn vị trí ô kệ lưu trữ —</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.code} (Dãy: {loc.aisle || '—'}, Kệ: {loc.shelf || '—'}, Hộc: {loc.bin || '—'})
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="btn-pms btn-pms-ghost"
                style={{ fontSize: 12, color: 'var(--brand-primary)', padding: '4px 0' }}
                onClick={() => setShowCreateForm(true)}
              >
                + Thêm ô kệ mới vào kho tổng
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateNewLocation} style={{
              border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', padding: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Thêm Mới Vị Trí Ô Kệ
              </div>
              <div className="pms-form-group">
                <label className="pms-label">Mã Vị Trí Ô Kệ *</label>
                <input className="pms-input pms-input-bare" placeholder="VD: A-01-01" value={newCode}
                  onChange={(e) => setNewCode(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label className="pms-label">Dãy (Aisle)</label>
                  <input className="pms-input pms-input-bare" placeholder="VD: A" value={newAisle} onChange={(e) => setNewAisle(e.target.value)} />
                </div>
                <div>
                  <label className="pms-label">Kệ (Shelf)</label>
                  <input className="pms-input pms-input-bare" placeholder="VD: 02" value={newShelf} onChange={(e) => setNewShelf(e.target.value)} />
                </div>
                <div>
                  <label className="pms-label">Hộc (Bin)</label>
                  <input className="pms-input pms-input-bare" placeholder="VD: 03" value={newBin} onChange={(e) => setNewBin(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn-pms btn-pms-secondary" onClick={() => setShowCreateForm(false)}>Hủy</button>
                <button type="submit" className="btn-pms btn-pms-primary" disabled={creating}>
                  {creating ? 'Đang lưu…' : 'Lưu Vị Trí'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="pms-modal-footer">
          <button className="btn-pms btn-pms-secondary" onClick={onHide} disabled={loading}>Hủy</button>
          <button className="btn-pms btn-pms-primary" onClick={handleSave} disabled={loading || showCreateForm}>
            {loading ? 'Đang lưu…' : 'Xác Nhận Gán Vị Trí'}
          </button>
        </div>
      </div>
    </div>
  );
}
