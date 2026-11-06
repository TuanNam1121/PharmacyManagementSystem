import { NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import ChangePasswordModal from "../component/auth/ChangePasswordModal";

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
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [expandedModule, setExpandedModule] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dropdownRef = useRef(null);

  const crumbs = BREADCRUMB_MAP[location.pathname] || [];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutModal(false);
      navigate("/login", { replace: true, state: { message: "Đăng xuất thành công" } });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = user?.fullName || user?.username || "Nhân viên";
  const displayRole = user?.roleName || user?.role || "Quản trị viên";
  const avatarInitials = (displayName || "WH").trim().slice(0, 2).toUpperCase();

  return (
    <div className="pms-shell">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 24,
            zIndex: 9999,
            background: "#ecfdf5",
            color: "#065f46",
            border: "1px solid #6ee7b7",
            borderRadius: 12,
            padding: "12px 20px",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            fontWeight: 600,
            fontSize: 14,
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          {toastMsg}
        </div>
      )}

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
          <div
            className="pms-user-card"
            style={{ cursor: "pointer", transition: "background 0.2s" }}
            onClick={() => setShowLogoutModal(true)}
            title="Bấm để đăng xuất"
          >
            <div className="pms-user-avatar">{avatarInitials}</div>
            <div className="pms-user-info" style={{ flex: 1, minWidth: 0 }}>
              <div
                className="pms-user-name"
                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {displayName}
              </div>
              <div
                className="pms-user-role"
                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {displayRole}
              </div>
            </div>
            <button
              type="button"
              className="btn-pms btn-pms-ghost btn-pms-icon"
              style={{ padding: 4, color: "var(--sidebar-text)" }}
              title="Đăng xuất"
              onClick={(e) => {
                e.stopPropagation();
                setShowLogoutModal(true);
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
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

          <div className="pms-topbar-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
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

            {/* User Profile Pill & Dropdown */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowUserDropdown((prev) => !prev)}
                className="btn-pms btn-pms-ghost"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "4px 10px 4px 6px",
                  borderRadius: "20px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark))",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {avatarInitials}
                </div>
                <div style={{ textAlign: "left", lineHeight: 1.2 }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>
                    {displayRole}
                  </div>
                </div>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: "var(--text-muted)", marginLeft: 2 }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 6px)",
                    background: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
                    width: "220px",
                    padding: "8px 0",
                    zIndex: 1000,
                  }}
                >
                  <div style={{ padding: "8px 16px 10px 16px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {displayName}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: 2 }}>
                      {user?.email || "Chưa có email"}
                    </div>
                    <span
                      className="pms-badge pms-badge-success"
                      style={{ marginTop: 6, display: "inline-block", fontSize: "10px" }}
                    >
                      {displayRole}
                    </span>
                  </div>

                  <div style={{ padding: "4px 0" }}>
                    <NavLink
                      to="/profile"
                      onClick={() => setShowUserDropdown(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 16px",
                        fontSize: "13px",
                        color: "var(--text-primary)",
                        textDecoration: "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>Hồ sơ cá nhân</span>
                    </NavLink>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowPasswordModal(true);
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 16px",
                        fontSize: "13px",
                        color: "var(--text-primary)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span>Đổi mật khẩu</span>
                    </button>
                  </div>

                  <div style={{ height: "1px", background: "#f1f5f9", margin: "4px 0" }} />

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowLogoutModal(true);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 16px",
                      fontSize: "13px",
                      color: "#ef4444",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span style={{ fontWeight: 600 }}>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="pms-content">
          <Outlet />
        </main>
      </div>

      {/* ── Change Password Modal ── */}
      <ChangePasswordModal
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={(msg) => {
          setToastMsg(msg);
          setTimeout(() => setToastMsg(""), 4000);
        }}
      />

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => !isLoggingOut && setShowLogoutModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "400px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              animation: "fadeIn 0.2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Icon & Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#fef2f2",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                  Xác nhận đăng xuất
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                  Pharmacy Chain Management System
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <p style={{ fontSize: "14px", color: "#475569", margin: "0 0 24px 0", lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn kết thúc phiên làm việc? Mọi thông tin chưa lưu trên màn hình có thể bị mất.
            </p>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="btn-pms btn-pms-secondary"
                style={{ minWidth: "90px" }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="btn-pms btn-pms-danger"
                style={{ minWidth: "110px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                {isLoggingOut ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                      style={{ width: "14px", height: "14px" }}
                    />
                    <span>Đang thoát...</span>
                  </>
                ) : (
                  <span>Đăng xuất</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
