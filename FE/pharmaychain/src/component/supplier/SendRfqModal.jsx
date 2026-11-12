import { useState, useEffect } from 'react';
import { useSendRfq } from '../../hooks/rfq/useRfq';

export default function SendRfqModal({ show, onHide, supplier, supplierSelectMode = false, preselectedProposalId = null, onSuccess }) {
  // Two-step flow: compose the email first ("form"), then pick the suppliers to
  // invite in a popup ("suppliers") once the email is confirmed.
  const [step, setStep] = useState('form');

  const {
    proposals,
    loading,
    submitting,
    error,
    setError,
    selectedProposalId,
    setSelectedProposalId,
    subject,
    setSubject,
    content,
    setContent,
    proposalSuppliers,
    proposalSuppliersLoading,
    selectedSupplierIds,
    toggleSupplier,
    selectAllSuppliers,
    clearSuppliers,
    emailWarning,
    setEmailWarning,
    fetchProposals,
    fetchProposalSuppliers,
    handleSubmit,
    resetForm,
  } = useSendRfq(supplier, preselectedProposalId);

  useEffect(() => {
    if (!show) return;
    // Clear any warning from a previous send so it is not shown for a new supplier.
    setEmailWarning(null);
    setStep('form');
    fetchProposals();
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
  }, [show, supplier, preselectedProposalId, fetchProposals, setSubject, setContent, setEmailWarning, setSelectedProposalId]);

  const handleClose = () => {
    resetForm();
    setStep('form');
    onHide();
  };

  // Step 1 -> 2: validate the email, then load suppliers for the chosen proposal.
  const handleConfirm = async () => {
    if (!selectedProposalId) {
      setError('Vui lòng chọn đề xuất mua hàng');
      return;
    }
    if (!subject.trim()) {
      setError('Vui lòng nhập tiêu đề email');
      return;
    }
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung email');
      return;
    }
    setError(null);
    clearSuppliers();
    await fetchProposalSuppliers(selectedProposalId);
    setStep('suppliers');
  };

  // Step 2: send the RFQ email to every selected supplier.
  const handleSend = async () => {
    const result = await handleSubmit();
    if (result?.success) {
      if (onSuccess) {
        onSuccess(result.emailWarning);
      }
      // Keep the popup open when the email could not be delivered so the warning
      // stays visible; the RFQ itself has already been created.
      if (!result.emailWarning) {
        onHide();
      } else {
        // Refresh statuses so already-invited suppliers become locked.
        clearSuppliers();
        await fetchProposalSuppliers(selectedProposalId);
      }
    }
  };

  const renderAlerts = () => (
    <>
      {error && (
        <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    </>
  );

  const selectableCount = proposalSuppliers.filter((s) => !s.rfqSent).length;

  if (!show) return null;

  return (
    <div
      className="pms-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) handleClose();
      }}
    >
      {/* Step 1: compose the RFQ email */}
      <div className="pms-modal" style={{ maxWidth: 640 }}>
        <div className="pms-modal-header">
          <div>
            <div className="pms-modal-title">Gửi Yêu Cầu Báo Giá (RFQ)</div>
            <div className="pms-modal-sub">
              Soạn thảo email, sau đó chọn nhà cung cấp để gửi liên kết báo giá trực tuyến
            </div>
          </div>
          <button
            className="pms-modal-close"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Đóng"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await handleConfirm();
          }}
          style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}
        >
          <div className="pms-modal-body" style={{ flex: 1, overflowY: 'auto' }}>
            {renderAlerts()}

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
              Xác nhận
            </button>
          </div>
        </form>
      </div>

      {/* Step 2: supplier selection popup */}
      {step === 'suppliers' && (
        <div
          className="pms-modal-overlay"
          style={{ zIndex: 1100 }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) setStep('form');
          }}
        >
          <div className="pms-modal pms-modal-lg">
            <div className="pms-modal-header">
              <div>
                <div className="pms-modal-title">Chọn Nhà Cung Cấp Gửi RFQ</div>
                <div className="pms-modal-sub">
                  Tick chọn nhà cung cấp cần gửi yêu cầu báo giá cho đề xuất đã chọn
                </div>
              </div>
              <button
                className="pms-modal-close"
                onClick={() => setStep('form')}
                disabled={submitting}
                aria-label="Đóng"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="pms-modal-body" style={{ overflowY: 'auto' }}>
              {renderAlerts()}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 12, flexWrap: 'wrap' }}>
                <div className="pms-form-hint" style={{ margin: 0 }}>
                  Đã chọn{' '}
                  <strong style={{ color: 'var(--brand-primary, #059669)' }}>{selectedSupplierIds.length}</strong>{' '}
                  nhà cung cấp
                  {selectableCount > 0 ? ` (còn ${selectableCount} có thể gửi)` : ''}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn-pms btn-pms-secondary"
                    style={{ fontSize: 12, padding: '4px 10px' }}
                    onClick={selectAllSuppliers}
                    disabled={proposalSuppliersLoading || selectableCount === 0}
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

              <div className="pms-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="pms-table-wrap" style={{ maxHeight: 360, overflowY: 'auto' }}>
                  <table className="pms-table">
                    <thead>
                      <tr>
                        <th style={{ width: 44 }} />
                        <th style={{ width: 140 }}>MÃ NCC</th>
                        <th>TÊN NHÀ CUNG CẤP</th>
                        <th style={{ width: 150 }}>TRẠNG THÁI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposalSuppliersLoading ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                            Đang tải danh sách nhà cung cấp...
                          </td>
                        </tr>
                      ) : proposalSuppliers.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                            Không có nhà cung cấp nào đang hoạt động.
                          </td>
                        </tr>
                      ) : (
                        proposalSuppliers.map((s) => {
                          const checked = selectedSupplierIds.includes(String(s.id));
                          const alreadySent = s.rfqSent === true;
                          return (
                            <tr
                              key={s.id}
                              style={{ background: checked ? 'var(--brand-primary-light, #ecfdf5)' : 'transparent' }}
                            >
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={alreadySent || submitting}
                                  onChange={() => toggleSupplier(s.id)}
                                />
                              </td>
                              <td>
                                <span className="mono fw-700" style={{ fontSize: 13 }}>{s.code}</span>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
                                {s.email && (
                                  <div className="text-muted-color" style={{ fontSize: 12 }}>{s.email}</div>
                                )}
                              </td>
                              <td>
                                {alreadySent ? (
                                  <span className="pms-badge pms-badge-success" title={s.rfqCode ? `RFQ: ${s.rfqCode}` : undefined}>
                                    Đã gửi RFQ
                                  </span>
                                ) : (
                                  <span className="pms-badge pms-badge-neutral">Chưa gửi</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pms-form-hint" style={{ marginTop: 10 }}>
                Nhà cung cấp đã được gửi RFQ cho đề xuất này sẽ bị khóa để tránh gửi trùng.
              </div>
            </div>

            <div className="pms-modal-footer" style={{ flexShrink: 0 }}>
              <button
                type="button"
                className="btn-pms btn-pms-ghost"
                onClick={() => setStep('form')}
                disabled={submitting}
              >
                Quay lại
              </button>
              <button
                type="button"
                className="btn-pms btn-pms-primary"
                onClick={handleSend}
                disabled={submitting || proposalSuppliersLoading || selectedSupplierIds.length === 0}
              >
                {submitting ? (
                  <>
                    <div className="pms-spinner" style={{ width: 14, height: 14, marginRight: 8 }} />
                    Đang gửi…
                  </>
                ) : (
                  `Gửi RFQ (${selectedSupplierIds.length})`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
