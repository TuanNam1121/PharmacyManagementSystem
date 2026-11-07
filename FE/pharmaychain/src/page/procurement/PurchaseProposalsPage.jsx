import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/format';
import {
  createPurchaseProposal,
  getPurchaseProposals,
  getPurchaseProposalDetail,
  approvePurchaseProposal,
  rejectPurchaseProposal,
} from '../../api/PurchaseProposalAPI';
import PurchaseProposalCreateModal from '../../component/procurement/PurchaseProposalCreateModal';
import PurchaseProposalDetailModal from '../../component/procurement/PurchaseProposalDetailModal';
import PurchaseProposalRejectModal from '../../component/procurement/PurchaseProposalRejectModal';
import SendRfqModal from '../../component/supplier/SendRfqModal';

function Pagination({ total, page, size, onPage }) {
  if (total <= size) return null;
  const totalPages = Math.ceil(total / size);
  return (
    <div className="pms-pagination">
      <button className="pms-page-btn" disabled={page === 0} onClick={() => onPage(page - 1)}>‹</button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
        <button key={i} className={`pms-page-btn ${page === i ? 'active' : ''}`} onClick={() => onPage(i)}>{i + 1}</button>
      ))}
      {totalPages > 7 && <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>}
      <button className="pms-page-btn" disabled={page + 1 >= totalPages} onClick={() => onPage(page + 1)}>›</button>
    </div>
  );
}

export default function PurchaseProposalsPage() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const [sendRfqModalOpen, setSendRfqModalOpen] = useState(false);
  const [selectedProposalForRfq, setSelectedProposalForRfq] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPurchaseProposals({ page, size, search, status });
      setList(res?.content || []);
      setTotal(res?.totalElements ?? 0);
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách đề xuất mua hàng');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, status]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleCreateSubmit = async (payload) => {
    setCreateLoading(true);
    setError(null);
    try {
      const res = await createPurchaseProposal(payload);
      setSuccessMsg(`Đề xuất mua hàng ${res?.code || ''} đã được tạo thành công!`);
      setCreateModalOpen(false);
      await fetchList();
    } catch (err) {
      setError(err?.message || 'Tạo đề xuất mua hàng thất bại');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenDetail = async (id) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    try {
      const res = await getPurchaseProposalDetail(id);
      setSelectedDetail(res);
    } catch (err) {
      setError(err?.message || 'Không thể tải chi tiết đề xuất mua hàng');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async (row) => {
    setActionLoadingId(row.id);
    setError(null);
    try {
      await approvePurchaseProposal(row.id);
      setSuccessMsg(`Đề xuất mua hàng ${row.code || ''} đã được phê duyệt!`);
      await fetchList();
    } catch (err) {
      setError(err?.message || 'Phê duyệt đề xuất mua hàng thất bại');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenReject = (row) => {
    setRejectTarget(row);
    setRejectReason('');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectTarget) return;
    setRejectSubmitting(true);
    setError(null);
    try {
      await rejectPurchaseProposal(rejectTarget.id, rejectReason);
      setSuccessMsg(`Đã từ chối đề xuất mua hàng ${rejectTarget.code || ''}.`);
      setRejectTarget(null);
      setRejectReason('');
      await fetchList();
    } catch (err) {
      setError(err?.message || 'Từ chối đề xuất mua hàng thất bại');
    } finally {
      setRejectSubmitting(false);
    }
  };

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: '0', label: 'Đã lập đề xuất' },
    { value: '1', label: 'Chờ phê duyệt' },
    { value: '2', label: 'Đã phê duyệt' },
    { value: '3', label: 'Đã từ chối' },
    { value: '5', label: 'Hoàn tất' },
  ];

  const getStatusBadge = (statusCode, statusText) => {
    const s = Number(statusCode);
    if (s === 2) return <span className="pms-badge pms-badge-success">Đã phê duyệt</span>;
    if (s === 1) return <span className="pms-badge pms-badge-warning">Chờ phê duyệt</span>;
    if (s === 3) return <span className="pms-badge pms-badge-danger">Đã từ chối</span>;
    if (s === 4) return <span className="pms-badge pms-badge-info">Nhập một phần</span>;
    if (s === 5) return <span className="pms-badge pms-badge-success">Hoàn tất</span>;
    if (s === 6) return <span className="pms-badge pms-badge-danger">Đã hủy</span>;
    return <span className="pms-badge pms-badge-info">{statusText || 'Đã lập đề xuất'}</span>;
  };

  return (
    <div className="pms-page">
      <div className="pms-page-header">
        <div>
          <h1 className="pms-page-title">Đề Xuất Mua Hàng</h1>
          <p className="pms-page-sub">Tổng hợp yêu cầu mua hàng từ kho thành phương án mua và sẵn sàng chào giá RFQ</p>
        </div>
        <button
          className="btn-pms btn-pms-primary"
          onClick={() => setCreateModalOpen(true)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tạo Đề Xuất Mua Hàng
        </button>
      </div>

      {successMsg && (
        <div className="pms-alert pms-alert-success">
          ✓ {successMsg}
          <button className="pms-alert-close" onClick={() => setSuccessMsg(null)}>✕</button>
        </div>
      )}

      {error && (
        <div className="pms-alert pms-alert-danger">
          ⚠ {error}
          <button className="pms-alert-close" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="pms-filters-bar">
        <div className="pms-input-wrap" style={{ flex: 1, maxWidth: 360 }}>
          <span className="pms-input-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className="pms-input"
            type="text"
            placeholder="Tìm theo mã đề xuất hoặc mã yêu cầu mua…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>

        <select
          className="pms-select"
          style={{ width: 180 }}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          Tổng cộng: <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> đề xuất
        </span>
      </div>

      <div className="pms-card">
        <div className="pms-card-body" style={{ padding: 0 }}>
          <div className="pms-table-wrap">
            <table className="pms-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>STT</th>
                  <th>Mã Đề Xuất</th>
                  <th>Yêu Cầu Mua Hàng Liên Kết</th>
                  <th>Trạng Thái</th>
                  <th>Ngày Lập</th>
                  <th style={{ width: 130, textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      Đang tải danh sách đề xuất...
                    </td>
                  </tr>
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      Không tìm thấy đề xuất mua hàng nào.
                    </td>
                  </tr>
                ) : (
                  list.map((row, i) => (
                    <tr key={row.id || i}>
                      <td className="text-xs text-muted-color">{page * size + i + 1}</td>
                      <td><span className="mono fw-700" style={{ fontSize: 13 }}>{row.code}</span></td>
                      <td>{row.purchaseRequests && row.purchaseRequests.length > 0
                        ? row.purchaseRequests.map((r) => r.code).join(', ')
                        : '—'}</td>
                      <td>
                        {getStatusBadge(row.status, row.statusText)}
                      </td>
                      <td className="text-sm text-muted-color">{formatDate(row.createdAt)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                          {Number(row.status) === 0 && (
                            <button
                              className="pms-icon-btn edit"
                              style={{ color: 'var(--brand-primary)' }}
                              onClick={() => {
                                setSelectedProposalForRfq(row.id);
                                setSendRfqModalOpen(true);
                              }}
                              title="Tạo yêu cầu báo giá RFQ gửi nhà cung cấp"
                              aria-label="Tạo RFQ báo giá"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                              </svg>
                            </button>
                          )}
                          <button
                            className="pms-icon-btn view"
                            onClick={() => handleOpenDetail(row.id)}
                            title="Xem chi tiết đề xuất"
                            aria-label="Xem chi tiết"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <Pagination total={total} page={page} size={size} onPage={setPage} />
      </div>

      <PurchaseProposalCreateModal
        show={createModalOpen}
        onHide={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        loading={createLoading}
      />
      <PurchaseProposalDetailModal
        show={detailModalOpen}
        onHide={() => { setDetailModalOpen(false); setSelectedDetail(null); }}
        detail={selectedDetail}
        loading={detailLoading}
      />
      <SendRfqModal
        show={sendRfqModalOpen}
        onHide={() => { setSendRfqModalOpen(false); setSelectedProposalForRfq(null); }}
        supplierSelectMode
        preselectedProposalId={selectedProposalForRfq}
        onSuccess={() => {
          setSuccessMsg('Gửi yêu cầu báo giá RFQ thành công!');
          fetchList();
        }}
      />
    </div>
  );
}
