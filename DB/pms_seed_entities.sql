/* ==============================================================================
   PMS - SEED DATA CHO TOÀN BỘ 45 ENTITY (SQL SERVER)
   ------------------------------------------------------------------------------
   Nguồn sự thật : BE/sba/src/main/java/com/pharmacy/entity/  (45 @Entity + 1 @Embeddable)
   Mục tiêu      : Nạp dữ liệu mẫu cho TẤT CẢ các bảng, giữ đúng ràng buộc khóa ngoại
   Mật khẩu      : Password@123 (hash BCrypt dùng chung bên dưới)
   ------------------------------------------------------------------------------
   GHI CHÚ KHI CHẠY TRÊN DBEAVER
   - File KHÔNG chứa GO / PRINT / USE  ->  bôi đen toàn bộ và Execute script (Alt+X)
   - Toàn bộ chạy trong 1 transaction: lỗi là rollback sạch, không có dữ liệu nửa vời
   - Nếu DB chưa có 7 bảng có cột computed: chạy file pms_missing_tables_ddl.sql TRƯỚC, rồi mới chạy seed này
   - KHÔNG chèn các cột computed (DB tự tính):
       sales_invoice_details.sub_total, sales_return_details.sub_total,
       supplier_quotation_details.subtotal, inventory_audit_details.variance,
       inventory_adjustments.difference, daily_sales_reconciliations.system_total/difference,
       shifts.difference
   ============================================================================== */

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF EXISTS (SELECT 1 FROM dbo.accounts)
    BEGIN
        THROW 50001, N'Bảng accounts đã có dữ liệu. Hãy làm trống dữ liệu trước khi chạy lại seed.', 1;
    END;

    DECLARE @now   DATETIME2(0) = SYSDATETIME();
    DECLARE @today DATE         = CAST(SYSDATETIME() AS DATE);
    DECLARE @pwd   VARCHAR(100) = '$2a$10$L9xsmyG2oY8RIO6LshT6k.b5OXL0mQEHkv6toPJgOY81ixjxiovgG';

    /* ========================= 1. IDENTITY & RBAC ========================= */
    INSERT INTO dbo.roles (code, name, description) VALUES
        ('ADMIN',             N'Quản trị hệ thống',  N'Toàn quyền trên toàn bộ hệ thống'),
        ('GENERAL_MANAGER',   N'Giám đốc',           N'Xem báo cáo toàn chuỗi và phê duyệt đề xuất mua hàng'),
        ('STORE_MANAGER',     N'Quản lý chi nhánh',  N'Quản lý bán hàng, nhân sự và tồn kho tại chi nhánh'),
        ('PHARMACIST',        N'Dược sĩ',            N'Bán hàng tại quầy, tư vấn thuốc, mở/đóng ca'),
        ('WAREHOUSE_MANAGER', N'Quản lý kho',        N'Quản lý tồn kho, kiểm kê, điều chỉnh và nhập hàng'),
        ('WAREHOUSE_STAFF',   N'Nhân viên kho',      N'Soạn hàng, xuất kho, nhận hàng điều chuyển'),
        ('PURCHASING_STAFF',  N'Nhân viên thu mua',  N'Tạo yêu cầu mua, gửi RFQ và theo dõi báo giá');

    INSERT INTO dbo.permissions (code, [module], description) VALUES
        ('SYSTEM_SETTING_VIEW',        'SYSTEM',   N'Xem cấu hình hệ thống'),
        ('SYSTEM_SETTING_UPDATE',      'SYSTEM',   N'Cập nhật cấu hình hệ thống'),
        ('AUDIT_LOG_VIEW',             'SYSTEM',   N'Xem nhật ký thao tác'),
        ('ACCOUNT_VIEW',               'ACCOUNT',  N'Xem danh sách tài khoản'),
        ('ACCOUNT_CREATE',             'ACCOUNT',  N'Tạo tài khoản nhân viên'),
        ('ACCOUNT_UPDATE',             'ACCOUNT',  N'Cập nhật tài khoản nhân viên'),
        ('ACCOUNT_DELETE',             'ACCOUNT',  N'Khóa tài khoản nhân viên'),
        ('ROLE_VIEW',                  'ACCOUNT',  N'Xem vai trò và quyền'),
        ('ROLE_ASSIGN',                'ACCOUNT',  N'Gán vai trò cho tài khoản'),
        ('PRODUCT_VIEW',               'CATALOG',  N'Xem danh mục thuốc'),
        ('PRODUCT_CREATE',             'CATALOG',  N'Tạo thuốc mới'),
        ('PRODUCT_UPDATE',             'CATALOG',  N'Cập nhật thông tin thuốc'),
        ('PRODUCT_DELETE',             'CATALOG',  N'Ngừng kinh doanh thuốc'),
        ('CATEGORY_VIEW',              'CATALOG',  N'Xem nhóm thuốc'),
        ('CATEGORY_MANAGE',            'CATALOG',  N'Thêm/sửa nhóm thuốc'),
        ('SUPPLIER_VIEW',              'CATALOG',  N'Xem nhà cung cấp'),
        ('SUPPLIER_MANAGE',            'CATALOG',  N'Thêm/sửa nhà cung cấp'),
        ('INVENTORY_VIEW',             'INVENTORY',N'Xem tồn kho'),
        ('INVENTORY_ADJUST',           'INVENTORY',N'Tạo phiếu điều chỉnh tồn kho'),
        ('INVENTORY_AUDIT_CREATE',     'INVENTORY',N'Tạo phiếu kiểm kê'),
        ('INVENTORY_AUDIT_APPROVE',    'INVENTORY',N'Duyệt phiếu kiểm kê'),
        ('STOCK_MOVEMENT_VIEW',        'INVENTORY',N'Xem lịch sử xuất nhập tồn'),
        ('INVOICE_VIEW',               'SALES',    N'Xem hóa đơn bán hàng'),
        ('INVOICE_CREATE',             'SALES',    N'Tạo hóa đơn bán hàng'),
        ('INVOICE_CANCEL',             'SALES',    N'Hủy hóa đơn bán hàng'),
        ('INVOICE_RETURN',             'SALES',    N'Lập phiếu trả hàng'),
        ('SHIFT_OPEN',                 'SALES',    N'Mở ca bán hàng'),
        ('SHIFT_CLOSE',                'SALES',    N'Đóng ca bán hàng'),
        ('SHIFT_RECONCILE',            'SALES',    N'Kết toán ca bán hàng'),
        ('DAILY_SALES_VIEW',           'SALES',    N'Xem đối soát doanh thu ngày'),
        ('PURCHASE_REQUEST_VIEW',      'PURCHASE', N'Xem yêu cầu mua hàng'),
        ('PURCHASE_REQUEST_CREATE',    'PURCHASE', N'Tạo yêu cầu mua hàng'),
        ('PURCHASE_REQUEST_APPROVE',   'PURCHASE', N'Duyệt yêu cầu mua hàng'),
        ('RFQ_SEND',                   'PURCHASE', N'Gửi RFQ cho nhà cung cấp'),
        ('QUOTATION_VIEW',             'PURCHASE', N'Xem báo giá nhà cung cấp'),
        ('PURCHASE_PROPOSAL_APPROVE',  'PURCHASE', N'Duyệt đề xuất mua hàng'),
        ('WH_RECEIPT_CONFIRM',         'PURCHASE', N'Xác nhận nhập kho'),
        ('STOCK_REQUISITION_CREATE',   'TRANSFER', N'Tạo yêu cầu cấp hàng'),
        ('STOCK_REQUISITION_APPROVE',  'TRANSFER', N'Duyệt yêu cầu cấp hàng'),
        ('GOODS_ISSUE_DISPATCH',       'TRANSFER', N'Xuất kho điều chuyển'),
        ('GOODS_ISSUE_RECEIVE',        'TRANSFER', N'Nhận hàng điều chuyển'),
        ('CUSTOMER_VIEW',              'CUSTOMER', N'Xem khách hàng'),
        ('CUSTOMER_CREATE',            'CUSTOMER', N'Tạo khách hàng'),
        ('CUSTOMER_UPDATE',            'CUSTOMER', N'Cập nhật khách hàng'),
        ('CUSTOMER_DELETE',            'CUSTOMER', N'Khóa khách hàng'),
        ('HEALTH_PROFILE_VIEW',        'CUSTOMER', N'Xem hồ sơ sức khỏe khách hàng'),
        ('REPORT_INVENTORY_VIEW',      'REPORT',   N'Xem báo cáo tồn kho'),
        ('REPORT_PROFIT_VIEW',         'REPORT',   N'Xem báo cáo lợi nhuận'),
        ('REPORT_SALES_VIEW',          'REPORT',   N'Xem báo cáo bán hàng');

    /* Gán quyền cho từng vai trò (role_permissions) */
    INSERT INTO dbo.role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM dbo.roles r CROSS JOIN dbo.permissions p WHERE r.code = 'ADMIN';

    INSERT INTO dbo.role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM dbo.roles r
    JOIN dbo.permissions p ON p.code IN (
        'SYSTEM_SETTING_VIEW', 'AUDIT_LOG_VIEW', 'ACCOUNT_VIEW', 'ROLE_VIEW',
        'PRODUCT_VIEW', 'CATEGORY_VIEW', 'SUPPLIER_VIEW', 'INVENTORY_VIEW', 'STOCK_MOVEMENT_VIEW',
        'INVENTORY_AUDIT_APPROVE', 'INVOICE_VIEW', 'DAILY_SALES_VIEW',
        'PURCHASE_REQUEST_VIEW', 'PURCHASE_REQUEST_APPROVE', 'QUOTATION_VIEW',
        'PURCHASE_PROPOSAL_APPROVE', 'WH_RECEIPT_CONFIRM', 'STOCK_REQUISITION_APPROVE',
        'CUSTOMER_VIEW', 'HEALTH_PROFILE_VIEW',
        'REPORT_INVENTORY_VIEW', 'REPORT_PROFIT_VIEW', 'REPORT_SALES_VIEW')
    WHERE r.code = 'GENERAL_MANAGER';

    INSERT INTO dbo.role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM dbo.roles r
    JOIN dbo.permissions p ON p.code IN (
        'PRODUCT_VIEW', 'CATEGORY_VIEW', 'SUPPLIER_VIEW', 'INVENTORY_VIEW', 'STOCK_MOVEMENT_VIEW',
        'INVENTORY_AUDIT_CREATE', 'INVOICE_VIEW', 'INVOICE_CREATE', 'INVOICE_CANCEL', 'INVOICE_RETURN',
        'SHIFT_OPEN', 'SHIFT_CLOSE', 'SHIFT_RECONCILE', 'DAILY_SALES_VIEW',
        'CUSTOMER_VIEW', 'CUSTOMER_CREATE', 'CUSTOMER_UPDATE', 'HEALTH_PROFILE_VIEW',
        'PURCHASE_REQUEST_VIEW', 'PURCHASE_REQUEST_CREATE', 'QUOTATION_VIEW',
        'STOCK_REQUISITION_CREATE', 'REPORT_SALES_VIEW', 'REPORT_INVENTORY_VIEW')
    WHERE r.code = 'STORE_MANAGER';

    INSERT INTO dbo.role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM dbo.roles r
    JOIN dbo.permissions p ON p.code IN (
        'PRODUCT_VIEW', 'CATEGORY_VIEW', 'INVENTORY_VIEW', 'STOCK_MOVEMENT_VIEW',
        'INVOICE_VIEW', 'INVOICE_CREATE', 'INVOICE_RETURN', 'SHIFT_OPEN', 'SHIFT_CLOSE',
        'CUSTOMER_VIEW', 'CUSTOMER_CREATE', 'CUSTOMER_UPDATE', 'HEALTH_PROFILE_VIEW')
    WHERE r.code = 'PHARMACIST';

    INSERT INTO dbo.role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM dbo.roles r
    JOIN dbo.permissions p ON p.code IN (
        'PRODUCT_VIEW', 'CATEGORY_VIEW', 'SUPPLIER_VIEW', 'INVENTORY_VIEW', 'INVENTORY_ADJUST',
        'INVENTORY_AUDIT_CREATE', 'INVENTORY_AUDIT_APPROVE', 'STOCK_MOVEMENT_VIEW',
        'PURCHASE_REQUEST_VIEW', 'PURCHASE_REQUEST_APPROVE', 'QUOTATION_VIEW',
        'PURCHASE_PROPOSAL_APPROVE', 'WH_RECEIPT_CONFIRM',
        'STOCK_REQUISITION_APPROVE', 'GOODS_ISSUE_DISPATCH', 'REPORT_INVENTORY_VIEW')
    WHERE r.code = 'WAREHOUSE_MANAGER';

    INSERT INTO dbo.role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM dbo.roles r
    JOIN dbo.permissions p ON p.code IN (
        'PRODUCT_VIEW', 'INVENTORY_VIEW', 'STOCK_MOVEMENT_VIEW', 'INVENTORY_AUDIT_CREATE',
        'GOODS_ISSUE_DISPATCH', 'GOODS_ISSUE_RECEIVE')
    WHERE r.code = 'WAREHOUSE_STAFF';

    INSERT INTO dbo.role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM dbo.roles r
    JOIN dbo.permissions p ON p.code IN (
        'PRODUCT_VIEW', 'CATEGORY_VIEW', 'SUPPLIER_VIEW', 'SUPPLIER_MANAGE', 'INVENTORY_VIEW',
        'PURCHASE_REQUEST_VIEW', 'PURCHASE_REQUEST_CREATE', 'RFQ_SEND', 'QUOTATION_VIEW',
        'REPORT_INVENTORY_VIEW')
    WHERE r.code = 'PURCHASING_STAFF';

    /* ============================ 2. TỔ CHỨC ============================ */
    INSERT INTO dbo.stores (code, name, type, address, phone, status, created_at) VALUES
        ('HO01', N'Nhà thuốc Phúc An - Trụ sở chính', 0,
         N'125 Nguyễn Thị Minh Khai, Phường Bến Thành, Quận 1, TP.HCM', '02838221234', 1, DATEADD(DAY, -400, @now)),
        ('WH01', N'Kho tổng Phúc An - Bình Tân', 2,
         N'Lô C12 KCN Tân Tạo, Phường Tân Tạo A, Quận Bình Tân, TP.HCM', '02837541234', 1, DATEADD(DAY, -400, @now)),
        ('ST01', N'Nhà thuốc Phúc An - Quận 1', 1,
         N'45 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM', '02838224567', 1, DATEADD(DAY, -360, @now)),
        ('ST02', N'Nhà thuốc Phúc An - Quận 7', 1,
         N'812 Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP.HCM', '02837745678', 1, DATEADD(DAY, -300, @now)),
        ('ST03', N'Nhà thuốc Phúc An - Thủ Đức', 1,
         N'210 Võ Văn Ngân, Phường Bình Thọ, TP Thủ Đức, TP.HCM', '02838961234', 1, DATEADD(DAY, -180, @now));

    INSERT INTO dbo.warehouse_locations (store_id, code, aisle, shelf, bin, status)
    SELECT s.id, t.code, t.aisle, t.shelf, t.bin, 1
    FROM (VALUES
        ('WH01', 'WH-A-01', 'A', '01', '01'),
        ('WH01', 'WH-A-02', 'A', '02', '01'),
        ('WH01', 'WH-A-03', 'A', '03', '01'),
        ('WH01', 'WH-B-01', 'B', '01', '01'),
        ('WH01', 'WH-B-02', 'B', '02', '01'),
        ('ST01', 'Q1-A01',  'A', '01', '01'),
        ('ST01', 'Q1-A02',  'A', '02', '01'),
        ('ST02', 'Q7-A01',  'A', '01', '01'),
        ('ST03', 'TD-A01',  'A', '01', '01')
    ) AS t(store_code, code, aisle, shelf, bin)
    JOIN dbo.stores s ON s.code = t.store_code;

    /* ========================= 3. TÀI KHOẢN NHÂN SỰ ========================= */
    INSERT INTO dbo.accounts (username, email, phone, password, status, failed_login_count, created_at, role_id, store_id)
    SELECT t.username, t.email, t.phone, @pwd, t.status, 0, DATEADD(DAY, -200, @now), r.id, s.id
    FROM (VALUES
        ('admin',             'admin@phucanpharmacy.vn',            '0901234567', CAST(1 AS TINYINT), 'ADMIN',             'HO01'),
        ('general_manager',   'general.manager@phucanpharmacy.vn',   '0901234568', CAST(1 AS TINYINT), 'GENERAL_MANAGER',   'HO01'),
        ('manager',           'manager@phucanpharmacy.vn',          '0901234569', CAST(1 AS TINYINT), 'STORE_MANAGER',     'ST01'),
        ('store_manager',     'store.manager@phucanpharmacy.vn',     '0901234570', CAST(1 AS TINYINT), 'STORE_MANAGER',     'ST02'),
        ('store_manager_demo','store.manager.demo@phucanpharmacy.vn','0901234571', CAST(1 AS TINYINT), 'STORE_MANAGER',     'ST01'),
        ('pharmacist_duty',   'pharmacist.duty@phucanpharmacy.vn',   '0901234572', CAST(1 AS TINYINT), 'PHARMACIST',        'ST01'),
        ('pharmacist_2',      'pharmacist.two@phucanpharmacy.vn',    '0901234573', CAST(1 AS TINYINT), 'PHARMACIST',        'ST02'),
        ('warehouse_manager', 'warehouse.manager@phucanpharmacy.vn', '0901234574', CAST(1 AS TINYINT), 'WAREHOUSE_MANAGER', 'WH01'),
        ('warehouse_staff',   'warehouse.staff@phucanpharmacy.vn',   '0901234575', CAST(1 AS TINYINT), 'WAREHOUSE_STAFF',   'WH01'),
        ('purchasing_staff',  'purchasing.staff@phucanpharmacy.vn',  '0901234576', CAST(1 AS TINYINT), 'PURCHASING_STAFF',  'HO01')
    ) AS t(username, email, phone, status, role_code, store_code)
    JOIN dbo.roles  r ON r.code = t.role_code
    JOIN dbo.stores s ON s.code = t.store_code;

    INSERT INTO dbo.account_informations (account_id, full_name, date_of_birth, gender, address, avatar_url)
    SELECT a.id, t.full_name, t.dob, t.gender, t.address, t.avatar
    FROM (VALUES
        ('admin',             N'Hoàng Minh Quân',   CAST('1985-03-12' AS DATE), CAST(1 AS TINYINT), N'12 Trần Hưng Đạo, Phường 7, Quận 5, TP.HCM',             '/avatars/admin.png'),
        ('general_manager',   N'Nguyễn Thị Thu Hà', CAST('1980-07-25' AS DATE), CAST(2 AS TINYINT), N'88 Nguyễn Du, Phường Bến Thành, Quận 1, TP.HCM',          '/avatars/gm.png'),
        ('manager',           N'Trần Quốc Bảo',     CAST('1988-11-02' AS DATE), CAST(1 AS TINYINT), N'25 Pasteur, Phường Nguyễn Thái Bình, Quận 1, TP.HCM',      '/avatars/manager.png'),
        ('store_manager',     N'Lê Thị Mai',        CAST('1990-05-18' AS DATE), CAST(2 AS TINYINT), N'63 Huỳnh Tấn Phát, Phường Tân Thuận Đông, Quận 7, TP.HCM','/avatars/sm2.png'),
        ('store_manager_demo',N'Phan Anh Tuấn',     CAST('1992-02-09' AS DATE), CAST(1 AS TINYINT), N'101 Cách Mạng Tháng 8, Phường 5, Quận 3, TP.HCM',        '/avatars/sm3.png'),
        ('pharmacist_duty',   N'Phạm Văn Dũng',     CAST('1995-09-30' AS DATE), CAST(1 AS TINYINT), N'17 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM',       '/avatars/ph1.png'),
        ('pharmacist_2',      N'Võ Thị Hồng',       CAST('1996-12-14' AS DATE), CAST(2 AS TINYINT), N'230 Nguyễn Văn Linh, Phường Tân Phong, Quận 7, TP.HCM',   '/avatars/ph2.png'),
        ('warehouse_manager', N'Đặng Văn Khánh',    CAST('1987-04-21' AS DATE), CAST(1 AS TINYINT), N'Lô B5 KDC Tân Tạo, Phường Tân Tạo A, Quận Bình Tân, TP.HCM','/avatars/wm.png'),
        ('warehouse_staff',   N'Bùi Minh Tuấn',     CAST('1998-08-07' AS DATE), CAST(1 AS TINYINT), N'45 Tỉnh lộ 10, Phường Bình Trị Đông, Quận Bình Tân, TP.HCM','/avatars/ws.png'),
        ('purchasing_staff',  N'Ngô Thị Lan',       CAST('1994-06-16' AS DATE), CAST(2 AS TINYINT), N'312 Điện Biên Phủ, Phường 7, Quận 3, TP.HCM',            '/avatars/ps.png')
    ) AS t(username, full_name, dob, gender, address, avatar)
    JOIN dbo.accounts a ON a.username = t.username;

    /* Khóa ngoại tra theo nghiệp vụ (username/code) - không hardcode ID */
    DECLARE @accAdmin            BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'admin');
    DECLARE @accGeneralManager   BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'general_manager');
    DECLARE @accManager          BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'manager');
    DECLARE @accStoreManager     BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'store_manager');
    DECLARE @accStoreManagerDemo BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'store_manager_demo');
    DECLARE @accPharmacist       BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'pharmacist_duty');
    DECLARE @accPharmacist2      BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'pharmacist_2');
    DECLARE @accWarehouseManager BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'warehouse_manager');
    DECLARE @accWarehouseStaff   BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'warehouse_staff');
    DECLARE @accPurchasing       BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'purchasing_staff');

    DECLARE @storeHo   BIGINT = (SELECT id FROM dbo.stores WHERE code = 'HO01');
    DECLARE @storeWh   BIGINT = (SELECT id FROM dbo.stores WHERE code = 'WH01');
    DECLARE @storeSt01 BIGINT = (SELECT id FROM dbo.stores WHERE code = 'ST01');
    DECLARE @storeSt02 BIGINT = (SELECT id FROM dbo.stores WHERE code = 'ST02');
    DECLARE @storeSt03 BIGINT = (SELECT id FROM dbo.stores WHERE code = 'ST03');

    DECLARE @locQ1A01 BIGINT = (SELECT id FROM dbo.warehouse_locations WHERE code = 'Q1-A01');
    DECLARE @locQ7A01 BIGINT = (SELECT id FROM dbo.warehouse_locations WHERE code = 'Q7-A01');
    DECLARE @locWhA01 BIGINT = (SELECT id FROM dbo.warehouse_locations WHERE code = 'WH-A-01');

    /* ======================== 4. NHÀ CUNG CẤP & DANH MỤC ======================== */
    INSERT INTO dbo.suppliers (code, name, contact_person, phone, email, address, tax_code, status, note, delete_reason, created_at) VALUES
        ('SUP001', N'Công ty Cổ phần Dược phẩm Hậu Giang', N'Nguyễn Thành Long', '02923891234', 'sales@dhgpharma.com.vn',
         N'288 Bis Nguyễn Văn Cừ, Phường An Hòa, Quận Ninh Kiều, Cần Thơ', '1800159351', 1,
         N'Nhà cung cấp chiến lược - công nợ 30 ngày', NULL, DATEADD(DAY, -350, @now)),
        ('SUP002', N'Công ty Cổ phần Traphaco', N'Trần Mỹ Linh', '02438562189', 'kinhdoanh@traphaco.com.vn',
         N'75 Yên Ninh, Phường Trúc Bạch, Quận Ba Đình, Hà Nội', '0100108558', 1,
         N'Giao hàng 2 lần/tháng vào thứ Ba và thứ Sáu', NULL, DATEADD(DAY, -340, @now)),
        ('SUP003', N'Công ty Cổ phần Dược phẩm Imexpharm', N'Lê Hoàng Nam', '02773851234', 'sales@imexpharm.com',
         N'04 Đường 30/4, Phường 1, TP Cao Lãnh, Đồng Tháp', '1400222735', 1,
         N'Chuyên kháng sinh và thuốc tim mạch', NULL, DATEADD(DAY, -330, @now)),
        ('SUP004', N'Công ty TNHH Zuellig Pharma Việt Nam', N'Phan Thanh Trúc', '02838125400', 'cs.vn@zuelligpharma.com',
         N'Tòa nhà Etown 2, 364 Cộng Hòa, Phường 13, Quận Tân Bình, TP.HCM', '0302043590', 1,
         N'Nhà phân phối độc quyền nhiều nhãn hàng ngoại', NULL, DATEADD(DAY, -320, @now)),
        ('SUP005', N'Công ty Cổ phần Pymepharco', N'Võ Đình Khoa', '02573845123', 'info@pymepharco.com',
         N'166-170 Nguyễn Huệ, Phường 7, TP Tuy Hòa, Phú Yên', '4400207448', 1,
         N'Thanh toán chuyển khoản trong 15 ngày', NULL, DATEADD(DAY, -300, @now)),
        ('SUP006', N'Công ty TNHH Mega Wecare Việt Nam', N'Đỗ Thị Kim Chi', '02838211388', 'order@megawecare.com.vn',
         N'Lầu 5, 98 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM', '0302888541', 1,
         N'Chuyên vitamin và thực phẩm bổ sung', NULL, DATEADD(DAY, -280, @now)),
        ('SUP007', N'Công ty Cổ phần Thiết bị Y tế Medipro', N'Trương Văn Hải', '02838556677', 'sales@medipro.com.vn',
         N'52 Nguyễn Văn Trỗi, Phường 15, Quận Phú Nhuận, TP.HCM', '0311204578', 1,
         N'Cung cấp thiết bị y tế và vật tư tiêu hao', NULL, DATEADD(DAY, -260, @now)),
        ('SUP008', N'Công ty TNHH Mỹ phẩm Sakura Việt Nam', N'Mai Ngọc Diệp', '02837445566', 'b2b@sakura-vn.com',
         N'178 Lê Văn Sỹ, Phường 10, Quận Phú Nhuận, TP.HCM', '0309987421', 1,
         N'Chiết khấu 5% cho đơn từ 20 triệu', NULL, DATEADD(DAY, -240, @now)),
        ('SUP009', N'Công ty TNHH Dược phẩm Tân Thành', N'Nguyễn Đức Thắng', '02839223344', 'contact@tanthanhpharma.vn',
         N'97 Lý Thường Kiệt, Phường 7, Quận Tân Bình, TP.HCM', '0306341298', 2,
         N'Đã ngừng nhập hàng từ tháng 01/2026', N'Ngừng hợp tác do không đảm bảo tiêu chuẩn bảo quản', DATEADD(DAY, -400, @now)),
        ('SUP010', N'Công ty TNHH Dược phẩm Bình Minh', N'Lâm Thanh Sang', '02923776655', 'info@binhminhpharma.vn',
         N'12 Nguyễn Trãi, Phường Cái Khế, Quận Ninh Kiều, Cần Thơ', '1801064213', 3,
         N'Nhà cung cấp mới, đang chờ thẩm định hồ sơ', NULL, DATEADD(DAY, -30, @now));

    INSERT INTO dbo.categories (name, description, status, created_by, created_at) VALUES
        (N'Thuốc giảm đau - hạ sốt',      N'Nhóm thuốc giảm đau, kháng viêm, hạ sốt thông dụng', 1, @accAdmin, DATEADD(DAY, -350, @now)),
        (N'Thuốc kháng sinh',             N'Thuốc kê đơn dùng trong điều trị nhiễm khuẩn',       1, @accAdmin, DATEADD(DAY, -350, @now)),
        (N'Thuốc tiêu hóa',               N'Thuốc điều trị rối loạn tiêu hóa, dạ dày - tá tràng',  1, @accAdmin, DATEADD(DAY, -340, @now)),
        (N'Vitamin & thực phẩm bổ sung',  N'Vitamin, khoáng chất và thực phẩm bảo vệ sức khỏe',  1, @accAdmin, DATEADD(DAY, -340, @now)),
        (N'Thuốc tim mạch - huyết áp',    N'Thuốc điều trị tăng huyết áp và bệnh tim mạch',       1, @accAdmin, DATEADD(DAY, -320, @now)),
        (N'Thuốc hô hấp',                 N'Thuốc trị hen phế quản, long đờm, viêm mũi dị ứng',    1, @accAdmin, DATEADD(DAY, -320, @now)),
        (N'Thiết bị y tế',                N'Dụng cụ, thiết bị và vật tư y tế tiêu hao',           1, @accAdmin, DATEADD(DAY, -300, @now)),
        (N'Mỹ phẩm - chăm sóc da',        N'Sản phẩm chăm sóc da và mỹ phẩm dược liệu',           1, @accAdmin, DATEADD(DAY, -300, @now));    INSERT INTO dbo.products (barcode, name, unit, active_ingredient, manufacturer, is_prescription,
                              cost_price, selling_price, min_quantity, description, status, created_at, category_id)
    SELECT t.barcode, t.name, t.unit, t.ingredient, t.manufacturer, t.is_rx,
           t.cost_price, t.selling_price, t.min_quantity, t.description, CAST(1 AS TINYINT),
           DATEADD(DAY, -140, @now), c.id
    FROM (VALUES
        ('8934567890101', N'Paracetamol 500mg', N'Hộp 10 vỉ x 10 viên', N'Paracetamol 500mg', N'Domesco', CAST(0 AS BIT), CAST(28000 AS DECIMAL(18,2)), CAST(35000 AS DECIMAL(18,2)), 40, N'Giảm đau, hạ sốt cho người lớn và trẻ em trên 12 tuổi', N'Thuốc giảm đau - hạ sốt'),
        ('8934567890102', N'Ibuprofen 400mg', N'Hộp 10 vỉ x 10 viên', N'Ibuprofen 400mg', N'Traphaco', CAST(0 AS BIT), CAST(42000 AS DECIMAL(18,2)), CAST(52000 AS DECIMAL(18,2)), 30, N'Kháng viêm không steroid, giảm đau cơ xương khớp', N'Thuốc giảm đau - hạ sốt'),
        ('8934567890103', N'Panadol Extra', N'Hộp 12 vỉ x 10 viên', N'Paracetamol + Caffeine', N'GSK', CAST(0 AS BIT), CAST(96000 AS DECIMAL(18,2)), CAST(115000 AS DECIMAL(18,2)), 25, N'Giảm đau nhanh, hỗ trợ tỉnh táo', N'Thuốc giảm đau - hạ sốt'),
        ('8934567890104', N'Aspirin 81mg', N'Hộp 10 vỉ x 10 viên', N'Acid acetylsalicylic', N'Bayer', CAST(1 AS BIT), CAST(38000 AS DECIMAL(18,2)), CAST(47000 AS DECIMAL(18,2)), 20, N'Kháng kết tập tiểu cầu, phòng ngừa huyết khối', N'Thuốc giảm đau - hạ sốt'),
        ('8934567890201', N'Amoxicillin 500mg', N'Hộp 10 vỉ x 10 viên', N'Amoxicillin trihydrate', N'Imexpharm', CAST(1 AS BIT), CAST(62000 AS DECIMAL(18,2)), CAST(78000 AS DECIMAL(18,2)), 30, N'Kháng sinh nhóm beta-lactam, dùng theo chỉ định bác sĩ', N'Thuốc kháng sinh'),
        ('8934567890202', N'Azithromycin 250mg', N'Hộp 6 vỉ x 4 viên', N'Azithromycin dihydrate', N'Pymepharco', CAST(1 AS BIT), CAST(118000 AS DECIMAL(18,2)), CAST(145000 AS DECIMAL(18,2)), 20, N'Kháng sinh macrolid điều trị nhiễm khuẩn hô hấp', N'Thuốc kháng sinh'),
        ('8934567890203', N'Cefuroxime 500mg', N'Hộp 10 vỉ x 10 viên', N'Cefuroxime axetil', N'Imexpharm', CAST(1 AS BIT), CAST(165000 AS DECIMAL(18,2)), CAST(198000 AS DECIMAL(18,2)), 15, N'Kháng sinh cephalosporin thế hệ 2', N'Thuốc kháng sinh'),
        ('8934567890204', N'Ciprofloxacin 500mg', N'Hộp 10 vỉ x 10 viên', N'Ciprofloxacin HCl', N'DHG Pharma', CAST(1 AS BIT), CAST(88000 AS DECIMAL(18,2)), CAST(105000 AS DECIMAL(18,2)), 15, N'Kháng sinh nhóm quinolon', N'Thuốc kháng sinh'),
        ('8934567890301', N'Smecta 3g', N'Hộp 30 gói', N'Diosmectite', N'Ipsen', CAST(0 AS BIT), CAST(135000 AS DECIMAL(18,2)), CAST(160000 AS DECIMAL(18,2)), 20, N'Điều trị tiêu chảy cấp và đau bụng', N'Thuốc tiêu hóa'),
        ('8934567890302', N'Berberin 100mg', N'Hộp 10 vỉ x 10 viên', N'Berberin clorua', N'DHG Pharma', CAST(0 AS BIT), CAST(24000 AS DECIMAL(18,2)), CAST(32000 AS DECIMAL(18,2)), 40, N'Rối loạn tiêu hóa, viêm đại tràng nhẹ', N'Thuốc tiêu hóa'),
        ('8934567890303', N'Omeprazole 20mg', N'Hộp 10 vỉ x 10 viên', N'Omeprazole', N'Pymepharco', CAST(1 AS BIT), CAST(48000 AS DECIMAL(18,2)), CAST(62000 AS DECIMAL(18,2)), 30, N'Ức chế bơm proton, điều trị viêm loét dạ dày', N'Thuốc tiêu hóa'),
        ('8934567890304', N'Enterogermina', N'Hộp 20 ống', N'Bacillus subtilis', N'Sanofi', CAST(0 AS BIT), CAST(145000 AS DECIMAL(18,2)), CAST(175000 AS DECIMAL(18,2)), 20, N'Men vi sinh cân bằng hệ khuẩn đường ruột', N'Thuốc tiêu hóa'),
        ('8934567890401', N'Vitamin C 1000mg', N'Hộp 10 vỉ x 10 viên', N'Acid ascorbic', N'Mega Wecare', CAST(0 AS BIT), CAST(90000 AS DECIMAL(18,2)), CAST(112000 AS DECIMAL(18,2)), 25, N'Tăng sức đề kháng, bổ sung vitamin C', N'Vitamin & thực phẩm bổ sung'),
        ('8934567890402', N'Vitamin D3 2000IU', N'Hộp 10 vỉ x 10 viên', N'Cholecalciferol', N'Mega Wecare', CAST(0 AS BIT), CAST(78000 AS DECIMAL(18,2)), CAST(98000 AS DECIMAL(18,2)), 25, N'Hỗ trợ hấp thu canxi, tốt cho xương', N'Vitamin & thực phẩm bổ sung'),
        ('8934567890403', N'Omega-3 Fish Oil', N'Hộp 10 vỉ x 10 viên', N'Omega-3 (EPA/DHA)', N'Mega Wecare', CAST(0 AS BIT), CAST(165000 AS DECIMAL(18,2)), CAST(205000 AS DECIMAL(18,2)), 20, N'Tốt cho tim mạch, mắt và não bộ', N'Vitamin & thực phẩm bổ sung'),
        ('8934567890404', N'Sắt & Acid Folic', N'Hộp 10 vỉ x 10 viên', N'Ferrous fumarate', N'Imexpharm', CAST(0 AS BIT), CAST(72000 AS DECIMAL(18,2)), CAST(92000 AS DECIMAL(18,2)), 25, N'Phòng và hỗ trợ điều trị thiếu máu thiếu sắt', N'Vitamin & thực phẩm bổ sung'),
        ('8934567890501', N'Amlodipine 5mg', N'Hộp 10 vỉ x 10 viên', N'Amlodipine besylate', N'Pymepharco', CAST(1 AS BIT), CAST(58000 AS DECIMAL(18,2)), CAST(74000 AS DECIMAL(18,2)), 25, N'Điều trị tăng huyết áp, đau thắt ngực', N'Thuốc tim mạch - huyết áp'),
        ('8934567890502', N'Losartan 50mg', N'Hộp 10 vỉ x 10 viên', N'Losartan potassium', N'Imexpharm', CAST(1 AS BIT), CAST(68000 AS DECIMAL(18,2)), CAST(86000 AS DECIMAL(18,2)), 25, N'Điều trị tăng huyết áp, bảo vệ thận', N'Thuốc tim mạch - huyết áp'),
        ('8934567890601', N'Salbutamol 2mg', N'Hộp 10 vỉ x 10 viên', N'Salbutamol sulfat', N'DHG Pharma', CAST(1 AS BIT), CAST(34000 AS DECIMAL(18,2)), CAST(45000 AS DECIMAL(18,2)), 20, N'Giãn phế quản, điều trị hen phế quản', N'Thuốc hô hấp'),
        ('8934567890602', N'Ambroxol 30mg', N'Hộp 10 vỉ x 10 viên', N'Ambroxol HCl', N'Traphaco', CAST(0 AS BIT), CAST(46000 AS DECIMAL(18,2)), CAST(58000 AS DECIMAL(18,2)), 25, N'Tiêu nhầy, hỗ trợ điều trị ho có đờm', N'Thuốc hô hấp'),
        ('8934567890603', N'Otrivin 0.05%', N'Chai 10ml', N'Xylometazoline HCl', N'GSK', CAST(0 AS BIT), CAST(82000 AS DECIMAL(18,2)), CAST(98000 AS DECIMAL(18,2)), 15, N'Xịt mũi thông mũi, giảm nghẹt mũi', N'Thuốc hô hấp'),
        ('8934567890701', N'Nhiệt kế điện tử', N'Cái', N'Thiết bị đo thân nhiệt', N'Medipro', CAST(0 AS BIT), CAST(130000 AS DECIMAL(18,2)), CAST(175000 AS DECIMAL(18,2)), 10, N'Đo thân nhiệt điện tử, hiển thị số', N'Thiết bị y tế'),
        ('8934567890702', N'Máy đo huyết áp Omron', N'Cái', N'Máy đo huyết áp điện tử', N'Omron', CAST(0 AS BIT), CAST(890000 AS DECIMAL(18,2)), CAST(1150000 AS DECIMAL(18,2)), 5, N'Máy đo huyết áp bắp tay tự động', N'Thiết bị y tế'),
        ('8934567890703', N'Khẩu trang y tế 4 lớp', N'Hộp 50 cái', N'Khẩu trang y tế', N'Medipro', CAST(0 AS BIT), CAST(45000 AS DECIMAL(18,2)), CAST(65000 AS DECIMAL(18,2)), 50, N'Khẩu trang y tế 4 lớp kháng khuẩn', N'Thiết bị y tế'),
        ('8934567890704', N'Bông y tế gòn', N'Gói 100g', N'Bông gòn y tế', N'Medipro', CAST(0 AS BIT), CAST(12000 AS DECIMAL(18,2)), CAST(18000 AS DECIMAL(18,2)), 40, N'Bông gòn y tế tiệt trùng', N'Thiết bị y tế'),
        ('8934567890801', N'Kem chống nắng Anessa', N'Tuýp 60ml', N'Kem chống nắng SPF50+', N'Shiseido', CAST(0 AS BIT), CAST(420000 AS DECIMAL(18,2)), CAST(495000 AS DECIMAL(18,2)), 10, N'Chống nắng phổ rộng SPF50+ PA++++', N'Mỹ phẩm - chăm sóc da'),
        ('8934567890802', N'Sữa rửa mặt Cetaphil', N'Chai 250ml', N'Sữa rửa mặt dịu nhẹ', N'Galderma', CAST(0 AS BIT), CAST(235000 AS DECIMAL(18,2)), CAST(285000 AS DECIMAL(18,2)), 12, N'Làm sạch da nhạy cảm, không xà phòng', N'Mỹ phẩm - chăm sóc da')
    ) AS t(barcode, name, unit, ingredient, manufacturer, is_rx, cost_price, selling_price, min_quantity, description, category_name)
    JOIN dbo.categories c ON c.name = t.category_name;

    /* ============================== 5. LÔ THUỐC ============================== */
    /* 5.1 Lô chính (-A) cho mọi sản phẩm, hạn dùng xa */
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    SELECT p.id,
           'LOT-' + RIGHT('000000' + CAST(p.id AS VARCHAR(6)), 6) + '-A',
           DATEADD(DAY, -365, @today),
           DATEADD(DAY, 730, @today),
           sup.id,
           DATEADD(DAY, -120, @now)
    FROM dbo.products p
    JOIN dbo.suppliers sup ON sup.code = 'SUP00' + CAST(((p.id % 8) + 1) AS VARCHAR(1));

    /* 5.2 Lô cận hạn (-B) cho một số sản phẩm bán chạy -> test cảnh báo cận hạn */
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    SELECT p.id,
           'LOT-' + RIGHT('000000' + CAST(p.id AS VARCHAR(6)), 6) + '-B',
           DATEADD(DAY, -690, @today),
           DATEADD(DAY, 45, @today),
           sup.id,
           DATEADD(DAY, -60, @now)
    FROM dbo.products p
    JOIN dbo.suppliers sup ON sup.code = 'SUP00' + CAST(((p.id % 8) + 1) AS VARCHAR(1))
    WHERE p.barcode IN ('8934567890101', '8934567890102', '8934567890302',
                        '8934567890402', '8934567890601', '8934567890602');

    /* 5.3 Lô đã hết hạn (-C) -> test chặn bán / tiêu hủy */
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    SELECT p.id,
           'LOT-' + RIGHT('000000' + CAST(p.id AS VARCHAR(6)), 6) + '-C',
           DATEADD(DAY, -900, @today),
           DATEADD(DAY, -10, @today),
           sup.id,
           DATEADD(DAY, -300, @now)
    FROM dbo.products p
    JOIN dbo.suppliers sup ON sup.code = 'SUP00' + CAST(((p.id % 8) + 1) AS VARCHAR(1))
    WHERE p.barcode IN ('8934567890301', '8934567890704');

    /* 5.4 Lô nhập theo phiếu nhận hàng GRN-2026-0001 */
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    SELECT p.id, t.batch_number, t.mfg, t.exp, s.id, DATEADD(DAY, -7, @now)
    FROM (VALUES
        ('8934567890101', 'LOT-GRN-2601', CAST('2026-01-05' AS DATE), CAST('2029-01-05' AS DATE), 'SUP002'),
        ('8934567890401', 'LOT-GRN-2602', CAST('2026-01-08' AS DATE), CAST('2029-01-08' AS DATE), 'SUP002')
    ) AS t(barcode, batch_number, mfg, exp, sup_code)
    JOIN dbo.products  p ON p.barcode  = t.barcode
    JOIN dbo.suppliers s ON s.code     = t.sup_code;

    /* =========================== 6. LỊCH SỬ GIÁ =========================== */
    INSERT INTO dbo.price_histories (product_id, account_id, cost_price, selling_price, effective_from, reason, created_at)
    SELECT p.id, @accAdmin,
           CAST(ROUND(p.cost_price * 0.93, 0) AS DECIMAL(18,2)),
           CAST(ROUND(p.selling_price * 0.93, 0) AS DECIMAL(18,2)),
           DATEADD(DAY, -140, @now),
           N'Giá niêm yết giai đoạn khai trương chi nhánh',
           DATEADD(DAY, -140, @now)
    FROM dbo.products p;

    INSERT INTO dbo.price_histories (product_id, account_id, cost_price, selling_price, effective_from, reason, created_at)
    SELECT p.id, @accManager, p.cost_price, p.selling_price,
           DATEADD(DAY, -30, @now),
           N'Cập nhật giá bán theo báo giá nhà cung cấp tháng 01/2026',
           DATEADD(DAY, -30, @now)
    FROM dbo.products p;

    /* ============================== 7. KHÁCH HÀNG ============================== */
    INSERT INTO dbo.customers (full_name, phone, email, date_of_birth, gender, address, status, created_by, created_at, updated_at)
    SELECT t.full_name, t.phone, t.email, t.dob, t.gender, t.address, t.status, @accPharmacist,
           DATEADD(DAY, -t.days_ago, @now), NULL
    FROM (VALUES
        (N'Nguyễn Văn An',   '0912345671', 'an.nguyen@gmail.com',   CAST('1987-04-12' AS DATE), CAST(1 AS TINYINT), N'24 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',        CAST(1 AS TINYINT), 180),
        (N'Trần Thị Bích',   '0912345672', 'bich.tran@gmail.com',   CAST('1990-09-03' AS DATE), CAST(2 AS TINYINT), N'56 Hai Bà Trưng, Phường Tân Định, Quận 1, TP.HCM',       CAST(1 AS TINYINT), 170),
        (N'Lê Hoàng Cường',  '0912345673', 'cuong.le@yahoo.com',    CAST('1975-01-22' AS DATE), CAST(1 AS TINYINT), N'88 Điện Biên Phủ, Phường 6, Quận 3, TP.HCM',            CAST(1 AS TINYINT), 150),
        (N'Phạm Thu Dung',   '0912345674', 'dung.pham@gmail.com',   CAST('1998-06-15' AS DATE), CAST(2 AS TINYINT), N'12 Cách Mạng Tháng 8, Phường 5, Quận 3, TP.HCM',       CAST(1 AS TINYINT), 120),
        (N'Hoàng Minh Đức',  '0912345675', 'duc.hoang@outlook.com', CAST('1965-11-30' AS DATE), CAST(1 AS TINYINT), N'45 Võ Văn Tần, Phường 5, Quận 3, TP.HCM',               CAST(1 AS TINYINT), 100),
        (N'Vũ Thị Hạnh',     '0912345676', 'hanh.vu@gmail.com',     CAST('2001-03-08' AS DATE), CAST(2 AS TINYINT), N'100 Nguyễn Thị Minh Khai, Phường Bến Thành, Quận 1, TP.HCM', CAST(1 AS TINYINT), 90),
        (N'Đặng Quốc Huy',   '0912345677', 'huy.dang@gmail.com',    CAST('1983-07-19' AS DATE), CAST(1 AS TINYINT), N'7 Lý Tự Trọng, Phường Bến Nghé, Quận 1, TP.HCM',       CAST(1 AS TINYINT), 75),
        (N'Bùi Ngọc Lan',    '0912345678', 'lan.bui@gmail.com',     CAST('1993-12-25' AS DATE), CAST(2 AS TINYINT), N'231 Trần Não, Phường Bình An, TP Thủ Đức, TP.HCM',      CAST(1 AS TINYINT), 60),
        (N'Ngô Văn Phúc',    '0912345679', 'phuc.ngo@gmail.com',    CAST('1958-02-14' AS DATE), CAST(1 AS TINYINT), N'15 Nguyễn Oanh, Phường 7, Quận Gò Vấp, TP.HCM',         CAST(0 AS TINYINT), 200),
        (N'Mai Thị Quỳnh',   '0912345680', 'quynh.mai@gmail.com',   CAST('2004-10-05' AS DATE), CAST(2 AS TINYINT), N'302 Quang Trung, Phường 10, Quận Gò Vấp, TP.HCM',      CAST(1 AS TINYINT), 20)
    ) AS t(full_name, phone, email, dob, gender, address, status, days_ago);

    INSERT INTO dbo.customer_health_profiles (customer_id, height_cm, weight_kg, allergies, medical_conditions, current_medications, note, updated_at)
    SELECT c.id, t.height_cm, t.weight_kg, t.allergies, t.conditions, t.medications, t.note, DATEADD(DAY, -10, @now)
    FROM (VALUES
        ('0912345671', CAST(172.0 AS DECIMAL(5,1)), CAST(68.5 AS DECIMAL(5,1)), N'Không có', N'Tăng huyết áp nhẹ', N'Amlodipine 5mg/ngày', N'Tái khám huyết áp mỗi 3 tháng'),
        ('0912345672', CAST(158.0 AS DECIMAL(5,1)), CAST(52.0 AS DECIMAL(5,1)), N'Dị ứng Penicillin', N'Viêm dạ dày', N'Omeprazole 20mg khi đau', N'Tránh nhóm kháng sinh beta-lactam'),
        ('0912345675', CAST(168.0 AS DECIMAL(5,1)), CAST(74.0 AS DECIMAL(5,1)), N'Không có', N'Đái tháo đường type 2, tăng huyết áp', N'Losartan 50mg, Metformin 500mg', N'Cần tư vấn kỹ khi bán thuốc có đường'),
        ('0912345677', CAST(175.0 AS DECIMAL(5,1)), CAST(80.0 AS DECIMAL(5,1)), N'Dị ứng Aspirin', N'Hen phế quản nhẹ', N'Salbutamol 2mg khi lên cơn', N'Không dùng NSAID'),
        ('0912345679', CAST(165.0 AS DECIMAL(5,1)), CAST(60.0 AS DECIMAL(5,1)), N'Không có', N'Thoái hóa khớp gối', N'Glucosamine, Paracetamol khi đau', N'Khách hàng đã ngừng giao dịch'),
        ('0912345680', CAST(160.0 AS DECIMAL(5,1)), CAST(48.5 AS DECIMAL(5,1)), N'Dị ứng hải sản', N'Không có', N'Không dùng thuốc dài ngày', N'Sinh viên, hay mua vitamin C')
    ) AS t(phone, height_cm, weight_kg, allergies, conditions, medications, note)
    JOIN dbo.customers c ON c.phone = t.phone;

    /* ============================== 8. TỒN KHO ============================== */
    /* 8.1 Kho tổng: đủ tồn cho mọi lô (lô hết hạn chỉ còn 12) */
    INSERT INTO dbo.inventories (store_id, product_id, batch_id, location_id, quantity, version, updated_at)
    SELECT @storeWh, b.product_id, b.id, @locWhA01,
           CASE WHEN b.batch_number LIKE '%-C' THEN 12 ELSE 500 END,
           0, DATEADD(DAY, -5, @now)
    FROM dbo.product_batches b;

    /* 8.2 Chi nhánh Quận 1: nhóm giảm đau, kháng sinh, tiêu hóa, vitamin */
    INSERT INTO dbo.inventories (store_id, product_id, batch_id, location_id, quantity, version, updated_at)
    SELECT @storeSt01, b.product_id, b.id, @locQ1A01, 120, 0, DATEADD(DAY, -3, @now)
    FROM dbo.product_batches b
    JOIN dbo.products p   ON p.id = b.product_id
    JOIN dbo.categories c ON c.id = p.category_id
    WHERE b.batch_number LIKE '%-A'
      AND c.name IN (N'Thuốc giảm đau - hạ sốt', N'Thuốc kháng sinh', N'Thuốc tiêu hóa', N'Vitamin & thực phẩm bổ sung');

    /* 8.3 Chi nhánh Quận 7: nhóm tim mạch, hô hấp, thiết bị y tế, mỹ phẩm */
    INSERT INTO dbo.inventories (store_id, product_id, batch_id, location_id, quantity, version, updated_at)
    SELECT @storeSt02, b.product_id, b.id, @locQ7A01, 80, 0, DATEADD(DAY, -3, @now)
    FROM dbo.product_batches b
    JOIN dbo.products p   ON p.id = b.product_id
    JOIN dbo.categories c ON c.id = p.category_id
    WHERE b.batch_number LIKE '%-A'
      AND c.name IN (N'Thuốc tim mạch - huyết áp', N'Thuốc hô hấp', N'Thiết bị y tế', N'Mỹ phẩm - chăm sóc da');

    /* 8.4 Chi nhánh Thủ Đức: chỉ còn các lô cận hạn */
    INSERT INTO dbo.inventories (store_id, product_id, batch_id, location_id, quantity, version, updated_at)
    SELECT @storeSt03, b.product_id, b.id, NULL, 40, 0, DATEADD(DAY, -2, @now)
    FROM dbo.product_batches b
    WHERE b.batch_number LIKE '%-B';

    /* ============================== 9. CA BÁN HÀNG ============================== */
    DECLARE @shiftS1Closed BIGINT, @shiftS1Open BIGINT, @shiftS2Closed BIGINT, @shiftS3Open BIGINT;

    INSERT INTO dbo.shifts (store_id, account_id, opened_at, closed_at, opening_cash, closing_cash, expected_cash, status, note, reconciled_by, reconciled_at)
    VALUES (@storeSt01, @accManager, DATEADD(HOUR, -40, @now), DATEADD(HOUR, -32, @now),
            CAST(500000 AS DECIMAL(18,2)), CAST(3500000 AS DECIMAL(18,2)), CAST(3500000 AS DECIMAL(18,2)),
            2, N'Ca sáng - đã đóng, khớp quỹ', NULL, NULL);
    SET @shiftS1Closed = SCOPE_IDENTITY();

    INSERT INTO dbo.shifts (store_id, account_id, opened_at, closed_at, opening_cash, closing_cash, expected_cash, status, note, reconciled_by, reconciled_at)
    VALUES (@storeSt01, @accPharmacist, DATEADD(HOUR, -8, @now), NULL,
            CAST(300000 AS DECIMAL(18,2)), NULL, NULL,
            1, N'Ca chiều - đang mở', NULL, NULL);
    SET @shiftS1Open = SCOPE_IDENTITY();

    INSERT INTO dbo.shifts (store_id, account_id, opened_at, closed_at, opening_cash, closing_cash, expected_cash, status, note, reconciled_by, reconciled_at)
    VALUES (@storeSt02, @accStoreManager, DATEADD(HOUR, -36, @now), DATEADD(HOUR, -28, @now),
            CAST(400000 AS DECIMAL(18,2)), CAST(2500000 AS DECIMAL(18,2)), CAST(2480000 AS DECIMAL(18,2)),
            3, N'Ca sáng - lệch quỹ 20.000đ đã kết toán', @accStoreManager, DATEADD(HOUR, -27, @now));
    SET @shiftS2Closed = SCOPE_IDENTITY();

    INSERT INTO dbo.shifts (store_id, account_id, opened_at, closed_at, opening_cash, closing_cash, expected_cash, status, note, reconciled_by, reconciled_at)
    VALUES (@storeSt03, @accStoreManagerDemo, DATEADD(HOUR, -5, @now), NULL,
            CAST(200000 AS DECIMAL(18,2)), NULL, NULL,
            1, N'Ca tối - đang mở', NULL, NULL);
    SET @shiftS3Open = SCOPE_IDENTITY();

    /* ============================== 10. BÁN HÀNG (POS) ============================== */
    DECLARE @cus1 BIGINT = (SELECT id FROM dbo.customers WHERE phone = '0912345671');
    DECLARE @cus2 BIGINT = (SELECT id FROM dbo.customers WHERE phone = '0912345672');
    DECLARE @cus3 BIGINT = (SELECT id FROM dbo.customers WHERE phone = '0912345673');
    DECLARE @cus4 BIGINT = (SELECT id FROM dbo.customers WHERE phone = '0912345674');
    DECLARE @cus5 BIGINT = (SELECT id FROM dbo.customers WHERE phone = '0912345675');
    DECLARE @cus6 BIGINT = (SELECT id FROM dbo.customers WHERE phone = '0912345676');

    /* 10.1 Hóa đơn - tổng tiền tạm để 0, cập nhật lại từ chi tiết bên dưới */
    INSERT INTO dbo.sales_invoices (code, store_id, shift_id, account_id, customer_id, prescription_code,
                                    total_amount, discount, final_amount, status, cancel_reason, created_at, paid_at)
    VALUES
        ('SI-2026-0001', @storeSt01, @shiftS1Closed, @accManager,          @cus1, NULL,             0, 0, 0, 1, NULL, DATEADD(HOUR, -38, @now), DATEADD(HOUR, -38, @now)),
        ('SI-2026-0002', @storeSt01, @shiftS1Closed, @accPharmacist,      @cus2, N'DT-2026-0002',   0, 0, 0, 1, NULL, DATEADD(HOUR, -36, @now), DATEADD(HOUR, -36, @now)),
        ('SI-2026-0003', @storeSt01, @shiftS1Closed, @accPharmacist,      @cus3, N'DT-2026-0003',   0, 0, 0, 1, NULL, DATEADD(HOUR, -34, @now), DATEADD(HOUR, -34, @now)),
        ('SI-2026-0004', @storeSt02, @shiftS2Closed, @accStoreManager,    NULL,  NULL,             0, 0, 0, 1, NULL, DATEADD(HOUR, -34, @now), DATEADD(HOUR, -34, @now)),
        ('SI-2026-0005', @storeSt01, @shiftS1Open,   @accPharmacist,      @cus4, NULL,             0, 0, 0, 0, NULL, DATEADD(HOUR, -2, @now), NULL),
        ('SI-2026-0006', @storeSt02, @shiftS2Closed, @accStoreManager,    @cus5, NULL,             0, CAST(15000 AS DECIMAL(18,2)), 0, 1, NULL, DATEADD(HOUR, -30, @now), DATEADD(HOUR, -30, @now)),
        ('SI-2026-0007', @storeSt03, @shiftS3Open,   @accStoreManagerDemo,NULL,  NULL,             0, 0, 0, 1, NULL, DATEADD(HOUR, -4, @now), DATEADD(HOUR, -4, @now)),
        ('SI-2026-0008', @storeSt03, @shiftS3Open,   @accStoreManagerDemo,@cus6, NULL,             0, 0, 0, 2, N'Khách đổi ý, không mua nữa', DATEADD(HOUR, -3, @now), NULL);

    /* 10.2 Chi tiết hóa đơn - đơn giá lấy theo giá niêm yết của sản phẩm */
    INSERT INTO dbo.sales_invoice_details (sales_invoice_id, product_id, batch_id, quantity, unit_price, unit_cost, dosage_instruction)
    SELECT i.id, p.id, b.id, t.quantity, p.selling_price, p.cost_price, t.dosage
    FROM (VALUES
        ('SI-2026-0001', '8934567890101', 2, N'Ngày uống 2 lần, mỗi lần 1 viên sau ăn'),
        ('SI-2026-0001', '8934567890401', 1, N'Ngày uống 1 viên sau bữa sáng'),
        ('SI-2026-0002', '8934567890201', 3, N'Ngày uống 2 lần, mỗi lần 1 viên, đủ 5 ngày'),
        ('SI-2026-0002', '8934567890303', 2, N'Uống 1 viên trước bữa sáng 30 phút'),
        ('SI-2026-0003', '8934567890202', 2, N'Ngày uống 1 viên trước ăn 1 giờ, đủ 3 ngày'),
        ('SI-2026-0003', '8934567890301', 3, N'Ngày uống 3 gói, pha với nước ấm'),
        ('SI-2026-0004', '8934567890501', 2, N'Ngày uống 1 viên vào buổi sáng'),
        ('SI-2026-0004', '8934567890701', 1, N'Đo thân nhiệt khi sốt, vệ sinh đầu đo sau dùng'),
        ('SI-2026-0005', '8934567890102', 2, N'Ngày uống 2 lần, mỗi lần 1 viên sau ăn'),
        ('SI-2026-0005', '8934567890304', 1, N'Ngày uống 2 ống trước bữa ăn'),
        ('SI-2026-0006', '8934567890801', 1, N'Thoa buổi sáng, thoa lại sau 3 giờ'),
        ('SI-2026-0006', '8934567890802', 2, N'Rửa mặt 2 lần/ngày, massage nhẹ rồi rửa sạch'),
        ('SI-2026-0007', '8934567890101', 5, N'Ngày uống 3 lần, mỗi lần 1 viên khi sốt')
    ) AS t(invoice_code, barcode, quantity, dosage)
    JOIN dbo.sales_invoices i ON i.code = t.invoice_code
    JOIN dbo.products       p ON p.barcode = t.barcode
    LEFT JOIN dbo.product_batches b
           ON b.product_id = p.id
          AND b.batch_number = 'LOT-' + RIGHT('000000' + CAST(p.id AS VARCHAR(6)), 6) + '-A';

    /* 10.3 Chốt tổng tiền hóa đơn theo chi tiết (tránh lệch số) */
    UPDATE i
       SET i.total_amount = d.total_amount,
           i.final_amount = d.total_amount - i.discount
    FROM dbo.sales_invoices i
    JOIN (SELECT sales_invoice_id, SUM(quantity * unit_price) AS total_amount
          FROM dbo.sales_invoice_details
         GROUP BY sales_invoice_id) d ON d.sales_invoice_id = i.id;

    /* 10.4 Thanh toán của hóa đơn */
    INSERT INTO dbo.payments (sales_invoice_id, method, amount, status, transaction_ref, gateway_response, paid_at, created_at)
    SELECT i.id, t.method, i.final_amount, t.status, t.txn_ref, NULL, i.paid_at, i.created_at
    FROM dbo.sales_invoices i
    JOIN (VALUES
        ('SI-2026-0001', CAST(1 AS TINYINT), CAST(1 AS TINYINT), CAST(NULL AS VARCHAR(100))),
        ('SI-2026-0002', CAST(2 AS TINYINT), CAST(1 AS TINYINT), 'FT2602050000123456'),
        ('SI-2026-0003', CAST(3 AS TINYINT), CAST(1 AS TINYINT), 'VNP20260205123456'),
        ('SI-2026-0004', CAST(1 AS TINYINT), CAST(1 AS TINYINT), CAST(NULL AS VARCHAR(100))),
        ('SI-2026-0006', CAST(1 AS TINYINT), CAST(1 AS TINYINT), CAST(NULL AS VARCHAR(100))),
        ('SI-2026-0007', CAST(1 AS TINYINT), CAST(1 AS TINYINT), CAST(NULL AS VARCHAR(100)))
    ) AS t(invoice_code, method, status, txn_ref) ON t.invoice_code = i.code;

    /* ============================== 11. TRẢ HÀNG ============================== */
    INSERT INTO dbo.sales_returns (code, sales_invoice_id, shift_id, processed_by, return_type, refund_method, refund_amount, reason, created_at)
    SELECT 'SR-2026-0001', i.id, @shiftS1Closed, @accPharmacist,
           CAST(2 AS TINYINT), CAST(1 AS TINYINT), 0,
           N'Khách bị dị ứng sau khi dùng, trả lại 1 hộp Azithromycin',
           DATEADD(HOUR, -20, @now)
    FROM dbo.sales_invoices i
    WHERE i.code = 'SI-2026-0003';

    INSERT INTO dbo.sales_return_details (sales_return_id, sales_invoice_detail_id, product_id, batch_id, quantity, unit_price)
    SELECT sr.id, d.id, d.product_id, d.batch_id, 1, d.unit_price
    FROM dbo.sales_returns sr
    JOIN dbo.sales_invoices       i ON i.id = sr.sales_invoice_id
    JOIN dbo.sales_invoice_details d ON d.sales_invoice_id = i.id
    JOIN dbo.products             p ON p.id = d.product_id
    WHERE sr.code = 'SR-2026-0001'
      AND p.barcode = '8934567890202';

    UPDATE sr
       SET sr.refund_amount = d.total_amount
    FROM dbo.sales_returns sr
    JOIN (SELECT sales_return_id, SUM(quantity * unit_price) AS total_amount
          FROM dbo.sales_return_details
         GROUP BY sales_return_id) d ON d.sales_return_id = sr.id;

    UPDATE dbo.sales_invoices SET status = 3 WHERE code = 'SI-2026-0003';

    INSERT INTO dbo.payments (sales_invoice_id, method, amount, status, transaction_ref, gateway_response, paid_at, created_at)
    SELECT i.id, 1, sr.refund_amount, 3, 'REFUND-SR-2026-0001', NULL, DATEADD(HOUR, -20, @now), DATEADD(HOUR, -20, @now)
    FROM dbo.sales_invoices i
    JOIN dbo.sales_returns sr ON sr.sales_invoice_id = i.id
    WHERE sr.code = 'SR-2026-0001';

    /* ========================== 12. ĐỐI SOÁT DOANH THU NGÀY ========================== */
    INSERT INTO dbo.daily_sales_reconciliations (store_id, business_date, system_cash, system_bank, system_vnpay,
                                                 actual_cash, status, note, reconciled_by, reconciled_at)
    VALUES
        (@storeSt01, DATEADD(DAY, -2, @today), CAST(1200000 AS DECIMAL(18,2)), CAST(600000 AS DECIMAL(18,2)),
         CAST(430000 AS DECIMAL(18,2)), CAST(1200000 AS DECIMAL(18,2)), 1,
         N'Khớp quỹ cuối ngày', @accManager, DATEADD(HOUR, -30, @now)),
        (@storeSt02, DATEADD(DAY, -1, @today), CAST(1800000 AS DECIMAL(18,2)), CAST(0 AS DECIMAL(18,2)),
         CAST(0 AS DECIMAL(18,2)), CAST(1780000 AS DECIMAL(18,2)), 2,
         N'Thiếu 20.000đ tiền mặt, đã ghi nhận chênh lệch', @accStoreManager, DATEADD(HOUR, -27, @now)),
        (@storeSt03, @today, CAST(650000 AS DECIMAL(18,2)), CAST(0 AS DECIMAL(18,2)),
         CAST(0 AS DECIMAL(18,2)), NULL, 0,
         N'Chưa đối soát cuối ngày', NULL, NULL);

    /* ============================== 13. MUA HÀNG ============================== */
    /* 13.1 Yêu cầu mua hàng (status: 0 draft / 1 submitted / 2 RFQ sent / 3 proposal / 4 completed / 5 cancelled) */
    INSERT INTO dbo.purchase_requests (code, created_by, status, reason, created_at, updated_at, approved_at) VALUES
        ('PR-2026-0001', @accManager, 4, N'Tồn kho Paracetamol và Vitamin C dưới mức tối thiểu',
         DATEADD(DAY, -12, @now), DATEADD(DAY, -10, @now), DATEADD(DAY, -11, @now)),
        ('PR-2026-0002', @accStoreManager, 2, N'Bổ sung kháng sinh và thuốc tiêu hóa cho chi nhánh Quận 7',
         DATEADD(DAY, -6, @now), DATEADD(DAY, -5, @now), DATEADD(DAY, -5, @now)),
        ('PR-2026-0003', @accPharmacist, 0, N'Đề nghị nhập thêm Ibuprofen 400mg theo phản hồi khách hàng',
         DATEADD(DAY, -1, @now), NULL, NULL);

    INSERT INTO dbo.purchase_request_details (purchase_request_id, product_id, requested_quantity, note)
    SELECT pr.id, p.id, t.qty, t.note
    FROM (VALUES
        ('PR-2026-0001', '8934567890101', 200, N'Hết lô cận hạn, cần nhập gấp cho chi nhánh Quận 1'),
        ('PR-2026-0001', '8934567890401', 150, N'Mặt hàng bán chạy, cần bổ sung'),
        ('PR-2026-0002', '8934567890201', 120, N'Thiếu hàng cho các đơn thuốc tuần này'),
        ('PR-2026-0002', '8934567890303', 100, N'Bổ sung thuốc dạ dày'),
        ('PR-2026-0003', '8934567890102', 80,  N'Khách hỏi mua thường xuyên')
    ) AS t(pr_code, barcode, qty, note)
    JOIN dbo.purchase_requests pr ON pr.code = t.pr_code
    JOIN dbo.products          p  ON p.barcode = t.barcode;

    DECLARE @pr1 BIGINT = (SELECT id FROM dbo.purchase_requests WHERE code = 'PR-2026-0001');
    DECLARE @pr2 BIGINT = (SELECT id FROM dbo.purchase_requests WHERE code = 'PR-2026-0002');

    /* 13.2 Đề xuất mua hàng (status: 0 pending / 1 approved / 2 rejected / 3 completed) */
    INSERT INTO dbo.purchase_proposals (code, supplier_quotation_id, created_by, approved_by, status, reject_reason, total_amount, created_at, approved_at)
    VALUES
        ('PPRO-2026-0001', NULL, @accPurchasing, @accGeneralManager, 3, NULL, 0,
         DATEADD(DAY, -10, @now), DATEADD(DAY, -9, @now)),
        ('PPRO-2026-0002', NULL, @accPurchasing, @accGeneralManager, 1, NULL, 0,
         DATEADD(DAY, -5, @now), DATEADD(DAY, -4, @now));

    DECLARE @ppro1 BIGINT = (SELECT id FROM dbo.purchase_proposals WHERE code = 'PPRO-2026-0001');
    DECLARE @ppro2 BIGINT = (SELECT id FROM dbo.purchase_proposals WHERE code = 'PPRO-2026-0002');

    INSERT INTO dbo.purchase_proposal_requests (purchase_proposal_id, purchase_request_id) VALUES
        (@ppro1, @pr1),
        (@ppro2, @pr2);

    INSERT INTO dbo.purchase_proposal_details (purchase_proposal_id, product_id, quantity)
    SELECT pp.id, p.id, t.qty
    FROM (VALUES
        ('PPRO-2026-0001', '8934567890101', 200),
        ('PPRO-2026-0001', '8934567890401', 150),
        ('PPRO-2026-0002', '8934567890201', 120),
        ('PPRO-2026-0002', '8934567890303', 100)
    ) AS t(proposal_code, barcode, qty)
    JOIN dbo.purchase_proposals pp ON pp.code = t.proposal_code
    JOIN dbo.products           p  ON p.barcode = t.barcode;

    /* 13.3 RFQ gửi nhà cung cấp (RfqStatus là @Enumerated(ORDINAL): 0 SENT / 1 RESPONDED / 2 EXPIRED / 3 CANCELLED) */
    INSERT INTO dbo.rfqs (code, supplier_id, purchase_proposal_id, sent_by, token_hash, expired_at,
                          subject, content, status, sent_at, response_at, response_note, created_at)
    SELECT 'RFQ-2026-0001', s.id, pp.id, @accPurchasing,
           'a3f1c9d84b7e2650f8c1a4d6e9b30c72d5f8a1b4', DATEADD(DAY, 7, @now),
           N'Yêu cầu báo giá Paracetamol 500mg và Vitamin C 1000mg',
           N'Kính gửi Quý nhà cung cấp, Nhà thuốc Phúc An cần báo giá 2 mặt hàng với số lượng theo file đính kèm. Trân trọng cảm ơn.',
           1, DATEADD(DAY, -9, @now), DATEADD(DAY, -8, @now),
           N'Đã gửi báo giá chính thức qua email', DATEADD(DAY, -9, @now)
    FROM dbo.suppliers s
    CROSS JOIN dbo.purchase_proposals pp
    WHERE s.code = 'SUP002' AND pp.code = 'PPRO-2026-0001';

    INSERT INTO dbo.rfqs (code, supplier_id, purchase_proposal_id, sent_by, token_hash, expired_at,
                          subject, content, status, sent_at, response_at, response_note, created_at)
    SELECT 'RFQ-2026-0002', s.id, pp.id, @accPurchasing,
           'b7d2e5a8f1c43a96d0e3b6f9c2a5d8e1b4f70c3a', DATEADD(DAY, 10, @now),
           N'Yêu cầu báo giá Amoxicillin 500mg và Omeprazole 20mg',
           N'Kính gửi Quý nhà cung cấp, Nhà thuốc Phúc An cần báo giá 2 mặt hàng với số lượng theo file đính kèm. Trân trọng cảm ơn.',
           0, DATEADD(DAY, -4, @now), NULL, NULL, DATEADD(DAY, -4, @now)
    FROM dbo.suppliers s
    CROSS JOIN dbo.purchase_proposals pp
    WHERE s.code = 'SUP003' AND pp.code = 'PPRO-2026-0002';

    /* 13.4 Báo giá nhà cung cấp */
    INSERT INTO dbo.supplier_quotations (code, rfq_id, supplier_id, account_id, quotation_date, valid_until, total_amount, status, created_at)
    SELECT 'SQ-2026-0001', r.id, s.id, @accPurchasing,
           DATEADD(DAY, -8, @today), DATEADD(DAY, 22, @today), 0, 1, DATEADD(DAY, -8, @now)
    FROM dbo.rfqs r
    CROSS JOIN dbo.suppliers s
    WHERE r.code = 'RFQ-2026-0001' AND s.code = 'SUP002';

    INSERT INTO dbo.supplier_quotations (code, rfq_id, supplier_id, account_id, quotation_date, valid_until, total_amount, status, created_at)
    SELECT 'SQ-2026-0002', r.id, s.id, @accPurchasing,
           DATEADD(DAY, -3, @today), DATEADD(DAY, 27, @today), 0, 0, DATEADD(DAY, -3, @now)
    FROM dbo.rfqs r
    CROSS JOIN dbo.suppliers s
    WHERE r.code = 'RFQ-2026-0002' AND s.code = 'SUP003';

    INSERT INTO dbo.supplier_quotation_details (supplier_quotation_id, product_id, quantity, unit_price, tax_rate)
    SELECT sq.id, p.id, t.qty, t.unit_price, t.tax_rate
    FROM (VALUES
        ('SQ-2026-0001', '8934567890101', 200, CAST(25000 AS DECIMAL(18,2)), CAST(5.00 AS DECIMAL(5,2))),
        ('SQ-2026-0001', '8934567890401', 150, CAST(82000 AS DECIMAL(18,2)), CAST(5.00 AS DECIMAL(5,2))),
        ('SQ-2026-0002', '8934567890201', 120, CAST(60000 AS DECIMAL(18,2)), CAST(8.00 AS DECIMAL(5,2))),
        ('SQ-2026-0002', '8934567890303', 100, CAST(45000 AS DECIMAL(18,2)), CAST(5.00 AS DECIMAL(5,2)))
    ) AS t(sq_code, barcode, qty, unit_price, tax_rate)
    JOIN dbo.supplier_quotations sq ON sq.code = t.sq_code
    JOIN dbo.products            p  ON p.barcode = t.barcode;

    UPDATE sq
       SET sq.total_amount = d.total_amount
    FROM dbo.supplier_quotations sq
    JOIN (SELECT supplier_quotation_id, SUM(subtotal) AS total_amount
          FROM dbo.supplier_quotation_details
         GROUP BY supplier_quotation_id) d ON d.supplier_quotation_id = sq.id;

    UPDATE pp
       SET pp.supplier_quotation_id = sq.id,
           pp.total_amount = sq.total_amount
    FROM dbo.purchase_proposals pp
    JOIN dbo.supplier_quotations sq ON sq.code = 'SQ-2026-0001'
    WHERE pp.code = 'PPRO-2026-0001';

    /* 13.5 Phiếu nhận hàng (status: 0 draft / 1 confirmed / 2 cancelled) */
    INSERT INTO dbo.purchase_receipts (code, purchase_proposal_id, supplier_id, store_id, created_by, confirmed_by,
                                       delivery_type, status, total_amount, note, created_at, confirmed_at)
    SELECT 'GRN-2026-0001', pp.id, s.id, @storeWh, @accWarehouseStaff, @accWarehouseManager,
           CAST(2 AS TINYINT), CAST(1 AS TINYINT), 0,
           N'Nhập đủ theo báo giá SQ-2026-0001, hàng đạt tiêu chuẩn bảo quản',
           DATEADD(DAY, -7, @now), DATEADD(DAY, -6, @now)
    FROM dbo.purchase_proposals pp
    CROSS JOIN dbo.suppliers s
    WHERE pp.code = 'PPRO-2026-0001' AND s.code = 'SUP002';

    INSERT INTO dbo.purchase_receipts (code, purchase_proposal_id, supplier_id, store_id, created_by, confirmed_by,
                                       delivery_type, status, total_amount, note, created_at, confirmed_at)
    SELECT 'GRN-2026-0002', pp.id, s.id, @storeWh, @accWarehouseStaff, NULL,
           CAST(1 AS TINYINT), CAST(0 AS TINYINT), 0,
           N'Chờ kiểm nhận hàng theo báo giá SQ-2026-0002',
           DATEADD(DAY, -2, @now), NULL
    FROM dbo.purchase_proposals pp
    CROSS JOIN dbo.suppliers s
    WHERE pp.code = 'PPRO-2026-0002' AND s.code = 'SUP003';

    INSERT INTO dbo.purchase_receipt_details (purchase_receipt_id, product_id, order_quantity, quantity, unit_cost, subtotal,
                                              batch_number, manufacture_date, expiry_date, location_id, batch_id)
    SELECT gr.id, p.id, t.order_qty, t.qty, t.unit_cost, t.qty * t.unit_cost,
           t.batch_number, t.mfg, t.exp, @locWhA01, b.id
    FROM (VALUES
        ('GRN-2026-0001', '8934567890101', 200, 200, CAST(25000 AS DECIMAL(18,2)), 'LOT-GRN-2601', CAST('2026-01-05' AS DATE), CAST('2029-01-05' AS DATE)),
        ('GRN-2026-0001', '8934567890401', 150, 150, CAST(82000 AS DECIMAL(18,2)), 'LOT-GRN-2602', CAST('2026-01-08' AS DATE), CAST('2029-01-08' AS DATE)),
        ('GRN-2026-0002', '8934567890201', 120,   0, CAST(60000 AS DECIMAL(18,2)), 'LOT-GRN-2603', CAST('2026-02-01' AS DATE), CAST('2029-02-01' AS DATE)),
        ('GRN-2026-0002', '8934567890303', 100,   0, CAST(45000 AS DECIMAL(18,2)), 'LOT-GRN-2604', CAST('2026-02-01' AS DATE), CAST('2029-02-01' AS DATE))
    ) AS t(grn_code, barcode, order_qty, qty, unit_cost, batch_number, mfg, exp)
    JOIN dbo.purchase_receipts gr ON gr.code = t.grn_code
    JOIN dbo.products          p  ON p.barcode = t.barcode
    LEFT JOIN dbo.product_batches b
           ON b.product_id = p.id AND b.batch_number = t.batch_number;

    UPDATE gr
       SET gr.total_amount = d.total_amount
    FROM dbo.purchase_receipts gr
    JOIN (SELECT purchase_receipt_id, SUM(quantity * unit_cost) AS total_amount
          FROM dbo.purchase_receipt_details
         GROUP BY purchase_receipt_id) d ON d.purchase_receipt_id = gr.id;

    /* ===================== 14. ĐIỀU CHUYỂN NỘI BỘ (kho -> chi nhánh) ===================== */
    INSERT INTO dbo.stock_requisitions (code, store_id, created_by, approved_by, status, reject_reason,
                                        created_at, approved_at, dispatched_at, received_at)
    VALUES
        ('SRQ-2026-0001', @storeSt02, @accStoreManager, @accWarehouseManager, 5, NULL,
         DATEADD(DAY, -5, @now), DATEADD(DAY, -5, @now), DATEADD(DAY, -4, @now), DATEADD(DAY, -3, @now)),
        ('SRQ-2026-0002', @storeSt03, @accStoreManagerDemo, NULL, 1, NULL,
         DATEADD(HOUR, -6, @now), NULL, NULL, NULL);

    INSERT INTO dbo.stock_requisition_details (stock_requisition_id, product_id, requested_qty, approved_qty, received_qty)
    SELECT sr.id, p.id, t.requested_qty, t.approved_qty, t.received_qty
    FROM (VALUES
        ('SRQ-2026-0001', '8934567890101', CAST(60 AS INT), CAST(50 AS INT), CAST(50 AS INT)),
        ('SRQ-2026-0001', '8934567890401', CAST(40 AS INT), CAST(40 AS INT), CAST(40 AS INT)),
        ('SRQ-2026-0002', '8934567890402', CAST(30 AS INT), CAST(NULL AS INT), CAST(NULL AS INT))
    ) AS t(srq_code, barcode, requested_qty, approved_qty, received_qty)
    JOIN dbo.stock_requisitions sr ON sr.code = t.srq_code
    JOIN dbo.products            p ON p.barcode = t.barcode;

    INSERT INTO dbo.goods_issues (code, stock_requisition_id, from_store_id, to_store_id, created_by, dispatched_by, received_by,
                                  status, carrier, note, created_at, dispatched_at, received_at)
    SELECT 'GI-2026-0001', sr.id, @storeWh, @storeSt02, @accWarehouseStaff, @accWarehouseStaff, @accStoreManager,
           CAST(2 AS TINYINT), N'Xe tải nội bộ 51C-123.45', N'Giao đủ hàng, bao bì nguyên vẹn',
           DATEADD(DAY, -4, @now), DATEADD(DAY, -4, @now), DATEADD(DAY, -3, @now)
    FROM dbo.stock_requisitions sr
    WHERE sr.code = 'SRQ-2026-0001';

    INSERT INTO dbo.goods_issue_details (goods_issue_id, product_id, batch_id, quantity, received_quantity)
    SELECT gi.id, p.id, b.id, t.qty, t.received_qty
    FROM (VALUES
        ('GI-2026-0001', '8934567890101', CAST(50 AS INT), CAST(50 AS INT)),
        ('GI-2026-0001', '8934567890401', CAST(40 AS INT), CAST(40 AS INT))
    ) AS t(gi_code, barcode, qty, received_qty)
    JOIN dbo.goods_issues gi ON gi.code = t.gi_code
    JOIN dbo.products     p  ON p.barcode = t.barcode
    LEFT JOIN dbo.product_batches b
           ON b.product_id = p.id
          AND b.batch_number = 'LOT-' + RIGHT('000000' + CAST(p.id AS VARCHAR(6)), 6) + '-A';

    /* ===================== 15. KIỂM KÊ & ĐIỀU CHỈNH TỒN KHO ===================== */
    INSERT INTO dbo.inventory_audits (code, store_id, requested_by, counted_by, reviewed_by, status,
                                      audit_date, review_note, created_at, reviewed_at)
    VALUES
        ('IA-2026-0001', @storeSt01, @accManager, @accPharmacist, @accWarehouseManager, 3,
         DATEADD(DAY, -3, @today), N'Chấp nhận chênh lệch 2 hộp Paracetamol do rách bao bì',
         DATEADD(DAY, -4, @now), DATEADD(DAY, -2, @now)),
        ('IA-2026-0002', @storeWh, @accWarehouseManager, @accWarehouseStaff, NULL, 0,
         @today, NULL, DATEADD(HOUR, -3, @now), NULL);

    INSERT INTO dbo.inventory_audit_details (inventory_audit_id, product_id, batch_id, system_quantity, counted_quantity, note)
    SELECT ia.id, p.id, b.id, t.system_qty, t.counted_qty, t.note
    FROM (VALUES
        ('IA-2026-0001', '8934567890101', CAST(120 AS INT), CAST(118 AS INT), CAST(N'Rách 2 hộp, đã tách riêng chờ tiêu hủy' AS NVARCHAR(500))),
        ('IA-2026-0001', '8934567890401', CAST(120 AS INT), CAST(120 AS INT), CAST(NULL AS NVARCHAR(500))),
        ('IA-2026-0002', '8934567890201', CAST(500 AS INT), CAST(495 AS INT), CAST(N'Thiếu 5 hộp, đang kiểm tra lại camera' AS NVARCHAR(500)))
    ) AS t(audit_code, barcode, system_qty, counted_qty, note)
    JOIN dbo.inventory_audits ia ON ia.code = t.audit_code
    JOIN dbo.products         p  ON p.barcode = t.barcode
    LEFT JOIN dbo.product_batches b
           ON b.product_id = p.id
          AND b.batch_number = 'LOT-' + RIGHT('000000' + CAST(p.id AS VARCHAR(6)), 6) + '-A';

    /* Adjustment type: 1 COUNT_VARIANCE / 2 DAMAGE_SPOILAGE / 3 BREAKAGE / 4 EXPIRED_WRITEOFF / 5 OTHER */
    INSERT INTO dbo.inventory_adjustments (store_id, product_id, batch_id, inventory_audit_id, created_by, approved_by,
                                           type, status, quantity_before, quantity_after, value_impact, reason, created_at, approved_at)
    SELECT t.store_id, p.id, b.id, ia.id, t.created_by, t.approved_by, t.type, t.status,
           t.qty_before, t.qty_after,
           CAST((t.qty_after - t.qty_before) * p.cost_price AS DECIMAL(18,2)),
           t.reason, t.created_at, t.approved_at
    FROM (VALUES
        (@storeSt01, CAST('IA-2026-0001' AS VARCHAR(30)), '8934567890101', '-A', @accPharmacist, @accWarehouseManager,
         CAST(1 AS TINYINT), CAST(1 AS TINYINT), CAST(120 AS INT), CAST(118 AS INT),
         CAST(N'Điều chỉnh theo biên bản kiểm kê IA-2026-0001' AS NVARCHAR(500)), DATEADD(DAY, -2, @now), DATEADD(DAY, -2, @now)),
        (@storeSt01, CAST(NULL AS VARCHAR(30)), '8934567890301', '-A', @accPharmacist, CAST(NULL AS BIGINT),
         CAST(2 AS TINYINT), CAST(0 AS TINYINT), CAST(40 AS INT), CAST(36 AS INT),
         CAST(N'Hộp Smecta bị móp, rách vỏ - chờ duyệt tiêu hủy' AS NVARCHAR(500)), DATEADD(HOUR, -10, @now), CAST(NULL AS DATETIME2(0))),
        (@storeWh, CAST(NULL AS VARCHAR(30)), '8934567890704', '-C', @accWarehouseManager, @accWarehouseManager,
         CAST(4 AS TINYINT), CAST(1 AS TINYINT), CAST(12 AS INT), CAST(0 AS INT),
         CAST(N'Tiêu hủy lô hết hạn theo quy định bảo quản' AS NVARCHAR(500)), DATEADD(DAY, -1, @now), DATEADD(DAY, -1, @now))
    ) AS t(store_id, audit_code, barcode, suffix, created_by, approved_by, type, status, qty_before, qty_after, reason, created_at, approved_at)
    JOIN dbo.products p ON p.barcode = t.barcode
    LEFT JOIN dbo.inventory_audits ia ON ia.code = t.audit_code
    JOIN dbo.product_batches b
      ON b.product_id = p.id
     AND b.batch_number = 'LOT-' + RIGHT('000000' + CAST(p.id AS VARCHAR(6)), 6) + t.suffix;

    /* ===================== 16. THẺ KHO (stock_movements) ===================== */
    DECLARE @grn1 BIGINT = (SELECT id FROM dbo.purchase_receipts WHERE code = 'GRN-2026-0001');
    DECLARE @gi1  BIGINT = (SELECT id FROM dbo.goods_issues    WHERE code = 'GI-2026-0001');
    DECLARE @inv1 BIGINT = (SELECT id FROM dbo.sales_invoices  WHERE code = 'SI-2026-0001');
    DECLARE @inv2 BIGINT = (SELECT id FROM dbo.sales_invoices  WHERE code = 'SI-2026-0002');
    DECLARE @inv3 BIGINT = (SELECT id FROM dbo.sales_invoices  WHERE code = 'SI-2026-0003');
    DECLARE @inv4 BIGINT = (SELECT id FROM dbo.sales_invoices  WHERE code = 'SI-2026-0004');
    DECLARE @sr1  BIGINT = (SELECT id FROM dbo.sales_returns   WHERE code = 'SR-2026-0001');
    DECLARE @adj1 BIGINT = (SELECT MIN(id) FROM dbo.inventory_adjustments);

    INSERT INTO dbo.stock_movements (store_id, product_id, batch_id, movement_type, quantity_change, quantity_after,
                                     reference_type, reference_id, created_by, created_at, note)
    SELECT t.store_id, p.id, b.id, t.movement_type, t.qty_change, t.qty_after,
           t.ref_type, t.ref_id, t.created_by, t.created_at, t.note
    FROM (VALUES
        (@storeWh,   '8934567890101', '-A', CAST(1 AS TINYINT), CAST(200 AS INT), CAST(700 AS INT), 'PURCHASE_RECEIPT', @grn1, @accWarehouseStaff, DATEADD(DAY, -6, @now), CAST(N'Nhập kho theo phiếu GRN-2026-0001' AS NVARCHAR(500))),
        (@storeWh,   '8934567890401', '-A', CAST(1 AS TINYINT), CAST(150 AS INT), CAST(650 AS INT), 'PURCHASE_RECEIPT', @grn1, @accWarehouseStaff, DATEADD(DAY, -6, @now), CAST(N'Nhập kho theo phiếu GRN-2026-0001' AS NVARCHAR(500))),
        (@storeSt01, '8934567890101', '-A', CAST(2 AS TINYINT), CAST(-2  AS INT), CAST(118 AS INT), 'SALES_INVOICE',    @inv1, @accManager,       DATEADD(HOUR, -38, @now), CAST(N'Xuất bán theo hóa đơn SI-2026-0001' AS NVARCHAR(500))),
        (@storeSt01, '8934567890401', '-A', CAST(2 AS TINYINT), CAST(-1  AS INT), CAST(119 AS INT), 'SALES_INVOICE',    @inv1, @accManager,       DATEADD(HOUR, -38, @now), CAST(N'Xuất bán theo hóa đơn SI-2026-0001' AS NVARCHAR(500))),
        (@storeSt01, '8934567890201', '-A', CAST(2 AS TINYINT), CAST(-3  AS INT), CAST(117 AS INT), 'SALES_INVOICE',    @inv2, @accPharmacist,    DATEADD(HOUR, -36, @now), CAST(N'Xuất bán theo hóa đơn SI-2026-0002' AS NVARCHAR(500))),
        (@storeSt01, '8934567890202', '-A', CAST(2 AS TINYINT), CAST(-2  AS INT), CAST(118 AS INT), 'SALES_INVOICE',    @inv3, @accPharmacist,    DATEADD(HOUR, -34, @now), CAST(N'Xuất bán theo hóa đơn SI-2026-0003' AS NVARCHAR(500))),
        (@storeSt01, '8934567890202', '-A', CAST(1 AS TINYINT), CAST(1   AS INT), CAST(119 AS INT), 'SALES_RETURN',     @sr1,  @accPharmacist,    DATEADD(HOUR, -20, @now), CAST(N'Hoàn tồn do khách trả hàng SR-2026-0001' AS NVARCHAR(500))),
        (@storeSt02, '8934567890501', '-A', CAST(2 AS TINYINT), CAST(-2  AS INT), CAST(78  AS INT), 'SALES_INVOICE',    @inv4, @accStoreManager,  DATEADD(HOUR, -34, @now), CAST(N'Xuất bán theo hóa đơn SI-2026-0004' AS NVARCHAR(500))),
        (@storeWh,   '8934567890101', '-A', CAST(2 AS TINYINT), CAST(-50 AS INT), CAST(650 AS INT), 'GOODS_ISSUE',      @gi1,  @accWarehouseStaff, DATEADD(DAY, -4, @now), CAST(N'Xuất kho điều chuyển theo GI-2026-0001' AS NVARCHAR(500))),
        (@storeSt02, '8934567890101', '-A', CAST(1 AS TINYINT), CAST(50  AS INT), CAST(130 AS INT), 'GOODS_ISSUE',      @gi1,  @accStoreManager,   DATEADD(DAY, -3, @now), CAST(N'Nhận hàng điều chuyển theo GI-2026-0001' AS NVARCHAR(500))),
        (@storeSt01, '8934567890101', '-A', CAST(2 AS TINYINT), CAST(-2  AS INT), CAST(116 AS INT), 'INVENTORY_ADJUSTMENT', @adj1, @accPharmacist, DATEADD(DAY, -2, @now), CAST(N'Điều chỉnh giảm theo kiểm kê IA-2026-0001' AS NVARCHAR(500)))
    ) AS t(store_id, barcode, suffix, movement_type, qty_change, qty_after, ref_type, ref_id, created_by, created_at, note)
    JOIN dbo.products p ON p.barcode = t.barcode
    LEFT JOIN dbo.product_batches b
           ON b.product_id = p.id
          AND b.batch_number = 'LOT-' + RIGHT('000000' + CAST(p.id AS VARCHAR(6)), 6) + t.suffix;

    /* ===================== 17. THÔNG BÁO / EMAIL / NHẬT KÝ / CẤU HÌNH ===================== */
    DECLARE @prodParacetamol BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890101');
    DECLARE @prodVitaminC    BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890401');
    DECLARE @prodSmecta      BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890301');
    DECLARE @prodBongYTe     BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890704');
    DECLARE @batchExpired    BIGINT = (SELECT id FROM dbo.product_batches WHERE product_id = @prodBongYTe AND batch_number LIKE '%-C');
    DECLARE @rfq1            BIGINT = (SELECT id FROM dbo.rfqs WHERE code = 'RFQ-2026-0001');

    INSERT INTO dbo.notifications (account_id, store_id, type, title, message, ref_type, ref_id, is_read, created_at) VALUES
        (@accManager, @storeSt01, 'WARNING', N'Tồn kho dưới mức tối thiểu',
         N'Paracetamol 500mg tại chi nhánh Quận 1 chỉ còn 116 hộp, cần tạo yêu cầu mua hàng.',
         'PRODUCT', @prodParacetamol, 0, DATEADD(HOUR, -36, @now)),
        (@accWarehouseManager, @storeWh, 'DANGER', N'Lô thuốc đã hết hạn',
         N'Lô LOT-000025-C của Bông y tế gòn đã hết hạn 10 ngày, cần tiêu hủy theo quy định.',
         'BATCH', @batchExpired, 0, DATEADD(DAY, -1, @now)),
        (@accPharmacist, @storeSt01, 'INFO', N'Hóa đơn đã thanh toán',
         N'Hóa đơn SI-2026-0001 đã được thanh toán bằng tiền mặt.',
         'INVOICE', @inv1, 1, DATEADD(HOUR, -38, @now)),
        (@accPurchasing, NULL, 'INFO', N'Nhà cung cấp đã phản hồi RFQ',
         N'Nhà cung cấp Traphaco đã gửi báo giá cho yêu cầu RFQ-2026-0001.',
         'RFQ', @rfq1, 0, DATEADD(DAY, -8, @now)),
        (@accStoreManager, @storeSt02, 'INFO', N'Đã nhận hàng điều chuyển',
         N'Chi nhánh Quận 7 đã nhận đủ 90 sản phẩm từ phiếu GI-2026-0001.',
         'GOODS_ISSUE', @gi1, 1, DATEADD(DAY, -3, @now)),
        (@accGeneralManager, NULL, 'WARNING', N'Đề xuất mua hàng chờ phê duyệt',
         N'Đề xuất PPRO-2026-0002 đang chờ Giám đốc phê duyệt.',
         'PURCHASE_PROPOSAL', @ppro2, 0, DATEADD(DAY, -5, @now)),
        (@accPharmacist2, @storeSt02, 'INFO', N'Lô thuốc sắp hết hạn',
         N'Còn 45 ngày nữa là hết hạn với 2 lô thuốc tại chi nhánh Quận 7, ưu tiên bán trước.',
         'PRODUCT', @prodVitaminC, 0, DATEADD(DAY, -2, @now));

    INSERT INTO dbo.email_logs (to_email, subject, body, ref_type, ref_id, status, error_message, created_at, sent_at) VALUES
        ('kinhdoanh@traphaco.com.vn', N'Yêu cầu báo giá Paracetamol 500mg và Vitamin C 1000mg',
         N'Kính gửi Quý nhà cung cấp, vui lòng xem chi tiết yêu cầu báo giá trong đường dẫn đính kèm.',
         'RFQ', @rfq1, 1, NULL, DATEADD(DAY, -9, @now), DATEADD(DAY, -9, @now)),
        ('pharmacist.duty@phucanpharmacy.vn', N'Đặt lại mật khẩu tài khoản Nhà thuốc Phúc An',
         N'Mã đặt lại mật khẩu của bạn có hiệu lực trong 30 phút.',
         'PASSWORD_RESET', NULL, 1, NULL, DATEADD(HOUR, -5, @now), DATEADD(HOUR, -5, @now)),
        ('sales@imexpharm.com', N'Yêu cầu báo giá Amoxicillin 500mg và Omeprazole 20mg',
         N'Kính gửi Quý nhà cung cấp, vui lòng phản hồi báo giá trước ngày hết hạn RFQ.',
         'RFQ', NULL, 2, N'Hộp thư người nhận đã đầy, không thể gửi. Sẽ thử lại sau.', DATEADD(DAY, -4, @now), NULL);

    /* audit_logs.action: 1 = CREATE, 2 = UPDATE, 3 = DELETE */
    INSERT INTO dbo.audit_logs (account_id, [action], entity_name, entity_id, old_value, new_value, ip_address, created_at) VALUES
        (@accAdmin, 1, 'Product', @prodParacetamol, NULL,
         N'{"barcode":"8934567890101","name":"Paracetamol 500mg","sellingPrice":35000}', '192.168.1.10', DATEADD(DAY, -140, @now)),
        (@accManager, 2, 'SalesInvoice', @inv3, N'{"status":1}', N'{"status":3}', '192.168.1.24', DATEADD(HOUR, -20, @now)),
        (@accWarehouseManager, 1, 'InventoryAdjustment', @adj1, NULL,
         N'{"type":1,"quantityBefore":120,"quantityAfter":118}', '192.168.1.31', DATEADD(DAY, -2, @now)),
        (@accAdmin, 2, 'Account', @accStoreManagerDemo, N'{"status":1}', N'{"status":1,"password":"***"}', '192.168.1.10', DATEADD(DAY, -45, @now)),
        (@accPurchasing, 1, 'Rfq', @rfq1, NULL, N'{"code":"RFQ-2026-0001","status":0}', '192.168.1.44', DATEADD(DAY, -9, @now));

    INSERT INTO dbo.system_settings (setting_key, setting_value, description, updated_by, updated_at) VALUES
        ('LOW_STOCK_DEFAULT_QTY',        '20',        N'Ngưỡng tồn kho thấp mặc định khi sản phẩm chưa khai báo min_quantity', @accAdmin, DATEADD(DAY, -200, @now)),
        ('NEAR_EXPIRY_MONTHS',           '6',         N'Số tháng còn lại để coi là lô cận hạn',                            @accAdmin, DATEADD(DAY, -200, @now)),
        ('MIN_SHELF_LIFE_ON_RECEIPT',    '6',         N'Số tháng hạn dùng tối thiểu khi nhận hàng từ nhà cung cấp',         @accAdmin, DATEADD(DAY, -200, @now)),
        ('RETURN_WINDOW_HOURS',          '24',        N'Thời gian tối đa cho phép khách trả hàng sau khi mua',             @accAdmin, DATEADD(DAY, -200, @now)),
        ('SHIFT_DIFF_NOTE_THRESHOLD',    '50000',     N'Chênh lệch quỹ ca vượt ngưỡng này bắt buộc phải ghi chú',           @accManager, DATEADD(DAY, -120, @now)),
        ('ADJUSTMENT_APPROVAL_VND',      '1000000',   N'Giá trị điều chỉnh tồn kho từ ngưỡng này phải được quản lý duyệt',  @accWarehouseManager, DATEADD(DAY, -120, @now)),
        ('ALERT_JOB_CRON',               '0 0 8 * * ?', N'Lịch chạy tác vụ gửi cảnh báo tồn kho và hạn dùng mỗi ngày',        @accAdmin, DATEADD(DAY, -60, @now)),
        ('PASSWORD_RESET_MINUTES',       '30',        N'Thời gian hiệu lực của token đặt lại mật khẩu (phút)',               @accAdmin, DATEADD(DAY, -60, @now));

    INSERT INTO dbo.password_reset_tokens (account_id, token_hash, expires_at, used_at, created_at) VALUES
        (@accPharmacist2, 'f4c7a1d9e2b58c03a6d9f2b5c8e1a4d7b0c3f6a9',
         DATEADD(MINUTE, 30, @now), NULL, DATEADD(MINUTE, -5, @now)),
        (@accPurchasing, 'c9e2b5d8f1a47c30b6d9e2f5a8c1d4b7e0f3a6c9',
         DATEADD(DAY, -2, @now), DATEADD(DAY, -2, DATEADD(MINUTE, 3, @now)), DATEADD(DAY, -2, @now));

    COMMIT TRANSACTION;

    /* Toàn bộ seed đã commit. Muốn kiểm tra số dòng từng bảng, chạy:
       SELECT t.name AS table_name, SUM(p.rows) AS row_count
       FROM sys.tables t
       JOIN sys.partitions p ON p.object_id = t.object_id AND p.index_id IN (0,1)
       GROUP BY t.name ORDER BY t.name;
    */
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;

    DECLARE @errMessage NVARCHAR(2048) = CONCAT(N'[pms_seed_entities] loi dong ',
                                                ERROR_LINE(), N': ', ERROR_MESSAGE());
    THROW 50000, @errMessage, 1;
END CATCH;