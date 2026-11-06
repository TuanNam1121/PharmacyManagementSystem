   /* =====================================================================
      PHARMACY MANAGEMENT SYSTEM - SEED DATA (SQL Server / DBeaver)
      Stack : ReactJS + Java Spring Boot + SQL Server
      Conventions: snake_case tables/columns, no GO statements (DBeaver compatible)
      ===================================================================== */

   USE PMS;
   SET NOCOUNT ON;

   /* =====================================================================
      1. STORES
      ===================================================================== */
   SET IDENTITY_INSERT dbo.stores ON;
   INSERT INTO dbo.stores (id, code, name, type, address, phone, status, created_at) VALUES
   (1, 'HQ-001', N'Trụ sở chính', 0, N'Số 1 Lê Duẩn, Quận 1, TP.HCM', '02838221234', 1, '2026-01-01 08:00:00'),
   (2, 'ST-001', N'Chi nhánh Quận 1', 1, N'Số 25 Đồng Khởi, Quận 1, TP.HCM', '02838225678', 1, '2026-01-02 08:00:00'),
   (3, 'ST-002', N'Chi nhánh Bình Thạnh', 1, N'Số 123 Lê Văn Việt, Bình Thạnh, TP.HCM', '02838229012', 1, '2026-01-03 08:00:00'),
   (4, 'WH-001', N'Kho trung tâm', 2, N'Số 456 Nguyễn Văn Cừ, Quận Gò Vấp, TP.HCM', '02838223456', 1, '2026-01-04 08:00:00');
   SET IDENTITY_INSERT dbo.stores OFF;

   /* =====================================================================
      2. ROLES
      ===================================================================== */
   SET IDENTITY_INSERT dbo.roles ON;
   INSERT INTO dbo.roles (id, code, name, description) VALUES
   (1, 'ADMIN',             N'Quản trị viên hệ thống', N'Quyền hạn cao nhất, quản trị toàn hệ thống'),
   (2, 'STORE_MANAGER',     N'Quản lý cửa hàng',       N'Quản lý hoạt động cửa hàng, nhân viên, tồn kho'),
   (3, 'PHARMACIST',        N'Dược sĩ',                N'Bán thuốc, tư vấn, lập hóa đơn'),
   (4, 'PURCHASING_STAFF',  N'Nhân viên mua hàng',     N'Lập yêu cầu mua hàng, quản lý nhà cung cấp'),
   (5, 'GENERAL_MANAGER',   N'Giám đốc tổng',          N'Quyết định chiến lược, duyệt đơn mua lớn'),

   /* =====================================================================
      3. PERMISSIONS (part 1)
      ===================================================================== */
   SET IDENTITY_INSERT dbo.permissions ON;
   INSERT INTO dbo.permissions (id, code, module, description) VALUES
   (1,  'USER_VIEW',             'USER',             N'Xem danh sách người dùng'),
   (2,  'USER_CREATE',           'USER',             N'Tạo người dùng mới'),
   (3,  'USER_UPDATE',           'USER',             N'Cập nhật thông tin người dùng'),
   (4,  'USER_LOCK',             'USER',             N'Khóa/mở khóa tài khoản'),
   (5,  'USER_ASSIGN_ROLE',      'USER',             N'Phân vai trò cho người dùng'),
   (6,  'AUDIT_VIEW',            'USER',             N'Xem nhật ký kiểm toán'),
   (7,  'PRODUCT_VIEW',          'PRODUCT',          N'Xem danh sách sản phẩm'),
   (8,  'PRODUCT_CREATE',        'PRODUCT',          N'Tạo sản phẩm mới'),
   (9,  'PRODUCT_UPDATE',        'PRODUCT',          N'Cập nhật thông tin sản phẩm'),
   (10, 'PRICE_MANAGE',          'PRODUCT',          N'Quản lý giá bán'),
   (11, 'PRICE_HISTORY_VIEW',    'PRODUCT',          N'Xem lịch sử thay đổi giá'),
   (12, 'CATEGORY_VIEW',         'CATEGORY',         N'Xem danh mục sản phẩm'),
   (13, 'CATEGORY_CREATE',       'CATEGORY',         N'Tạo danh mục mới'),
   (14, 'CATEGORY_UPDATE',       'CATEGORY',         N'Cập nhật danh mục'),
   (15, 'CATEGORY_DELETE',       'CATEGORY',         N'Xóa danh mục'),
   (16, 'SHIFT_OPEN',            'SHIFT',            N'Mở ca làm việc'),
   (17, 'SHIFT_CLOSE',           'SHIFT',            N'Đóng ca làm việc'),
   (18, 'INVOICE_CREATE',        'SALES',            N'Tạo hóa đơn bán hàng'),
   (19, 'PAYMENT_PROCESS',       'SALES',            N'Xử lý thanh toán'),
   (20, 'INVOICE_CANCEL',        'SALES',            N'Hủy hóa đơn'),
   (21, 'INVOICE_VIEW',          'SALES',            N'Xem hóa đơn'),
   (22, 'SALES_DAILY_VIEW',      'SALES',            N'Xem báo cáo doanh thu ngày'),
   (23, 'SALES_RECONCILE',       'SALES',            N'Điều chỉnh doanh thu ngày'),
   (24, 'CUSTOMER_VIEW',         'CUSTOMER',         N'Xem danh sách khách hàng'),
   (25, 'CUSTOMER_CREATE',       'CUSTOMER',         N'Tạo khách hàng mới'),
   (26, 'CUSTOMER_UPDATE',       'CUSTOMER',         N'Cập nhật thông tin khách hàng'),
   (27, 'CUSTOMER_DELETE',       'CUSTOMER',         N'Xóa khách hàng'),
   (28, 'STORE_INVENTORY_VIEW',  'STORE_INVENTORY',  N'Xem tồn kho cửa hàng'),
   (29, 'STORE_AUDIT_REVIEW',    'STORE_INVENTORY',  N'Duyệt kiểm kê tồn kho'),
   (30, 'REQUISITION_CREATE',    'STORE_INVENTORY',  N'Tạo phiếu yêu cầu hàng'),
   (31, 'REQUISITION_VIEW',      'STORE_INVENTORY',  N'Xem phiếu yêu cầu hàng'),
   (32, 'REQUISITION_UPDATE',    'STORE_INVENTORY',  N'Cập nhật phiếu yêu cầu hàng'),
   (33, 'GOODS_RECEIPT_VIEW',    'STORE_INVENTORY',  N'Xem phiếu nhập kho'),
   (34, 'GOODS_RECEIPT_CONFIRM', 'STORE_INVENTORY',  N'Xác nhận phiếu nhập kho');
   SET IDENTITY_INSERT dbo.permissions OFF;
   (6, 'WAREHOUSE_MANAGER', N'Quản lý kho',            N'Quản lý kho trung tâm, nhập kho, điều phối'),
   (7, 'WAREHOUSE_STAFF',   N'Nhân viên kho',          N'Nhập xuất kho, sắp xếp hàng');
   SET IDENTITY_INSERT dbo.roles OFF;