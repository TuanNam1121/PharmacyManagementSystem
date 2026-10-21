import { formatDate, money, getInitials } from '../../utils/format';

export default function ProductTable({
  data = [],
  loading = false,
  page = 0,
  size = 10,
  onView,
  onEdit,
}) {
  if (loading) {
    return (
      <div className="pms-card">
        <div className="pms-spinner-wrap">
          <div className="pms-spinner" />
          <span className="pms-spinner-text">Loading product catalog…</span>
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
              <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div className="pms-empty-title">No products found</div>
          <div className="pms-empty-sub">No product records matched your search or filter criteria.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pms-card">
      <div className="pms-table-wrap">
        <table className="pms-table">
          <thead>
            <tr>
              <th style={{ width: 44 }}>#</th>
              <th>Product</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Prescription</th>
              <th>Stock Min</th>
              <th>Status</th>
              <th className="text-right" style={{ width: 110 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const isActive = String(row.status) === '1';
              const isRx = row.isPrescription === true;

              return (
                <tr key={row.id || i}>
                  {/* # */}
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {page * size + i + 1}
                  </td>

                  {/* Product */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))',
                          color: 'var(--brand-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 12,
                          flexShrink: 0,
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        {getInitials(row.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13.5 }}>
                          {row.name}
                        </div>
                        {row.barcode && (
                          <div style={{ marginTop: 2 }}>
                            <span className="pms-badge pms-badge-neutral mono" style={{ fontSize: 10.5 }}>
                              {row.barcode}
                            </span>
                          </div>
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

                  {/* Price */}
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
                    {isActive ? (
                      <span className="pms-badge pms-badge-success">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        Active
                      </span>
                    ) : (
                      <span className="pms-badge pms-badge-danger">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="text-right">
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {/* View */}
                      <button
                        className="btn-pms btn-pms-ghost btn-pms-sm"
                        title="View Product Details"
                        onClick={() => onView(row.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>

                      {/* Edit */}
                      <button
                        className="btn-pms btn-pms-ghost btn-pms-sm"
                        title="Edit Product"
                        onClick={() => onEdit(row)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
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
