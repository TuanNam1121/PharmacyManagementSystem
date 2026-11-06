import React, { useState, useEffect } from 'react';
import { getRfqQuotationDetails, recordQuotation } from '../../api/RfqAPI';

export default function RecordQuotationModal({ show, onHide, rfq, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [quotationCode, setQuotationCode] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState([]);
  const [supplierName, setSupplierName] = useState('');

  useEffect(() => {
    if (!show || !rfq) return;

    setError(null);
    setSupplierName(rfq.supplierName || rfq.supplier?.name || '');
    
    // Default valid until 30 days
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setValidUntil(d.toISOString().slice(0, 10));

    const defaultCode = `QUO-${(rfq.supplierCode || 'SUP').replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-5)}`;
    setQuotationCode(defaultCode);
    setNote('');

    // Fetch RFQ items
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await getRfqQuotationDetails(rfq.id);
        const proposalItems = res?.items || [];
        setItems(
          proposalItems.map((it) => ({
            productId: it.productId,
            productName: it.productName,
            productCode: it.productCode,
            unit: it.unit,
            quantity: it.requestedQuantity || 1,
            unitPrice: it.unitPrice && Number(it.unitPrice) > 0 ? Number(it.unitPrice) : 50000,
          }))
        );
      } catch (err) {
        setError(err?.message || 'Không thể tải danh sách mặt hàng của RFQ');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [show, rfq]);

  if (!show || !rfq) return null;

  const handlePriceChange = (index, value) => {
    const num = Math.max(0, Number(value) || 0);
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], unitPrice: num };
      return copy;
    });
  };

  const totalAmount = items.reduce((sum, it) => sum + (it.unitPrice || 0) * (it.quantity || 0), 0);

  const formatCurrency = (amt) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quotationCode.trim()) {
      setError('Vui lòng nhập số báo giá của nhà cung cấp.');
      return;
    }
    if (items.some((it) => !it.unitPrice || it.unitPrice <= 0)) {
      setError('Vui lòng nhập đơn giá chào lớn hơn 0 cho tất cả mặt hàng.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await recordQuotation(rfq.id, {
        quotationCode: quotationCode.trim(),
        validUntil: validUntil || undefined,
        note: note.trim() || undefined,
        items: items.map((it) => ({
          productId: it.productId,
          unitPrice: it.unitPrice,
          taxRate: 0,
          quantity: it.quantity,
        })),
      });

      if (onSuccess) {
        onSuccess(`Đã ghi nhận báo giá từ ${supplierName || 'nhà cung cấp'} thành công!`);
      }
      onHide();
    } catch (err) {
      setError(err?.message || 'Ghi nhận báo giá thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="pms-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onHide();
      }}
    >
      <div className="pms-modal pms-modal-lg" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="pms-modal-header" style={{ flexShrink: 0 }}>
          <div>
            <div className="pms-modal-title">Ghi Nhận Báo Giá Nhà Cung Cấp</div>
            <div className="pms-modal-sub">
              Tiếp nhận đơn giá chào từ <strong>{supplierName}</strong> cho yêu cầu {rfq.code}
            </div>
          </div>
          <button className="pms-modal-close" onClick={onHide} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="pms-modal-body" style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
            {error && (
              <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                ⚠ {error}
              </div>
            )}

            {/* General info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
              <div>
                <label className="pms-label">Số Báo Giá NCC <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  className="pms-input"
                  value={quotationCode}
                  onChange={(e) => setQuotationCode(e.target.value)}
                  placeholder="Ví dụ: QUO-DHG-001"
                  required
                />
              </div>
              <div>
                <label className="pms-label">Hạn Hiệu Lực Báo Giá</label>
                <input
                  type="date"
                  className="pms-input"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
              <div>
                <label className="pms-label">Ghi Chú NCC</label>
                <input
                  type="text"
                  className="pms-input"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Điều khoản giao hàng, thanh toán..."
                />
              </div>
            </div>

            {/* Items table */}
            <div style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Danh Mục Thuốc & Đơn Giá Chào Từ NCC:
              </h4>

              {loading ? (
                <div className="pms-spinner-wrap" style={{ padding: '30px 0' }}>
                  <div className="pms-spinner" />
                  <span className="pms-spinner-text">Đang tải danh mục mặt hàng…</span>
                </div>
              ) : items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  Không tìm thấy mặt hàng nào trong yêu cầu này.
                </div>
              ) : (
                <div className="pms-table-wrap" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }}>
                  <table className="pms-table" style={{ fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th>Tên Thuốc / Sản Phẩm</th>
                        <th>ĐVT</th>
                        <th className="text-right" style={{ width: 100 }}>Số Lượng</th>
                        <th className="text-right" style={{ width: 160 }}>Đơn Giá Chào (đ)</th>
                        <th className="text-right" style={{ width: 150 }}>Thành Tiền (đ)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, idx) => (
                        <tr key={it.productId || idx}>
                          <td className="text-xs text-muted-color">{idx + 1}</td>
                          <td>
                            <div className="fw-600">{it.productName}</div>
                            <div className="text-xs text-muted-color mono">{it.productCode}</div>
                          </td>
                          <td className="text-secondary-color">{it.unit || '—'}</td>
                          <td className="text-right fw-600">{it.quantity}</td>
                          <td className="text-right">
                            <input
                              type="number"
                              min="1"
                              step="500"
                              className="pms-input"
                              style={{ textAlign: 'right', fontWeight: 600, padding: '4px 8px' }}
                              value={it.unitPrice}
                              onChange={(e) => handlePriceChange(idx, e.target.value)}
                              required
                            />
                          </td>
                          <td className="text-right fw-700" style={{ color: 'var(--brand-primary)' }}>
                            {formatCurrency((it.unitPrice || 0) * (it.quantity || 0))}
                          </td>
                        </tr>
                      ))}
                      <tr style={{ background: 'var(--bg-canvas)' }}>
                        <td colSpan={5} className="fw-700" style={{ textAlign: 'right', fontSize: 13 }}>
                          Tổng Giá Trị Báo Giá:
                        </td>
                        <td className="text-right fw-700" style={{ fontSize: 15, color: 'var(--brand-primary)' }}>
                          {formatCurrency(totalAmount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="pms-modal-footer" style={{ flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn-pms btn-pms-secondary" onClick={onHide} disabled={submitting}>
              Hủy
            </button>
            <button
              type="submit"
              className="btn-pms btn-pms-primary"
              disabled={submitting || loading || items.length === 0}
            >
              {submitting ? 'Đang lưu báo giá…' : 'Lưu & Ghi Nhận Báo Giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

