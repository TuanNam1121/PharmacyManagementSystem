import { useState } from 'react';

export default function WarehouseDispatchModal({ show, onHide, requisition, onConfirm, loading }) {
  const [carrier, setCarrier] = useState('Đội xe chuyên dụng Kho Tổng');
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
            <div className="pms-modal-title">Xác Nhận Xuất Kho Điều Phối (Xuất Hàng)</div>
            <div className="pms-modal-sub">
              Phiếu điều phối {requisition.code} → Nơi nhận: {requisition.storeName}
            </div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Đóng">
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
                Xác nhận xuất kho sẽ phân bổ các lô thuốc theo quy tắc <strong>FEFO (Hạn dùng gần nhất xuất trước)</strong> và trừ tồn kho trực tiếp tại Kho Tổng.
              </span>
            </div>

            <div className="pms-form-group" style={{ marginBottom: 16 }}>
              <label className="pms-form-label">
                Đơn Vị / Phương Thức Vận Chuyển <span className="pms-required">*</span>
              </label>
              <select
                className="pms-select"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                required
              >
                <option value="Đội xe chuyên dụng Kho Tổng">Đội xe vận tải chuyên dụng Kho Tổng</option>
                <option value="Logistics Dược phẩm Chuỗi Lạnh">Vận tải chuỗi lạnh dược phẩm (Xe bảo quản lạnh GSP)</option>
                <option value="Chuyển phát nhanh tiêu chuẩn">Chuyển phát nhanh dược phẩm tiêu chuẩn</option>
                <option value="Chi nhánh tự điều phối nhận hàng">Chi nhánh nhà thuốc tự đến nhận hàng tại kho</option>
              </select>
            </div>

            <div className="pms-form-group">
              <label className="pms-form-label">Ghi Chú Xuất Kho / Thông Tin Chuyến Xe</label>
              <textarea
                className="pms-input"
                rows={3}
                placeholder="Tên lái xe, số điện thoại, biển số xe, mã niêm phong (seal), nhiệt độ bảo quản..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="pms-modal-footer">
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={loading}>
              Hủy
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
              {loading ? 'Đang xuất kho…' : 'Xác Nhận Xuất Kho & Trừ Tồn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
