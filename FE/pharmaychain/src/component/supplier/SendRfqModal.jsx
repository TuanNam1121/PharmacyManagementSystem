import { useEffect } from 'react';
import { useSendRfq } from '../../hooks/rfq/useRfq';

export default function SendRfqModal({ show, onHide, supplier, supplierSelectMode = false, onSuccess }) {
  const {
    proposals,
    loading,
    submitting,
    error,
    selectedProposalId,
    setSelectedProposalId,
    subject,
    setSubject,
    content,
    setContent,
    suppliers,
    suppliersLoading,
    selectedSupplierId,
    setSelectedSupplierId,
    fetchProposals,
    fetchSuppliers,
    handleSubmit,
    resetForm,
  } = useSendRfq(supplier);

  useEffect(() => {
    if (!show) return;
    fetchProposals();
    if (supplierSelectMode) {
      fetchSuppliers();
    }
    // Pre-fill subject with default
    setSubject(`Yêu cầu báo giá dược phẩm${supplier?.name ? ` - ${supplier.name}` : ''}`);
    setContent(`Kính gửi ${supplier?.contactPerson || 'Quý Nhà cung cấp'},

Chúng tôi xin gửi tới Quý công ty danh mục yêu cầu báo giá cho các sản phẩm dược phẩm theo đề xuất mua hàng đính kèm.

Quý công ty vui lòng xem chi tiết và phản hồi đơn giá trực tuyến qua đường dẫn bảo mật được cấp trong thư này.

Trân trọng cảm ơn,
Bộ phận Mua Hàng - Hệ thống Dược Phẩm PMS`);
  }, [show, supplier, supplierSelectMode, fetchProposals, fetchSuppliers, setSubject, setContent]);

  const handleClose = () => {
    resetForm();
    onHide();
  };

  if (!show) return null;

  return (
    <div className="pms-modal-overlay">
      <div className="pms-modal" style={{ maxWidth: 600 }}>
        <div className="pms-modal-header">
          <h3 className="pms-modal-title">Gửi Yêu Cầu Báo Giá (RFQ)</h3>
          <button className="pms-modal-close" onClick={handleClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="pms-modal-body">
          {/* Supplier Info / Selection */}
          <div className="pms-form-group">
            <label className="pms-form-label" htmlFor="supplier">Nhà Cung Cấp *</label>
            {supplierSelectMode ? (
              suppliersLoading ? (
                <div className="pms-spinner-wrap">
                  <div className="pms-spinner" />
                  <span className="pms-spinner-text">Đang tải danh sách nhà cung cấp...</span>
                </div>
              ) : (
                <select
                  id="supplier"
                  className="pms-form-select"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn nhà cung cấp --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              )
            ) : (
              <div className="pms-readonly-field">
                <strong>{supplier.name}</strong> ({supplier.code})<br />
                {supplier.contactPerson && <span>Người liên hệ: {supplier.contactPerson}</span>}<br />
                {supplier.email && <span>Email: {supplier.email}</span>}
              </div>
            )}
            {supplierSelectMode && suppliers.length === 0 && !suppliersLoading && (
              <div className="pms-form-hint">Không có nhà cung cấp nào đang hoạt động.</div>
            )}
          </div>

          {error && (
            <div className="pms-alert pms-alert-danger">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={async (e) => {
            const success = await handleSubmit(e);
            if (success) {
              if (onSuccess) {
                onSuccess();
              } else {
                alert('Đã gửi yêu cầu báo giá RFQ thành công!');
              }
              onHide();
            }
          }}>
            {/* Purchase Proposal Selection */}
            <div className="pms-form-group">
              <label className="pms-form-label" htmlFor="purchaseProposal">
                Đề Xuất Mua Hàng Gốc *
              </label>
              {loading ? (
                <div className="pms-spinner-wrap">
                  <div className="pms-spinner" />
                  <span className="pms-spinner-text">Đang tải danh sách đề xuất mua hàng...</span>
                </div>
              ) : (
                <select
                  id="purchaseProposal"
                  className="pms-form-select"
                  value={selectedProposalId}
                  onChange={(e) => setSelectedProposalId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn đề xuất mua hàng --</option>
                  {proposals.map(proposal => (
                    <option key={proposal.id} value={proposal.id}>
                      {proposal.code} ({proposal.purchaseRequests?.length || 0} yêu cầu)
                    </option>
                  ))}
                </select>
              )}
              {proposals.length === 0 && !loading && (
                <div className="pms-form-hint">Không có đề xuất mua hàng nào khả dụng.</div>
              )}
            </div>

            {/* Subject */}
            <div className="pms-form-group">
              <label className="pms-form-label" htmlFor="subject">
                Tiêu Đề Email *
              </label>
              <input
                id="subject"
                type="text"
                className="pms-form-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Nhập tiêu đề email"
                required
              />
            </div>

            {/* Content */}
            <div className="pms-form-group">
              <label className="pms-form-label" htmlFor="content">
                Nội Dung Email *
              </label>
              <textarea
                id="content"
                className="pms-form-textarea"
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung thư. Đường dẫn phản hồi báo giá sẽ tự động được thêm vào cuối email."
                required
              />
            </div>

            <div className="pms-form-hint">
              Đường dẫn bảo mật để nhà cung cấp điền báo giá sẽ được hệ thống đính kèm tự động trong email.
              Liên kết có hiệu lực trong vòng 3 ngày kể từ khi gửi.
            </div>

            {/* Modal Footer */}
            <div className="pms-modal-footer">
              <button
                type="button"
                className="btn-pms btn-pms-ghost"
                onClick={handleClose}
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn-pms btn-pms-primary"
                disabled={submitting || loading}
              >
                {submitting ? (
                  <>
                    <div className="pms-spinner" style={{ width: 14, height: 14, marginRight: 8 }} />
                    Đang gửi…
                  </>
                ) : 'Gửi RFQ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}