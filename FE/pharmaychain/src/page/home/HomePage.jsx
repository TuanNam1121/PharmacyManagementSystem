import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { money } from '../../utils/format';
import { getDailySalesOverview } from '../../api/DailySalesAPI';
import { getBranchInventorySummary } from '../../api/BranchInventoryAPI';
import { getWarehouseInventory } from '../../api/WarehouseInventoryAPI';
import { getRequisitionList } from '../../api/StockRequisitionAPI';
import { getPurchaseOrders } from '../../api/PurchaseOrderAPI';

export default function HomePage() {
  const { user } = useAuth();
  const rawRole = (user?.role || '').toUpperCase().replace(/^ROLE_/, '').trim();
  const isWarehouseRole = rawRole.includes('WAREHOUSE');
  const isStoreRole = rawRole === 'STORE_MANAGER' || rawRole === 'PHARMACIST';
  const isPurchasingRole = rawRole === 'PURCHASING_STAFF';
  const isManagerOrAdmin = rawRole === 'GENERAL_MANAGER' || rawRole === 'ADMIN' || !rawRole;

  const [loading, setLoading] = useState(true);
  const [salesOverview, setSalesOverview] = useState(null);
  const [branchSummary, setBranchSummary] = useState(null);
  const [warehouseData, setWarehouseData] = useState({ totalSkus: 0, totalUnits: 0, expiringSoon: 0 });
  const [pendingRequisitions, setPendingRequisitions] = useState(0);
  const [pendingPOs, setPendingPOs] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      setLoading(true);
      const storeId = localStorage.getItem('pms_selected_store_id') || 3;

      try {
        const promises = [];

        // 1. Sales metrics (for GM, Admin, Store Manager, Pharmacist)
        if (isManagerOrAdmin || isStoreRole) {
          promises.push(
            getDailySalesOverview({ storeId }).then(res => {
              if (isMounted) setSalesOverview(res);
            }).catch(() => {})
          );
        }

        // 2. Branch inventory metrics
        if (isManagerOrAdmin || isStoreRole) {
          promises.push(
            getBranchInventorySummary(storeId).then(res => {
              if (isMounted) setBranchSummary(res);
            }).catch(() => {})
          );
        }

        // 3. Central warehouse metrics (for GM, Admin, Warehouse)
        if (isManagerOrAdmin || isWarehouseRole) {
          promises.push(
            getWarehouseInventory({ page: 0, size: 50 }).then(res => {
              if (isMounted && res) {
                const list = res.content || [];
                const totalUnits = list.reduce((sum, item) => sum + (item.quantity || 0), 0);
                const expiringSoon = list.filter(x => x.expiryStatus === 'EXPIRING_SOON').length;
                setWarehouseData({
                  totalSkus: res.totalElements || list.length,
                  totalUnits,
                  expiringSoon,
                });
              }
            }).catch(() => {})
          );
        }

        // 4. Pending replenishment requests
        promises.push(
          getRequisitionList({ status: '0', page: 0, size: 5 }).then(res => {
            if (isMounted && res) {
              setPendingRequisitions(res.totalElements || 0);
            }
          }).catch(() => {})
        );

        // 5. Purchase orders (for GM, Admin, Purchasing, Warehouse)
        if (isManagerOrAdmin || isPurchasingRole || isWarehouseRole) {
          promises.push(
            getPurchaseOrders({ page: 0, size: 5 }).then(res => {
              if (isMounted && res) {
                setPendingPOs(res.totalElements || 0);
              }
            }).catch(() => {})
          );
        }

        await Promise.allSettled(promises);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => { isMounted = false; };
  }, [rawRole]);

  // Construct standard 4-card metrics matching WarehouseStats template
  const getCards = () => {
    if (isWarehouseRole) {
      return [
        {
          label: 'Tổng Đơn Vị Tồn Kho Tổng',
          value: loading ? '...' : warehouseData.totalUnits.toLocaleString('vi-VN'),
          iconColor: 'emerald',
          sub: 'đơn vị sẵn sàng xuất điều chuyển',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          ),
        },
        {
          label: 'Tổng Lô Thuốc (SKU)',
          value: loading ? '...' : warehouseData.totalSkus.toLocaleString('vi-VN'),
          iconColor: 'blue',
          sub: 'định vị trên các dãy kệ GSP',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
            </svg>
          ),
        },
        {
          label: 'Lô Cận Hạn Dùng (≤90 ngày)',
          value: loading ? '...' : warehouseData.expiringSoon.toLocaleString('vi-VN'),
          iconColor: 'amber',
          sub: 'ưu tiên điều chuyển xuất trước (FEFO)',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          ),
        },
        {
          label: 'Yêu Cầu Lĩnh Thuốc Chờ Xuất',
          value: loading ? '...' : pendingRequisitions.toLocaleString('vi-VN'),
          iconColor: 'teal',
          sub: 'phiếu đề xuất từ các chi nhánh',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          ),
        },
      ];
    }

    if (isStoreRole) {
      return [
        {
          label: 'Doanh Thu Quầy Hôm Nay',
          value: loading ? '...' : money(salesOverview?.systemTotal || 0),
          iconColor: 'emerald',
          sub: `+${salesOverview?.growthPercentageVsYesterday || 0}% so với hôm trước`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          ),
        },
        {
          label: 'Tổng Hóa Đơn Bán Lẻ',
          value: loading ? '...' : (salesOverview?.totalInvoices || 0).toLocaleString('vi-VN'),
          iconColor: 'blue',
          sub: `phân bổ trên ${salesOverview?.totalShifts || 1} ca bán hàng`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          ),
        },
        {
          label: 'Thuốc Cận Hạn & Thiếu Hàng',
          value: loading ? '...' : ((branchSummary?.lowStockCount || 0) + (branchSummary?.expiringSoonCount || 0)).toLocaleString('vi-VN'),
          iconColor: 'amber',
          sub: `${branchSummary?.lowStockCount || 0} dưới định mức — ${branchSummary?.expiringSoonCount || 0} cận hạn`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          ),
        },
        {
          label: 'Yêu Cầu Lĩnh Thuốc Đang Gửi',
          value: loading ? '...' : pendingRequisitions.toLocaleString('vi-VN'),
          iconColor: 'teal',
          sub: 'phiếu đề xuất xin cấp phát từ kho tổng',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          ),
        },
      ];
    }

    // Default for General Manager & Admin: Chain-wide view
    return [
      {
        label: 'Doanh Thu Hệ Thống Hôm Nay',
        value: loading ? '...' : money(salesOverview?.systemTotal || 0),
        iconColor: 'emerald',
        sub: `+${salesOverview?.growthPercentageVsYesterday || 0}% so với hôm trước`,
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        ),
      },
      {
        label: 'Tổng Hóa Đơn Bán Lẻ',
        value: loading ? '...' : (salesOverview?.totalInvoices || 0).toLocaleString('vi-VN'),
        iconColor: 'blue',
        sub: 'giao dịch hoàn tất trên toàn chuỗi',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        ),
      },
      {
        label: 'Cảnh Báo Tồn Kho & Hạn Dùng',
        value: loading ? '...' : ((branchSummary?.lowStockCount || 0) + (warehouseData.expiringSoon || 0)).toLocaleString('vi-VN'),
        iconColor: 'amber',
        sub: 'thuốc cận hạn hoặc dưới ngưỡng an toàn',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        ),
      },
      {
        label: 'Yêu Cầu Lĩnh Thuốc Chờ Duyệt',
        value: loading ? '...' : pendingRequisitions.toLocaleString('vi-VN'),
        iconColor: 'red',
        sub: 'đề xuất điều chuyển từ các chi nhánh',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        ),
      },
    ];
  };

  const cards = getCards();

  // Quick action shortcuts tailored to the 5 domains
  const quickActions = [
    {
      to: '/pos',
      label: 'Quầy Bán Lẻ POS',
      desc: 'Xuất hóa đơn bán lẻ, thu ngân và trừ tồn FEFO',
      color: '#10b981',
      bg: '#ecfdf5',
      roles: ['ADMIN', 'STORE_MANAGER', 'PHARMACIST'],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
    },
    {
      to: '/warehouse/inventory',
      label: 'Kho Tổng Trung Tâm',
      desc: 'Tra cứu tồn kho tổng FEFO, vị trí ô kệ và điều chỉnh tồn',
      color: '#0284c7',
      bg: '#f0f9ff',
      roles: ['ADMIN', 'GENERAL_MANAGER', 'WAREHOUSE_MANAGER', 'WAREHOUSE_STAFF'],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
        </svg>
      ),
    },
    {
      to: '/store/inventory',
      label: 'Tồn Kho Cửa Hàng',
      desc: 'Theo dõi tồn quầy chi nhánh, ngưỡng an toàn và hạn dùng',
      color: '#059669',
      bg: '#ecfdf5',
      roles: ['ADMIN', 'GENERAL_MANAGER', 'STORE_MANAGER', 'PHARMACIST'],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
    },
    {
      to: '/store/requisitions',
      label: 'Yêu Cầu Lĩnh Thuốc',
      desc: 'Tạo phiếu xin cấp phát thuốc gửi lên kho tổng trung tâm',
      color: '#f59e0b',
      bg: '#fffbeb',
      roles: ['ADMIN', 'STORE_MANAGER'],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      ),
    },
    {
      to: '/procurement/orders',
      label: 'Đơn Đặt Hàng Mua (PO)',
      desc: 'Theo dõi đơn đặt hàng nhà cung cấp và tiến độ giao hàng',
      color: '#8b5cf6',
      bg: '#f5f3ff',
      roles: ['ADMIN', 'GENERAL_MANAGER', 'PURCHASING_STAFF'],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      ),
    },
    {
      to: '/reports/profit',
      label: 'Báo Cáo Lợi Nhuận',
      desc: 'Phân tích doanh thu, lợi nhuận gộp và biên độ kinh doanh',
      color: '#6366f1',
      bg: '#eef2ff',
      roles: ['ADMIN', 'GENERAL_MANAGER', 'STORE_MANAGER'],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      ),
    },
  ];

  const visibleActions = quickActions.filter(a => {
    if (isManagerOrAdmin) return true;
    return a.roles.includes(rawRole);
  });

  return (
    <div>
      {/* ── Page Header — Chuẩn chung đồng bộ ── */}
      <div className="pms-page-header">
        <div>
          <h1 className="pms-page-title">Bàn Làm Việc — Tổng Quan Hệ Thống</h1>
          <p className="pms-page-sub">
            Hệ thống quản trị chuỗi nhà thuốc &amp; Kho vận PharmaChain.
          </p>
        </div>
      </div>

      {/* ── Greeting Banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 12,
          padding: '24px 28px',
          marginBottom: 20,
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: '#34d399', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>
            PharmaChain Operations Hub
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            Xin chào, {user?.fullName || user?.username || 'Nhân viên'}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            Vai trò: <strong style={{ color: '#f8fafc' }}>{user?.roleName || user?.role || 'Quản trị viên'}</strong>
          </div>
        </div>
      </div>

      {/* ── KPI Stats Cards — Chuẩn chung đồng bộ (Mẫu WarehouseStats) ── */}
      <div className="pms-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {cards.map((s) => (
          <div className="pms-stat-card" key={s.label}>
            <div className={`pms-stat-icon ${s.iconColor}`}>{s.icon}</div>
            <div>
              <div className="pms-stat-label">{s.label}</div>
              <div className="pms-stat-value" style={{ whiteSpace: 'nowrap' }}>{s.value}</div>
              <div className="pms-stat-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Access Modules ── */}
      <div className="pms-card" style={{ marginBottom: 24 }}>
        <div className="pms-card-header">
          <div>
            <div className="pms-card-title">Truy Cập Nhanh Phân Hệ Nghiệp Vụ</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Các tính năng cốt lõi được phân quyền theo chức danh công việc của bạn
            </div>
          </div>
        </div>
        <div className="pms-card-body">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {visibleActions.map((mod) => (
              <NavLink
                key={mod.to}
                to={mod.to}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '16px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  textDecoration: 'none',
                  transition: 'all 150ms ease',
                }}
                className="pms-quick-card"
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: mod.bg,
                    color: mod.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {mod.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                    {mod.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {mod.desc}
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
