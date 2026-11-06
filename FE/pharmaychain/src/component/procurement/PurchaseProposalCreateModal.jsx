import { useState, useEffect } from 'react';
import { getEligiblePurchaseRequests } from '../../api/PurchaseProposalAPI';
import { formatDate } from '../../utils/format';

export default function PurchaseProposalCreateModal({ show, onHide, onSubmit, loading, preselectedId = null }) {
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (!show) return;
    setFormError(null);
    setSelectedIds(preselectedId ? [preselectedId] : []);
    loadEligibleRequests();
  }, [show, preselectedId]);

  const loadEligibleRequests = async () => {
    try {
      const res = await getEligiblePurchaseRequests();
      setPurchaseRequests(res || []);
    } catch (err) {
      setFormError('Không thể tải danh sách yêu cầu mua hàng: ' + (err?.message || err));
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
      setFormError('Vui lòng chọn ít nhất một yêu cầu mua hàng để tổng hợp.');
      return;
    }

    onSubmit({ purchaseRequestIds: selectedIds.map(Number) });
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !loading) onHide(); }}>
      <div className="pms-modal pms-modal-lg" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="pms-modal-header" style={{ flexShrink: 0 }}>
          <div>
            <div className="pms-modal-title">Tạo Đề Xuất Mua Hàng</div>
            <div className="pms-modal-sub">Tổng hợp các yêu cầu mua hàng từ kho thành đề xuất mua hàng để tiến hành chào giá RFQ</div>
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

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                Yêu cầu mua hàng khả dụng * <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(chọn một hoặc nhiều phiếu để gộp)</span>
              </label>
              <div style={{
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: 8,
                maxHeight: 280,
                overflowY: 'auto',
              }}>
                {purchaseRequests.length === 0 ? (
                  <div style={{ padding: '20px 16px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                    Không tìm thấy yêu cầu mua hàng nào khả dụng (yêu cầu phải ở trạng thái <strong>ĐÃ GỬI DUYỆT</strong> và chưa được tổng hợp vào đề xuất khác).
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
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        Ngày lập: {formatDate(pr.createdAt)}
                      </span>
                    </label>
                  ))
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, fontWeight: 500 }}>
                Đã chọn: <strong style={{ color: 'var(--brand-primary)' }}>{selectedIds.length}</strong> yêu cầu mua hàng
              </div>
            </div>
          </div>

          <div className="pms-modal-footer" style={{ padding: '16px 24px', flexShrink: 0, borderTop: '1px solid #e2e8f0', background: '#fff' }}>
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={loading}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn-pms btn-pms-primary" disabled={loading || selectedIds.length === 0}>
              {loading ? 'Đang tạo đề xuất…' : 'Tạo Đề Xuất Mua Hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
