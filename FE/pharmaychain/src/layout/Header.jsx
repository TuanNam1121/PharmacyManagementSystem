export default function Header() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm px-3 py-2">
      <div className="container-fluid d-flex justify-content-between align-items-center">

        {/* Search center */}
        <div className="input-group d-none d-md-flex" style={{ maxWidth: 560, width: '100%' }}>
          <span className="input-group-text bg-light border-end-0">
            <svg className="bi bi-search" width="16" height="16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.397h-.001c.03.04.062.078.098.115l1.57 1.57a1 1 0 0 0 1.414 0l.004-.004-1.57-1.57a1 1 0 0 0-1.414 0zm0-9A8 8 0 1 1 0 8a8 8 0 0 1 11.742-9zM12 6.5a5.5 5.5 0 1 0-11 0 5.5 5.5 0 0 0 11 0z"/></svg>
          </span>
          <input type="text" className="form-control border-start-0" placeholder="Tìm kiếm trong hệ thống..." />
        </div>

        {/* Right */}
        <div className="d-flex align-items-center gap-3">
          <div className="d-none d-md-flex align-items-center gap-2 text-muted small fw-medium">
            <svg className="bi bi-calendar2-week" width="16" height="16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2zM2 5a1 1 0 0 0-1 1v1h1V5zm1 3v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1H3zm14-1V8a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z"/></svg>
            {dateStr}
          </div>

          <div className="position-relative">
            <button className="btn btn-link text-muted p-0 border-0" type="button">
              <svg className="bi bi-bell" width="20" height="20"><path d="M8 16a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2zm4-9.5a3.5 3.5 0 1 0-7 0V8H5v1.5a3.5 3.5 0 0 0 7 0zM8 6.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H8a.5.5 0 0 1-.5-.5v-1z"/></svg>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">9+</span>
            </button>
          </div>

          <div className="dropdown text-end">
            <button className="btn btn-link text-dark p-0 border-0 d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                <span className="text-white fw-bold small">ML</span>
              </div>
              <div>
                <div className="fw-medium small">Nguyễn Mai Linh</div>
                <div className="text-muted smaller">Quản trị hệ thống</div>
              </div>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-sm">
              <li><a className="dropdown-item" href="#">Thông tin cá nhân</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item text-danger" href="#">Đăng xuất</a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
