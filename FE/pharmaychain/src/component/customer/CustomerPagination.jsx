export default function CustomerPagination({
  total = 0,
  page = 0,
  size = 10,
  onPageChange,
  onSizeChange,
}) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / size));
  const startItem = page * size + 1;
  const endItem = Math.min((page + 1) * size, total);

  // Calculate visible page buttons (max 5 page buttons around current page)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return { pages, hasStartEllipsis: start > 0, hasEndEllipsis: end < totalPages - 1 };
  };

  const { pages, hasStartEllipsis, hasEndEllipsis } = getPageNumbers();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '12px 4px',
        marginTop: 8,
      }}
    >
      {/* Items range info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
        <span>
          Hiển thị <strong style={{ color: 'var(--text-primary)' }}>{startItem}</strong> -{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{endItem}</strong> trong tổng số{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> khách hàng
        </span>

        {/* Page size selector */}
        {onSizeChange && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
            <span>Số dòng:</span>
            <select
              className="pms-select"
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              style={{ padding: '3px 8px', fontSize: 12, height: 28 }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      <div className="pms-pagination" style={{ margin: 0 }}>
        {/* First page */}
        <button
          className="pms-page-btn"
          disabled={page === 0}
          onClick={() => onPageChange(0)}
          title="Trang đầu"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="11 17 6 12 11 7" />
            <polyline points="18 17 13 12 18 7" />
          </svg>
        </button>

        {/* Previous page */}
        <button
          className="pms-page-btn"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          title="Trang trước"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {hasStartEllipsis && (
          <>
            <button className="pms-page-btn" onClick={() => onPageChange(0)}>
              1
            </button>
            <span style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 12 }}>…</span>
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            className={`pms-page-btn ${page === p ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p + 1}
          </button>
        ))}

        {hasEndEllipsis && (
          <>
            <span style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 12 }}>…</span>
            <button className="pms-page-btn" onClick={() => onPageChange(totalPages - 1)}>
              {totalPages}
            </button>
          </>
        )}

        {/* Next page */}
        <button
          className="pms-page-btn"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
          title="Trang tiếp"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Last page */}
        <button
          className="pms-page-btn"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(totalPages - 1)}
          title="Trang cuối"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="13 17 18 12 13 7" />
            <polyline points="6 17 11 12 6 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
