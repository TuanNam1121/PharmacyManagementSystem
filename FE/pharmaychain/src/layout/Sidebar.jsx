import { NavLink } from 'react-router-dom';

const groups = [
  {
    label: 'TỔNG QUAN',
    items: [
      { key: '/', label: 'Toàn hệ thống', count: '24 nhà thuốc' },
      { key: '/dashboard', label: 'Tổng quan' },
    ],
  },
  {
    label: 'VẬN HÀNH',
    items: [
      { key: '/sales', label: 'Bán hàng', disabled: true },
      { key: '/orders', label: 'Đơn hàng', disabled: true, count: '12' },
      { key: '/inventory', label: 'Kho & hàng hóa', disabled: true },
      { key: '/purchase', label: 'Nhập hàng', disabled: true },
    ],
  },
  {
    label: 'ĐỐI TÁC',
    items: [
      { key: '/supplier', label: 'Nhà cung cấp', active: true },
      { key: '/customer', label: 'Khách hàng', disabled: true },
    ],
  },
  {
    label: 'QUẢN LÝ',
    items: [
      { key: '/branch', label: 'Chi nhánh', disabled: true },
      { key: '/staff', label: 'Nhân sự', disabled: true },
      { key: '/report', label: 'Báo cáo', disabled: true },
      { key: '/settings', label: 'Cài đặt', disabled: true },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand p-3 mb-3 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
            <span className="text-white fw-bold" style={{ fontSize: 18 }}>A</span>
          </div>
          <div>
            <div className="fw-bold small">An Khang</div>
            <div className="text-muted smaller">PHARMACY MANAGEMENT</div>
          </div>
        </div>
      </div>

      <nav className="nav flex-column px-2">
        {groups.map((group) => (
          <div key={group.label} className="mb-3">
            <div className="text-muted small fw-bold uppercase px-2 mb-2">{group.label}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.key}
                to={item.key}
                className={({ isActive }) =>
                  `sidebar-item d-flex align-items-center gap-2 px-2 py-2 rounded-3 text-decoration-none ${isActive || item.active ? 'sidebar-item-active' : ''} ${item.disabled ? 'text-muted disabled-item' : ''}`
                }
                onClick={(e) => { if (item.disabled) e.preventDefault(); }}
              >
                <span className="sidebar-label small">{item.label}</span>
                {item.count && <span className="badge bg-light text-dark ms-auto rounded-pill px-2">{item.count}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto p-3 border-top">
        <div className="text-muted small fw-medium">Phiên bản 1.0.0</div>
      </div>
    </aside>
  );
}
