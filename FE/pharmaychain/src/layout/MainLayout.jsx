import { NavLink, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useState } from "react";

// All 10 modules with their nav items
const NAV_MODULES = [
  {
    key: "auth",
    label: "Authentication",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    items: [
      { to: "/login", label: "Login" },
      { to: "/profile", label: "My Profile" },
    ],
  },
  {
    key: "users",
    label: "User & Security",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    items: [
      { to: "/users", label: "User List" },
      { to: "/audit-log", label: "Audit Log" },
    ],
  },
  {
    key: "products",
    label: "Products & Catalog",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    items: [
      { to: "/products", label: "Product Catalog" },
      { to: "/categories", label: "Categories" },
    ],
  },
  {
    key: "sales",
    label: "POS & Sales",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    items: [
      { to: "/pos", label: "POS Counter" },
      { to: "/shifts", label: "Shift Management" },
      { to: "/sales", label: "Sales Invoices" },
    ],
  },
  {
    key: "customers",
    label: "Customers",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    items: [
      { to: "/customers", label: "Customer Directory" },
    ],
  },
  {
    key: "store-inventory",
    label: "Branch Stock & Requisitions",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    items: [
      { to: "/store/inventory", label: "Branch Stock" },
      { to: "/store/requisitions", label: "Stock Requisitions" },
      { to: "/store/receipts", label: "Store Goods Receipts" },
      { to: "/store/audit", label: "Inventory Audit" },
    ],
  },
  {
    key: "warehouse",
    label: "Central Warehouse",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <path d="M2 7l10-5 10 5" />
      </svg>
    ),
    items: [
      { to: "/warehouse/inventory", label: "Inventory & Stock" },
      { to: "/warehouse/adjustments", label: "Adjustments" },
      { to: "/warehouse/alerts", label: "Expiry & Low Stock Alerts" },
      { to: "/warehouse/replenishment", label: "Store Replenishment" },
      { to: "/warehouse/receipts", label: "Purchase Receipts" },
      { to: "/warehouse/requests", label: "Purchase Requests" },
    ],
  },
  {
    key: "procurement",
    label: "Procurement",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    items: [
      { to: "/supplier", label: "Suppliers" },
      { to: "/procurement/requests", label: "Purchase Requests" },
      { to: "/procurement/rfq", label: "RFQ & Quotations" },
      { to: "/procurement/proposals", label: "Purchase Proposals" },
      { to: "/procurement/orders", label: "Purchase Orders" },
    ],
  },
  {
    key: "reporting",
    label: "Reports & BI",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    items: [
      { to: "/reports/profit", label: "Profit Report" },
      { to: "/reports/inventory", label: "Inventory Report" },
      { to: "/reports/sales", label: "Daily Sales" },
    ],
  },
];

const BREADCRUMB_MAP = {
  "/": ["Home"],
  "/warehouse/inventory": ["Central Warehouse", "Inventory & Stock"],
  "/supplier": ["Procurement", "Suppliers"],
  "/login": ["Authentication", "Login"],
  "/profile": ["Authentication", "My Profile"],
  "/users": ["User & Security", "User List"],
  "/audit-log": ["User & Security", "Audit Log"],
  "/products": ["Products & Catalog", "Product Catalog"],
  "/categories": ["Products & Catalog", "Categories"],
  "/pos": ["POS & Sales", "POS Counter"],
  "/shifts": ["POS & Sales", "Shift Management"],
  "/sales": ["POS & Sales", "Sales Invoices"],
  "/customers": ["Customers", "Customer Directory"],
  "/store/inventory": ["Branch Stock & Requisitions", "Branch Stock"],
  "/store/requisitions": ["Branch Stock & Requisitions", "Stock Requisitions"],
  "/store/receipts": ["Branch Stock & Requisitions", "Store Goods Receipts"],
  "/store/audit": ["Branch Stock & Requisitions", "Inventory Audit"],
  "/warehouse/adjustments": ["Central Warehouse", "Adjustments"],
  "/warehouse/alerts": ["Central Warehouse", "Expiry & Low Stock Alerts"],
  "/warehouse/replenishment": ["Central Warehouse", "Store Replenishment"],
  "/warehouse/receipts": ["Central Warehouse", "Purchase Receipts"],
  "/procurement/requests": ["Procurement", "Purchase Requests"],
  "/procurement/rfq": ["Procurement", "RFQ & Quotations"],
  "/procurement/proposals": ["Procurement", "Purchase Proposals"],
  "/procurement/orders": ["Procurement", "Purchase Orders"],
  "/reports/profit": ["Reports & BI", "Profit Report"],
  "/reports/inventory": ["Reports & BI", "Inventory Report"],
  "/reports/sales": ["Reports & BI", "Daily Sales"],
};

export default function MainLayout() {
  const location = useLocation();
  const [expandedModule, setExpandedModule] = useState(null);

  const crumbs = BREADCRUMB_MAP[location.pathname] || [];

  // Auto-expand the current active module
  const activeModule = NAV_MODULES.find((m) =>
    m.items.some((item) => location.pathname.startsWith(item.to))
  );

  const toggleModule = (key) => {
    setExpandedModule((prev) => (prev === key ? null : key));
  };

  const isExpanded = (key) => {
    if (expandedModule === key) return true;
    if (expandedModule === null && activeModule?.key === key) return true;
    return false;
  };

  return (
    <div className="pms-shell">
      {/* ── Sidebar ── */}
      <aside className="pms-sidebar">
        {/* Logo */}
        <div className="pms-sidebar-header">
          <NavLink to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div className="pms-logo-icon">Rx</div>
            <div className="pms-logo-text">
              <span className="pms-logo-name">PharmaChain</span>
              <span className="pms-logo-sub">Management System</span>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav style={{ padding: "8px", flex: 1, overflowY: "auto" }}>
          {/* Home */}
          <NavLink
            to="/"
            end
            className={({ isActive }) => `pms-nav-item ${isActive ? "active" : ""}`}
            style={{ marginBottom: 4 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Dashboard
          </NavLink>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--sidebar-border)", margin: "8px 8px 8px" }} />

          {NAV_MODULES.map((module) => {
            const expanded = isExpanded(module.key);
            const hasActive = module.items.some((item) => location.pathname.startsWith(item.to));

            return (
              <div key={module.key}>
                {/* Module toggle */}
                <button
                  className={`pms-nav-item ${hasActive ? "active" : ""}`}
                  onClick={() => toggleModule(module.key)}
                  style={{
                    width: "100%",
                    justifyContent: "space-between",
                    marginBottom: 2,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {module.icon}
                    <span style={{ fontSize: 12 }}>{module.label}</span>
                  </span>
                  <svg
                    width="12" height="12"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 200ms" }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>

                {/* Sub-items */}
                {expanded && (
                  <div style={{ paddingLeft: 28, marginBottom: 4 }}>
                    {module.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `pms-nav-item ${isActive ? "active" : ""}`
                        }
                        style={{ fontSize: 12, paddingTop: 7, paddingBottom: 7 }}
                      >
                        <span style={{ width: 4, height: 4, background: "currentColor", borderRadius: "50%", flexShrink: 0 }} />
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="pms-sidebar-footer">
          <div className="pms-user-card">
            <div className="pms-user-avatar">WH</div>
            <div className="pms-user-info">
              <div className="pms-user-name">Warehouse Manager</div>
              <div className="pms-user-role">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="pms-main">
        {/* Topbar */}
        <header className="pms-topbar">
          <div className="pms-topbar-breadcrumb">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            {crumbs.length === 0 && <span className="current">Dashboard</span>}
            {crumbs.map((c, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {i > 0 && <span className="sep">/</span>}
                <span className={i === crumbs.length - 1 ? "current" : ""}>{c}</span>
              </span>
            ))}
          </div>

          <div className="pms-topbar-actions">
            <button className="btn-pms btn-pms-ghost btn-pms-icon" title="Notifications" style={{ position: "relative" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span style={{
                position: "absolute", top: 6, right: 6,
                width: 7, height: 7, background: "#ef4444",
                borderRadius: "50%", border: "1.5px solid white",
              }} />
            </button>
            <button className="btn-pms btn-pms-ghost btn-pms-icon" title="Settings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="pms-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
