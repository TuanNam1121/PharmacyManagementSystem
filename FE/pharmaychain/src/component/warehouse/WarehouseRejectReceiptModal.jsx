import { useState, useEffect } from 'react';
import { money } from '../../utils/format';

export default function WarehouseRejectReceiptModal({ show, receipt, onHide, onSubmit, loading }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      setReason('');
      setError('');
    }
  }, [show]);

  if (!show || !receipt) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason || !reason.trim()) {
      setError('Vui lòng nhập lý do từ chối nhận hàng.');
      return;
    }
    onSubmit(receipt.id, reason.trim());
  };

  return (
    <div className="pms-modal-overlay" onClick={onHide}>
      <div className="pms-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="pms-modal-header" style={{ borderBottom: '2px solid #ef4444' }}>
            <h3 className="pms-modal-title" style={{ color: '#dc2626' }}>Từ chối tiếp nhận kiện hàng</h3>
            <button type="button" className="pms-modal-close" onClick={onHide}>✕</button>
          </div>
          <div className="pms-modal-body">
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                Mã phiếu: <span style={{ color: '#dc2626' }}>{receipt.code}</span>
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Nhà cung cấp: {receipt.supplierName || 'NCC đối tác'}
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Tổng giá trị: {money(receipt.totalAmount || 0)}
              </div>
            </div>

            {error && (
              <div className="pms-alert pms-alert-danger" style={{ marginBottom: 12 }}>
                ⚠️ {error}
              </div>
            )}

            <div className="pms-form-group">
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Lý do từ chối nhận hàng <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                className="pms-input"
                rows="4"
                placeholder="Ví dụ: Bao bì thuốc bị móp méo, ướt rách, giao sai chủng loại, cận hạn dùng, thiếu số lượng..."
                value={reason}
                onChange={(e) => { setReason(e.target.value); setError(''); }}
                autoFocus
                required
              />
            </div>
          </div>
          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={loading}>
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn-pms"
              style={{
                background: 'linear-gradient(135deg,#dc2626,#ef4444)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 20px',
                cursor: 'pointer',
                fontWeight: 700,
                opacity: loading ? 0.7 : 1,
              }}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

