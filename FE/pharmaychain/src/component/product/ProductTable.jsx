import { money, getInitials } from '../../utils/format';

export default function ProductTable({
  data = [],
  loading = false,
  page = 0,
  size = 10,
  onView,
  onEdit,
  onUpdatePrice,
  onToggleStatus,
}) {
  if (loading) {
    return (
      <div className="pms-card">
        <div className="pms-spinner-wrap">
          <div className="pms-spinner" />
          <span className="pms-spinner-text">Loading catalog products…</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="pms-card">
        <div className="pms-empty">
          <div className="pms-empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div className="pms-empty-title">No products found</div>
          <div className="pms-empty-sub">No products matched your search or filter criteria.</div>
        </div>
      </div>
    );
  }

  const renderStatusBadge = (status) => {
    const s = Number(status);
    if (s === 1) {
      return (
        <span className="pms-badge pms-badge-success">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
          </svg>
          Active
        </span>
      );
    }
    if (s === 2) {
      return (
        <span className="pms-badge pms-badge-neutral">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
          </svg>
          Discontinued
        </span>
      );
    }
    return (
      <span className="pms-badge pms-badge-danger">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
        Inactive
      </span>
    );
  };

  return (
    <div className="pms-card">
      <div className="pms-table-wrap">
        <table className="pms-table">
          <thead>
            <tr>
              <th style={{ width: 44 }}>#</th>
              <th style={{ width: 56 }}>Avatar</th>
              <th>Product Info</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Pricing (Sell / Cost)</th>
              <th>Type</th>
              <th>Min Stock</th>
              <th>Status</th>
              <th className="text-right" style={{ width: 148 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const isRx = row.isPrescription === true;
              const isActive = Number(row.status) === 1;

              return (
                <tr key={row.id || i}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {page * size + i + 1}
                  </td>

                  {/* Avatar / Thumbnail (UC15 / Req 5) */}
                  <td style={{ width: 56 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 8,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-color)',
                        background: '#f8fafc',
                      }}
                    >
                      {row.imageUrl ? (
                        <img
                          src={row.imageUrl}
                          alt={row.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextSibling) {
                              e.currentTarget.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div
                        style={{
                          display: row.imageUrl ? 'none' : 'flex',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))',
                          color: 'var(--brand-primary)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {getInitials(row.name)}
                      </div>
                    </div>
                  </td>

                  {/* Product Info */}
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13.5 }}>
                        {row.name}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
                        {row.barcode && (
                          <span className="pms-badge pms-badge-neutral mono" style={{ fontSize: 10.5 }}>
                            {row.barcode}
                          </span>
                        )}
                        {row.manufacturer && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {row.manufacturer}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {row.categoryName || '—'}
                    </span>
                  </td>

                  {/* Unit */}
                  <td>
                    <span className="pms-badge pms-badge-neutral" style={{ fontSize: 11.5 }}>
                      {row.unit || '—'}
                    </span>
                  </td>

                  {/* Pricing */}
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                      {money(row.sellingPrice)}
                    </div>
                    {row.costPrice != null && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                        Cost: {money(row.costPrice)}
                      </div>
                    )}
                  </td>

                  {/* Prescription */}
                  <td>
                    {isRx ? (
                      <span className="pms-badge pms-badge-warning">Rx</span>
                    ) : (
                      <span className="pms-badge pms-badge-neutral">OTC</span>
                    )}
                  </td>

                  {/* Stock Min */}
                  <td>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {row.minQuantity ?? '—'}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    {renderStatusBadge(row.status)}
                  </td>

                  {/* Actions */}
                  <td className="text-right">
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {/* View */}
                      <button
                        className="btn-pms btn-pms-ghost btn-pms-sm"
                        title="Xem chi tiết sản phẩm"
                        onClick={() => onView(row.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>

                      {/* Set / Update Price (Req 1) */}
                      <button
                        className="btn-pms btn-pms-ghost btn-pms-sm"
                        style={{ color: 'var(--brand-primary)' }}
                        title="Cập nhật giá sản phẩm (Set/Update Price)"
                        onClick={() => onUpdatePrice && onUpdatePrice(row)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23"/>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                      </button>

                      {/* Edit */}
                      <button
                        className="btn-pms btn-pms-ghost btn-pms-sm"
                        title="Chỉnh sửa thông tin chung"
                        onClick={() => onEdit(row)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>

                      {/* Inactive / Activate Product (Req 3) */}
                      <button
                        className={`btn-pms btn-pms-sm ${isActive ? 'btn-pms-ghost' : 'btn-pms-outline'}`}
                        style={{ color: isActive ? 'var(--status-danger)' : 'var(--brand-primary)' }}
                        title={isActive ? 'Vô hiệu hóa sản phẩm (Inactive)' : 'Kích hoạt lại sản phẩm (Active)'}
                        onClick={() => onToggleStatus && onToggleStatus(row)}
                      >
                        {isActive ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
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
  );
}
