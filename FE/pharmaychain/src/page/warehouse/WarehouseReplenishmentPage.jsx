import { useState, useEffect, useCallback } from 'react';
import { formatDate } from '../../utils/format';
import {
  getReplenishmentRequests,
  getReplenishmentRequestDetail,
  approveReplenishmentRequest,
  rejectReplenishmentRequest,
  confirmGoodsDispatch,
} from '../../api/WarehouseInventoryAPI';
import WarehouseReplenishmentDetailModal from '../../component/warehouse/WarehouseReplenishmentDetailModal';
import WarehouseDispatchModal from '../../component/warehouse/WarehouseDispatchModal';

export default function WarehouseReplenishmentPage() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedForDispatch, setSelectedForDispatch] = useState(null);
  const [dispatchLoading, setDispatchLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReplenishmentRequests({
        page,
        size,
        search,
        status: status !== '' ? status : undefined,
      });
      setList(res?.content || []);
      setTotal(res?.totalElements ?? 0);
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách yêu cầu điều chuyển từ chi nhánh');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, status]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // View detail
  const handleOpenDetail = async (id) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    try {
      const res = await getReplenishmentRequestDetail(id);
      setSelectedDetail(res);
    } catch (err) {
      setError(err?.message || 'Không thể tải chi tiết yêu cầu');
    } finally {
      setDetailLoading(false);
    }
  };

  // UC #50: Approve
  const handleApprove = async (id) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await approveReplenishmentRequest(id);
      setSuccessMsg(`Đã phê duyệt yêu cầu điều phối ${res?.code || ''} thành công!`);
      setSelectedDetail(res);
      await fetchList();
    } catch (err) {
      setError(err?.message || 'Lỗi khi phê duyệt yêu cầu điều phối');
    } finally {
      setActionLoading(false);
    }
  };

  // UC #51: Reject
  const handleReject = async (id, reason) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await rejectReplenishmentRequest(id, reason);
      setSuccessMsg(`Đã từ chối yêu cầu điều phối ${res?.code || ''}.`);
      setSelectedDetail(res);
      await fetchList();
    } catch (err) {
      setError(err?.message || 'Lỗi khi từ chối yêu cầu điều phối');
    } finally {
      setActionLoading(false);
    }
  };

  // UC #52: Dispatch
  const handleOpenDispatch = (item) => {
    setSelectedForDispatch(item);
    setDispatchModalOpen(true);
  };

  const handleConfirmDispatch = async (id, payload) => {
    setDispatchLoading(true);
    setError(null);
    try {
      const issue = await confirmGoodsDispatch(id, payload);
      setSuccessMsg(`Đã tạo phiếu xuất kho #${issue?.code || ''} thành công! Kho đã trừ tồn và bắt đầu giao vận.`);
      setDispatchModalOpen(false);
      setSelectedForDispatch(null);
      await fetchList();
      if (detailModalOpen && selectedDetail?.id === id) {
        setDetailModalOpen(false);
      }
    } catch (err) {
      setError(err?.message || 'Lỗi khi xuất kho điều chuyển');
    } finally {
      setDispatchLoading(false);
    }
  };

  const totalPages = Math.ceil(total / size);

  return (
    <div>
      {/* Page Header */}
      <div className="pms-page-header">
        <div>
          <h1 className="pms-page-title">Điều Phối Bổ Sung & Xuất Kho Chi Nhánh</h1>
          <p className="pms-page-sub">
            Tiếp nhận phiếu đề xuất lĩnh thuốc từ các nhà thuốc chi nhánh, phê duyệt số lượng và xuất kho giao hàng theo chuẩn FEFO
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="pms-alert pms-alert-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {successMsg}
          <button className="pms-alert-close" onClick={() => setSuccessMsg(null)}>✕</button>
        </div>
      )}
      {error && (
        <div className="pms-alert pms-alert-danger">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
          <button className="pms-alert-close" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="pms-filters-bar">
        <div className="pms-input-wrap" style={{ flex: 1, maxWidth: 360 }}>
          <span className="pms-input-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            className="pms-input"
            type="text"
            placeholder="Tìm theo mã yêu cầu hoặc tên chi nhánh…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="pms-select"
          style={{ width: 220 }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="1">Chờ xét duyệt</option>
          <option value="2">Đã phê duyệt (Sẵn sàng xuất kho)</option>
          <option value="3">Đã từ chối</option>
          <option value="4">Đã xuất kho / Đang giao</option>
          <option value="5">Đã nhận hàng (Hoàn tất)</option>
          <option value="0">Bản nháp</option>
        </select>

        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> yêu cầu chi nhánh
        </span>
      </div>

      {/* Requisitions List Table */}
      {loading ? (
        <div className="pms-card">
          <div className="pms-spinner-wrap">
            <div className="pms-spinner" />
            <span className="pms-spinner-text">Đang tải danh sách yêu cầu bổ sung hàng…</span>
          </div>
        </div>
      ) : list.length === 0 ? (
        <div className="pms-card">
          <div className="pms-empty">
            <div className="pms-empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div className="pms-empty-title">Không tìm thấy yêu cầu điều chuyển nào</div>
            <div className="pms-empty-sub">Các chi nhánh chưa gửi yêu cầu xin bổ sung tồn kho phù hợp với bộ lọc.</div>
          </div>
        </div>
      ) : (
        <div className="pms-card">
          <div className="pms-table-wrap">
            <table className="pms-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Mã Đề Xuất</th>
                  <th>Chi Nhánh Yêu Cầu</th>
                  <th>Ngày Yêu Cầu</th>
                  <th>Người Yêu Cầu</th>
                  <th>Trạng Thái</th>
                  <th style={{ width: 140, textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row, i) => {
                  const isPending = row.status === 1 || row.status === 0 || row.statusText === 'Chờ xét duyệt' || row.statusText === 'Bản nháp' || row.statusText === 'Submitted';
                  const isApproved = row.status === 2 || row.statusText === 'Đã phê duyệt' || row.statusText === 'Approved';
                  const isRejected = row.status === 3 || row.statusText === 'Đã từ chối' || row.statusText === 'Rejected';
                  const isDispatched = row.status === 4 || row.statusText === 'Đã xuất kho / Đang giao' || row.statusText === 'Dispatched';
                  const isReceived = row.status === 5 || row.statusText === 'Đã nhận hàng';

                  return (
                    <tr key={row.id || i}>
                      <td className="text-xs text-muted-color">{page * size + i + 1}</td>
                      <td>
                        <span className="mono fw-700" style={{ fontSize: 13 }}>{row.code}</span>
                      </td>
                      <td>
                        <div className="fw-600" style={{ fontSize: 13 }}>{row.storeName || 'Chi nhánh'}</div>
                      </td>
                      <td className="text-sm text-muted-color">{formatDate(row.createdAt)}</td>
                      <td className="text-sm text-muted-color">{row.createdByUsername || '—'}</td>
                      <td>
                        <span className={`pms-badge ${isApproved ? 'pms-badge-success' : isRejected ? 'pms-badge-danger' : isDispatched ? 'pms-badge-info' : isReceived ? 'pms-badge-neutral' : 'pms-badge-warning'}`}>
                          {row.status === 2 ? 'Đã phê duyệt' : row.status === 3 ? 'Đã từ chối' : row.status === 4 ? 'Đã xuất kho / Đang giao' : row.status === 5 ? 'Đã nhận hàng' : 'Chờ xét duyệt'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                          {isPending && (
                            <button
                              className="btn-pms btn-pms-sm btn-pms-primary"
                              title="Phê duyệt đề xuất"
                              onClick={() => handleApprove(row.id)}
                              disabled={actionLoading}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Duyệt
                            </button>
                          )}

                          {isApproved && (
                            <button
                              className="btn-pms btn-pms-sm btn-pms-primary"
                              title="Xuất kho hàng (Tạo phiếu xuất)"
                              onClick={() => handleOpenDispatch(row)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                              </svg>
                              Xuất kho
                            </button>
                          )}

                          <button
                            className="btn-pms btn-pms-sm btn-pms-secondary"
                            title="Xem chi tiết phiếu yêu cầu"
                            onClick={() => handleOpenDetail(row.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > size && (
        <div className="pms-pagination">
          <button className="pms-page-btn" disabled={page === 0} onClick={() => setPage(page - 1)}>
            ‹
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
            <button key={i} className={`pms-page-btn ${page === i ? 'active' : ''}`} onClick={() => setPage(i)}>
              {i + 1}
            </button>
          ))}
          <button className="pms-page-btn" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
            ›
          </button>
        </div>
      )}

      {/* Modals */}
      <WarehouseReplenishmentDetailModal
        show={detailModalOpen}
        onHide={() => { setDetailModalOpen(false); setSelectedDetail(null); }}
        detail={selectedDetail}
        loading={detailLoading}
        onApprove={handleApprove}
        onReject={handleReject}
        onOpenDispatch={handleOpenDispatch}
        actionLoading={actionLoading}
      />
      <WarehouseDispatchModal
        show={dispatchModalOpen}
        onHide={() => { setDispatchModalOpen(false); setSelectedForDispatch(null); }}
        requisition={selectedForDispatch}
        onConfirm={handleConfirmDispatch}
        loading={dispatchLoading}
      />
    </div>
  );
}
