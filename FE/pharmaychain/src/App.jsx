import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import HomePage from './page/home/HomePage';
import SupplierPage from './page/supplier/SupplierPage';
import WarehouseInventoryPage from './page/warehouse/WarehouseInventoryPage';
import UsersPage from './page/users/UsersPage';

/* ── Placeholder for unbuilt pages ── */
function ComingSoon({ title, module }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12, textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'var(--brand-primary-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 8,
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 360 }}>
        This page is part of the <strong>{module}</strong> module and is currently under development.
        The backend API is being built in parallel.
      </div>
      <span className="pms-badge pms-badge-warning" style={{ marginTop: 8 }}>Coming Soon</span>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route index element={<Navigate to="/home" replace />} />
      <Route element={<MainLayout />}>
        {/* Home */}
        <Route path="/home" element={<HomePage />} />

        {/* Authentication */}
        <Route path="/login"   element={<ComingSoon title="Login" module="Authentication" />} />
        <Route path="/profile" element={<ComingSoon title="My Profile" module="Authentication" />} />

        {/* User & Security */}
        <Route path="/users"     element={<UsersPage />} />
        <Route path="/audit-log" element={<ComingSoon title="Audit Log" module="User & Security" />} />

        {/* Products & Catalog */}
        <Route path="/products"   element={<ComingSoon title="Product Catalog" module="Products & Catalog" />} />
        <Route path="/categories" element={<ComingSoon title="Categories" module="Products & Catalog" />} />

        {/* POS & Sales */}
        <Route path="/pos"    element={<ComingSoon title="POS Counter" module="POS & Sales" />} />
        <Route path="/shifts" element={<ComingSoon title="Shift Management" module="POS & Sales" />} />
        <Route path="/sales"  element={<ComingSoon title="Sales Invoices" module="POS & Sales" />} />

        {/* Customers */}
        <Route path="/customers" element={<ComingSoon title="Customer Directory" module="Customer Management" />} />

        {/* Branch Stock & Requisitions (Store Inventory) */}
        <Route path="/store/inventory"    element={<ComingSoon title="Branch Stock" module="Branch Stock & Requisitions" />} />
        <Route path="/store/requisitions" element={<ComingSoon title="Stock Requisitions" module="Branch Stock & Requisitions" />} />
        <Route path="/store/receipts"     element={<ComingSoon title="Store Goods Receipts" module="Branch Stock & Requisitions" />} />

        {/* Central Warehouse (LIVE - All BE endpoints wired) */}
        <Route path="/warehouse/inventory"     element={<WarehouseInventoryPage defaultTab="inventory" />} />
        <Route path="/warehouse/adjustments"   element={<WarehouseInventoryPage defaultTab="adjustments" />} />
        <Route path="/warehouse/alerts"        element={<WarehouseInventoryPage defaultTab="inventory" defaultExpiryFilter="EXPIRING_SOON" />} />
        <Route path="/warehouse/receipts"      element={<WarehouseInventoryPage defaultTab="history" />} />
        <Route path="/warehouse/replenishment" element={<ComingSoon title="Store Replenishment" module="Central Warehouse" />} />

        {/* Procurement (LIVE: suppliers) */}
        <Route path="/supplier"               element={<SupplierPage />} />
        <Route path="/procurement/requests"   element={<ComingSoon title="Purchase Requests" module="Procurement" />} />
        <Route path="/procurement/rfq"        element={<ComingSoon title="RFQ & Quotations" module="Procurement" />} />
        <Route path="/procurement/proposals"  element={<ComingSoon title="Purchase Proposals" module="Procurement" />} />
        <Route path="/procurement/orders"     element={<ComingSoon title="Purchase Orders" module="Procurement" />} />

        {/* Reports */}
        <Route path="/reports/profit"    element={<ComingSoon title="Profit Report" module="Reports & BI" />} />
        <Route path="/reports/inventory" element={<ComingSoon title="Inventory Report" module="Reports & BI" />} />
        <Route path="/reports/sales"     element={<ComingSoon title="Daily Sales Report" module="Reports & BI" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
