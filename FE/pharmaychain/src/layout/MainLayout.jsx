import { NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { getAuthorizedStores, DEFAULT_RETAIL_STORES } from "../api/StoreAPI";
import ChangePasswordModal from "../component/auth/ChangePasswordModal";

// 5 Business domains structured strictly according to Backlog scope
const NAV_MODULES = [
  {
    key: "sales-customers",
    label: "Bán Hàng & Khách Hàng",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    items: [
      { to: "/pos", label: "Quầy bán lẻ POS", roles: ["ADMIN", "STORE_MANAGER", "PHARMACIST"] },
      { to: "/sales", label: "Hóa đơn & Ca bán hàng", roles: ["ADMIN", "STORE_MANAGER", "PHARMACIST", "GENERAL_MANAGER"] },
      { to: "/customers", label: "Khách hàng", roles: ["ADMIN", "STORE_MANAGER", "PHARMACIST", "GENERAL_MANAGER"] },
    ],
  },
  {
    key: "inventory-warehouse",
    label: "Kho & Tồn Kho",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <path d="M2 7l10-5 10 5" />
      </svg>
    ),
    subgroups: [
      {
        key: "warehouse-central",
        title: "KHO TỔNG",
        items: [
          { to: "/warehouse/inventory", label: "Tồn kho tổng FEFO", roles: ["ADMIN", "WAREHOUSE_MANAGER", "WAREHOUSE_STAFF", "GENERAL_MANAGER", "PURCHASING_STAFF"] },
          { to: "/warehouse/replenishment", label: "Điều chuyển chi nhánh", roles: ["ADMIN", "WAREHOUSE_MANAGER", "WAREHOUSE_STAFF", "GENERAL_MANAGER"] },
        ],
      },
      {
        key: "branch-stores",
        title: "KHO CHI NHÁNH",
        isBranchSection: true,
        items: [
          { to: "/store/inventory", label: "Tồn kho cửa hàng", roles: ["ADMIN", "STORE_MANAGER", "PHARMACIST", "GENERAL_MANAGER"] },
          { to: "/store/audit", label: "Kiểm kê kho cửa hàng", roles: ["ADMIN", "STORE_MANAGER"] },
          { to: "/store/requisitions", label: "Yêu cầu lĩnh thuốc", roles: ["ADMIN", "STORE_MANAGER"] },
          { to: "/store/receipts", label: "Phiếu nhận hàng", roles: ["ADMIN", "STORE_MANAGER"] },
        ],
      },
    ],
  },
  {
    key: "procurement-suppliers",
    label: "Thu Mua & Nhà Cung Cấp",
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
      { to: "/procurement/requests", label: "Yêu cầu mua hàng", roles: ["ADMIN", "PURCHASING_STAFF", "WAREHOUSE_MANAGER", "GENERAL_MANAGER"] },
      { to: "/supplier", label: "Nhà cung cấp", roles: ["ADMIN", "PURCHASING_STAFF", "GENERAL_MANAGER"] },
      { to: "/procurement/proposals", label: "Đề xuất mua hàng", roles: ["ADMIN", "PURCHASING_STAFF", "GENERAL_MANAGER"] },
      { to: "/procurement/rfq", label: "RFQ & Báo giá", roles: ["ADMIN", "PURCHASING_STAFF", "GENERAL_MANAGER"] },
      { to: "/procurement/orders", label: "Đơn đặt hàng PO", roles: ["ADMIN", "PURCHASING_STAFF", "GENERAL_MANAGER"] },
    ],
  },
  {
    key: "admin-reporting",
    label: "Danh Mục, Quản Trị & Báo Cáo",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    subgroups: [
      {
        key: "admin-catalog",
        title: "DANH MỤC",
        items: [
          { to: "/products", label: "Danh mục thuốc & Giá", roles: ["ADMIN", "STORE_MANAGER", "PHARMACIST", "PURCHASING_STAFF", "WAREHOUSE_MANAGER", "GENERAL_MANAGER"] },
          { to: "/categories", label: "Nhóm thuốc GSP", roles: ["ADMIN", "STORE_MANAGER", "PURCHASING_STAFF", "GENERAL_MANAGER"] },
        ],
      },
      {
        key: "admin-system",
        title: "QUẢN TRỊ HỆ THỐNG",
        items: [
          { to: "/users", label: "Quản lý người dùng", roles: ["ADMIN", "GENERAL_MANAGER"] },
          { to: "/audit-log", label: "Nhật ký kiểm toán", roles: ["ADMIN", "GENERAL_MANAGER"] },
        ],
      },
      {
        key: "admin-reports",
        title: "BÁO CÁO",
        items: [
          { to: "/reports/profit", label: "Báo cáo lợi nhuận", roles: ["ADMIN", "GENERAL_MANAGER", "STORE_MANAGER"] },
          { to: "/reports/inventory", label: "Báo cáo tồn kho", roles: ["ADMIN", "GENERAL_MANAGER", "WAREHOUSE_MANAGER", "STORE_MANAGER"] },
        ],
      },
    ],
  },
];

const BREADCRUMB_MAP = {
  "/": ["Bàn làm việc"],
  "/home": ["Bàn làm việc"],
  "/pos": ["Bán hàng & Khách hàng", "Quầy bán lẻ POS"],
  "/sales": ["Bán hàng & Khách hàng", "Hóa đơn & Ca bán hàng"],
  "/shifts": ["Bán hàng & Khách hàng", "Hóa đơn & Ca bán hàng"],
  "/customers": ["Bán hàng & Khách hàng", "Khách hàng"],
  "/store/inventory": ["Kho & Tồn kho", "Tồn kho cửa hàng"],
  "/store/audit": ["Kho & Tồn kho", "Kiểm kê kho cửa hàng"],
  "/store/requisitions": ["Kho & Tồn kho", "Yêu cầu lĩnh thuốc"],
  "/store/receipts": ["Kho & Tồn kho", "Phiếu nhận hàng"],
  "/warehouse/inventory": ["Kho & Tồn kho", "Tồn kho tổng FEFO"],
  "/warehouse/receipts": ["Kho & Tồn kho", "Tồn kho tổng FEFO"],
  "/warehouse/adjustments": ["Kho & Tồn kho", "Tồn kho tổng FEFO"],
  "/warehouse/alerts": ["Kho & Tồn kho", "Tồn kho tổng FEFO"],
  "/warehouse/replenishment": ["Kho & Tồn kho", "Điều chuyển chi nhánh"],
  "/warehouse/requests": ["Thu mua & Nhà cung cấp", "Yêu cầu mua hàng"],
  "/procurement/requests": ["Thu mua & Nhà cung cấp", "Yêu cầu mua hàng"],
  "/supplier": ["Thu mua & Nhà cung cấp", "Nhà cung cấp"],
  "/procurement/rfq": ["Thu mua & Nhà cung cấp", "RFQ & Báo giá"],
  "/procurement/proposals": ["Thu mua & Nhà cung cấp", "Đề xuất mua hàng"],
  "/procurement/orders": ["Thu mua & Nhà cung cấp", "Đơn đặt hàng PO"],
  "/products": ["Danh mục, Quản trị & Báo cáo", "Danh mục thuốc & Giá"],
  "/categories": ["Danh mục, Quản trị & Báo cáo", "Nhóm thuốc GSP"],
  "/users": ["Danh mục, Quản trị & Báo cáo", "Quản lý người dùng"],
  "/audit-log": ["Danh mục, Quản trị & Báo cáo", "Nhật ký kiểm toán"],
  "/reports/profit": ["Danh mục, Quản trị & Báo cáo", "Báo cáo lợi nhuận"],
  "/reports/inventory": ["Danh mục, Quản trị & Báo cáo", "Báo cáo tồn kho"],
  "/reports/sales": ["Bán hàng & Khách hàng", "Hóa đơn bán lẻ"],
  "/profile": ["Tài khoản cá nhân", "Hồ sơ cá nhân"],
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

  const [stores, setStores] = useState(DEFAULT_RETAIL_STORES);
  const [selectedStoreId, setSelectedStoreId] = useState(() => {
    return localStorage.getItem("pms_selected_store_id") || "3";
  });

  const crumbs = BREADCRUMB_MAP[location.pathname] || [];

  // Normalize user role code
  const rawRole = (user?.role || "").toUpperCase().replace(/^ROLE_/, "").trim();
  const rawRoleName = (user?.roleName || "").toLowerCase();
  const isSuperAdmin =
    rawRole === "ADMIN" ||
    rawRole === "QUAN_TRI_VIEN" ||
    rawRoleName.includes("quản trị") ||
    user?.roleId === 1;

  // Fetch authorized retail stores dynamically from Backend API
  useEffect(() => {
    let isMounted = true;
    getAuthorizedStores().then((data) => {
      if (isMounted && data) {
        setStores(data);
        if (data.length === 1) {
          // Store Manager or Pharmacist: locked strictly to their assigned branch
          setSelectedStoreId(String(data[0].id));
          localStorage.setItem("pms_selected_store_id", String(data[0].id));
        } else if (data.length > 1) {
          // GM or Admin: respect cached selection or default to first branch
          const cached = localStorage.getItem("pms_selected_store_id");
          const exists = data.some((s) => String(s.id) === cached);
          const defaultId = exists ? cached : String(data[0].id);
          setSelectedStoreId(defaultId);
          localStorage.setItem("pms_selected_store_id", defaultId);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [user?.role]);

  const handleBranchSelect = (newStoreId) => {
    setSelectedStoreId(newStoreId);
    localStorage.setItem("pms_selected_store_id", newStoreId);
    window.dispatchEvent(new CustomEvent("pms:store-changed", { detail: { storeId: newStoreId } }));

    if (location.pathname.startsWith("/store/")) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set("storeId", newStoreId);
      navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
    }
  };

  const filterItems = (items) =>
    (items || []).filter((item) => {
      if (isSuperAdmin || !item.roles || item.roles.length === 0) return true;
      return item.roles.some(
        (r) =>
          r === rawRole ||
          user?.role?.toUpperCase() === `ROLE_${r}` ||
          rawRoleName.includes(r.toLowerCase())
      );
    });

  // Filter modules, subgroups and items by user role
  const visibleModules = NAV_MODULES.map((module) => {
    if (module.subgroups) {
      const visibleSubgroups = module.subgroups
        .map((sg) => ({
          ...sg,
          items: filterItems(sg.items),
        }))
        .filter((sg) => sg.items.length > 0);

      const allItems = visibleSubgroups.flatMap((sg) => sg.items);
      return {
        ...module,
        subgroups: visibleSubgroups,
        items: allItems,
      };
    } else {
      const visibleItems = filterItems(module.items);
      return { ...module, items: visibleItems };
    }
  }).filter((module) => module.items && module.items.length > 0);

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

  const isItemActive = (itemTo) => {
    const basePath = (itemTo || "").split("?")[0];
    if (basePath === "/sales") {
      return location.pathname === "/sales" || location.pathname === "/shifts";
    }
    if (basePath === "/warehouse/inventory") {
      return (
        location.pathname === "/warehouse/inventory" ||
        location.pathname === "/warehouse/receipts" ||
        location.pathname === "/warehouse/adjustments" ||
        location.pathname === "/warehouse/alerts"
      );
    }
    return location.pathname === basePath;
  };

  // Auto-expand the current active module
  const activeModule = visibleModules.find((m) =>
    m.items.some((item) => isItemActive(item.to))
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
            to="/home"
            className={({ isActive }) =>
              `pms-nav-item ${isActive || location.pathname === "/" ? "active" : ""}`
            }
            style={{ marginBottom: 4 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Bàn làm việc
          </NavLink>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--sidebar-border)", margin: "8px 8px 8px" }} />

          {visibleModules.map((module) => {
            const expanded = isExpanded(module.key);
            const hasActive = module.items.some((item) => isItemActive(item.to));

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
                  <div style={{ paddingLeft: 12, marginBottom: 4 }}>
                    {module.subgroups ? (
                      module.subgroups.map((sg) => (
                        <div key={sg.key || sg.title} style={{ marginBottom: 10 }}>
                          {/* Subgroup Header */}
                          <div
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.8px",
                              color: "var(--sidebar-text-muted, #64748b)",
                              padding: "6px 8px 3px 12px",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span>{sg.title}</span>
                          </div>

                          {/* Branch Selector for KHO CHI NHÁNH */}
                          {sg.isBranchSection && stores.length > 0 && (
                            <div style={{ padding: "4px 8px 8px 12px" }}>
                              {stores.length === 1 ? (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "5px 10px",
                                    background: "rgba(16, 185, 129, 0.1)",
                                    border: "1px solid rgba(16, 185, 129, 0.25)",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    color: "#34d399",
                                    fontWeight: 600,
                                  }}
                                  title="Chi nhánh được phân công"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                  </svg>
                                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {stores[0].name}
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  <select
                                    className="pms-select"
                                    style={{
                                      width: "100%",
                                      fontSize: "11px",
                                      height: "30px",
                                      padding: "2px 8px",
                                      background: "#1e293b",
                                      color: "#f8fafc",
                                      border: "1px solid #334155",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                    }}
                                    value={selectedStoreId || ""}
                                    onChange={(e) => handleBranchSelect(e.target.value)}
                                    title="Chọn chi nhánh làm việc"
                                  >
                                    {stores.map((s) => (
                                      <option key={s.id} value={s.id} style={{ background: "#1e293b", color: "#f8fafc" }}>
                                        {s.code} — {s.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Subgroup items */}
                          <div style={{ paddingLeft: 12 }}>
                            {sg.items.map((item) => {
                              const toUrl = sg.isBranchSection && selectedStoreId ? `${item.to}?storeId=${selectedStoreId}` : item.to;
                              const isActive = isItemActive(item.to);
                              return (
                                <NavLink
                                  key={item.to}
                                  to={toUrl}
                                  className={`pms-nav-item ${isActive ? "active" : ""}`}
                                  style={{ fontSize: 12, paddingTop: 6, paddingBottom: 6 }}
                                >
                                  <span style={{ width: 4, height: 4, background: "currentColor", borderRadius: "50%", flexShrink: 0 }} />
                                  {item.label}
                                </NavLink>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ paddingLeft: 16 }}>
                        {module.items.map((item) => {
                          const isActive = isItemActive(item.to);
                          return (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              className={`pms-nav-item ${isActive ? "active" : ""}`}
                              style={{ fontSize: 12, paddingTop: 7, paddingBottom: 7 }}
                            >
                              <span style={{ width: 4, height: 4, background: "currentColor", borderRadius: "50%", flexShrink: 0 }} />
                              {item.label}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
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
            {crumbs.length === 0 && <span className="current">Bàn làm việc</span>}
            {crumbs.map((c, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {i > 0 && <span className="sep">/</span>}
                <span className={i === crumbs.length - 1 ? "current" : ""}>{c}</span>
              </span>
            ))}
          </div>

          <div className="pms-topbar-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="btn-pms btn-pms-ghost btn-pms-icon" title="Thông báo" style={{ position: "relative" }}>
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
