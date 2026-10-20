export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container-fluid d-flex justify-content-between align-items-center px-4 py-2">
        <span className="text-muted small">© {year} An Khang Pharmacy Management</span>
        <span className="text-muted small">Hệ thống quản lý thuốc</span>
      </div>
    </footer>
  );
}
