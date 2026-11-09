import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/format';
import {
  getPurchasingStaffPurchaseRequests,
  getPurchasingStaffPurchaseRequestDetail,
  createPurchaseRequest,
} from '../../api/WarehouseInventoryAPI';
import WarehouseCreatePurchaseRequestModal from '../../component/warehouse/WarehouseCreatePurchaseRequestModal';
import WarehousePurchaseRequestDetailModal from '../../component/warehouse/WarehousePurchaseRequestDetailModal';

const getPrStatusBadge = (status, statusText) => {
  switch (Number(status)) {
    case 1:
      return <span className="pms-badge pms-badge-warning">Chờ duyệt</span>;
    case 2:
      return <span className="pms-badge pms-badge-info">Đã lập đề xuất</span>;
    case 3:
      return <span className="pms-badge pms-badge-info">Đang chào giá RFQ</span>;
    case 4:
      return <span className="pms-badge pms-badge-info">Đã chọn báo giá</span>;
    case 5:
      return <span className="pms-badge pms-badge-success">Đã duyệt đơn PO</span>;
    case 6:
      return <span className="pms-badge pms-badge-danger">Đã hủy</span>;
    default:
      return <span className="pms-badge pms-badge-neutral">{statusText || 'Không xác định'}</span>;
  }
};

export default function WarehousePurchaseRequestsPage() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  // Dùng để refresh danh sách thủ công (ví dụ sau khi tạo mới thành công)
  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPurchasingStaffPurchaseRequests({
        page,
        size,
        search,
        status,
      });
      setList(res?.content || []);
      setTotal(res?.totalElements ?? 0);
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách yêu cầu mua hàng');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, status]);

  // Hook nạp dữ liệu chính, giải quyết triệt để lỗi "cascading renders" và race condition
  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPurchasingStaffPurchaseRequests({
          page,
          size,
          search,
          status,
        });
        if (!ignore) {
          setList(res?.content || []);
          setTotal(res?.totalElements ?? 0);
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.message || 'Không thể tải danh sách yêu cầu mua hàng');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [page, size, search, status]);

  const handleOpenDetail = async (id) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    try {
      const res = await getPurchasingStaffPurchaseRequestDetail(id);
      setSelectedDetail(res);
    } catch (err) {
      setError(err?.message || 'Không thể tải chi tiết yêu cầu mua hàng');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateSubmit = async (payload) => {
    setCreateLoading(true);
    setError(null);
    try {
      const creatorId = user?.id || user?.accountId || null;
      const res = await createPurchaseRequest(payload, creatorId);
      setSuccessMsg(`Đã tạo yêu cầu mua sắm ${res?.code || ''} thành công!`);
      setCreateModalOpen(false);
      await fetchList();
    } catch (err) {
      setError(err?.message || 'Lỗi khi tạo yêu cầu mua sắm');
    } finally {
      setCreateLoading(false);
    }
  };

  const totalPages = Math.ceil(total / size);

  return (
    <div>
      {/* Page Header */}
      <div className="pms-page-header">
        <div>
          <h1 className="pms-page-title">Yêu Cầu Mua Hàng & Bổ Sung Kho</h1>
          <p className="pms-page-sub">Gửi và theo dõi các yêu cầu mua thuốc định kỳ để duy trì hạn mức tồn kho kho tổng</p>
        </div>
        <button
          className="btn-pms btn-pms-primary"
          onClick={() => setCreateModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tạo Yêu Cầu Mua Hàng
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="pms-alert pms-alert-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {successMsg}
          <button className="pms-alert-close" onClick={() => setSuccessMsg(null)}>✕</button>
        </div>
      )}
      {error && (
        <div className="pms-alert pms-alert-danger">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
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
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className="pms-input"
            type="text"
            placeholder="Tìm theo mã yêu cầu hoặc lý do…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>

        <select
          className="pms-select"
          style={{ width: 180 }}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="1">Chờ duyệt</option>
          <option value="2">Đã lập đề xuất</option>
          <option value="3">Đang chào giá RFQ</option>
          <option value="4">Đã chọn báo giá</option>
          <option value="5">Đã duyệt đơn PO</option>
          <option value="6">Đã hủy</option>
        </select>

        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> yêu cầu
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="pms-card">
          <div className="pms-spinner-wrap">
            <div className="pms-spinner" />
            <span className="pms-spinner-text">Đang tải danh sách yêu cầu mua sắm…</span>
          </div>
        </div>
      ) : list.length === 0 ? (
        <div className="pms-card">
          <div className="pms-empty">
            <div className="pms-empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              </svg>
            </div>
            <div className="pms-empty-title">Không tìm thấy yêu cầu mua hàng nào</div>
            <div className="pms-empty-sub">Hãy tạo yêu cầu mua hàng đầu tiên để bổ sung tồn kho từ nhà cung cấp.</div>
          </div>
        </div>
      ) : (
        <div className="pms-card">
          <div className="pms-table-wrap">
            <table className="pms-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Mã Yêu Cầu</th>
                  <th>Số Mặt Hàng</th>
                  <th>Trạng Thái</th>
                  <th>Ngày Lập</th>
                  <th>Người Tạo</th>
                  <th style={{ width: 100, textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row, i) => (
                  <tr key={row.id || i}>
                    <td className="text-xs text-muted-color">{page * size + i + 1}</td>
                    <td>
                      <span className="mono fw-700" style={{ fontSize: 13 }}>{row.code}</span>
                    </td>
                    <td>
                      <span className="pms-badge pms-badge-neutral">{row.itemCount || (row.items ? row.items.length : 0)} mặt hàng</span>
                    </td>
                    <td>
                      {getPrStatusBadge(row.status, row.statusText)}
                    </td>
                    <td className="text-sm text-muted-color">{formatDate(row.createdAt)}</td>
                    <td className="text-sm text-muted-color">{row.createdByUsername || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <button
                          className="pms-icon-btn view"
                          onClick={() => handleOpenDetail(row.id)}
                          title="Xem chi tiết yêu cầu"
                          aria-label="Xem chi tiết"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
      <WarehouseCreatePurchaseRequestModal
        show={createModalOpen}
        onHide={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        loading={createLoading}
      />
      <WarehousePurchaseRequestDetailModal
        show={detailModalOpen}
        onHide={() => { setDetailModalOpen(false); setSelectedDetail(null); }}
        detail={selectedDetail}
        loading={detailLoading}
      />
    </div>
  );
}