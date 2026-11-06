import { NavLink } from 'react-router-dom';

/* ── KPI metrics ── */
const KPI_CARDS = [
  {
    label: "Tổng Mặt Hàng Thuốc",
    value: "2,847",
    delta: "+12 hôm nay",
    deltaUp: true,
    iconColor: "emerald",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M2 7l10-5 10 5"/>
      </svg>
    ),
  },
  {
    label: "Doanh Thu Hôm Nay",
    value: "₫48.2M",
    delta: "+8.3% so với hôm qua",
    deltaUp: true,
    iconColor: "blue",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    label: "Nhà Cung Cấp Đang Hợp Tác",
    value: "34",
    delta: "2 đối tác chờ duyệt",
    deltaUp: null,
    iconColor: "violet",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    label: "Lô Thuốc Cận Hạn Dùng",
    value: "17",
    delta: "≤ 90 ngày",
    deltaUp: false,
    iconColor: "amber",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    label: "Yêu Cầu Chuyển Kho Chờ Duyệt",
    value: "6",
    delta: "từ 3 chi nhánh",
    deltaUp: null,
    iconColor: "red",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    label: "Đơn Đặt Hàng Mua Mở (PO)",
    value: "4",
    delta: "₫185M cam kết",
    deltaUp: null,
    iconColor: "teal",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
  },
];

/* ── Quick action modules ── */
const QUICK_MODULES = [
  {
    to: "/pos",
    label: "Bán Hàng POS",
    desc: "Bán lẻ tại quầy và xuất hóa đơn",
    color: "#10b981",
    bg: "#ecfdf5",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    to: "/warehouse/inventory",
    label: "Kho Tổng Trung Tâm",
    desc: "Lô thuốc FEFO & quản lý vị trí ô kệ",
    color: "#3b82f6",
    bg: "#eff6ff",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M2 7l10-5 10 5"/>
      </svg>
    ),
  },
  {
    to: "/supplier",
    label: "Nhà Cung Cấp",
    desc: "Danh bạ nhà cung cấp & yêu cầu báo giá RFQ",
    color: "#7c3aed",
    bg: "#f5f3ff",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    to: "/customers",
    label: "Khách Hàng",
    desc: "Hồ sơ y tế, dị ứng thuốc & điểm thưởng",
    color: "#f59e0b",
    bg: "#fffbeb",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    to: "/store/inventory",
    label: "Kho & Yêu Cầu Chi Nhánh",
    desc: "Tồn kho chi nhánh, đề xuất lĩnh thuốc & nhận hàng",
    color: "#ef4444",
    bg: "#fef2f2",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
      </svg>
    ),
  },
  {
    to: "/reports/profit",
    label: "Báo Cáo & Phân Tích",
    desc: "Lợi nhuận, định giá kho & xuất Excel",
    color: "#6366f1",
    bg: "#eef2ff",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    to: "/products",
    label: "Danh Mục Thuốc",
    desc: "Danh mục dược phẩm, lịch sử giá & phân loại",
    color: "#0891b2",
    bg: "#ecfeff",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    ),
  },
  {
    to: "/procurement/orders",
    label: "Đơn Mua Hàng (PO)",
    desc: "Phê duyệt đơn mua, ký nhận & theo dõi giao hàng",
    color: "#d97706",
    bg: "#fef3c7",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    to: "/users",
    label: "Quản Lý Người Dùng",
    desc: "Tài khoản nhân viên, phân quyền RBAC & nhật ký",
    color: "#64748b",
    bg: "#f8fafc",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

/* ── Recent activity (static placeholder) ── */
const RECENT_ACTIVITY = [
  { icon: "📦", text: "Phiếu nhập kho PR-2026-0041 đã xác nhận — Lô LOT-B2026-11", time: "2 phút trước", color: "#10b981" },
  { icon: "⚠️", text: "Cảnh báo cận hạn / tồn thấp: Augmentin 1g — còn 12 hộp", time: "14 phút trước", color: "#f59e0b" },
  { icon: "🧾", text: "Hóa đơn bán lẻ INV-2026-1284 — ₫640,000 — Tiền mặt", time: "31 phút trước", color: "#3b82f6" },
  { icon: "✅", text: "Xuất kho điều chuyển REQ-0098 đến Nhà thuốc Cầu Giấy (ST01)", time: "1 giờ trước", color: "#10b981" },
  { icon: "🔒", text: "Tài khoản nhân viên pharmacist_02 đã được khóa bởi Admin", time: "2 giờ trước", color: "#ef4444" },
  { icon: "📝", text: "Đề xuất mua hàng PP-2026-019 đã gửi trình Ban Giám Đốc", time: "3 giờ trước", color: "#7c3aed" },
];

export default function HomePage() {
  return (
    <div>
      {/* ── Hero welcome banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
        borderRadius: "var(--border-radius-xl)",
        padding: "32px 36px",
        marginBottom: 28,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 200, height: 200,
          background: "rgba(16, 185, 129, 0.08)",
          borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", bottom: -60, right: 120,
          width: 140, height: 140,
          background: "rgba(59, 130, 246, 0.06)",
          borderRadius: "50%",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "#34d399", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>
                PharmaChain — Hệ Thống Quản Trị Chuỗi Nhà Thuốc
              </div>
              <h1 style={{
                fontSize: 28, fontWeight: 800, color: "#f1f5f9",
                letterSpacing: "-0.5px", lineHeight: 1.2, margin: "0 0 8px",
              }}>
                Xin chào, Quản lý Hệ thống 👋
              </h1>
              <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
                Hệ thống Kho Dược & Nhà Thuốc · <span style={{ color: "#34d399" }}>Hệ thống đang hoạt động</span>
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <NavLink to="/warehouse/inventory" className="btn-pms btn-pms-primary" style={{ fontSize: 13 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M2 7l10-5 10 5"/>
                </svg>
                Kho Tổng
              </NavLink>
              <NavLink to="/pos" className="btn-pms btn-pms-secondary" style={{ fontSize: 13, background: "rgba(255,255,255,0.08)", color: "#f1f5f9", border: "1px solid rgba(255,255,255,0.12)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                Quầy Thu Ngân POS
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
        marginBottom: 28,
      }}>
        {KPI_CARDS.map((kpi) => (
          <div key={kpi.label} className="pms-stat-card" style={{ flexDirection: "row", gap: 16, alignItems: "flex-start" }}>
            <div className={`pms-stat-icon ${kpi.iconColor}`} style={{ flexShrink: 0 }}>{kpi.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="pms-stat-label">{kpi.label}</div>
              <div className="pms-stat-value" style={{ fontSize: 22 }}>{kpi.value}</div>
              <div style={{
                fontSize: 11, marginTop: 4, fontWeight: 600,
                color: kpi.deltaUp === true ? "var(--color-success)" : kpi.deltaUp === false ? "var(--color-danger)" : "var(--text-muted)",
              }}>
                {kpi.deltaUp === true && "↑ "}
                {kpi.deltaUp === false && "↓ "}
                {kpi.delta}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Access Modules + Activity ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

        {/* Quick access grid */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Truy Cập Nhanh — Các Phân Hệ Chức Năng</div>
            <span className="pms-badge pms-badge-neutral">Toàn diện các nghiệp vụ</span>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}>
            {QUICK_MODULES.map((mod) => (
              <NavLink
                key={mod.to}
                to={mod.to}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  padding: "18px 16px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--border-radius-lg)",
                  textDecoration: "none",
                  transition: "all 200ms ease",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)",
                }}
                className="module-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = mod.color;
                  e.currentTarget.style.boxShadow = `0 4px 20px ${mod.color}22`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  width: 48, height: 48,
                  background: mod.bg,
                  color: mod.color,
                  borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {mod.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>{mod.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.4 }}>{mod.desc}</div>
                </div>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: mod.color, fontWeight: 600 }}>
                  Truy cập
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Hoạt Động Gần Đây</div>
          <div className="pms-card" style={{ overflow: "visible" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {RECENT_ACTIVITY.map((item, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: 12,
                  padding: "14px 16px",
                  borderBottom: i < RECENT_ACTIVITY.length - 1 ? "1px solid var(--border-color)" : "none",
                  alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${item.color}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.4 }}>{item.text}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-color)" }}>
              <NavLink to="/audit-log" style={{ fontSize: 12, color: "var(--brand-primary)", fontWeight: 600, textDecoration: "none" }}>
                Xem nhật ký kiểm toán hệ thống →
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* ── All Modules Overview Table ── */}
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>
          Tổng Quan Các Phân Hệ Chức Năng Cốt Lõi
        </div>
        <div className="pms-card">
          <div className="pms-table-wrap">
            <table className="pms-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Phân Hệ</th>
                  <th>Chức Năng Chính</th>
                  <th>Người Phụ Trách</th>
                  <th>Số Nghiệp Vụ</th>
                  <th className="text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { no: 1, module: "Xác thực & Bảo mật", key: "Đăng nhập, Đăng xuất, Đổi mật khẩu, Hồ sơ cá nhân", assignee: "Tuấn Nam", count: 5, to: "/login", color: "#10b981" },
                  { no: 2, module: "Người Dùng & Phân Quyền", key: "Quản lý tài khoản, Phân quyền RBAC, Nhật ký kiểm toán", assignee: "Khoa Vinh", count: 6, to: "/users", color: "#7c3aed" },
                  { no: 3, module: "Danh Mục Thuốc & Giá", key: "Danh mục dược phẩm, Lịch sử giá, Nhóm thuốc", assignee: "Khoa Vinh", count: 9, to: "/products", color: "#3b82f6" },
                  { no: 4, module: "Bán Lẻ Tại Quầy POS", key: "Thu ngân POS, Xuất hóa đơn FEFO, Quản lý ca, Đổi trả", assignee: "Tuấn Nam", count: 8, to: "/pos", color: "#f59e0b" },
                  { no: 5, module: "Quản Lý Khách Hàng", key: "Hồ sơ sức khỏe, Cảnh báo dị ứng, Lịch sử mua thuốc", assignee: "Tuấn Nam", count: 5, to: "/customers", color: "#d97706" },
                  { no: 6, module: "Tồn Kho & Yêu Cầu Chi Nhánh", key: "Tồn kho chi nhánh, Đề xuất chuyển kho, Nhận hàng", assignee: "Trọng Đăng", count: 7, to: "/store/inventory", color: "#ef4444" },
                  { no: 7, module: "Kho Tổng Trung Tâm", key: "Tồn kho FEFO, Vị trí ô kệ, Điều chỉnh tồn, Cảnh báo cận hạn", assignee: "Nhật Huy", count: 14, to: "/warehouse/inventory", color: "#10b981" },
                  { no: 8, module: "Mua Sắm & Đấu Thầu", key: "Nhà cung cấp, Yêu cầu báo giá RFQ, Đề xuất mua sắm", assignee: "Nhật Quang", count: 13, to: "/supplier", color: "#6366f1" },
                  { no: 9, module: "Đơn Đặt Hàng Mua (PO)", key: "Ban Giám Đốc duyệt PO, Từ chối, Xác nhận nhập mua", assignee: "Trọng Đăng", count: 3, to: "/procurement/orders", color: "#0891b2" },
                  { no: 10, module: "Báo Cáo & Phân Tích BI", key: "Báo cáo lợi nhuận, Định giá tồn kho, Xuất Excel", assignee: "Trọng Đăng", count: 3, to: "/reports/profit", color: "#8b5cf6" },
                ].map((row) => (
                  <tr key={row.no}>
                    <td className="text-xs text-muted-color">{row.no}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: row.color, flexShrink: 0,
                        }} />
                        <span className="fw-600" style={{ fontSize: 13 }}>{row.module}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)", maxWidth: 280 }}>{row.key}</td>
                    <td>
                      <span className="pms-badge pms-badge-neutral">{row.assignee}</span>
                    </td>
                    <td>
                      <span className="fw-700" style={{ color: row.color }}>{row.count}</span>
                    </td>
                    <td className="text-right">
                      <NavLink to={row.to} className="btn-pms btn-pms-sm btn-pms-secondary">
                        Truy cập →
                      </NavLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
