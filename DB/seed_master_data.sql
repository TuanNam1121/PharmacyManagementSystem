/* =====================================================================
   PMS - SEED MASTER DATA (AUTHENTICATION, ROLES, PERMISSIONS, 
   STORES, SUPPLIERS, CATEGORIES, PRODUCTS, PRICE HISTORIES)
   Database: PMS (Microsoft SQL Server)
   Encoding: UTF-8
   Description:
     Kịch bản SQL nạp dữ liệu nền tảng (Master Data) cho hệ thống PharmaChain:
     1. Cấu hình hệ thống (System Settings)
     2. Chi nhánh & Kho (Stores)
     3. Vai trò, Quyền hạn & Phân quyền (Roles, Permissions, Role_Permissions)
     4. Tài khoản, Mật khẩu BCrypt (Password@123) & Thông tin nhân viên
     5. Nhà cung cấp (Suppliers) & Vị trí kho (Warehouse Locations)
     6. Danh mục nhóm thuốc & sản phẩm y tế (Categories)
     7. Danh mục sản phẩm (Products) liên kết nhóm danh mục
     8. Lịch sử giá niêm yết ban đầu (Price Histories)

     TUYỆT ĐỐI KHÔNG chứa dữ liệu nghiệp vụ kinh doanh (không ca làm việc,
     không hóa đơn bán lẻ, không đổi trả hàng, không tồn kho hay lô hàng).
   ===================================================================== */

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET NOCOUNT ON;
USE [PMS];
GO

PRINT N'=====================================================================';
PRINT N'>>> [1/7] BẮT ĐẦU NẠP CẤU HÌNH HỆ THỐNG & CHI NHÁNH / KHO (STORES)...';
PRINT N'=====================================================================';

-- 1.1 Cấu hình hệ thống mặc định (system_settings)
IF OBJECT_ID('dbo.system_settings', 'U') IS NOT NULL
BEGIN
    MERGE INTO dbo.system_settings AS target
    USING (VALUES
        ('LOW_STOCK_DEFAULT_QTY',     N'20',      N'Định mức tồn kho tối thiểu mặc định cho sản phẩm mới'),
        ('NEAR_EXPIRY_MONTHS',        N'6',       N'Cảnh báo khi hạn sử dụng còn dưới N tháng (UC46)'),
        ('MIN_SHELF_LIFE_ON_RECEIPT', N'6',       N'Quy tắc BR-03: Hạn dùng tối thiểu khi nhập kho NCC'),
        ('RETURN_WINDOW_HOURS',       N'24',      N'Quy tắc BR-06: Thời hạn tiếp nhận đổi trả thuốc'),
        ('SHIFT_DIFF_NOTE_THRESHOLD', N'50000',   N'Quy tắc BR-07: Chênh lệch tiền két cần giải trình (VNĐ)'),
        ('ADJUSTMENT_APPROVAL_VND',   N'5000000', N'Quy tắc BR-08: Giá trị điều chỉnh kho cần quản lý duyệt'),
        ('ALERT_JOB_CRON',            N'0 0 8 * * *', N'Lịch chạy tác vụ quét cảnh báo hạn dùng mỗi ngày lúc 8h sáng'),
        ('PASSWORD_RESET_MINUTES',    N'15',      N'Thời gian hết hạn của mã khôi phục mật khẩu')
    ) AS source (setting_key, setting_value, description)
    ON target.setting_key = source.setting_key
    WHEN MATCHED THEN
        UPDATE SET target.setting_value = source.setting_value, target.description = source.description
    WHEN NOT MATCHED THEN
        INSERT (setting_key, setting_value, description) VALUES (source.setting_key, source.setting_value, source.description);
END;

-- 1.2 Chi nhánh & Kho (stores)
IF OBJECT_ID('dbo.stores', 'U') IS NOT NULL
BEGIN
    MERGE INTO dbo.stores AS target
    USING (VALUES
        ('HQ',   N'Trụ Sở Chính - Ban Giám Đốc', 0, N'Tầng 10, Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội', '02473008888', 1),
        ('WH01', N'Kho Tổng Trung Tâm Miền Bắc', 2, N'Lô B2, KCN Đài Tư, 386 Nguyễn Văn Linh, Long Biên, Hà Nội', '02438759999', 1),
        ('ST01', N'Nhà Thuốc Chi Nhánh 01 - Cầu Giấy', 1, N'123 Đường Cầu Giấy, P. Dịch Vọng, Q. Cầu Giấy, Hà Nội', '02438332211', 1),
        ('ST02', N'Nhà Thuốc Chi Nhánh 02 - Đống Đa', 1, N'45 Phố Chùa Bộc, P. Quang Trung, Q. Đống Đa, Hà Nội', '02438523344', 1)
    ) AS source (code, name, type, address, phone, status)
    ON target.code = source.code
    WHEN MATCHED THEN
        UPDATE SET target.name = source.name, target.type = source.type, target.address = source.address, target.phone = source.phone, target.status = source.status
    WHEN NOT MATCHED THEN
        INSERT (code, name, type, address, phone, status) VALUES (source.code, source.name, source.type, source.address, source.phone, source.status);
END;
GO

PRINT N'=====================================================================';
PRINT N'>>> [2/7] NẠP VAI TRÒ (ROLES) & TÍNH NĂNG DANH MỤC QUYỀN (PERMISSIONS)...';
PRINT N'=====================================================================';

-- 2.1 Vai trò hệ thống (roles)
MERGE INTO dbo.roles AS target
USING (VALUES
    ('ADMIN',             N'Quản trị viên hệ thống',       N'Toàn quyền quản trị tài khoản, phân quyền và danh mục hệ thống'),
    ('STORE_MANAGER',     N'Cửa hàng trưởng chi nhánh',    N'Quản lý bán hàng, ca làm việc, duyệt đề xuất và kiểm kê tại chi nhánh'),
    ('PHARMACIST',        N'Dược sĩ tư vấn & Thu ngân',   N'Thực hiện bán lẻ, quản lý giỏ hàng, mở/đóng ca và tiếp nhận thanh toán'),
    ('WAREHOUSE_MANAGER', N'Quản lý kho tổng',             N'Duyệt nhập/xuất kho, điều chuyển, kiểm kê và cảnh báo tồn kho'),
    ('WAREHOUSE_STAFF',   N'Thủ kho / Nhân viên kho',     N'Thực hiện nhập kho, phân bổ vị trí ô kệ, điều chuyển và xuất hàng'),
    ('PURCHASING_STAFF',  N'Nhân viên thu mua',           N'Lập yêu cầu mua hàng, gửi RFQ, tiếp nhận báo giá và theo dõi đơn hàng'),
    ('GENERAL_MANAGER',   N'Tổng giám đốc điều hành',      N'Xem báo cáo kinh doanh, báo cáo tài chính và duyệt đơn đặt hàng lớn')
) AS source (code, name, description)
ON target.code = source.code
WHEN MATCHED THEN
    UPDATE SET target.name = source.name, target.description = source.description
WHEN NOT MATCHED THEN
    INSERT (code, name, description) VALUES (source.code, source.name, source.description);

-- 2.2 Danh mục các tính năng / quyền hạn hệ thống (permissions)
MERGE INTO dbo.permissions AS target
USING (VALUES
    -- Module USER
    ('USER', 'USER_VIEW', N'Xem danh sách tài khoản người dùng'),
    ('USER', 'USER_CREATE', N'Tạo mới tài khoản người dùng'),
    ('USER', 'USER_UPDATE', N'Cập nhật thông tin tài khoản người dùng'),
    ('USER', 'USER_LOCK', N'Khóa hoặc kích hoạt tài khoản'),
    ('USER', 'USER_ASSIGN_ROLE', N'Phân quyền vai trò cho tài khoản'),
    ('USER', 'AUDIT_VIEW', N'Xem nhật ký kiểm toán hệ thống (Audit Logs)'),
    
    -- Module PRODUCT & CATEGORY
    ('PRODUCT', 'PRODUCT_VIEW', N'Xem danh mục sản phẩm thuốc'),
    ('PRODUCT', 'PRODUCT_CREATE', N'Thêm mới sản phẩm vào danh mục'),
    ('PRODUCT', 'PRODUCT_UPDATE', N'Chỉnh sửa thông tin sản phẩm'),
    ('PRODUCT', 'PRICE_MANAGE', N'Thiết lập và điều chỉnh giá vốn, giá bán'),
    ('PRODUCT', 'PRICE_HISTORY_VIEW', N'Xem lịch sử thay đổi giá niêm yết'),
    ('CATEGORY', 'CATEGORY_VIEW', N'Xem danh mục nhóm thuốc'),
    ('CATEGORY', 'CATEGORY_CREATE', N'Thêm mới nhóm thuốc danh mục'),
    ('CATEGORY', 'CATEGORY_UPDATE', N'Chỉnh sửa nhóm thuốc danh mục'),
    ('CATEGORY', 'CATEGORY_DELETE', N'Xóa nhóm thuốc danh mục'),

    -- Module SHIFT & SALES
    ('SHIFT', 'SHIFT_OPEN', N'Mở ca làm việc thu ngân'),
    ('SHIFT', 'SHIFT_CLOSE', N'Chốt ca làm việc và bàn giao tiền két'),
    ('SALES', 'INVOICE_CREATE', N'Lập đơn hàng và xuất hóa đơn bán lẻ POS'),
    ('SALES', 'PAYMENT_PROCESS', N'Xử lý thu tiền và phương thức thanh toán'),
    ('SALES', 'INVOICE_CANCEL', N'Hủy đơn hàng bán lẻ'),
    ('SALES', 'INVOICE_VIEW', N'Xem danh sách và chi tiết hóa đơn'),
    ('SALES', 'SALES_DAILY_VIEW', N'Xem báo cáo tổng hợp bán hàng trong ngày'),
    ('SALES', 'SALES_RECONCILE', N'Đối soát dòng tiền bán hàng và két thu ngân'),

    -- Module CUSTOMER
    ('CUSTOMER', 'CUSTOMER_VIEW', N'Xem danh sách khách hàng và hội viên'),
    ('CUSTOMER', 'CUSTOMER_CREATE', N'Đăng ký thông tin khách hàng mới'),
    ('CUSTOMER', 'CUSTOMER_UPDATE', N'Cập nhật thông tin khách hàng và tiền sử bệnh'),
    ('CUSTOMER', 'CUSTOMER_DELETE', N'Xóa hồ sơ khách hàng'),

    -- Module STORE INVENTORY & WAREHOUSE
    ('STORE_INVENTORY', 'STORE_INVENTORY_VIEW', N'Xem tồn kho tại chi nhánh'),
    ('STORE_INVENTORY', 'STORE_AUDIT_REVIEW', N'Kiểm kê và đối soát kho chi nhánh'),
    ('STORE_INVENTORY', 'REQUISITION_CREATE', N'Tạo phiếu yêu cầu xin cấp thuốc từ kho tổng'),
    ('STORE_INVENTORY', 'REQUISITION_VIEW', N'Xem danh sách phiếu xin cấp thuốc'),
    ('STORE_INVENTORY', 'GOODS_RECEIPT_CONFIRM', N'Xác nhận nhận hàng chuyển về chi nhánh'),
    ('WAREHOUSE', 'WH_INVENTORY_VIEW', N'Xem tồn kho kho tổng theo ô kệ và hạn dùng FEFO'),
    ('WAREHOUSE', 'BIN_ASSIGN', N'Phân bổ vị trí ô kệ cho sản phẩm trong kho'),
    ('WAREHOUSE', 'ADJUSTMENT_CREATE', N'Tạo phiếu điều chỉnh tồn kho'),
    ('WAREHOUSE', 'ADJUSTMENT_APPROVE', N'Phê duyệt phiếu điều chỉnh tồn kho'),
    ('WAREHOUSE', 'ALERT_LOW_STOCK_VIEW', N'Xem cảnh báo thuốc sắp hết hàng'),
    ('WAREHOUSE', 'ALERT_EXPIRY_VIEW', N'Xem cảnh báo thuốc cận date / hết hạn'),
    ('WAREHOUSE', 'PR_MANAGE', N'Quản lý phiếu yêu cầu mua hàng từ nhà cung cấp'),

    -- Module REPLENISHMENT & PROCUREMENT
    ('REPLENISHMENT', 'REPLENISH_MANAGE', N'Quản lý kế hoạch bổ sung hàng'),
    ('REPLENISHMENT', 'REPLENISH_APPROVE', N'Duyệt điều chuyển hàng liên kho'),
    ('PROCUREMENT', 'SUPPLIER_MANAGE', N'Quản lý thông tin nhà cung cấp dược phẩm'),
    ('PROCUREMENT', 'PO_CREATE', N'Lập đơn đặt hàng mua (PO)'),
    ('PROCUREMENT', 'PO_APPROVE', N'Phê duyệt đơn đặt hàng mua lớn'),

    -- Module REPORT & SYSTEM
    ('REPORT', 'REPORT_SALES', N'Xem báo cáo doanh thu bán lẻ'),
    ('REPORT', 'REPORT_INVENTORY', N'Xem báo cáo xuất nhập tồn kho'),
    ('REPORT', 'REPORT_FINANCIAL', N'Xem báo cáo tài chính và lợi nhuận'),
    ('SYSTEM', 'ROLE_VIEW', N'Xem phân quyền vai trò người dùng'),
    ('SYSTEM', 'CONFIG_MANAGE', N'Quản lý tham số cấu hình hệ thống')
) AS source (module, code, description)
ON target.code = source.code
WHEN MATCHED THEN
    UPDATE SET target.module = source.module, target.description = source.description
WHEN NOT MATCHED THEN
    INSERT (module, code, description) VALUES (source.module, source.code, source.description);

-- 2.3 Gán quyền hạn cho từng vai trò (role_permissions)
DECLARE @RolePermMap TABLE (role_code VARCHAR(50), perm_code VARCHAR(50));
INSERT INTO @RolePermMap (role_code, perm_code) VALUES
-- ADMIN: Toàn quyền
('ADMIN', 'USER_VIEW'), ('ADMIN', 'USER_CREATE'), ('ADMIN', 'USER_UPDATE'), ('ADMIN', 'USER_LOCK'), ('ADMIN', 'USER_ASSIGN_ROLE'), ('ADMIN', 'AUDIT_VIEW'),
('ADMIN', 'PRODUCT_VIEW'), ('ADMIN', 'PRODUCT_CREATE'), ('ADMIN', 'PRODUCT_UPDATE'), ('ADMIN', 'PRICE_MANAGE'), ('ADMIN', 'PRICE_HISTORY_VIEW'),
('ADMIN', 'CATEGORY_VIEW'), ('ADMIN', 'CATEGORY_CREATE'), ('ADMIN', 'CATEGORY_UPDATE'), ('ADMIN', 'CATEGORY_DELETE'),
('ADMIN', 'SHIFT_OPEN'), ('ADMIN', 'SHIFT_CLOSE'),
('ADMIN', 'INVOICE_CREATE'), ('ADMIN', 'PAYMENT_PROCESS'), ('ADMIN', 'INVOICE_CANCEL'), ('ADMIN', 'INVOICE_VIEW'), ('ADMIN', 'SALES_DAILY_VIEW'), ('ADMIN', 'SALES_RECONCILE'),
('ADMIN', 'CUSTOMER_VIEW'), ('ADMIN', 'CUSTOMER_CREATE'), ('ADMIN', 'CUSTOMER_UPDATE'), ('ADMIN', 'CUSTOMER_DELETE'),
('ADMIN', 'STORE_INVENTORY_VIEW'), ('ADMIN', 'STORE_AUDIT_REVIEW'), ('ADMIN', 'REQUISITION_CREATE'), ('ADMIN', 'REQUISITION_VIEW'), ('ADMIN', 'GOODS_RECEIPT_CONFIRM'),
('ADMIN', 'WH_INVENTORY_VIEW'), ('ADMIN', 'BIN_ASSIGN'), ('ADMIN', 'ADJUSTMENT_CREATE'), ('ADMIN', 'ADJUSTMENT_APPROVE'), ('ADMIN', 'ALERT_LOW_STOCK_VIEW'), ('ADMIN', 'ALERT_EXPIRY_VIEW'), ('ADMIN', 'PR_MANAGE'),
('ADMIN', 'REPLENISH_MANAGE'), ('ADMIN', 'REPLENISH_APPROVE'), ('ADMIN', 'SUPPLIER_MANAGE'), ('ADMIN', 'PO_CREATE'), ('ADMIN', 'PO_APPROVE'),
('ADMIN', 'REPORT_SALES'), ('ADMIN', 'REPORT_INVENTORY'), ('ADMIN', 'REPORT_FINANCIAL'), ('ADMIN', 'ROLE_VIEW'), ('ADMIN', 'CONFIG_MANAGE'),

-- PHARMACIST: Bán lẻ POS, khách hàng, ca làm việc, tra cứu sản phẩm
('PHARMACIST', 'PRODUCT_VIEW'), ('PHARMACIST', 'CATEGORY_VIEW'), ('PHARMACIST', 'PRICE_HISTORY_VIEW'),
('PHARMACIST', 'SHIFT_OPEN'), ('PHARMACIST', 'SHIFT_CLOSE'),
('PHARMACIST', 'INVOICE_CREATE'), ('PHARMACIST', 'PAYMENT_PROCESS'), ('PHARMACIST', 'INVOICE_VIEW'),
('PHARMACIST', 'CUSTOMER_VIEW'), ('PHARMACIST', 'CUSTOMER_CREATE'), ('PHARMACIST', 'CUSTOMER_UPDATE'),
('PHARMACIST', 'STORE_INVENTORY_VIEW'),

-- STORE_MANAGER: Quản lý chi nhánh, đối soát ca, duyệt đề xuất
('STORE_MANAGER', 'PRODUCT_VIEW'), ('STORE_MANAGER', 'CATEGORY_VIEW'), ('STORE_MANAGER', 'PRICE_HISTORY_VIEW'),
('STORE_MANAGER', 'SHIFT_OPEN'), ('STORE_MANAGER', 'SHIFT_CLOSE'),
('STORE_MANAGER', 'INVOICE_CREATE'), ('STORE_MANAGER', 'PAYMENT_PROCESS'), ('STORE_MANAGER', 'INVOICE_CANCEL'), ('STORE_MANAGER', 'INVOICE_VIEW'),
('STORE_MANAGER', 'SALES_DAILY_VIEW'), ('STORE_MANAGER', 'SALES_RECONCILE'),
('STORE_MANAGER', 'CUSTOMER_VIEW'), ('STORE_MANAGER', 'CUSTOMER_CREATE'), ('STORE_MANAGER', 'CUSTOMER_UPDATE'),
('STORE_MANAGER', 'STORE_INVENTORY_VIEW'), ('STORE_MANAGER', 'STORE_AUDIT_REVIEW'), ('STORE_MANAGER', 'REQUISITION_CREATE'), ('STORE_MANAGER', 'REQUISITION_VIEW'), ('STORE_MANAGER', 'GOODS_RECEIPT_CONFIRM'),
('STORE_MANAGER', 'REPORT_SALES'),

-- WAREHOUSE_STAFF: Phân bổ ô kệ, kiểm kê, nhập xuất
('WAREHOUSE_STAFF', 'PRODUCT_VIEW'), ('WAREHOUSE_STAFF', 'CATEGORY_VIEW'),
('WAREHOUSE_STAFF', 'WH_INVENTORY_VIEW'), ('WAREHOUSE_STAFF', 'BIN_ASSIGN'), ('WAREHOUSE_STAFF', 'ADJUSTMENT_CREATE'),
('WAREHOUSE_STAFF', 'ALERT_LOW_STOCK_VIEW'), ('WAREHOUSE_STAFF', 'ALERT_EXPIRY_VIEW'),

-- WAREHOUSE_MANAGER: Duyệt điều chỉnh, cảnh báo, bổ sung hàng
('WAREHOUSE_MANAGER', 'PRODUCT_VIEW'), ('WAREHOUSE_MANAGER', 'CATEGORY_VIEW'), ('WAREHOUSE_MANAGER', 'WH_INVENTORY_VIEW'),
('WAREHOUSE_MANAGER', 'BIN_ASSIGN'), ('WAREHOUSE_MANAGER', 'ADJUSTMENT_APPROVE'),
('WAREHOUSE_MANAGER', 'ALERT_LOW_STOCK_VIEW'), ('WAREHOUSE_MANAGER', 'ALERT_EXPIRY_VIEW'), ('WAREHOUSE_MANAGER', 'PR_MANAGE'),
('WAREHOUSE_MANAGER', 'REPLENISH_MANAGE'), ('WAREHOUSE_MANAGER', 'REPLENISH_APPROVE'), ('WAREHOUSE_MANAGER', 'REPORT_INVENTORY'),

-- PURCHASING_STAFF: Quản lý NCC, tạo PO, RFQ
('PURCHASING_STAFF', 'PRODUCT_VIEW'), ('PURCHASING_STAFF', 'CATEGORY_VIEW'),
('PURCHASING_STAFF', 'SUPPLIER_MANAGE'), ('PURCHASING_STAFF', 'PO_CREATE'), ('PURCHASING_STAFF', 'PR_MANAGE'),

-- GENERAL_MANAGER: Duyệt PO lớn, xem toàn bộ báo cáo
('GENERAL_MANAGER', 'PRODUCT_VIEW'), ('GENERAL_MANAGER', 'CATEGORY_VIEW'),
('GENERAL_MANAGER', 'PO_APPROVE'), ('GENERAL_MANAGER', 'REPORT_SALES'), ('GENERAL_MANAGER', 'REPORT_INVENTORY'), ('GENERAL_MANAGER', 'REPORT_FINANCIAL');

-- Chèn vào dbo.role_permissions nếu chưa có
INSERT INTO dbo.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM @RolePermMap m
JOIN dbo.roles r ON r.code = m.role_code
JOIN dbo.permissions p ON p.code = m.perm_code
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
GO

PRINT N'=====================================================================';
PRINT N'>>> [3/7] NẠP TÀI KHOẢN MẪU & MẬT KHẨU (Password@123)...';
PRINT N'=====================================================================';

/* Mật khẩu chung cho môi trường kiểm thử: Password@123
   BCrypt Hash: $2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W */

DECLARE @AdminRoleId       INT = (SELECT id FROM dbo.roles WHERE code = 'ADMIN');
DECLARE @StoreManagerRoleId INT = (SELECT id FROM dbo.roles WHERE code = 'STORE_MANAGER');
DECLARE @PharmacistRoleId   INT = (SELECT id FROM dbo.roles WHERE code = 'PHARMACIST');
DECLARE @WarehouseMgrRoleId INT = (SELECT id FROM dbo.roles WHERE code = 'WAREHOUSE_MANAGER');
DECLARE @WarehouseStaffRoleId INT = (SELECT id FROM dbo.roles WHERE code = 'WAREHOUSE_STAFF');
DECLARE @PurchasingRoleId   INT = (SELECT id FROM dbo.roles WHERE code = 'PURCHASING_STAFF');
DECLARE @GmRoleId           INT = (SELECT id FROM dbo.roles WHERE code = 'GENERAL_MANAGER');

DECLARE @AccountData TABLE (
    username VARCHAR(50),
    email VARCHAR(150),
    phone VARCHAR(20),
    role_id INT,
    status TINYINT,
    full_name NVARCHAR(150),
    dob DATE,
    gender TINYINT,
    address NVARCHAR(250),
    avatar_url VARCHAR(500)
);

INSERT INTO @AccountData VALUES
('admin', 'admin@pharmacy.com', '0901234567', @AdminRoleId, 1, N'Quản Trị Viên Hệ Thống', '1988-05-15', 1, N'Tầng 10, Tòa nhà FPT, Duy Tân, Cầu Giấy, Hà Nội', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
('pharmacist_hn01', 'pharmacist1@pharmacy.com', '0912345678', @PharmacistRoleId, 1, N'Nguyễn Văn Dược', '1995-10-20', 1, N'Số 45 Ngõ 165 Cầu Giấy, P. Dịch Vọng, Hà Nội', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150'),
('pharmacist1', 'pharmacist_alt@pharmacy.com', '0912999888', @PharmacistRoleId, 1, N'Đỗ Minh Ngọc', '1998-03-12', 0, N'Số 12 Chùa Láng, Láng Thượng, Đống Đa, Hà Nội', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
('manager_hn01', 'manager1@pharmacy.com', '0922345678', @StoreManagerRoleId, 1, N'Trần Thị Hương', '1990-08-25', 0, N'Tòa Landmark 72, Mễ Trì, Nam Từ Liêm, Hà Nội', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
('warehouse01', 'warehouse1@pharmacy.com', '0932345678', @WarehouseStaffRoleId, 1, N'Lê Văn Kho', '1993-12-05', 1, N'Số 88 Sài Đồng, Long Biên, Hà Nội', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('wh_manager01', 'wh_manager1@pharmacy.com', '0942345678', @WarehouseMgrRoleId, 1, N'Phạm Đình Quân', '1987-04-18', 1, N'Số 22 Phúc Lợi, Long Biên, Hà Nội', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
('purchasing01', 'purchasing1@pharmacy.com', '0952345678', @PurchasingRoleId, 1, N'Vũ Hoàng Nam', '1992-07-22', 1, N'Số 18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'),
('gm01', 'gm@pharmacy.com', '0962345678', @GmRoleId, 1, N'Bùi Quang Huy', '1980-01-10', 1, N'Khu đô thị Ciputra, Tây Hồ, Hà Nội', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'),
('locked_user', 'locked@pharmacy.com', '0972345678', @PharmacistRoleId, 0, N'Tài Khoản Đã Bị Khóa', '1999-01-01', 1, N'Hà Nội', NULL);

-- Chèn hoặc cập nhật dbo.accounts
MERGE INTO dbo.accounts AS target
USING @AccountData AS source
ON target.username = source.username
WHEN MATCHED THEN
    UPDATE SET 
        target.email = source.email,
        target.phone = source.phone,
        target.role_id = source.role_id,
        target.status = source.status,
        target.password = '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W',
        target.failed_login_count = 0
WHEN NOT MATCHED THEN
    INSERT (username, email, phone, role_id, status, [password], failed_login_count, created_at)
    VALUES (source.username, source.email, source.phone, source.role_id, source.status,
            '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', 0, SYSDATETIME());

-- Chèn hoặc cập nhật dbo.account_informations
MERGE INTO dbo.account_informations AS target
USING (
    SELECT a.id AS account_id, src.full_name, src.dob, src.gender, src.address, src.avatar_url
    FROM @AccountData src
    JOIN dbo.accounts a ON a.username = src.username
) AS source
ON target.account_id = source.account_id
WHEN MATCHED THEN
    UPDATE SET 
        target.full_name = source.full_name,
        target.date_of_birth = source.dob,
        target.gender = source.gender,
        target.address = source.address,
        target.avatar_url = source.avatar_url
WHEN NOT MATCHED THEN
    INSERT (account_id, full_name, date_of_birth, gender, address, avatar_url)
    VALUES (source.account_id, source.full_name, source.dob, source.gender, source.address, source.avatar_url);
GO

PRINT N'=====================================================================';
PRINT N'>>> [4/7] NẠP NHÀ CUNG CẤP (SUPPLIERS) & VỊ TRÍ KHO (LOCATIONS)...';
PRINT N'=====================================================================';

-- 4.1 Nhà cung cấp dược phẩm (suppliers)
MERGE INTO dbo.suppliers AS target
USING (VALUES
    ('SUP001', N'Công ty Cổ phần Dược Hậu Giang (DHG Pharma)', N'Nguyễn Văn An', '02923891433', 'contact@dhgpharma.com.vn', N'288 Bis Nguyễn Văn Cừ, P. An Hòa, Q. Ninh Kiều, Cần Thơ', '1800156801', N'Đối tác chiến lược cung cấp thuốc hạ sốt, kháng sinh, giảm đau', 1),
    ('SUP002', N'Công ty Cổ phần Traphaco', N'Trần Thị Mai', '02436814980', 'info@traphaco.com.vn', N'Ngõ 15, Ngọc Hồi, Hoàng Liệt, Hoàng Mai, Hà Nội', '0100108656', N'Nhà cung cấp thuốc đông dược, thuốc tim mạch, bổ gan Boganic', 1),
    ('SUP003', N'Công ty TNHH Sanofi-Aventis Việt Nam', N'Lê Minh Tuấn', '02838298526', 'vietnam.contact@sanofi.com', N'Số 10 Hàm Nghi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', '0300819934', N'Tập đoàn dược phẩm quốc tế chuyên biệt men vi sinh và thuốc tiêu hóa', 1),
    ('SUP004', N'Công ty Cổ phần Dược phẩm Imexpharm', N'Phạm Thu Trang', '02773851941', 'imexpharm@imexpharm.com', N'Số 4, Đường 30/4, Phường 1, TP. Cao Lãnh, Đồng Tháp', '1400384433', N'Nhà máy sản xuất kháng sinh tiêu chuẩn EU-GMP hàng đầu', 1),
    ('SUP005', N'Công ty Cổ phần Dược phẩm Hà Tây (Hataphar)', N'Vũ Đình Khiêm', '02433522203', 'duochatay@hataphar.com.vn', N'10A Quang Trung, Q. Hà Đông, Hà Nội', '0500237890', N'Cung cấp Paracetamol, thuốc thiết yếu tiêu chuẩn GMP-WHO', 1),
    ('SUP006', N'Công ty TNHH Mega Lifesciences Việt Nam', N'Hoàng Lan Anh', '02838238666', 'megavn@megawecare.com', N'Tòa nhà E-Town, 364 Cộng Hòa, P. 13, Q. Tân Bình, TP. HCM', '0302014567', N'Nhà cung cấp viên nang mềm Eugica, Enat 400, thực phẩm bảo vệ sức khỏe', 1)
) AS source (code, name, contact_person, phone, email, address, tax_code, note, status)
ON target.code = source.code
WHEN MATCHED THEN
    UPDATE SET target.name = source.name, target.contact_person = source.contact_person, target.phone = source.phone, target.email = source.email, target.address = source.address, target.tax_code = source.tax_code, target.note = source.note, target.status = source.status
WHEN NOT MATCHED THEN
    INSERT (code, name, contact_person, phone, email, address, tax_code, note, status)
    VALUES (source.code, source.name, source.contact_person, source.phone, source.email, source.address, source.tax_code, source.note, source.status);

-- 4.2 Vị trí Ô/Kệ kho tổng (warehouse_locations)
DECLARE @WhStoreId BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE type = 2);
IF @WhStoreId IS NOT NULL AND OBJECT_ID('dbo.warehouse_locations', 'U') IS NOT NULL
BEGIN
    MERGE INTO dbo.warehouse_locations AS target
    USING (VALUES
        ('A-01-01', 'A', '1', '1'),
        ('A-01-02', 'A', '1', '2'),
        ('A-02-01', 'A', '2', '1'),
        ('A-02-02', 'A', '2', '2'),
        ('B-01-01', 'B', '1', '1'),
        ('B-01-02', 'B', '1', '2'),
        ('B-02-01', 'B', '2', '1'),
        ('C-01-01', 'C', '1', '1'),
        ('D-01-01', 'D', '1', '1')
    ) AS source (code, aisle, shelf, bin)
    ON target.store_id = @WhStoreId AND target.code = source.code
    WHEN MATCHED THEN
        UPDATE SET target.aisle = source.aisle, target.shelf = source.shelf, target.bin = source.bin, target.status = 1
    WHEN NOT MATCHED THEN
        INSERT (store_id, code, aisle, shelf, bin, status)
        VALUES (@WhStoreId, source.code, source.aisle, source.shelf, source.bin, 1);
END;
GO

PRINT N'=====================================================================';
PRINT N'>>> [5/7] NẠP DANH MỤC NHÓM THUỐC & Y TẾ (CATEGORIES)...';
PRINT N'=====================================================================';

DECLARE @AdminId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'admin');

DECLARE @CategoryData TABLE (
    name NVARCHAR(150),
    description NVARCHAR(500)
);

INSERT INTO @CategoryData (name, description) VALUES
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', N'Các loại thuốc giảm đau thông thường (Paracetamol), thuốc kháng viêm không steroid (NSAIDs) và hạ sốt cho người lớn & trẻ em'),
(N'Thuốc Kháng Sinh & Kháng Khuẩn', N'Các nhóm kháng sinh kê đơn (Rx) như Penicillin, Cephalosporin, Macrolide, Quinolone dùng điều trị nhiễm khuẩn đường hô hấp, tiêu hóa, da và tiết niệu'),
(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', N'Thuốc điều trị viêm loét dạ dày - tá tràng (PPI, kháng H2), trung hòa acid, men tiêu hóa, men vi sinh, thuốc trị tiêu chảy và bổ gan'),
(N'Thuốc Tim Mạch & Huyết Áp', N'Thuốc kê đơn điều trị tăng huyết áp (chẹn canxi, chẹn beta, ức chế men chuyển), hạ mỡ máu và trợ tim'),
(N'Thuốc Hô Hấp, Ho & Cảm Cúm', N'Siro ho, viên ngậm thảo dược bổ phế, thuốc long đờm, giãn phế quản và các chế phẩm đặc trị cảm sốt, sổ mũi'),
(N'Thuốc Dị Ứng & Kháng Histamin', N'Các thuốc kháng histamin thế hệ mới điều trị viêm mũi dị ứng, mày đay, mẩn ngứa và dị ứng thời tiết'),
(N'Thuốc Da Liễu & Trị Mụn', N'Các loại kem bôi ngoài da, thuốc mỡ kháng khuẩn, kem trị mụn, trị nấm và phục hồi tổn thương da'),
(N'Thuốc Nhãn Khoa & Tai Mũi Họng', N'Thuốc nhỏ mắt cung cấp dưỡng chất, nước mắt nhân tạo, dung dịch xịt mũi co mạch và thuốc nhỏ tai'),
(N'Thuốc Cơ Xương Khớp & Thần Kinh', N'Thuốc giãn cơ, bổ thần kinh, giảm đau dây thần kinh tọa và hỗ trợ tuần hoàn não'),
(N'Vitamin, Khoáng Chất & Dinh Dưỡng', N'Viên sủi tăng đề kháng, canxi, vitamin tổng hợp, kẽm, sắt và các khoáng chất thiết yếu cho cơ thể'),
(N'Thực Phẩm Bảo Vệ Sức Khỏe & TPCN', N'Dầu cá Omega-3, viên bổ xương khớp Glucosamine, sụn vi cá mập, trà thảo mộc và thực phẩm chức năng hỗ trợ sức khỏe'),
(N'Dụng Cụ Y Tế & Chăm Sóc Vết Thương', N'Băng dán y tế vô trùng, cồn sát khuẩn, nước muối sinh lý, nhiệt kế điện tử, gạc và khẩu trang y tế');

MERGE INTO dbo.categories AS target
USING @CategoryData AS source
ON target.name = source.name
WHEN MATCHED THEN
    UPDATE SET 
        target.description = source.description,
        target.status = 1
WHEN NOT MATCHED THEN
    INSERT (name, description, status, created_by, created_at)
    VALUES (source.name, source.description, 1, @AdminId, SYSDATETIME());
GO

PRINT N'=====================================================================';
PRINT N'>>> [6/7] NẠP DANH MỤC SẢN PHẨM (PRODUCTS)...';
PRINT N'=====================================================================';

DECLARE @ProductData TABLE (
    category_name NVARCHAR(150),
    barcode VARCHAR(50),
    name NVARCHAR(250),
    unit NVARCHAR(30),
    active_ingredient NVARCHAR(250),
    manufacturer NVARCHAR(200),
    is_prescription BIT,
    cost_price DECIMAL(18,2),
    selling_price DECIMAL(18,2),
    min_quantity INT,
    description NVARCHAR(MAX)
);

INSERT INTO @ProductData 
(category_name, barcode, name, unit, active_ingredient, manufacturer, is_prescription, cost_price, selling_price, min_quantity, description)
VALUES
-- 1. Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', '8934567890123', N'Panadol Extra Đỏ (Hộp 15 vỉ x 12 viên)', N'Hộp', N'Paracetamol 500mg, Caffeine 65mg', N'GSK Consumer Healthcare', 0, 165000.00, 195000.00, 40, N'Thuốc giảm đau nhanh cho các cơn đau đầu, đau cơ, đau răng, hạ sốt hiệu quả.'),
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', '8934567890124', N'Paracetamol 500mg Hataphar (Hộp 10 vỉ x 10 viên)', N'Hộp', N'Paracetamol 500mg', N'Dược phẩm Hà Tây (Hataphar)', 0, 45000.00, 60000.00, 50, N'Thuốc hạ sốt, giảm đau thông thường không gây kích ứng dạ dày.'),
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', '8934567890133', N'Efferalgan 500mg (Hộp 4 vỉ x 4 viên sủi)', N'Hộp', N'Paracetamol 500mg', N'UPSA SAS (Pháp)', 0, 60000.00, 78000.00, 30, N'Viên sủi tác dụng giảm đau hạ sốt nhanh, hòa tan hoàn toàn trong nước.'),
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', '8934567890134', N'Mobic 7.5mg (Hộp 2 vỉ x 10 viên)', N'Hộp', N'Meloxicam 7.5mg', N'Boehringer Ingelheim', 1, 155000.00, 185000.00, 20, N'Thuốc kháng viêm không steroid (NSAID) kê đơn dùng cho viêm khớp mạn tính.'),
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', '8934567890135', N'Hapacol 250 Trẻ Em Vị Cam (Hộp 24 gói)', N'Hộp', N'Paracetamol 250mg', N'DHG Pharma', 0, 42000.00, 55000.00, 35, N'Bột sủi hương cam dịu ngọt hạ sốt cho trẻ từ 2 đến 6 tuổi.'),

-- 2. Thuốc Kháng Sinh & Kháng Khuẩn
(N'Thuốc Kháng Sinh & Kháng Khuẩn', '8934567890125', N'Augmentin 1g (Hộp 14 viên)', N'Hộp', N'Amoxicillin 875mg, Acid Clavulanic 125mg', N'GlaxoSmithKline (GSK)', 1, 215000.00, 260000.00, 30, N'Kháng sinh phổ rộng điều trị nhiễm khuẩn đường hô hấp trên và dưới, nhiễm khuẩn da.'),
(N'Thuốc Kháng Sinh & Kháng Khuẩn', '8934567890126', N'Amoxicillin 500mg DHG (Hộp 10 vỉ x 10 viên)', N'Hộp', N'Amoxicillin trihydrate 500mg', N'DHG Pharma', 1, 65000.00, 85000.00, 40, N'Kháng sinh nhóm penicillin điều trị nhiễm trùng do vi khuẩn nhạy cảm.'),
(N'Thuốc Kháng Sinh & Kháng Khuẩn', '8934567890136', N'Cefixim 200mg DHG (Hộp 2 vỉ x 10 viên)', N'Hộp', N'Cefixim 200mg', N'DHG Pharma', 1, 72000.00, 95000.00, 25, N'Kháng sinh Cephalosporin thế hệ 3 đường uống điều trị viêm phế quản, viêm tai giữa.'),
(N'Thuốc Kháng Sinh & Kháng Khuẩn', '8934567890137', N'Zithromax 500mg (Hộp 1 vỉ x 3 viên)', N'Hộp', N'Azithromycin dihydrate 500mg', N'Pfizer (Mỹ)', 1, 135000.00, 165000.00, 20, N'Kháng sinh nhóm Macrolide phổ rộng liều ngắn ngày cho nhiễm trùng hô hấp.'),
(N'Thuốc Kháng Sinh & Kháng Khuẩn', '8934567890138', N'Ciprofloxacin 500mg Vidipha (Hộp 10 vỉ x 10 viên)', N'Hộp', N'Ciprofloxacin 500mg', N'Vidipha', 1, 85000.00, 110000.00, 25, N'Kháng sinh Quinolone điều trị nhiễm khuẩn đường tiết niệu, đường tiêu hóa.'),

-- 3. Thuốc Tiêu Hóa, Dạ Dày & Gan Mật
(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', '8934567890127', N'Nexium Mups 40mg (Hộp 14 viên)', N'Hộp', N'Esomeprazole magnesium trihydrate 40mg', N'AstraZeneca', 1, 295000.00, 350000.00, 25, N'Thuốc ức chế bơm proton (PPI) điều trị trào ngược dạ dày thực quản (GERD) và loét dạ dày.'),
(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', '8934567890128', N'Hỗn dịch uống Gaviscon Dual Action (Hộp 24 gói x 10ml)', N'Hộp', N'Natri alginate, Natri bicarbonat, Calci carbonat', N'Reckitt Benckiser', 0, 110000.00, 135000.00, 40, N'Lớp gel bảo vệ thực quản ngăn ngừa trào ngược acid và chứng ợ chua nóng rát.'),
(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', '8934567890139', N'Phosphalugel Thuốc Dạ Dày Chữ P (Hộp 26 gói x 20g)', N'Hộp', N'Nhôm phosphat gel 20%', N'Sanofi Aventis', 0, 98000.00, 120000.00, 50, N'Hỗn dịch kháng acid làm dịu nhanh cơn đau do viêm dạ dày cấp và mãn tính.'),
(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', '8934567890140', N'Smecta 3g Vị Vani (Hộp 30 gói)', N'Hộp', N'Diosmectite 3g', N'Ipsen Pharma', 0, 120000.00, 145000.00, 40, N'Bột pha uống bảo vệ niêm mạc ruột và điều trị tiêu chảy cấp & mạn tính.'),
(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', '8934567890141', N'Men vi sinh Enterogermina 2 tỷ bào tử (Hộp 20 ống x 5ml)', N'Hộp', N'Bacillus clausii 2 tỷ bào tử', N'Sanofi Aventis', 0, 145000.00, 175000.00, 45, N'Bào tử men vi sinh phục hồi hệ vi sinh đường ruột do dùng kháng sinh dài ngày.'),

-- 4. Thuốc Tim Mạch & Huyết Áp
(N'Thuốc Tim Mạch & Huyết Áp', '8934567890129', N'Amlodipine 5mg Stada (Hộp 3 vỉ x 10 viên)', N'Hộp', N'Amlodipine besylate 5mg', N'Stada', 1, 22000.00, 30000.00, 30, N'Thuốc chẹn kênh canxi điều trị tăng huyết áp và đau thắt ngực ổn định.'),
(N'Thuốc Tim Mạch & Huyết Áp', '8934567890142', N'Concor 5mg (Hộp 5 vỉ x 10 viên)', N'Hộp', N'Bisoprolol fumarate 5mg', N'Merck Healthcare', 1, 180000.00, 225000.00, 20, N'Thuốc chẹn thụ thể beta chọn lọc điều trị tăng huyết áp và suy tim mạn tính.'),
(N'Thuốc Tim Mạch & Huyết Áp', '8934567890143', N'Micardis 40mg (Hộp 3 vỉ x 10 viên)', N'Hộp', N'Telmisartan 40mg', N'Boehringer Ingelheim', 1, 230000.00, 280000.00, 20, N'Thuốc đối kháng thụ thể angiotensin II hạ huyết áp và phòng ngừa biến cố tim mạch.'),
(N'Thuốc Tim Mạch & Huyết Áp', '8934567890144', N'Lipitor 20mg (Hộp 3 vỉ x 10 viên)', N'Hộp', N'Atorvastatin calcium 20mg', N'Pfizer', 1, 410000.00, 495000.00, 15, N'Thuốc điều hòa lipid máu nhóm statin hạ cholesterol máu và triglyceride.'),

-- 5. Thuốc Hô Hấp, Ho & Cảm Cúm
(N'Thuốc Hô Hấp, Ho & Cảm Cúm', '8934567890145', N'Siro Ho Prospan Chai 100ml', N'Chai', N'Cao khô lá thường xuân', N'Engelhard Arzneimittel (Đức)', 0, 95000.00, 125000.00, 35, N'Siro thảo dược trị ho phế quản, viêm đường hô hấp cấp, dùng an toàn cho trẻ sơ sinh.'),
(N'Thuốc Hô Hấp, Ho & Cảm Cúm', '8934567890146', N'Viên ngậm ho Bảo Thanh (Hộp 20 vỉ x 5 viên)', N'Hộp', N'Ô mai, Mật ong, Tỳ bà diệp, Xuyên bối mẫu', N'Dược phẩm Hoa Linh', 0, 110000.00, 140000.00, 40, N'Viên ngậm bổ phế, nhuận phế, giảm ngứa rát cổ họng do ho khan, ho gió.'),
(N'Thuốc Hô Hấp, Ho & Cảm Cúm', '8934567890147', N'Decolgen Cảm Cúm (Hộp 25 vỉ x 4 viên)', N'Hộp', N'Paracetamol, Phenylephrine, Chlorpheniramine', N'United Pharma', 0, 90000.00, 115000.00, 30, N'Thuốc điều trị triệu chứng cảm cúm, nhức đầu, sốt, nghẹt mũi và hắt hơi.'),
(N'Thuốc Hô Hấp, Ho & Cảm Cúm', '8934567890148', N'Viên nang mềm Eugica (Hộp 10 vỉ x 10 viên)', N'Hộp', N'Eucalyptol, Tinh dầu tràm, Gừng, Tần', N'Mega Lifesciences', 0, 68000.00, 88000.00, 40, N'Viên nang làm ấm họng, sát trùng đường hô hấp, giảm các cơn ho dai dẳng.'),

-- 6. Thuốc Dị Ứng & Kháng Histamin
(N'Thuốc Dị Ứng & Kháng Histamin', '8934567890131', N'Telfast HD 180mg (Hộp 1 vỉ x 10 viên)', N'Hộp', N'Fexofenadine HCl 180mg', N'Sanofi Aventis', 0, 72000.00, 90000.00, 30, N'Kháng histamin thế hệ 2 không gây buồn ngủ, trị viêm mũi dị ứng và mề đay tự phát.'),
(N'Thuốc Dị Ứng & Kháng Histamin', '8934567890149', N'Cetirizin 10mg Stada (Hộp 5 vỉ x 10 viên)', N'Hộp', N'Cetirizin dihydroclorid 10mg', N'Stada', 0, 40000.00, 55000.00, 30, N'Thuốc chống dị ứng điều trị các chứng viêm kết mạc dị ứng, ngứa da do phát ban.'),

-- 7. Thuốc Da Liễu & Trị Mụn
(N'Thuốc Da Liễu & Trị Mụn', '8934567890150', N'Kem bôi da Fucidin 2% (Tuýp 15g)', N'Tuýp', N'Acid fusidic 20mg/g', N'LEO Pharma (Đan Mạch)', 1, 82000.00, 105000.00, 25, N'Kháng sinh bôi ngoài da điều trị viêm da mủ, chốc lở và vết thương nông nhiễm khuẩn.'),
(N'Thuốc Da Liễu & Trị Mụn', '8934567890151', N'Kem ngừa sẹo Dermatix Ultra (Tuýp 15g)', N'Tuýp', N'Gel silicon công nghệ CPX & Vitamin C ester', N'Menarini', 0, 245000.00, 295000.00, 20, N'Gel làm phẳng, mềm và mờ các vết sẹo sau phẫu thuật, bỏng hoặc vết cắt trầy xước.'),

-- 8. Thuốc Nhãn Khoa & Tai Mũi Họng
(N'Thuốc Nhãn Khoa & Tai Mũi Họng', '8934567890152', N'Thuốc nhỏ mắt Rohto Vita 40 (Lọ 12ml)', N'Lọ', N'Vitamin B6, Vitamin E thiên nhiên, Sodium Chondroitin', N'Rohto-Mentholatum', 0, 42000.00, 55000.00, 50, N'Bổ sung dưỡng chất làm dịu căng thẳng mỏi mắt, nhìn mờ do làm việc nhiều trước máy tính.'),
(N'Thuốc Nhãn Khoa & Tai Mũi Họng', '8934567890153', N'Thuốc xịt mũi Otrivin 0.1% (Lọ 10ml)', N'Lọ', N'Xylometazoline hydrochloride 0.1%', N'GlaxoSmithKline (GSK)', 0, 45000.00, 60000.00, 35, N'Xịt thông mũi nhanh chóng giảm phù nề xung huyết mũi do cảm lạnh hoặc viêm xoang.'),

-- 9. Vitamin, Khoáng Chất & Dinh Dưỡng
(N'Vitamin, Khoáng Chất & Dinh Dưỡng', '8934567890130', N'Viên sủi Berocca Performance Vị Xoài (Tuýp 10 viên)', N'Tuýp', N'Vitamin nhóm B tổng hợp, Vitamin C, Kẽm, Magiê', N'Bayer Pharma', 0, 75000.00, 95000.00, 30, N'Viên sủi bổ sung năng lượng, hỗ trợ tỉnh táo tập trung và tăng cường sức đề kháng.'),
(N'Vitamin, Khoáng Chất & Dinh Dưỡng', '8934567890154', N'Canxi Osteocare Liquid Chai 200ml', N'Chai', N'Canxi nguyên tố, Magiê, Vitamin D3, Kẽm', N'Vitabiotics (Anh Quốc)', 0, 185000.00, 230000.00, 25, N'Bổ sung canxi và vitamin D dạng lỏng dễ hấp thu, chống loãng xương cho người lớn.'),

-- 10. Thực Phẩm Bảo Vệ Sức Khỏe & TPCN
(N'Thực Phẩm Bảo Vệ Sức Khỏe & TPCN', '8934567890132', N'Viên uống Dầu cá Omega 3 Fish Oil (Chai 100 viên)', N'Chai', N'EPA 180mg, DHA 120mg, Dầu cá tinh khiết', N'Blackmores (Úc)', 0, 380000.00, 480000.00, 25, N'Cung cấp acid béo Omega 3 tự nhiên hỗ trợ sức khỏe tim mạch, não bộ và thị lực.'),
(N'Thực Phẩm Bảo Vệ Sức Khỏe & TPCN', '8934567890155', N'Viên uống Bổ Khớp Glucosamine 1500mg Orihiro (Lọ 900 viên)', N'Lọ', N'Glucosamine hydrochloride 1500mg, Chondroitin', N'Orihiro (Nhật Bản)', 0, 520000.00, 650000.00, 15, N'Hỗ trợ tái tạo sụn khớp, bôi trơn ổ khớp và giảm triệu chứng thoái hóa khớp.'),

-- 11. Dụng Cụ Y Tế & Chăm Sóc Vết Thương
(N'Dụng Cụ Y Tế & Chăm Sóc Vết Thương', '8934567890156', N'Nước muối sinh lý Natri Clorid 0.9% (Chai 500ml)', N'Chai', N'Natri clorid 0.9% đẳng trương', N'Dược phẩm Pharmedic', 0, 5000.00, 8000.00, 100, N'Dung dịch rửa vết thương, súc miệng vệ sinh họng và rửa mũi an toàn.'),
(N'Dụng Cụ Y Tế & Chăm Sóc Vết Thương', '8934567890157', N'Băng dán y tế cá nhân Urgo Waterproof (Hộp 20 miếng)', N'Hộp', N'Màng PU chống nước vô trùng', N'Urgo Healthcare', 0, 28000.00, 38000.00, 50, N'Băng dán cá nhân thoáng khí chống nước bảo vệ vết thương khỏi vi khuẩn và bụi bẩn.'),
(N'Dụng Cụ Y Tế & Chăm Sóc Vết Thương', '8934567890158', N'Cồn y tế 70 độ Vĩnh Phúc (Chai 500ml)', N'Chai', N'Ethanol 70% v/v', N'Dược Vĩnh Phúc', 0, 15000.00, 22000.00, 60, N'Sát khuẩn da, dụng cụ y tế và bề mặt tiếp xúc phòng ngừa nhiễm trùng.'),
(N'Dụng Cụ Y Tế & Chăm Sóc Vết Thương', '8934567890159', N'Nhiệt kế điện tử đầu mềm Microlife MT200', N'Cái', N'Cảm biến nhiệt kỹ thuật số chính xác 10s', N'Microlife (Thụy Sĩ)', 0, 130000.00, 175000.00, 20, N'Đo thân nhiệt nhanh chóng trong 10 giây, báo sốt bằng tiếng bíp và màn hình phát sáng.'),
(N'Dụng Cụ Y Tế & Chăm Sóc Vết Thương', '8934567890160', N'Khẩu trang y tế 4 lớp kháng khuẩn KF94 (Hộp 30 cái)', N'Hộp', N'Vải không dệt y tế, màng lọc Meltblown', N'Famapro', 0, 35000.00, 50000.00, 80, N'Khẩu trang thiết kế 4D ôm khít mặt, màng lọc kháng khuẩn lọc bụi mịn PM2.5.');

MERGE INTO dbo.products AS target
USING (
    SELECT 
        c.id AS category_id,
        src.barcode,
        src.name,
        src.unit,
        src.active_ingredient,
        src.manufacturer,
        src.is_prescription,
        src.cost_price,
        src.selling_price,
        src.min_quantity,
        src.description
    FROM @ProductData src
    JOIN dbo.categories c ON c.name = src.category_name
) AS source
ON target.barcode = source.barcode
WHEN MATCHED THEN
    UPDATE SET
        target.category_id = source.category_id,
        target.name = source.name,
        target.unit = source.unit,
        target.active_ingredient = source.active_ingredient,
        target.manufacturer = source.manufacturer,
        target.is_prescription = source.is_prescription,
        target.cost_price = source.cost_price,
        target.selling_price = source.selling_price,
        target.min_quantity = source.min_quantity,
        target.description = source.description,
        target.status = 1,
        target.updated_at = SYSDATETIME()
WHEN NOT MATCHED THEN
    INSERT (
        category_id, barcode, name, unit, active_ingredient, manufacturer,
        is_prescription, cost_price, selling_price, min_quantity, description,
        status, created_at
    )
    VALUES (
        source.category_id, source.barcode, source.name, source.unit, source.active_ingredient, source.manufacturer,
        source.is_prescription, source.cost_price, source.selling_price, source.min_quantity, source.description,
        1, SYSDATETIME()
    );
GO

PRINT N'=====================================================================';
PRINT N'>>> [7/7] NẠP BẢN GHI LỊCH SỬ GIÁ BAN ĐẦU (PRICE_HISTORIES)...';
PRINT N'=====================================================================';

DECLARE @AdminId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'admin');

IF OBJECT_ID('dbo.price_histories', 'U') IS NOT NULL
BEGIN
    INSERT INTO dbo.price_histories (product_id, account_id, cost_price, selling_price, effective_from, reason, created_at)
    SELECT 
        p.id,
        @AdminId,
        p.cost_price,
        p.selling_price,
        SYSDATETIME(),
        N'Thiết lập giá niêm yết ban đầu khi tạo sản phẩm vào danh mục',
        SYSDATETIME()
    FROM dbo.products p
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.price_histories ph WHERE ph.product_id = p.id
    );
END;

PRINT N'=====================================================================';
PRINT N'>>> HOÀN TẤT NẠP SEED MASTER DATA THÀNH CÔNG!';
PRINT N'DANH SÁCH TÀI KHOẢN MẪU ĐĂNG NHẬP (MẬT KHẨU CHUNG: Password@123):';
PRINT N'1. Admin:             Username: admin           | Email: admin@pharmacy.com';
PRINT N'2. Dược sĩ / POS:     Username: pharmacist_hn01 | Email: pharmacist1@pharmacy.com';
PRINT N'3. Dược sĩ dự phòng:  Username: pharmacist1     | Email: pharmacist_alt@pharmacy.com';
PRINT N'4. Quản lý chi nhánh: Username: manager_hn01    | Email: manager1@pharmacy.com';
PRINT N'5. Nhân viên kho:     Username: warehouse01     | Email: warehouse1@pharmacy.com';
PRINT N'6. Quản lý kho tổng:  Username: wh_manager01    | Email: wh_manager1@pharmacy.com';
PRINT N'7. Nhân viên thu mua: Username: purchasing01    | Email: purchasing1@pharmacy.com';
PRINT N'8. Tổng giám đốc:     Username: gm01            | Email: gm@pharmacy.com';
PRINT N'9. Tài khoản bị khóa: Username: locked_user     | (status = 0, kiểm thử HTTP 403)';
PRINT N'=====================================================================';
GO

