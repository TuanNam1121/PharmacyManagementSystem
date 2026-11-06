import { useState, useEffect } from 'react';
import { getEligiblePurchaseRequests } from '../../api/PurchaseProposalAPI';
import { getWarehouseProducts } from '../../api/WarehouseInventoryAPI';
import { formatDate } from '../../utils/format';

export default function PurchaseProposalCreateModal({ show, onHide, onSubmit, loading, preselectedId = null }) {
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [directItems, setDirectItems] = useState([]);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'direct'
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (!show) return;
    setFormError(null);
    setSelectedIds(preselectedId ? [preselectedId] : []);
    setDirectItems([]);
    setActiveTab(preselectedId ? 'requests' : 'requests');

    getEligiblePurchaseRequests()
      .then((res) => setPurchaseRequests(res || []))
      .catch((err) => setFormError('Không thể tải yêu cầu mua hàng: ' + (err?.message || err)));

    getWarehouseProducts()
      .then((res) => setProducts(res || []))
      .catch((err) => console.error('Failed to load products', err));
  }, [show, preselectedId]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleItemChange = (index, field, value) => {
    setDirectItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addDirectItemRow = () => {
    setDirectItems((prev) => [
      ...prev,
      { productId: '', quantity: 100, note: '' },
    ]);
  };

  const removeDirectItemRow = (index) => {
    setDirectItems((prev) => prev.filter((_, i) => i !== index));
  };

  if (!show) return null;

  const validDirectItems = directItems.filter(
    (it) => it.productId && Number(it.quantity) > 0
  );

  const canSubmit = selectedIds.length > 0 || validDirectItems.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!canSubmit) {
      setFormError('Vui lòng chọn ít nhất một yêu cầu mua hàng từ kho hoặc thêm ít nhất một mặt hàng mua chủ động.');
      return;
    }

    const payload = {
      purchaseRequestIds: selectedIds.map(Number),
    };

    if (validDirectItems.length > 0) {
      payload.items = validDirectItems.map((it) => ({
        productId: Number(it.productId),
        quantity: Number(it.quantity),
        note: it.note?.trim() || undefined,
      }));
    }

    onSubmit(payload);
  };

  return (
    <div className="pms-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !loading) onHide(); }}>
      <div className="pms-modal pms-modal-lg" style={{ maxHeight: '92vh', width: '92%', maxWidth: 840, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="pms-modal-header" style={{ flexShrink: 0 }}>
          <div>
            <div className="pms-modal-title">Tạo Đề Xuất Mua Hàng</div>
            <div className="pms-modal-sub">
              Tổng hợp từ phiếu yêu cầu của kho hoặc chủ động đặt hàng thuốc (khuyến mãi, giá tốt, dự phòng)
            </div>
          </div>
          <button className="pms-modal-close" onClick={onHide} disabled={loading} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Tab switch between warehouse requests and proactive item additions */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 24px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: activeTab === 'requests' ? 'var(--brand-primary, #059669)' : '#64748b',
              borderBottom: activeTab === 'requests' ? '2px solid var(--brand-primary, #059669)' : '2px solid transparent',
              transition: 'all 150ms ease',
            }}
          >
            1. Từ yêu cầu kho tổng ({selectedIds.length} đã chọn)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('direct');
              if (directItems.length === 0) addDirectItemRow();
            }}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: activeTab === 'direct' ? 'var(--brand-primary, #059669)' : '#64748b',
              borderBottom: activeTab === 'direct' ? '2px solid var(--brand-primary, #059669)' : '2px solid transparent',
              transition: 'all 150ms ease',
            }}
          >
            2. Mua chủ động / Khuyến mãi ({validDirectItems.length} mặt hàng)
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div className="pms-modal-body" style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
            {formError && (
              <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                {formError}
              </div>
            )}

            {activeTab === 'requests' && (
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
                      <div style={{ marginTop: 6, fontSize: 12, color: 'var(--brand-primary, #059669)', fontWeight: 600 }}>
                        👉 Bạn có thể chuyển sang tab "Mua chủ động / Khuyến mãi" để tự lập đề xuất mua sắm ngay!
                      </div>
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
            )}

            {activeTab === 'direct' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      Danh mục thuốc mua chủ động (không cần đợi kho báo hết):
                    </label>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Thích hợp khi nhà cung cấp đang có giá ưu đãi, đợt khuyến mãi hoặc chuẩn bị cho mùa vụ cao điểm.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-pms btn-pms-secondary"
                    style={{ fontSize: 12, padding: '6px 12px' }}
                    onClick={addDirectItemRow}
                  >
                    + Thêm thuốc
                  </button>
                </div>

                {directItems.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: 13, color: '#64748b' }}>Chưa có mặt hàng mua chủ động nào.</div>
                    <button
                      type="button"
                      className="btn-pms btn-pms-primary"
                      style={{ marginTop: 10, fontSize: 12 }}
                      onClick={addDirectItemRow}
                    >
                      + Thêm mặt hàng đầu tiên
                    </button>
                  </div>
                ) : (
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                    <table className="pms-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}>#</th>
                          <th style={{ minWidth: 260 }}>Tên Thuốc / Quy Cách *</th>
                          <th style={{ width: 130 }}>Số Lượng *</th>
                          <th>Ghi Chú Nhu Cầu</th>
                          <th style={{ width: 50, textAlign: 'center' }}>Xóa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {directItems.map((item, idx) => {
                          const selectedProd = products.find((p) => String(p.id) === String(item.productId));
                          return (
                            <tr key={idx}>
                              <td>{idx + 1}</td>
                              <td>
                                <select
                                  className="pms-select"
                                  style={{ width: '100%', fontSize: 13 }}
                                  value={item.productId}
                                  onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                                  required
                                >
                                  <option value="">-- Chọn thuốc cần đề xuất mua --</option>
                                  {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} ({p.unit || 'Đơn vị'}) - Giá gốc: {Number(p.costPrice || 0).toLocaleString('vi-VN')} ₫
                                    </option>
                                  ))}
                                </select>
                                {selectedProd && (
                                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                    Mã vạch: {selectedProd.barcode} | Đơn vị: {selectedProd.unit}
                                  </div>
                                )}
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="pms-input"
                                  min="1"
                                  style={{ width: '100%', fontSize: 13 }}
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                  required
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="pms-input"
                                  placeholder="VD: Giá NCC đang giảm 10%..."
                                  style={{ width: '100%', fontSize: 13 }}
                                  value={item.note || ''}
                                  onChange={(e) => handleItemChange(idx, 'note', e.target.value)}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  className="pms-icon-btn delete"
                                  onClick={() => removeDirectItemRow(idx)}
                                  title="Xóa dòng này"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

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
                Tổng hợp: <strong>{selectedIds.length}</strong> yêu cầu kho + <strong>{validDirectItems.length}</strong> thuốc mua chủ động
              </span>
              {!canSubmit && (
                <span style={{ color: '#ef4444', fontWeight: 500 }}>
                  (Vui lòng chọn ít nhất 1 yêu cầu kho hoặc 1 mặt hàng mua chủ động)
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
    </div>
  );
}
