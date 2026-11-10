import { useState, useEffect } from 'react';
import { getEligiblePurchaseRequests } from '../../api/PurchaseProposalAPI';
import { formatDate } from '../../utils/format';

export default function PurchaseProposalCreateModal({ show, onHide, onSubmit, loading, preselectedId = null }) {
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formError, setFormError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  useEffect(() => {
    if (!show) return;
    setFormError(null);
    setSelectedIds(preselectedId ? [preselectedId] : []);
    setShowConfirm(false);
    setPendingPayload(null);

    getEligiblePurchaseRequests()
      .then((res) => setPurchaseRequests(res || []))
      .catch((err) => setFormError('Không thể tải yêu cầu mua hàng: ' + (err?.message || err)));
  }, [show, preselectedId]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (!show) return null;

  const canSubmit = selectedIds.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!canSubmit) {
      setFormError('Vui lòng chọn ít nhất một yêu cầu mua hàng từ kho.');
      return;
    }

    const payload = {
      purchaseRequestIds: selectedIds.map(Number),
    };

    setPendingPayload(payload);
    setShowConfirm(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirm(false);
    onSubmit(pendingPayload);
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !loading) onHide(); }}>
      <div className="pms-modal pms-modal-lg" style={{ maxHeight: '92vh', width: '92%', maxWidth: 840, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="pms-modal-header" style={{ flexShrink: 0 }}>
          <div>
            <div className="pms-modal-title">Tạo Đề Xuất Mua Hàng</div>
            <div className="pms-modal-sub">
              Tổng hợp từ phiếu yêu cầu mua hàng của kho tổng
            </div>
          </div>
          <button className="pms-modal-close" onClick={onHide} disabled={loading} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div className="pms-modal-body" style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
            {formError && (
              <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                {formError}
              </div>
            )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Phiếu yêu cầu mua hàng từ kho tổng khả dụng:
                  </label>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Đã chọn: <strong style={{ color: 'var(--brand-primary, #059669)' }}>{selectedIds.length}</strong> phiếu
                  </span>
                </div>

                <div style={{
                  border: '1px solid var(--border-color, #e5e7eb)',
                  borderRadius: 8,
                  maxHeight: 280,
                  overflowY: 'auto',
                }}>
                  {purchaseRequests.length === 0 ? (
                    <div style={{ padding: '24px 16px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                      Kho tổng hiện chưa có phiếu yêu cầu mới nào chờ gộp.
                    </div>
                  ) : (
                    purchaseRequests.map((pr) => (
                      <label
                        key={pr.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '12px 14px', cursor: 'pointer',
                          borderBottom: '1px solid var(--border-color, #e5e7eb)',
                          background: selectedIds.includes(pr.id) ? 'var(--brand-primary-light, #ecfdf5)' : 'transparent',
                          transition: 'background 150ms ease',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(pr.id)}
                          onChange={() => toggleSelect(pr.id)}
                        />
                        <span className="mono fw-700" style={{ fontSize: 13 }}>{pr.code}</span>
                        <span className="pms-badge pms-badge-info" style={{ fontSize: 11 }}>
                          {pr.statusText === 'Submitted' ? 'Đã gửi duyệt' : pr.statusText || 'Đã gửi duyệt'}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}>
                          {pr.reason || 'Bổ sung tồn kho'}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {formatDate(pr.createdAt)}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

            {/* Bottom summary alert */}
            <div style={{
              marginTop: 18,
              padding: '10px 14px',
              background: '#f1f5f9',
              borderRadius: 6,
              fontSize: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>
                Tổng hợp: <strong>{selectedIds.length}</strong> yêu cầu kho
              </span>
              {!canSubmit && (
                <span style={{ color: '#ef4444', fontWeight: 500 }}>
                  (Vui lòng chọn ít nhất 1 yêu cầu kho)
                </span>
              )}
            </div>
          </div>

          <div className="pms-modal-footer" style={{ padding: '16px 24px', flexShrink: 0, borderTop: '1px solid #e2e8f0', background: '#fff' }}>
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={loading}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn-pms btn-pms-primary" disabled={loading || !canSubmit}>
              {loading ? 'Đang tạo đề xuất…' : 'Tạo Đề Xuất Mua Hàng'}
            </button>
          </div>
        </form>
      </div>

      {showConfirm && (
        <div
          className="pms-modal-overlay"
          style={{ zIndex: 1100 }}
          onClick={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) setShowConfirm(false); }}
        >
          <div className="pms-modal" style={{ maxWidth: 420 }}>
            <div className="pms-modal-header">
              <div className="pms-modal-title">Xác nhận tạo đề xuất</div>
            </div>
            <div className="pms-modal-body" style={{ fontSize: 14, color: 'var(--text-primary)' }}>
              Bạn có muốn tạo đề xuất mua hàng?
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                {selectedIds.length} phiếu yêu cầu sẽ được tổng hợp thành một đề xuất mua hàng.
              </div>
            </div>
            <div className="pms-modal-footer">
              <button
                type="button"
                className="btn-pms btn-pms-secondary"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Không
              </button>
              <button
                type="button"
                className="btn-pms btn-pms-primary"
                onClick={handleConfirmSubmit}
                disabled={loading}
              >
                {loading ? 'Đang tạo…' : 'Có'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
