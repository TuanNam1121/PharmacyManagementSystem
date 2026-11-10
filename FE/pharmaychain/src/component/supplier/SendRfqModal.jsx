import { useState, useEffect } from 'react';
import { useSendRfq } from '../../hooks/rfq/useRfq';

export default function SendRfqModal({ show, onHide, supplier, supplierSelectMode = false, preselectedProposalId = null, onSuccess }) {
  const [showSuppliers, setShowSuppliers] = useState(true);
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
    selectedSupplierIds,
    toggleSupplier,
    selectAllSuppliers,
    clearSuppliers,
    emailWarning,
    setEmailWarning,
    fetchProposals,
    fetchSuppliers,
    handleSubmit,
    resetForm,
  } = useSendRfq(supplier, preselectedProposalId);

  useEffect(() => {
    if (!show) return;
    // Clear any warning from a previous send so it is not shown for a new supplier.
    setEmailWarning(null);
    setShowSuppliers(true);
    fetchProposals();
    if (supplierSelectMode) {
      fetchSuppliers();
    }
    if (preselectedProposalId) {
      setSelectedProposalId(String(preselectedProposalId));
    }
    // Pre-fill subject with default
    setSubject(`Yêu cầu báo giá dược phẩm${supplier?.name ? ` - ${supplier.name}` : ''}`);
    setContent(`Kính gửi ${supplier?.contactPerson || 'Quý Nhà cung cấp'},

Chúng tôi xin gửi tới Quý công ty danh mục yêu cầu báo giá cho các sản phẩm dược phẩm theo đề xuất mua hàng đính kèm.

Quý công ty vui lòng xem chi tiết và phản hồi đơn giá trực tuyến qua đường dẫn bảo mật được cấp trong thư này.

Trân trọng cảm ơn,
Bộ phận Mua Hàng - Hệ thống Dược Phẩm PMS`);
  }, [show, supplier, supplierSelectMode, fetchProposals, fetchSuppliers, setSubject, setContent, setEmailWarning]);

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const selectedSuppliers = supplierSelectMode
    ? suppliers.filter((s) => selectedSupplierIds.includes(String(s.id)))
    : (supplier ? [supplier] : []);
  const recipientEmails = selectedSuppliers.map((s) => s.email).filter(Boolean);

  if (!show) return null;

  return (
    <div
      className="pms-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) handleClose();
      }}
    >
      <div className="pms-modal" style={{ maxWidth: 640 }}>
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">Gửi Yêu Cầu Báo Giá (RFQ)</div>
            <div className="pms-modal-sub">
              Soạn thảo email và gửi liên kết báo giá trực tuyến đến nhà cung cấp
            </div>
          </div>
          <button
            className="pms-modal-close"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Đóng"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form
          onSubmit={async (e) => {
            const result = await handleSubmit(e);
            if (result?.success) {
              if (onSuccess) {
                onSuccess(result.emailWarning);
              }
              // Keep the modal open when the email could not be delivered so the
              // warning stays visible; the RFQ itself has already been created.
              if (!result.emailWarning) {
                onHide();
              }
            }
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <div className="pms-modal-body" style={{ flex: 1, overflowY: 'auto' }}>
            {error && (
              <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {emailWarning && (
              <div className="pms-alert pms-alert-warning" style={{ marginBottom: 16 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>
                  <strong>Đã tạo RFQ nhưng email chưa gửi được.</strong> {emailWarning}
                </span>
              </div>
            )}

            {/* Supplier Info / Selection */}
            <div className="pms-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="pms-label" htmlFor="supplier" style={{ margin: 0 }}>
                  Nhà Cung Cấp *{supplierSelectMode ? (
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
                      {' '}— Đã chọn <strong style={{ color: 'var(--brand-primary, #059669)' }}>{selectedSupplierIds.length}</strong> nhà cung cấp
                    </span>
                  ) : null}
                </label>
                {supplierSelectMode && !suppliersLoading && (
                  <button
                    type="button"
                    className="btn-pms btn-pms-ghost"
                    style={{ fontSize: 12, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    onClick={() => setShowSuppliers((v) => !v)}
                  >
                    {showSuppliers ? 'Thu gọn' : `Chọn nhà cung cấp (${selectedSupplierIds.length})`}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      style={{ transform: showSuppliers ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                )}
              </div>
              {supplierSelectMode ? (
                suppliersLoading ? (
                  <div className="pms-spinner-wrap" style={{ padding: '12px 0' }}>
                    <div className="pms-spinner" />
                    <span className="pms-spinner-text">Đang tải danh sách nhà cung cấp...</span>
                  </div>
                ) : showSuppliers ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="btn-pms btn-pms-secondary"
                          style={{ fontSize: 12, padding: '4px 10px' }}
                          onClick={selectAllSuppliers}
                        >
                          Chọn tất cả
                        </button>
                        <button
                          type="button"
                          className="btn-pms btn-pms-secondary"
                          style={{ fontSize: 12, padding: '4px 10px' }}
                          onClick={clearSuppliers}
                          disabled={selectedSupplierIds.length === 0}
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        border: '1px solid var(--border-color, #e5e7eb)',
                        borderRadius: 8,
                        maxHeight: 220,
                        overflowY: 'auto',
                      }}
                    >
                      {suppliers.map((s) => {
                        const checked = selectedSupplierIds.includes(String(s.id));
                        return (
                          <label
                            key={s.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '10px 14px',
                              cursor: 'pointer',
                              borderBottom: '1px solid var(--border-color, #e5e7eb)',
                              background: checked ? 'var(--brand-primary-light, #ecfdf5)' : 'transparent',
                              transition: 'background 150ms ease',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSupplier(s.id)}
                            />
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                              {s.name}
                            </span>
                            <span className="text-muted-color" style={{ fontSize: 12 }}>({s.code})</span>
                            {s.email && (
                              <span className="text-muted-color" style={{ fontSize: 12, marginLeft: 'auto' }}>
                                {s.email}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </>
                ) : null
              ) : (
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 6,
                    border: '1px solid var(--border-color)',
                    fontSize: 13,
                  }}
                >
                  <strong style={{ color: 'var(--text-primary)' }}>{supplier?.name}</strong> ({supplier?.code})<br />
                  {supplier?.contactPerson && (
                    <span className="text-muted-color" style={{ fontSize: 12 }}>
                      Người liên hệ: {supplier.contactPerson}
                    </span>
                  )}
                  {supplier?.email && (
                    <span className="text-muted-color" style={{ fontSize: 12, marginLeft: 12 }}>
                      Email: {supplier.email}
                    </span>
                  )}
                </div>
              )}
              {supplierSelectMode && recipientEmails.length > 0 && (
                <div className="pms-form-hint">
                  Người nhận ({recipientEmails.length}):{' '}
                  <strong>
                    {recipientEmails.slice(0, 2).join(', ')}
                    {recipientEmails.length > 2 ? `, +${recipientEmails.length - 2} khác` : ''}
                  </strong>
                </div>
              )}
              {supplierSelectMode && suppliers.length === 0 && !suppliersLoading && (
                <div className="pms-form-hint">Không có nhà cung cấp nào đang hoạt động.</div>
              )}
            </div>

            {/* Purchase Proposal Selection */}
            <div className="pms-form-group">
              <label className="pms-label" htmlFor="purchaseProposal">
                Đề Xuất Mua Hàng Gốc *
              </label>
              {loading ? (
                <div className="pms-spinner-wrap" style={{ padding: '12px 0' }}>
                  <div className="pms-spinner" />
                  <span className="pms-spinner-text">Đang tải danh sách đề xuất mua hàng...</span>
                </div>
              ) : (
                <select
                  id="purchaseProposal"
                  className="pms-select"
                  style={{ width: '100%' }}
                  value={selectedProposalId}
                  onChange={(e) => setSelectedProposalId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn đề xuất mua hàng --</option>
                  {proposals.map((proposal) => (
                    <option key={proposal.id} value={proposal.id}>
                      {proposal.code} ({proposal.purchaseRequests?.length || 0} yêu cầu liên kết)
                    </option>
                  ))}
                </select>
              )}
              {proposals.length === 0 && !loading && (
                <div className="pms-form-hint" style={{ color: 'var(--brand-danger)' }}>
                  Hiện không có đề xuất mua hàng nào ở trạng thái Sẵn sàng tạo RFQ.
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="pms-form-group">
              <label className="pms-label" htmlFor="subject">
                Tiêu Đề Email *
              </label>
              <input
                id="subject"
                type="text"
                className="pms-input"
                style={{ width: '100%' }}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Nhập tiêu đề email mời chào giá..."
                required
              />
            </div>

            {/* Content */}
            <div className="pms-form-group">
              <label className="pms-label" htmlFor="content">
                Nội Dung Email *
              </label>
              <textarea
                id="content"
                className="pms-input"
                style={{
                  width: '100%',
                  minHeight: 140,
                  padding: '10px 14px',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung thư. Đường dẫn phản hồi báo giá sẽ tự động được thêm vào cuối email."
                required
              />
            </div>

            <div className="pms-form-hint" style={{ marginTop: -6, marginBottom: 8 }}>
              Đường dẫn bảo mật để nhà cung cấp điền báo giá sẽ được hệ thống đính kèm tự động trong email.
              Liên kết có hiệu lực trong vòng 3 ngày kể từ khi gửi.
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pms-modal-footer" style={{ flexShrink: 0 }}>
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
                  <div
                    className="pms-spinner"
                    style={{ width: 14, height: 14, marginRight: 8 }}
                  />
                  Đang gửi…
                </>
              ) : (
                supplierSelectMode && selectedSupplierIds.length > 1
                  ? `Gửi RFQ (${selectedSupplierIds.length})`
                  : 'Gửi RFQ'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}