import { useState, useEffect, useCallback } from 'react';
import { fetchAuditLogs } from '../../api/auditLogApi';

const ACTION_MAP = {
  1: { label: 'ĐĂNG NHẬP', cls: 'pms-badge pms-badge-info' },
  2: { label: 'CẬP NHẬT / DUYỆT', cls: 'pms-badge pms-badge-success' },
  3: { label: 'KIỂM TOÁN', cls: 'pms-badge pms-badge-warning' },
  4: { label: 'ĐĂNG XUẤT', cls: 'pms-badge pms-badge-neutral' },
  5: { label: 'XÓA BẢN GHI', cls: 'pms-badge pms-badge-danger' },
};

export default function AuditLogPage() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(15);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [entityName, setEntityName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Detail Modal for old / new values
  const [selectedLog, setSelectedLog] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAuditLogs({
        search,
        action: action !== '' ? action : undefined,
        entityName: entityName !== '' ? entityName : undefined,
        page,
        size,
      });
      setList(res?.content || []);
      setTotal(res?.totalElements ?? 0);
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách nhật ký kiểm toán');
    } finally {
      setLoading(false);
    }
  }, [search, action, entityName, page, size]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReset = () => {
    setSearch('');
    setAction('');
    setEntityName('');
    setPage(0);
  };

  const totalPages = Math.ceil(total / size);

  return (
    <div className="pms-page-container">
      {/* Header */}
      <div className="pms-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Nhật ký kiểm toán hệ thống</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
            Theo dõi và kiểm toán các sự kiện an ninh, đăng nhập, đối soát doanh thu POS, duyệt đơn mua hàng và biến động kho.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="pms-btn pms-btn-secondary" onClick={loadData} disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Làm mới
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="pms-filter-card" style={{
        background: 'var(--bg-surface, #ffffff)',
        padding: '16px 20px',
        borderRadius: 12,
        border: '1px solid var(--border-color, #e2e8f0)',
        marginBottom: 20,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center'
      }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <input
            type="text"
            className="pms-input"
            placeholder="Tìm theo IP, đối tượng, nội dung..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            style={{ width: '100%', paddingLeft: 32 }}
          />
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted, #94a3b8)"
            strokeWidth="2"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <div style={{ minWidth: 180 }}>
          <select
            className="pms-input"
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(0); }}
          >
            <option value="">Tất cả hành động</option>
            <option value="1">Đăng nhập (LOGIN)</option>
            <option value="2">Cập nhật / Duyệt (UPDATE)</option>
            <option value="3">Kiểm toán kho (AUDIT)</option>
            <option value="4">Đăng xuất (LOGOUT)</option>
            <option value="5">Xóa dữ liệu (DELETE)</option>
          </select>
        </div>

        <div style={{ minWidth: 180 }}>
          <select
            className="pms-input"
            value={entityName}
            onChange={(e) => { setEntityName(e.target.value); setPage(0); }}
          >
            <option value="">Tất cả phân hệ tác động</option>
            <option value="AUTH">Xác thực tài khoản (AUTH)</option>
            <option value="BRANCH_INVENTORY">Tồn kho chi nhánh (BRANCH_INVENTORY)</option>
            <option value="DAILY_SALES">Đối soát doanh thu (DAILY_SALES)</option>
            <option value="GOODS_RECEIPT">Nhận hàng chi nhánh (GOODS_RECEIPT)</option>
            <option value="INVENTORY_AUDIT">Kiểm kê kho (INVENTORY_AUDIT)</option>
            <option value="PURCHASE_ORDER">Đơn mua hàng (PURCHASE_ORDER)</option>
            <option value="ACCOUNT_PROFILE">Hồ sơ cá nhân (ACCOUNT_PROFILE)</option>
          </select>
        </div>

        <button className="pms-btn pms-btn-ghost" onClick={handleReset}>
          Đặt lại
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="pms-alert pms-alert-danger" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Table Card */}
      <div style={{
        background: 'var(--bg-surface, #ffffff)',
        borderRadius: 12,
        border: '1px solid var(--border-color, #e2e8f0)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="pms-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle, #f8fafc)', textAlign: 'left', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Thời gian</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Người thực hiện</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Hành động</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Phân hệ tác động</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Mã bản ghi</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Địa chỉ IP</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
                    Đang nạp nhật ký kiểm toán...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                    Không có bản ghi nhật ký kiểm toán nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                list.map((row) => {
                  const act = ACTION_MAP[row.action] || { label: row.actionName || `Hành động ${row.action}`, cls: 'pms-badge' };
                  const dtStr = row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '—';
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        {dtStr}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.fullName || row.username || 'Hệ thống'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.role || (row.username ? `@${row.username}` : 'N/A')}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={act.cls}>{act.label}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <code style={{ background: 'var(--bg-subtle, #f1f5f9)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
                          {row.entityName}
                        </code>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {row.entityId ?? '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>
                        {row.ipAddress || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          className="pms-btn pms-btn-secondary"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                          onClick={() => setSelectedLog(row)}
                        >
                          Xem thay đổi
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Hiển thị {list.length} trên tổng số {total} bản ghi (Trang {page + 1}/{totalPages})
            </span>
            <div className="pms-pagination" style={{ display: 'flex', gap: 4 }}>
              <button className="pms-page-btn" disabled={page === 0} onClick={() => setPage(page - 1)}>
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button
                  key={i}
                  className={`pms-page-btn ${page === i ? 'active' : ''}`}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </button>
              ))}
              <button className="pms-page-btn" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details / Diff Modal */}
      {selectedLog && (
        <div className="pms-modal-backdrop" onClick={() => setSelectedLog(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="pms-modal-card" onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--bg-surface, #ffffff)', width: '90%', maxWidth: 640, borderRadius: 16, padding: 24, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Chi tiết nhật ký kiểm toán #{selectedLog.id}</h3>
              <button className="pms-btn pms-btn-ghost" onClick={() => setSelectedLog(null)}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, fontSize: 13 }}>
              <div><strong>Người thực hiện:</strong> {selectedLog.fullName || selectedLog.username || 'Hệ thống'}</div>
              <div><strong>Hành động:</strong> {selectedLog.actionName}</div>
              <div><strong>Phân hệ:</strong> {selectedLog.entityName} #{selectedLog.entityId ?? '—'}</div>
              <div><strong>Địa chỉ IP:</strong> {selectedLog.ipAddress || '—'}</div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong>Thời gian:</strong> {selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString('vi-VN') : '—'}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <strong style={{ fontSize: 12, color: 'var(--text-secondary)' }}>TRẠNG THÁI TRƯỚC (DỮ LIỆU CŨ):</strong>
              <pre style={{
                background: 'var(--bg-subtle, #f8fafc)',
                padding: 12,
                borderRadius: 8,
                fontSize: 12,
                maxHeight: 140,
                overflowY: 'auto',
                border: '1px solid var(--border-color, #e2e8f0)',
                marginTop: 4,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {selectedLog.oldValue || '— (Khởi tạo ban đầu / Không có)'}
              </pre>
            </div>

            <div style={{ marginBottom: 16 }}>
              <strong style={{ fontSize: 12, color: 'var(--text-secondary)' }}>TRẠNG THÁI SAU (DỮ LIỆU MỚI):</strong>
              <pre style={{
                background: 'var(--bg-subtle, #f8fafc)',
                padding: 12,
                borderRadius: 8,
                fontSize: 12,
                maxHeight: 140,
                overflowY: 'auto',
                border: '1px solid var(--border-color, #e2e8f0)',
                marginTop: 4,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {selectedLog.newValue || '— (Không thay đổi / N/A)'}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="pms-btn pms-btn-secondary" onClick={() => setSelectedLog(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
