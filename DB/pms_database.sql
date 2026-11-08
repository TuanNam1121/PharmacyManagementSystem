/* PMS seed data only. Requires the PMS schema to exist before execution. */
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET NOCOUNT ON;
GO

USE [PMS];
GO

-- Preserve the seed-data normalization from the original setup script.
UPDATE dbo.purchase_requests
SET status = 1, updated_at = SYSDATETIME()
WHERE status = 0;
GO

/* =========================================================================================
   PHẦN 1: CẤU HÌNH HỆ THỐNG & CHI NHÁNH / KHO TỔNG (STORES)
   ========================================================================================= */

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

IF OBJECT_ID('dbo.stores', 'U') IS NOT NULL
BEGIN
    -- Dọn dẹp ràng buộc dữ liệu liên quan đến HQ (nếu có) trước khi xóa
    IF EXISTS (SELECT 1 FROM dbo.stores WHERE code = 'HQ')
    BEGIN
        DECLARE @OldHqId BIGINT = (SELECT id FROM dbo.stores WHERE code = 'HQ');
        DECLARE @DefaultWhId BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'WH01');
        DECLARE @DefaultSt01Id BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'ST01');

        UPDATE dbo.accounts SET store_id = NULL WHERE store_id = @OldHqId;
        IF @DefaultSt01Id IS NOT NULL UPDATE dbo.goods_issues SET to_store_id = @DefaultSt01Id WHERE to_store_id = @OldHqId;
        IF @DefaultWhId IS NOT NULL UPDATE dbo.goods_issues SET from_store_id = @DefaultWhId WHERE from_store_id = @OldHqId;
        IF @DefaultWhId IS NOT NULL UPDATE dbo.purchase_requests SET store_id = @DefaultWhId WHERE store_id = @OldHqId;
        IF @DefaultSt01Id IS NOT NULL UPDATE dbo.stock_requisitions SET store_id = @DefaultSt01Id WHERE store_id = @OldHqId;
        DELETE FROM dbo.inventories WHERE store_id = @OldHqId;
        DELETE FROM dbo.stores WHERE id = @OldHqId;
    END

    MERGE INTO dbo.stores AS target
    USING (VALUES
        ('WH01', N'Kho Tổng Trung Tâm Miền Bắc', 2, N'Lô B2, KCN Đài Tư, 386 Nguyễn Văn Linh, Long Biên, Hà Nội', '02438759999', 1),
        ('ST01', N'Nhà Thuốc Chi Nhánh 01 - Cầu Giấy', 1, N'123 Đường Cầu Giấy, P. Dịch Vọng, Q. Cầu Giấy, Hà Nội', '02438332211', 1),
        ('ST02', N'Nhà Thuốc Chi Nhánh 02 - Đống Đa', 1, N'45 Phố Chùa Bộc, P. Quang Trung, Q. Đống Đa, Hà Nội', '02438523344', 1)
    ) AS source (code, name, type, address, phone, status)
    ON target.code = source.code
    WHEN MATCHED THEN
        UPDATE SET target.name = source.name, target.type = source.type, target.address = source.address, target.phone = source.phone, target.status = source.status
    WHEN NOT MATCHED THEN
        INSERT (code, name, type, address, phone, status, created_at) VALUES (source.code, source.name, source.type, source.address, source.phone, source.status, SYSDATETIME());
END;
GO

/* =========================================================================================
   PHẦN 2: VAI TRÒ (ROLES), QUYỀN HẠN (PERMISSIONS) & PHÂN QUYỀN
   ========================================================================================= */

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

MERGE INTO dbo.permissions AS target
USING (VALUES
    ('USER_VIEW',             'USER',             N'Xem danh sách người dùng'),
    ('USER_CREATE',           'USER',             N'Tạo người dùng mới'),
    ('USER_UPDATE',           'USER',             N'Cập nhật thông tin người dùng'),
    ('USER_LOCK',             'USER',             N'Khóa/mở khóa tài khoản'),
    ('USER_ASSIGN_ROLE',      'USER',             N'Phân vai trò cho người dùng'),
    ('AUDIT_VIEW',            'USER',             N'Xem nhật ký kiểm toán hệ thống'),
    ('PRODUCT_VIEW',          'PRODUCT',          N'Xem danh mục và thông tin sản phẩm'),
    ('PRODUCT_CREATE',        'PRODUCT',          N'Thêm sản phẩm mới vào danh mục'),
    ('PRODUCT_UPDATE',        'PRODUCT',          N'Chỉnh sửa thông tin sản phẩm'),
    ('PRICE_MANAGE',          'PRODUCT',          N'Thiết lập và điều chỉnh giá bán'),
    ('PRICE_HISTORY_VIEW',    'PRODUCT',          N'Xem lịch sử thay đổi giá bán'),
    ('CATEGORY_VIEW',         'CATEGORY',         N'Xem danh mục nhóm sản phẩm'),
    ('CATEGORY_CREATE',       'CATEGORY',         N'Tạo nhóm danh mục mới'),
    ('CATEGORY_UPDATE',       'CATEGORY',         N'Cập nhật nhóm danh mục'),
    ('CATEGORY_DELETE',       'CATEGORY',         N'Xóa nhóm danh mục'),
    ('SHIFT_OPEN',            'SHIFT',            N'Mở ca làm việc tại quầy POS'),
    ('SHIFT_CLOSE',           'SHIFT',            N'Đóng ca làm việc và kết toán tiền mặt'),
    ('INVOICE_CREATE',        'SALES',            N'Tạo hóa đơn bán lẻ thuốc tại quầy'),
    ('PAYMENT_PROCESS',       'SALES',            N'Thực hiện thanh toán đơn hàng'),
    ('INVOICE_CANCEL',        'SALES',            N'Hủy hóa đơn bán lẻ'),
    ('INVOICE_VIEW',          'SALES',            N'Xem lịch sử hóa đơn bán lẻ'),
    ('SALES_DAILY_VIEW',      'SALES',            N'Xem báo cáo doanh thu theo ngày'),
    ('SALES_RECONCILE',       'SALES',            N'Đối soát và điều chỉnh doanh thu ngày'),
    ('CUSTOMER_VIEW',         'CUSTOMER',         N'Xem danh sách khách hàng & tiền sử bệnh'),
    ('CUSTOMER_CREATE',       'CUSTOMER',         N'Tạo hồ sơ khách hàng mới'),
    ('CUSTOMER_UPDATE',       'CUSTOMER',         N'Cập nhật thông tin và tiền sử bệnh khách hàng'),
    ('CUSTOMER_DELETE',       'CUSTOMER',         N'Vô hiệu hóa hồ sơ khách hàng'),
    ('STORE_INVENTORY_VIEW',  'STORE_INVENTORY',  N'Xem tồn kho tại chi nhánh'),
    ('STORE_AUDIT_REVIEW',    'STORE_INVENTORY',  N'Duyệt kết quả kiểm kê chi nhánh'),
    ('REQUISITION_CREATE',    'STORE_INVENTORY',  N'Tạo phiếu yêu cầu điều chuyển hàng từ kho tổng'),
    ('REQUISITION_VIEW',      'STORE_INVENTORY',  N'Xem danh sách phiếu yêu cầu điều chuyển'),
    ('REQUISITION_UPDATE',    'STORE_INVENTORY',  N'Chỉnh sửa phiếu yêu cầu điều chuyển'),
    ('GOODS_RECEIPT_VIEW',    'STORE_INVENTORY',  N'Xem danh sách phiếu nhận hàng điều chuyển'),
    ('GOODS_RECEIPT_CONFIRM', 'STORE_INVENTORY',  N'Xác nhận nhập hàng vào kho chi nhánh'),
    ('WH_INVENTORY_VIEW',     'WAREHOUSE',        N'Xem tồn kho tổng theo lô FEFO & vị trí ô kệ'),
    ('WH_PURCHASE_HISTORY',   'WAREHOUSE',        N'Xem lịch sử nhập kho hàng hóa'),
    ('WH_ASSIGN_LOCATION',    'WAREHOUSE',        N'Gán và điều chỉnh vị trí ô kệ lưu trữ'),
    ('WH_ADJUSTMENT_CREATE',  'WAREHOUSE',        N'Tạo phiếu kiểm kê điều chỉnh kho'),
    ('WH_ADJUSTMENT_APPROVE', 'WAREHOUSE',        N'Duyệt / Từ chối phiếu điều chỉnh tồn kho'),
    ('WH_LOW_STOCK_ALERT',    'WAREHOUSE',        N'Xem cảnh báo thuốc sắp hết hàng'),
    ('WH_EXPIRY_ALERT',       'WAREHOUSE',        N'Xem cảnh báo thuốc cận hạn & hết hạn'),
    ('WH_PURCHASE_REQUEST',   'WAREHOUSE',        N'Quản lý yêu cầu mua hàng phục vụ kho'),
    ('WH_REPLENISHMENT_VIEW', 'WAREHOUSE',        N'Xem yêu cầu điều chuyển từ các cửa hàng'),
    ('WH_REPLENISHMENT_APPROVE','WAREHOUSE',      N'Duyệt yêu cầu điều chuyển hàng'),
    ('WH_REPLENISHMENT_REJECT','WAREHOUSE',       N'Từ chối yêu cầu điều chuyển hàng'),
    ('WH_DISPATCH_CONFIRM',   'WAREHOUSE',        N'Xác nhận xuất kho điều chuyển theo FEFO'),
    ('WH_RECEIPT_CREATE',     'WAREHOUSE',        N'Tạo phiếu nhập kho mua hàng từ NCC'),
    ('WH_RECEIPT_CONFIRM',    'WAREHOUSE',        N'Xác nhận nhập kho & tăng tồn kho theo lô'),
    ('PROC_REQUEST_VIEW',     'PROCUREMENT',      N'Xem danh sách yêu cầu mua hàng'),
    ('PROC_REQUEST_CREATE',   'PROCUREMENT',      N'Tạo mới yêu cầu mua hàng'),
    ('PROC_PROPOSAL_MANAGE',  'PROCUREMENT',      N'Tạo và theo dõi đề xuất mua hàng tổng hợp'),
    ('PROC_PROPOSAL_APPROVE', 'PROCUREMENT',      N'Duyệt đề xuất mua hàng và đơn đặt hàng PO'),
    ('PROC_RFQ_MANAGE',       'PROCUREMENT',      N'Gửi RFQ và tiếp nhận báo giá từ NCC'),
    ('REPORT_VIEW_ALL',       'REPORT',           N'Xem báo cáo tồn kho và báo cáo doanh thu lợi nhuận')
) AS source (code, module, description)
ON target.code = source.code
WHEN MATCHED THEN
    UPDATE SET target.module = source.module, target.description = source.description
WHEN NOT MATCHED THEN
    INSERT (code, module, description) VALUES (source.code, source.module, source.description);

-- Gán quyền cho các vai trò
DECLARE @RolePermMap TABLE (role_code VARCHAR(30), perm_code VARCHAR(40));

-- ADMIN: Toàn quyền
INSERT INTO @RolePermMap
SELECT 'ADMIN', code FROM dbo.permissions;

-- STORE_MANAGER:
INSERT INTO @RolePermMap VALUES
('STORE_MANAGER', 'USER_VIEW'),
('STORE_MANAGER', 'PRODUCT_VIEW'),
('STORE_MANAGER', 'PRICE_HISTORY_VIEW'),
('STORE_MANAGER', 'CATEGORY_VIEW'),
('STORE_MANAGER', 'SHIFT_OPEN'),
('STORE_MANAGER', 'SHIFT_CLOSE'),
('STORE_MANAGER', 'INVOICE_CREATE'),
('STORE_MANAGER', 'PAYMENT_PROCESS'),
('STORE_MANAGER', 'INVOICE_CANCEL'),
('STORE_MANAGER', 'INVOICE_VIEW'),
('STORE_MANAGER', 'SALES_DAILY_VIEW'),
('STORE_MANAGER', 'SALES_RECONCILE'),
('STORE_MANAGER', 'CUSTOMER_VIEW'),
('STORE_MANAGER', 'CUSTOMER_CREATE'),
('STORE_MANAGER', 'CUSTOMER_UPDATE'),
('STORE_MANAGER', 'STORE_INVENTORY_VIEW'),
('STORE_MANAGER', 'STORE_AUDIT_REVIEW'),
('STORE_MANAGER', 'REQUISITION_CREATE'),
('STORE_MANAGER', 'REQUISITION_VIEW'),
('STORE_MANAGER', 'REQUISITION_UPDATE'),
('STORE_MANAGER', 'GOODS_RECEIPT_VIEW'),
('STORE_MANAGER', 'GOODS_RECEIPT_CONFIRM'),
('STORE_MANAGER', 'REPORT_VIEW_ALL');

-- PHARMACIST:
INSERT INTO @RolePermMap VALUES
('PHARMACIST', 'PRODUCT_VIEW'),
('PHARMACIST', 'CATEGORY_VIEW'),
('PHARMACIST', 'SHIFT_OPEN'),
('PHARMACIST', 'SHIFT_CLOSE'),
('PHARMACIST', 'INVOICE_CREATE'),
('PHARMACIST', 'PAYMENT_PROCESS'),
('PHARMACIST', 'INVOICE_VIEW'),
('PHARMACIST', 'CUSTOMER_VIEW'),
('PHARMACIST', 'CUSTOMER_CREATE'),
('PHARMACIST', 'CUSTOMER_UPDATE'),
('PHARMACIST', 'STORE_INVENTORY_VIEW');

-- WAREHOUSE_MANAGER & WAREHOUSE_STAFF:
INSERT INTO @RolePermMap VALUES
('WAREHOUSE_MANAGER', 'PRODUCT_VIEW'),
('WAREHOUSE_MANAGER', 'CATEGORY_VIEW'),
('WAREHOUSE_MANAGER', 'WH_INVENTORY_VIEW'),
('WAREHOUSE_MANAGER', 'WH_PURCHASE_HISTORY'),
('WAREHOUSE_MANAGER', 'WH_ASSIGN_LOCATION'),
('WAREHOUSE_MANAGER', 'WH_ADJUSTMENT_CREATE'),
('WAREHOUSE_MANAGER', 'WH_ADJUSTMENT_APPROVE'),
('WAREHOUSE_MANAGER', 'WH_LOW_STOCK_ALERT'),
('WAREHOUSE_MANAGER', 'WH_EXPIRY_ALERT'),
('WAREHOUSE_MANAGER', 'WH_PURCHASE_REQUEST'),
('WAREHOUSE_MANAGER', 'WH_REPLENISHMENT_VIEW'),
('WAREHOUSE_MANAGER', 'WH_REPLENISHMENT_APPROVE'),
('WAREHOUSE_MANAGER', 'WH_REPLENISHMENT_REJECT'),
('WAREHOUSE_MANAGER', 'WH_DISPATCH_CONFIRM'),
('WAREHOUSE_MANAGER', 'WH_RECEIPT_CREATE'),
('WAREHOUSE_MANAGER', 'WH_RECEIPT_CONFIRM'),
('WAREHOUSE_MANAGER', 'REPORT_VIEW_ALL'),

('WAREHOUSE_STAFF', 'PRODUCT_VIEW'),
('WAREHOUSE_STAFF', 'WH_INVENTORY_VIEW'),
('WAREHOUSE_STAFF', 'WH_ASSIGN_LOCATION'),
('WAREHOUSE_STAFF', 'WH_ADJUSTMENT_CREATE'),
('WAREHOUSE_STAFF', 'WH_DISPATCH_CONFIRM'),
('WAREHOUSE_STAFF', 'WH_RECEIPT_CREATE');

-- PURCHASING_STAFF:
INSERT INTO @RolePermMap VALUES
('PURCHASING_STAFF', 'PRODUCT_VIEW'),
('PURCHASING_STAFF', 'PRICE_MANAGE'),
('PURCHASING_STAFF', 'PROC_REQUEST_VIEW'),
('PURCHASING_STAFF', 'PROC_REQUEST_CREATE'),
('PURCHASING_STAFF', 'PROC_PROPOSAL_MANAGE'),
('PURCHASING_STAFF', 'PROC_RFQ_MANAGE');

-- GENERAL_MANAGER:
INSERT INTO @RolePermMap VALUES
('GENERAL_MANAGER', 'PRODUCT_VIEW'),
('GENERAL_MANAGER', 'PRICE_MANAGE'),
('GENERAL_MANAGER', 'PROC_PROPOSAL_APPROVE'),
('GENERAL_MANAGER', 'REPORT_VIEW_ALL');

-- Insert phân quyền vào bảng role_permissions
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

/* =========================================================================================
   PHẦN 3: TÀI KHOẢN NGƯỜI DÙNG (ACCOUNTS) & HỒ SƠ NHÂN VIÊN
   Mật khẩu chung cho tất cả tài khoản kiểm thử: Password@123
   BCrypt: $2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W
   ========================================================================================= */

DECLARE @AdminRoleId       INT = (SELECT id FROM dbo.roles WHERE code = 'ADMIN');
DECLARE @StoreManagerRoleId INT = (SELECT id FROM dbo.roles WHERE code = 'STORE_MANAGER');
DECLARE @PharmacistRoleId   INT = (SELECT id FROM dbo.roles WHERE code = 'PHARMACIST');
DECLARE @WarehouseMgrRoleId INT = (SELECT id FROM dbo.roles WHERE code = 'WAREHOUSE_MANAGER');
DECLARE @WarehouseStaffRoleId INT = (SELECT id FROM dbo.roles WHERE code = 'WAREHOUSE_STAFF');
DECLARE @PurchasingRoleId   INT = (SELECT id FROM dbo.roles WHERE code = 'PURCHASING_STAFF');
DECLARE @GmRoleId           INT = (SELECT id FROM dbo.roles WHERE code = 'GENERAL_MANAGER');

DECLARE @WhId   BIGINT = (SELECT id FROM dbo.stores WHERE code = 'WH01');
DECLARE @St01Id BIGINT = (SELECT id FROM dbo.stores WHERE code = 'ST01');

DECLARE @AccountData TABLE (
DECLARE @AccountData TABLE (
    username VARCHAR(50),
    email VARCHAR(150),
    phone VARCHAR(20),
    role_id INT,
    store_id BIGINT,
    status TINYINT,
    full_name NVARCHAR(150),
    dob DATE,
    gender TINYINT,
    address NVARCHAR(250),
    avatar_url VARCHAR(500)
);

INSERT INTO @AccountData VALUES
('admin', 'admin@pharmacy.com', '0901234567', @AdminRoleId, NULL, 1, N'Quản Trị Viên Hệ Thống', '1988-05-15', 1, N'Tầng 10, Tòa nhà FPT, Duy Tân, Cầu Giấy, Hà Nội', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
('pharmacist_hn01', 'pharmacist1@pharmacy.com', '0912345678', @PharmacistRoleId, @St01Id, 1, N'Nguyễn Văn Dược', '1995-10-20', 1, N'Số 45 Ngõ 165 Cầu Giấy, P. Dịch Vọng, Hà Nội', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150'),
('pharmacist1', 'pharmacist_alt@pharmacy.com', '0912999888', @PharmacistRoleId, @St01Id, 1, N'Đỗ Minh Ngọc', '1998-03-12', 0, N'Số 12 Chùa Láng, Láng Thượng, Đống Đa, Hà Nội', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
('manager_hn01', 'manager1@pharmacy.com', '0922345678', @StoreManagerRoleId, @St01Id, 1, N'Trần Thị Hương', '1990-08-25', 0, N'Tòa Landmark 72, Mễ Trì, Nam Từ Liêm, Hà Nội', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
('warehouse01', 'warehouse1@pharmacy.com', '0932345678', @WarehouseStaffRoleId, @WhId, 1, N'Lê Văn Kho', '1993-12-05', 1, N'Số 88 Sài Đồng, Long Biên, Hà Nội', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('wh_manager01', 'wh_manager1@pharmacy.com', '0942345678', @WarehouseMgrRoleId, @WhId, 1, N'Phạm Đình Quân', '1987-04-18', 1, N'Số 22 Phúc Lợi, Long Biên, Hà Nội', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
('purchasing01', 'purchasing1@pharmacy.com', '0952345678', @PurchasingRoleId, NULL, 1, N'Vũ Hoàng Nam', '1992-07-22', 1, N'Số 18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'),
('gm01', 'gm@pharmacy.com', '0962345678', @GmRoleId, NULL, 1, N'Bùi Quang Huy', '1980-01-10', 1, N'Khu đô thị Ciputra, Tây Hồ, Hà Nội', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'),
('locked_user', 'locked@pharmacy.com', '0972345678', @PharmacistRoleId, @St01Id, 2, N'Tài Khoản Đã Bị Khóa', '1999-01-01', 1, N'Hà Nội', NULL),
('inactive_user', 'inactive@pharmacy.com', '0982345678', @PharmacistRoleId, @St01Id, 0, N'Tài Khoản Vô Hiệu Hóa', '1999-02-02', 0, N'Hà Nội', NULL);

MERGE INTO dbo.accounts AS target
USING @AccountData AS source
ON target.username = source.username
WHEN MATCHED THEN
    UPDATE SET 
        target.email = source.email,
        target.phone = source.phone,
        target.role_id = source.role_id,
        target.store_id = source.store_id,
        target.status = source.status,
        target.password = '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W',
        target.failed_login_count = 0
WHEN NOT MATCHED THEN
    INSERT (username, email, phone, role_id, store_id, status, [password], failed_login_count, created_at)
    VALUES (source.username, source.email, source.phone, source.role_id, source.store_id, source.status,
            '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', 0, SYSDATETIME());

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

/* =========================================================================================
   PHẦN 4: NHÀ CUNG CẤP & VỊ TRÍ Ô KỆ KHO TỔNG (LOCATIONS)
   ========================================================================================= */

MERGE INTO dbo.suppliers AS target
USING (VALUES
    ('SUP-DHG',      N'Công ty Cổ phần Dược Hậu Giang (DHG Pharma)', N'Nguyễn Văn Hùng', '02923891433', 'dhgpharma@dhgpharma.com.vn', N'288 Bis Nguyễn Văn Cừ, P. An Hòa, Q. Ninh Kiều, Cần Thơ', '1800156801', 1, N'Nhà sản xuất dược phẩm đạt chuẩn GMP-Japan/WHO hàng đầu VN'),
    ('SUP-TRAPHACO', N'Công ty Cổ phần Traphaco',                   N'Trần Thị Mai',    '02437341797', 'info@traphaco.com.vn',       N'Số 75 Phố Yên Ninh, Ba Đình, Hà Nội',                      '0100108656', 1, N'Thương hiệu thuốc đông dược, thuốc thảo dược và ho bổ phế số 1 VN'),
    ('SUP-IMEX',     N'Công ty Cổ phần Dược phẩm Imexpharm',        N'Lê Minh Tuấn',    '02773851941', 'imexpharm@imexpharm.com',    N'Số 4 Đường 30/4, P. 1, TP. Cao Lãnh, Đồng Tháp',           '1400384433', 1, N'Chuyên sản xuất kháng sinh cao cấp đạt tiêu chuẩn EU-GMP'),
    ('SUP-HATAP',    N'Công ty Cổ phần Dược phẩm Hà Tây (Hataphar)',N'Phạm Quang Thắng', '02433522203', 'hataphar@hn.vnn.vn',        N'Số 10A Phố Quang Trung, Hà Đông, Hà Nội',                  '0500105312', 1, N'Nhà sản xuất các loại thuốc thiết yếu, hạ sốt giảm đau phổ biến'),
    ('SUP-SANOFI',   N'Công ty TNHH Sanofi-Aventis Việt Nam',       N'Vũ Bích Ngọc',    '02838298526', 'contact-vn@sanofi.com',      N'Lô I-8-1, Đường D8, Khu Công Nghệ Cao, Q. 9, TP.HCM',      '0300823528', 1, N'Tập đoàn dược phẩm đa quốc gia hàng đầu về tiêu hóa và tim mạch'),
    ('SUP-GSK',      N'GlaxoSmithKline (GSK) Việt Nam',             N'David Harrison',  '02839102860', 'vietnam.contact@gsk.com',    N'Tầng 16, Tòa nhà Metropolitan, 235 Đồng Khởi, Q. 1, TP.HCM', '0303867123', 1, N'Hãng dược phẩm phát minh hàng đầu thế giới (Panadol, Augmentin)'),
    ('SUP-ASTRA',    N'AstraZeneca Việt Nam',                       N'Trần Anh Thư',    '02838221666', 'astrazeneca@astra.com.vn',    N'Tòa nhà Deutsches Haus, 33 Lê Duẩn, Q. 1, TP.HCM',         '0302243209', 1, N'Hãng dược phẩm phát minh sinh phẩm y tế & tim mạch')
) AS source (code, name, contact_person, phone, email, address, tax_code, status, note)
ON target.code = source.code
WHEN MATCHED THEN
    UPDATE SET target.name = source.name, target.contact_person = source.contact_person, target.phone = source.phone, target.email = source.email, target.address = source.address, target.tax_code = source.tax_code, target.status = source.status, target.note = source.note
WHEN NOT MATCHED THEN
    INSERT (code, name, contact_person, phone, email, address, tax_code, status, note, created_at)
    VALUES (source.code, source.name, source.contact_person, source.phone, source.email, source.address, source.tax_code, source.status, source.note, SYSDATETIME());

-- Nạp vị trí ô kệ kho tổng WH01
DECLARE @Wh01Id BIGINT = (SELECT id FROM dbo.stores WHERE code = 'WH01');
IF @Wh01Id IS NOT NULL AND OBJECT_ID('dbo.warehouse_locations', 'U') IS NOT NULL
BEGIN
    MERGE INTO dbo.warehouse_locations AS target
    USING (VALUES
        ('LOC-A1-S1-B1', 'A1', 'S1', 'B1', @Wh01Id, 1),
        ('LOC-A1-S1-B2', 'A1', 'S1', 'B2', @Wh01Id, 1),
        ('LOC-A1-S2-B1', 'A1', 'S2', 'B1', @Wh01Id, 1),
        ('LOC-A2-S1-B1', 'A2', 'S1', 'B1', @Wh01Id, 1),
        ('LOC-A2-S1-B2', 'A2', 'S1', 'B2', @Wh01Id, 1),
        ('LOC-COOL-01',  'COOL', 'C1', '01', @Wh01Id, 1),
        ('LOC-COOL-02',  'COOL', 'C1', '02', @Wh01Id, 1)
    ) AS source (code, aisle, shelf, bin, store_id, status)
    ON target.code = source.code AND target.store_id = source.store_id
    WHEN MATCHED THEN
        UPDATE SET target.aisle = source.aisle, target.shelf = source.shelf, target.bin = source.bin, target.status = source.status
    WHEN NOT MATCHED THEN
        INSERT (code, aisle, shelf, bin, store_id, status) VALUES (source.code, source.aisle, source.shelf, source.bin, source.store_id, source.status);
END;
GO

/* =========================================================================================
   PHẦN 5: DANH MỤC NHÓM THUỐC (CATEGORIES) & SẢN PHẨM (PRODUCTS & PRICE HISTORIES)
   ========================================================================================= */

DECLARE @AdminId BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'admin');

DECLARE @CategoryData TABLE (name NVARCHAR(150), description NVARCHAR(500));
INSERT INTO @CategoryData VALUES
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', N'Các loại thuốc giảm đau thông thường (Paracetamol), kháng viêm không steroid (NSAIDs) và hạ sốt cho người lớn & trẻ em'),
(N'Thuốc Kháng Sinh & Kháng Khuẩn', N'Các nhóm kháng sinh kê đơn (Rx) như Penicillin, Cephalosporin, Macrolide, Quinolone điều trị nhiễm khuẩn'),
(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', N'Thuốc điều trị loét dạ dày (PPI), trung hòa acid, men tiêu hóa, men vi sinh và thuốc tiêu chảy'),
(N'Thuốc Tim Mạch & Huyết Áp', N'Thuốc kê đơn điều trị tăng huyết áp, hạ mỡ máu và trợ tim'),
(N'Thuốc Hô Hấp, Ho & Cảm Cúm', N'Siro ho, viên ngậm thảo dược bổ phế, long đờm và chế phẩm đặc trị cảm cúm'),
(N'Thuốc Dị Ứng & Kháng Histamin', N'Các thuốc kháng histamin thế hệ mới điều trị viêm mũi dị ứng, mày đay, mẩn ngứa'),
(N'Thuốc Da Liễu & Trị Mụn', N'Các loại kem bôi ngoài da, thuốc mỡ kháng khuẩn, kem trị mụn và nấm da'),
(N'Thuốc Nhãn Khoa & Tai Mũi Họng', N'Thuốc nhỏ mắt, nước mắt nhân tạo, dung dịch xịt mũi co mạch'),
(N'Vitamin, Khoáng Chất & Dinh Dưỡng', N'Viên sủi tăng đề kháng, canxi, vitamin tổng hợp, kẽm và khoáng chất thiết yếu'),
(N'Thực Phẩm Bảo Vệ Sức Khỏe & TPCN', N'Dầu cá Omega-3, viên bổ xương khớp Glucosamine và thực phẩm chức năng hỗ trợ sức khỏe'),
(N'Dụng Cụ Y Tế & Chăm Sóc Vết Thương', N'Băng dán y tế, cồn sát khuẩn, nước muối sinh lý, nhiệt kế điện tử, khẩu trang y tế');

MERGE INTO dbo.categories AS target
USING @CategoryData AS source
ON target.name = source.name
WHEN MATCHED THEN
    UPDATE SET target.description = source.description
WHEN NOT MATCHED THEN
    INSERT (name, description, status, created_by, created_at)
    VALUES (source.name, source.description, 1, @AdminId, SYSDATETIME());

-- Dọn dẹp danh mục rác / trùng lặp lỗi font không có sản phẩm nào tham chiếu
DELETE FROM dbo.categories WHERE id >= 17 AND id NOT IN (SELECT DISTINCT category_id FROM dbo.products WHERE category_id IS NOT NULL);

-- Nạp 30+ sản phẩm y tế
DECLARE @ProductData TABLE (
    category_name NVARCHAR(150),
    barcode VARCHAR(50),
    name NVARCHAR(200),
    unit NVARCHAR(30),
    active_ingredient NVARCHAR(250),
    manufacturer NVARCHAR(150),
    is_prescription BIT,
    cost_price DECIMAL(18,2),
    selling_price DECIMAL(18,2),
    min_quantity INT,
    description NVARCHAR(500)
);

INSERT INTO @ProductData VALUES
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', '8934567890123', N'Panadol Extra Đỏ (Hộp 15 vỉ x 12 viên)', N'Hộp', N'Paracetamol 500mg, Caffeine 65mg', N'GSK Consumer Healthcare', 0, 165000.00, 195000.00, 40, N'Thuốc giảm đau nhanh cho các cơn đau đầu, đau răng, hạ sốt hiệu quả.'),
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', '8934567890124', N'Paracetamol 500mg Hataphar (Hộp 10 vỉ x 10 viên)', N'Hộp', N'Paracetamol 500mg', N'Dược phẩm Hà Tây (Hataphar)', 0, 45000.00, 60000.00, 50, N'Thuốc hạ sốt, giảm đau thông thường không gây kích ứng dạ dày.'),
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', '8934567890133', N'Efferalgan 500mg (Hộp 4 vỉ x 4 viên sủi)', N'Hộp', N'Paracetamol 500mg', N'UPSA SAS (Pháp)', 0, 60000.00, 78000.00, 30, N'Viên sủi tác dụng giảm đau hạ sốt nhanh, hòa tan hoàn toàn trong nước.'),
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', '8934567890134', N'Mobic 7.5mg (Hộp 2 vỉ x 10 viên)', N'Hộp', N'Meloxicam 7.5mg', N'Boehringer Ingelheim', 1, 155000.00, 185000.00, 20, N'Thuốc kháng viêm không steroid (NSAID) kê đơn dùng cho viêm khớp mạn tính.'),
(N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', '8934567890135', N'Hapacol 250 Trẻ Em Vị Cam (Hộp 24 gói)', N'Hộp', N'Paracetamol 250mg', N'DHG Pharma', 0, 42000.00, 55000.00, 35, N'Bột sủi hương cam dịu ngọt hạ sốt cho trẻ từ 2 đến 6 tuổi.'),

(N'Thuốc Kháng Sinh & Kháng Khuẩn', '8934567890125', N'Augmentin 1g (Hộp 14 viên)', N'Hộp', N'Amoxicillin 875mg, Acid Clavulanic 125mg', N'GlaxoSmithKline (GSK)', 1, 215000.00, 260000.00, 30, N'Kháng sinh phổ rộng điều trị nhiễm khuẩn đường hô hấp, nhiễm khuẩn da.'),
(N'Thuốc Kháng Sinh & Kháng Khuẩn', '8934567890126', N'Amoxicillin 500mg DHG (Hộp 10 vỉ x 10 viên)', N'Hộp', N'Amoxicillin trihydrate 500mg', N'DHG Pharma', 1, 65000.00, 85000.00, 40, N'Kháng sinh nhóm penicillin điều trị nhiễm trùng do vi khuẩn nhạy cảm.'),
(N'Thuốc Kháng Sinh & Kháng Khuẩn', '8934567890136', N'Cefixim 200mg DHG (Hộp 2 vỉ x 10 viên)', N'Hộp', N'Cefixim 200mg', N'DHG Pharma', 1, 72000.00, 95000.00, 25, N'Kháng sinh Cephalosporin thế hệ 3 điều trị viêm phế quản, viêm tai giữa.'),
(N'Thuốc Kháng Sinh & Kháng Khuẩn', '8934567890137', N'Zithromax 500mg (Hộp 1 vỉ x 3 viên)', N'Hộp', N'Azithromycin dihydrate 500mg', N'Pfizer (Mỹ)', 1, 135000.00, 165000.00, 20, N'Kháng sinh nhóm Macrolide liều ngắn ngày cho nhiễm trùng hô hấp.'),
(N'Thuốc Kháng Sinh & Kháng Khuẩn', '8934567890138', N'Ciprofloxacin 500mg Vidipha (Hộp 10 vỉ x 10 viên)', N'Hộp', N'Ciprofloxacin 500mg', N'Vidipha', 1, 85000.00, 110000.00, 25, N'Kháng sinh Quinolone điều trị nhiễm khuẩn đường tiết niệu, đường tiêu hóa.'),

(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', '8934567890127', N'Nexium Mups 40mg (Hộp 14 viên)', N'Hộp', N'Esomeprazole magnesium trihydrate 40mg', N'AstraZeneca', 1, 295000.00, 350000.00, 25, N'Thuốc ức chế bơm proton (PPI) điều trị trào ngược dạ dày thực quản (GERD).'),
(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', '8934567890128', N'Hỗn dịch uống Gaviscon Dual Action (Hộp 24 gói x 10ml)', N'Hộp', N'Natri alginate, Natri bicarbonat, Calci carbonat', N'Reckitt Benckiser', 0, 110000.00, 135000.00, 40, N'Lớp gel bảo vệ thực quản ngăn ngừa trào ngược acid và chứng ợ chua nóng rát.'),
(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', '8934567890139', N'Phosphalugel Thuốc Dạ Dày Chữ P (Hộp 26 gói x 20g)', N'Hộp', N'Nhôm phosphat gel 20%', N'Sanofi Aventis', 0, 98000.00, 120000.00, 50, N'Hỗn dịch kháng acid làm dịu nhanh cơn đau do viêm dạ dày cấp và mãn tính.'),
(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', '8934567890140', N'Smecta 3g Vị Vani (Hộp 30 gói)', N'Hộp', N'Diosmectite 3g', N'Ipsen Pharma', 0, 120000.00, 145000.00, 40, N'Bột pha uống bảo vệ niêm mạc ruột và điều trị tiêu chảy cấp & mạn tính.'),
(N'Thuốc Tiêu Hóa, Dạ Dày & Gan Mật', '8934567890141', N'Men vi sinh Enterogermina 2 tỷ bào tử (Hộp 20 ống x 5ml)', N'Hộp', N'Bacillus clausii 2 tỷ bào tử', N'Sanofi Aventis', 0, 145000.00, 175000.00, 45, N'Bào tử men vi sinh phục hồi hệ vi sinh đường ruột do dùng kháng sinh dài ngày.'),

(N'Thuốc Tim Mạch & Huyết Áp', '8934567890129', N'Amlodipine 5mg Stada (Hộp 3 vỉ x 10 viên)', N'Hộp', N'Amlodipine besylate 5mg', N'Stada', 1, 22000.00, 30000.00, 30, N'Thuốc chẹn kênh canxi điều trị tăng huyết áp và đau thắt ngực ổn định.'),
(N'Thuốc Tim Mạch & Huyết Áp', '8934567890142', N'Concor 5mg (Hộp 5 vỉ x 10 viên)', N'Hộp', N'Bisoprolol fumarate 5mg', N'Merck Healthcare', 1, 180000.00, 225000.00, 20, N'Thuốc chẹn thụ thể beta chọn lọc điều trị tăng huyết áp và suy tim mạn tính.'),
(N'Thuốc Tim Mạch & Huyết Áp', '8934567890143', N'Micardis 40mg (Hộp 3 vỉ x 10 viên)', N'Hộp', N'Telmisartan 40mg', N'Boehringer Ingelheim', 1, 230000.00, 280000.00, 20, N'Thuốc đối kháng thụ thể angiotensin II hạ huyết áp và phòng ngừa biến cố tim mạch.'),
(N'Thuốc Tim Mạch & Huyết Áp', '8934567890144', N'Lipitor 20mg (Hộp 3 vỉ x 10 viên)', N'Hộp', N'Atorvastatin calcium 20mg', N'Pfizer', 1, 410000.00, 495000.00, 15, N'Thuốc điều hòa lipid máu nhóm statin hạ cholesterol máu và triglyceride.'),

(N'Thuốc Hô Hấp, Ho & Cảm Cúm', '8934567890145', N'Siro Ho Prospan Chai 100ml', N'Chai', N'Cao khô lá thường xuân', N'Engelhard Arzneimittel (Đức)', 0, 95000.00, 125000.00, 35, N'Siro thảo dược trị ho phế quản, viêm đường hô hấp cấp, dùng an toàn cho trẻ sơ sinh.'),
(N'Thuốc Hô Hấp, Ho & Cảm Cúm', '8934567890146', N'Viên ngậm ho Bảo Thanh (Hộp 20 vỉ x 5 viên)', N'Hộp', N'Ô mai, Mật ong, Tỳ bà diệp, Xuyên bối mẫu', N'Dược phẩm Hoa Linh', 0, 110000.00, 140000.00, 40, N'Viên ngậm bổ phế, nhuận phế, giảm ngứa rát cổ họng do ho khan, ho gió.'),
(N'Thuốc Hô Hấp, Ho & Cảm Cúm', '8934567890147', N'Decolgen Cảm Cúm (Hộp 25 vỉ x 4 viên)', N'Hộp', N'Paracetamol, Phenylephrine, Chlorpheniramine', N'United Pharma', 0, 90000.00, 115000.00, 30, N'Thuốc điều trị triệu chứng cảm cúm, nhức đầu, sốt, nghẹt mũi và hắt hơi.'),

(N'Thuốc Dị Ứng & Kháng Histamin', '8934567890131', N'Telfast HD 180mg (Hộp 1 vỉ x 10 viên)', N'Hộp', N'Fexofenadine HCl 180mg', N'Sanofi Aventis', 0, 72000.00, 90000.00, 30, N'Kháng histamin thế hệ 2 không gây buồn ngủ, trị viêm mũi dị ứng và mề đay.'),
(N'Thuốc Dị Ứng & Kháng Histamin', '8934567890149', N'Cetirizin 10mg Stada (Hộp 5 vỉ x 10 viên)', N'Hộp', N'Cetirizin dihydroclorid 10mg', N'Stada', 0, 40000.00, 55000.00, 30, N'Thuốc chống dị ứng điều trị các chứng viêm kết mạc dị ứng, ngứa da do phát ban.'),

(N'Vitamin, Khoáng Chất & Dinh Dưỡng', '8934567890130', N'Viên sủi Berocca Performance Vị Xoài (Tuýp 10 viên)', N'Tuýp', N'Vitamin nhóm B tổng hợp, Vitamin C, Kẽm, Magiê', N'Bayer Pharma', 0, 75000.00, 95000.00, 30, N'Viên sủi bổ sung năng lượng, hỗ trợ tỉnh táo tập trung và tăng cường sức đề kháng.'),
(N'Thực Phẩm Bảo Vệ Sức Khỏe & TPCN', '8934567890132', N'Viên uống Dầu cá Omega 3 Fish Oil (Chai 100 viên)', N'Chai', N'EPA 180mg, DHA 120mg, Dầu cá tinh khiết', N'Blackmores (Úc)', 0, 380000.00, 480000.00, 25, N'Cung cấp acid béo Omega 3 tự nhiên hỗ trợ sức khỏe tim mạch, não bộ và thị lực.'),
(N'Dụng Cụ Y Tế & Chăm Sóc Vết Thương', '8934567890156', N'Nước muối sinh lý Natri Clorid 0.9% (Chai 500ml)', N'Chai', N'Natri clorid 0.9% đẳng trương', N'Dược phẩm Pharmedic', 0, 5000.00, 8000.00, 100, N'Dung dịch rửa vết thương, súc miệng vệ sinh họng và rửa mũi an toàn.'),
(N'Dụng Cụ Y Tế & Chăm Sóc Vết Thương', '8934567890157', N'Băng dán y tế cá nhân Urgo Waterproof (Hộp 20 miếng)', N'Hộp', N'Màng PU chống nước vô trùng', N'Urgo Healthcare', 0, 28000.00, 38000.00, 50, N'Băng dán cá nhân thoáng khí chống nước bảo vệ vết thương khỏi vi khuẩn và bụi bẩn.');

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
        target.description = source.description
WHEN NOT MATCHED THEN
    INSERT (category_id, barcode, name, unit, active_ingredient, manufacturer, is_prescription, cost_price, selling_price, min_quantity, status, description, created_at)
    VALUES (source.category_id, source.barcode, source.name, source.unit, source.active_ingredient, source.manufacturer, source.is_prescription, source.cost_price, source.selling_price, source.min_quantity, 1, source.description, SYSDATETIME());

-- Nạp lịch sử giá niêm yết ban đầu
INSERT INTO dbo.price_histories (product_id, account_id, cost_price, selling_price, effective_from, reason, created_at)
SELECT p.id, @AdminId, p.cost_price, p.selling_price, SYSDATETIME(), N'Thiết lập giá niêm yết ban đầu khi khởi tạo sản phẩm', SYSDATETIME()
FROM dbo.products p
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.price_histories ph WHERE ph.product_id = p.id
);
GO

/* =========================================================================================
   PHẦN 6: LÔ THUỐC FEFO & TỒN KHO THỰC TẾ (INVENTORIES)
   ========================================================================================= */

DECLARE @defaultSupplierId BIGINT = (SELECT TOP 1 id FROM dbo.suppliers ORDER BY id);

-- 7.1 Lô chuẩn cho tất cả sản phẩm (HSD 2028)
INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
SELECT 
    p.id,
    'LOT-' + RIGHT('000' + CAST(p.id AS VARCHAR(10)), 3) + '-2026',
    CAST('2026-01-15' AS DATE),
    CAST('2028-12-31' AS DATE),
    ISNULL((SELECT TOP 1 id FROM dbo.suppliers WHERE id = (p.id % 5 + 1)), @defaultSupplierId),
    SYSDATETIME()
FROM dbo.products p
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.product_batches pb WHERE pb.product_id = p.id AND pb.batch_number = ('LOT-' + RIGHT('000' + CAST(p.id AS VARCHAR(10)), 3) + '-2026')
);

-- 7.2 Lô CẬN HẠN (Expiring Soon - còn 45 ngày nữa hết hạn) để kiểm thử cảnh báo kho tổng & FEFO
DECLARE @PAugmentin BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890125');
DECLARE @PPanadol   BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890123');
DECLARE @PParacet   BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890124');

IF @PAugmentin IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.product_batches WHERE batch_number = 'LOT-EXP-AUG-01')
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    VALUES (@PAugmentin, 'LOT-EXP-AUG-01', DATEADD(MONTH, -20, CAST(SYSDATETIME() AS DATE)), DATEADD(DAY, 45, CAST(SYSDATETIME() AS DATE)), @defaultSupplierId, SYSDATETIME());

IF @PPanadol IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.product_batches WHERE batch_number = 'LOT-EXP-PANA-01')
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    VALUES (@PPanadol, 'LOT-EXP-PANA-01', DATEADD(MONTH, -22, CAST(SYSDATETIME() AS DATE)), DATEADD(DAY, 60, CAST(SYSDATETIME() AS DATE)), @defaultSupplierId, SYSDATETIME());

-- 7.3 Lô ĐÃ HẾT HẠN (Expired - hết hạn 10 ngày trước) để kiểm thử chặn FEFO và cảnh báo nguy cấp
IF @PParacet IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.product_batches WHERE batch_number = 'LOT-EXPIRED-PARA-01')
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    VALUES (@PParacet, 'LOT-EXPIRED-PARA-01', DATEADD(YEAR, -3, CAST(SYSDATETIME() AS DATE)), DATEADD(DAY, -10, CAST(SYSDATETIME() AS DATE)), @defaultSupplierId, SYSDATETIME());

-- 7.4 Phân bổ tồn kho cho Kho tổng WH01 và các chi nhánh
INSERT INTO dbo.inventories (store_id, product_id, batch_id, location_id, quantity, version, updated_at)
SELECT 
    s.id AS store_id,
    p.id AS product_id,
    b.id AS batch_id,
    (SELECT TOP 1 loc.id FROM dbo.warehouse_locations loc WHERE loc.store_id = s.id),
    CASE 
        WHEN s.type = 2 THEN 1000  -- Kho tổng 1,000 hộp
        ELSE 250                   -- Chi nhánh / Quầy POS 250 hộp
    END AS quantity,
    0 AS version,
    SYSDATETIME() AS updated_at
FROM dbo.stores s
CROSS JOIN dbo.products p
JOIN dbo.product_batches b ON b.product_id = p.id
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.inventories inv 
    WHERE inv.store_id = s.id AND inv.product_id = p.id AND inv.batch_id = b.id
);
GO

/* =========================================================================================
   PHẦN 7: KHÁCH HÀNG & HỒ SƠ DỊ ỨNG (CUSTOMERS & HEALTH PROFILES)
   ========================================================================================= */

DECLARE @AdminId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'admin');
IF @AdminId IS NULL SET @AdminId = 1;

-- KH 1: Nguyễn Văn An - Tiền sử dị ứng Paracetamol
DECLARE @Cus1Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.customers WHERE phone = '0912345678')
BEGIN
    INSERT INTO dbo.customers (full_name, phone, email, date_of_birth, gender, address, status, created_by, created_at)
    VALUES (N'Nguyễn Văn An', '0912345678', 'an.nguyen@gmail.com', '1988-04-12', 1, N'Số 15 Ngõ 68 Cầu Giấy, Hà Nội', 1, @AdminId, SYSDATETIME());
    SET @Cus1Id = SCOPE_IDENTITY();
END
ELSE
    SET @Cus1Id = (SELECT id FROM dbo.customers WHERE phone = '0912345678');

IF NOT EXISTS (SELECT 1 FROM dbo.customer_health_profiles WHERE customer_id = @Cus1Id)
    INSERT INTO dbo.customer_health_profiles (customer_id, height_cm, weight_kg, allergies, medical_conditions, current_medications, note, updated_at)
    VALUES (@Cus1Id, 172.0, 68.5, N'Paracetamol, Aspirin', N'Tăng huyết áp vô căn, Viêm loét dạ dày', N'Amlodipine 5mg', N'Khách có tiền sử sốc dị ứng nhẹ với Paracetamol', SYSDATETIME());

-- KH 2: Trần Thị Bích - Mang thai tuần 24, dị ứng Amoxicillin
DECLARE @Cus2Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.customers WHERE phone = '0987654321')
BEGIN
    INSERT INTO dbo.customers (full_name, phone, email, date_of_birth, gender, address, status, created_by, created_at)
    VALUES (N'Trần Thị Bích', '0987654321', 'bich.tran@gmail.com', '1995-09-20', 2, N'Tòa CT2 Chung cư FPT, Duy Tân, Cầu Giấy, Hà Nội', 1, @AdminId, SYSDATETIME());
    SET @Cus2Id = SCOPE_IDENTITY();
END
ELSE
    SET @Cus2Id = (SELECT id FROM dbo.customers WHERE phone = '0987654321');

IF NOT EXISTS (SELECT 1 FROM dbo.customer_health_profiles WHERE customer_id = @Cus2Id)
    INSERT INTO dbo.customer_health_profiles (customer_id, height_cm, weight_kg, allergies, medical_conditions, current_medications, note, updated_at)
    VALUES (@Cus2Id, 160.0, 58.0, N'Amoxicillin, Penicillin', N'Đang mang thai tuần 24', N'Sắt sinh học, Axit Folic', N'Lưu ý chống chỉ định kháng sinh nhóm Penicillin khi kê đơn', SYSDATETIME());

-- KH 3: Lê Hoàng Long - Đái tháo đường Type 2
DECLARE @Cus3Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.customers WHERE phone = '0903456789')
BEGIN
    INSERT INTO dbo.customers (full_name, phone, email, date_of_birth, gender, address, status, created_by, created_at)
    VALUES (N'Lê Hoàng Long', '0903456789', 'long.le@yahoo.com', '1962-11-05', 1, N'Số 88 Trần Đăng Ninh, Dịch Vọng, Cầu Giấy, Hà Nội', 1, @AdminId, SYSDATETIME());
    SET @Cus3Id = SCOPE_IDENTITY();
END
ELSE
    SET @Cus3Id = (SELECT id FROM dbo.customers WHERE phone = '0903456789');

IF NOT EXISTS (SELECT 1 FROM dbo.customer_health_profiles WHERE customer_id = @Cus3Id)
    INSERT INTO dbo.customer_health_profiles (customer_id, height_cm, weight_kg, allergies, medical_conditions, current_medications, note, updated_at)
    VALUES (@Cus3Id, 168.0, 72.0, NULL, N'Đái tháo đường type 2, Mỡ máu cao', N'Metformin 850mg, Atorvastatin 20mg', N'Người cao tuổi mua thuốc định kỳ hàng tháng', SYSDATETIME());

-- KH 4: Phạm Quỳnh Chi - Khách quen thân thiết (Hội viên Vàng)
DECLARE @Cus4Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.customers WHERE phone = '0934567890')
BEGIN
    INSERT INTO dbo.customers (full_name, phone, email, date_of_birth, gender, address, status, created_by, created_at)
    VALUES (N'Phạm Quỳnh Chi', '0934567890', 'quynhchi.pham@gmail.com', '1992-03-15', 2, N'Số 45 Nguyễn Phong Sắc, Cầu Giấy, Hà Nội', 1, @AdminId, SYSDATETIME());
    SET @Cus4Id = SCOPE_IDENTITY();
END
ELSE
    SET @Cus4Id = (SELECT id FROM dbo.customers WHERE phone = '0934567890');

IF NOT EXISTS (SELECT 1 FROM dbo.customer_health_profiles WHERE customer_id = @Cus4Id)
    INSERT INTO dbo.customer_health_profiles (customer_id, height_cm, weight_kg, allergies, medical_conditions, current_medications, note, updated_at)
    VALUES (@Cus4Id, 163.0, 50.0, N'Hải sản, Phấn hoa', N'Viêm xoang dị ứng thời tiết', NULL, N'Hội viên Vàng thường xuyên mua thực phẩm chức năng', SYSDATETIME());

-- KH 5: Đỗ Thị Thu Trang - Khách hàng bị vô hiệu hóa để test khôi phục
IF NOT EXISTS (SELECT 1 FROM dbo.customers WHERE phone = '0966778899')
    INSERT INTO dbo.customers (full_name, phone, email, date_of_birth, gender, address, status, created_by, created_at)
    VALUES (N'Đỗ Thị Thu Trang', '0966778899', 'thutrang.do@gmail.com', '1998-07-28', 2, N'Số 12 Xuân Thủy, Cầu Giấy, Hà Nội', 0, @AdminId, SYSDATETIME());
GO

/* =========================================================================================
   PHẦN 8: BÁN HÀNG TẠI QUẦY POS: CA LÀM VIỆC, HÓA ĐƠN & ĐỔI TRẢ THUỐC
   ========================================================================================= */

DECLARE @StoreId BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'ST01');
DECLARE @PharmacistId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'pharmacist_hn01');
DECLARE @ManagerId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'manager_hn01');

-- 9.1 Ca Sáng Hôm Qua (CLOSED & RECONCILED)
DECLARE @ShiftYesterdayId BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.shifts WHERE account_id = @PharmacistId AND status = 2)
BEGIN
    INSERT INTO dbo.shifts (store_id, account_id, opened_at, closed_at, opening_cash, closing_cash, expected_cash, status, note, reconciled_by, reconciled_at)
    VALUES (
        @StoreId, @PharmacistId,
        DATEADD(HOUR, -30, SYSDATETIME()),
        DATEADD(HOUR, -23, SYSDATETIME()),
        1500000.00, 1955000.00, 1955000.00, 2,
        N'Ca sáng bàn giao chuẩn xác. Tiền két khớp 100%.',
        @ManagerId, DATEADD(HOUR, -22, SYSDATETIME())
    );
    SET @ShiftYesterdayId = SCOPE_IDENTITY();
END
ELSE
    SET @ShiftYesterdayId = (SELECT TOP 1 id FROM dbo.shifts WHERE account_id = @PharmacistId AND status = 2 ORDER BY id DESC);

-- 9.2 Ca Sáng Hôm Nay (OPEN) phục vụ kiểm thử POS trực tiếp
DECLARE @ShiftTodayId BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.shifts WHERE account_id = @PharmacistId AND status = 1)
BEGIN
    INSERT INTO dbo.shifts (store_id, account_id, opened_at, closed_at, opening_cash, closing_cash, expected_cash, status, note)
    VALUES (@StoreId, @PharmacistId, DATEADD(HOUR, -4, SYSDATETIME()), NULL, 1000000.00, NULL, NULL, 1, N'Ca làm việc trực quầy POS buổi sáng');
    SET @ShiftTodayId = SCOPE_IDENTITY();
END
ELSE
    SET @ShiftTodayId = (SELECT TOP 1 id FROM dbo.shifts WHERE account_id = @PharmacistId AND status = 1);

-- 9.3 Hóa đơn bán lẻ mẫu
DECLARE @PAugmentin BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890125');
DECLARE @BAugmentin BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @PAugmentin);
DECLARE @PGaviscon  BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890128');
DECLARE @BGaviscon  BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @PGaviscon);
DECLARE @PPanadol   BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890123');
DECLARE @BPanadol   BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @PPanadol);

IF NOT EXISTS (SELECT 1 FROM dbo.sales_invoices WHERE code = 'INV-20261104-0001')
BEGIN
    INSERT INTO dbo.sales_invoices (code, store_id, shift_id, account_id, customer_id, prescription_code, total_amount, discount, final_amount, status, created_at)
    VALUES ('INV-20261104-0001', @StoreId, @ShiftYesterdayId, @PharmacistId, 1, 'RX-BACHMAI-1029', 395000.00, 0.00, 395000.00, 1, DATEADD(HOUR, -25, SYSDATETIME()));
    
    DECLARE @InvId BIGINT = SCOPE_IDENTITY();

    INSERT INTO dbo.sales_invoice_details (sales_invoice_id, product_id, batch_id, quantity, unit_price, unit_cost, dosage_instruction)
    VALUES 
    (@InvId, @PAugmentin, @BAugmentin, 1, 260000.00, 215000.00, N'Uống 1 viên x 2 lần/ngày sau bữa ăn'),
    (@InvId, @PGaviscon, @BGaviscon, 1, 135000.00, 110000.00, N'Uống 1 gói sau khi ăn 30 phút');

    INSERT INTO dbo.payments (sales_invoice_id, method, amount, status, transaction_ref, paid_at, created_at)
    VALUES (@InvId, 1, 395000.00, 1, NULL, DATEADD(HOUR, -25, SYSDATETIME()), DATEADD(HOUR, -25, SYSDATETIME()));

    -- Phiếu đổi trả hàng (UC25)
    IF NOT EXISTS (SELECT 1 FROM dbo.sales_returns WHERE code = 'RET-20261104-0001')
    BEGIN
        INSERT INTO dbo.sales_returns (code, sales_invoice_id, shift_id, processed_by, return_type, refund_method, refund_amount, reason, created_at)
        VALUES ('RET-20261104-0001', @InvId, @ShiftYesterdayId, @PharmacistId, 2, 1, 135000.00, N'Khách mua nhầm loại hỗn dịch, muốn hoàn tiền', DATEADD(HOUR, -24, SYSDATETIME()));
        
        DECLARE @RetId BIGINT = SCOPE_IDENTITY();
        DECLARE @Detail2Id BIGINT = (SELECT TOP 1 id FROM dbo.sales_invoice_details WHERE sales_invoice_id = @InvId AND product_id = @PGaviscon);
        
        INSERT INTO dbo.sales_return_details (sales_return_id, sales_invoice_detail_id, product_id, batch_id, quantity, unit_price)
        VALUES (@RetId, @Detail2Id, @PGaviscon, @BGaviscon, 1, 135000.00);
    END
END
GO

/* =========================================================================================
   PHẦN 9: QUY TRÌNH MUA HÀNG & BÁO GIÁ ĐẤU THẦU (PROCUREMENT FLOW)
   ========================================================================================= */

DECLARE @BuyerId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'purchasing01');
IF @BuyerId IS NULL SET @BuyerId = 1;
DECLARE @GmId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'gm01');
IF @GmId IS NULL SET @GmId = 1;
DECLARE @WhStoreId BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'WH01');
IF @WhStoreId IS NULL SET @WhStoreId = 2;

DECLARE @P1 BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890123'); -- Panadol
DECLARE @P2 BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890125'); -- Augmentin
DECLARE @SupplierDhgId BIGINT = (SELECT TOP 1 id FROM dbo.suppliers WHERE code = 'SUP-DHG');

-- 10.1 Yêu cầu mua hàng (Purchase Requests)
DECLARE @Pr1Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.purchase_requests WHERE code = 'PR-20261101-0001')
BEGIN
    INSERT INTO dbo.purchase_requests (code, store_id, created_by, status, reason, created_at, approved_at)
    VALUES ('PR-20261101-0001', @WhStoreId, @BuyerId, 1, N'Bổ sung lượng dự trữ kho tổng chuẩn bị mùa đông', DATEADD(DAY, -5, SYSDATETIME()), DATEADD(DAY, -4, SYSDATETIME()));
    SET @Pr1Id = SCOPE_IDENTITY();

    INSERT INTO dbo.purchase_request_details (purchase_request_id, product_id, requested_quantity, note)
    VALUES 
    (@Pr1Id, @P1, 500, N'Hàng chuẩn bị cho đợt khuyến mãi'),
    (@Pr1Id, @P2, 200, N'Thuốc kháng sinh dự trữ mùa rét');
END
ELSE
    SET @Pr1Id = (SELECT id FROM dbo.purchase_requests WHERE code = 'PR-20261101-0001');

-- 10.2 Đề xuất mua hàng (Purchase Proposals)
DECLARE @Pp1Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.purchase_proposals WHERE code = 'PP-20261102-0001')
BEGIN
    INSERT INTO dbo.purchase_proposals (code, created_by, approved_by, status, reject_reason, total_amount, created_at, approved_at)
    VALUES ('PP-20261102-0001', @BuyerId, @GmId, 2, NULL, 125500000.00, DATEADD(DAY, -4, SYSDATETIME()), DATEADD(DAY, -3, SYSDATETIME()));
    SET @Pp1Id = SCOPE_IDENTITY();

    INSERT INTO dbo.purchase_proposal_requests (purchase_proposal_id, purchase_request_id)
    VALUES (@Pp1Id, @Pr1Id);

    INSERT INTO dbo.purchase_proposal_details (purchase_proposal_id, product_id, quantity)
    VALUES 
    (@Pp1Id, @P1, 500),
    (@Pp1Id, @P2, 200);
END
ELSE
    SET @Pp1Id = (SELECT id FROM dbo.purchase_proposals WHERE code = 'PP-20261102-0001');

-- 10.3 Yêu cầu báo giá (RFQs)
DECLARE @Rfq1Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.rfqs WHERE code = 'RFQ-20261102-0001')
BEGIN
    INSERT INTO dbo.rfqs (code, supplier_id, purchase_proposal_id, created_by, sent_by, token_hash, expired_at, subject, content, status, sent_at, created_at)
    VALUES (
        'RFQ-20261102-0001', @SupplierDhgId, @Pp1Id, @BuyerId, @BuyerId,
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        DATEADD(DAY, 7, SYSDATETIME()),
        N'Yêu cầu báo giá vật tư y tế & dược phẩm đợt Tháng 11/2026',
        N'Kính gửi Quý đối tác DHG Pharma, vui lòng cung cấp bảng báo giá cho các mặt hàng đính kèm.',
        0, -- SENT
        DATEADD(DAY, -3, SYSDATETIME()),
        DATEADD(DAY, -3, SYSDATETIME())
    );
    SET @Rfq1Id = SCOPE_IDENTITY();
END
ELSE
    SET @Rfq1Id = (SELECT id FROM dbo.rfqs WHERE code = 'RFQ-20261102-0001');

-- 10.4 Báo giá phản hồi từ nhà cung cấp (Supplier Quotations)
DECLARE @Quo1Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.supplier_quotations WHERE code = 'QUO-DHG-20261103-01')
BEGIN
    INSERT INTO dbo.supplier_quotations (code, rfq_id, supplier_id, account_id, quotation_date, valid_until, total_amount, status, created_at)
    VALUES ('QUO-DHG-20261103-01', @Rfq1Id, @SupplierDhgId, @BuyerId, CAST(DATEADD(DAY, -2, SYSDATETIME()) AS DATE), CAST(DATEADD(DAY, 30, SYSDATETIME()) AS DATE), 125500000.00, 1, DATEADD(DAY, -2, SYSDATETIME()));
    SET @Quo1Id = SCOPE_IDENTITY();

    INSERT INTO dbo.supplier_quotation_details (supplier_quotation_id, product_id, quantity, unit_price, tax_rate)
    VALUES 
    (@Quo1Id, @P1, 500, 160000.00, 5.0),
    (@Quo1Id, @P2, 200, 205000.00, 5.0);

    -- Cập nhật proposal liên kết với báo giá trúng thầu
    UPDATE dbo.purchase_proposals 
    SET supplier_quotation_id = @Quo1Id 
    WHERE id = @Pp1Id;
END
GO

/* =========================================================================================
   PHẦN 10: QUY TRÌNH KHO TRUNG TÂM & ĐIỀU CHUYỂN HÀNG HÓA (ROWS 45-58 - NHẬT HUY)
   ========================================================================================= */

DECLARE @WhStoreId BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'WH01');
DECLARE @St01StoreId BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'ST01');
DECLARE @WhStaffId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'warehouse01');
DECLARE @WhMgrId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'wh_manager01');
DECLARE @SupplierId BIGINT = (SELECT TOP 1 id FROM dbo.suppliers WHERE code = 'SUP-DHG');

DECLARE @ProdPana BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890123');
DECLARE @BatchPana BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @ProdPana);
DECLARE @ProdAug BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890125');
DECLARE @BatchAug BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @ProdAug);

-- 11.1 Phiếu nhập kho mua hàng (Purchase Receipts)
DECLARE @PpRecId BIGINT = (SELECT TOP 1 id FROM dbo.purchase_proposals WHERE code = 'PP-20261102-0001');

IF NOT EXISTS (SELECT 1 FROM dbo.purchase_receipts WHERE code = 'REC-20261104-0001')
BEGIN
    INSERT INTO dbo.purchase_receipts (code, purchase_proposal_id, supplier_id, store_id, created_by, confirmed_by, delivery_type, status, total_amount, note, created_at, confirmed_at)
    VALUES ('REC-20261104-0001', @PpRecId, @SupplierId, @WhStoreId, @WhStaffId, @WhMgrId, 1, 1, 80000000.00, N'Nhập hàng nguyên lô Panadol Extra theo hợp đồng tháng 11', DATEADD(DAY, -2, SYSDATETIME()), DATEADD(DAY, -2, SYSDATETIME()));
    
    DECLARE @RecId BIGINT = SCOPE_IDENTITY();
    
    INSERT INTO dbo.purchase_receipt_details (purchase_receipt_id, product_id, order_quantity, quantity, unit_cost, batch_number, manufacture_date, expiry_date, location_id)
    VALUES (@RecId, @ProdPana, 500, 500, 160000.00, 'LOT-PANA-2026-IN', CAST('2026-02-01' AS DATE), CAST('2028-12-31' AS DATE), 1);
END

IF NOT EXISTS (SELECT 1 FROM dbo.purchase_receipts WHERE code = 'REC-20261106-0002')
BEGIN
    INSERT INTO dbo.purchase_receipts (code, purchase_proposal_id, supplier_id, store_id, created_by, confirmed_by, delivery_type, status, total_amount, note, created_at, confirmed_at)
    VALUES ('REC-20261106-0002', @PpRecId, @SupplierId, @WhStoreId, @WhStaffId, NULL, 1, 0, 41000000.00, N'Hàng đang bốc dỡ tại cửa nhập số 2, chờ thủ kho kiểm định cảm quan', SYSDATETIME(), NULL);
    
    DECLARE @Rec2Id BIGINT = SCOPE_IDENTITY();
    
    INSERT INTO dbo.purchase_receipt_details (purchase_receipt_id, product_id, order_quantity, quantity, unit_cost, batch_number, manufacture_date, expiry_date, location_id)
    VALUES (@Rec2Id, @ProdAug, 200, 200, 205000.00, 'LOT-AUG-2026-NEW', CAST('2026-03-01' AS DATE), CAST('2028-09-30' AS DATE), 2);
END

-- 11.2 Yêu cầu điều chuyển từ cửa hàng (Stock Requisitions)
DECLARE @Req1Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.stock_requisitions WHERE code = 'REQ-20261105-0001')
BEGIN
    INSERT INTO dbo.stock_requisitions (code, store_id, created_by, approved_by, status, created_at, approved_at)
    VALUES ('REQ-20261105-0001', @St01StoreId, @WhStaffId, @WhMgrId, 2, DATEADD(DAY, -1, SYSDATETIME()), DATEADD(DAY, -1, SYSDATETIME()));
    SET @Req1Id = SCOPE_IDENTITY();

    INSERT INTO dbo.stock_requisition_details (stock_requisition_id, product_id, requested_qty, approved_qty, received_qty)
    VALUES 
    (@Req1Id, @ProdPana, 100, 100, NULL),
    (@Req1Id, @ProdAug, 50, 50, NULL);
END
ELSE
    SET @Req1Id = (SELECT id FROM dbo.stock_requisitions WHERE code = 'REQ-20261105-0001');

-- 11.3 Phiếu xuất kho điều chuyển theo FEFO (Goods Issues)
IF NOT EXISTS (SELECT 1 FROM dbo.goods_issues WHERE code = 'GI-20261105-0001')
BEGIN
    INSERT INTO dbo.goods_issues (code, stock_requisition_id, from_store_id, to_store_id, created_by, dispatched_by, status, carrier, note, created_at, dispatched_at)
    VALUES ('GI-20261105-0001', @Req1Id, @WhStoreId, @St01StoreId, @WhStaffId, @WhStaffId, 1, N'Đội xe vận chuyển PharmaChain Fleet #02', N'Hàng đang trên đường vận chuyển sang Nhà thuốc Cầu Giấy', DATEADD(HOUR, -6, SYSDATETIME()), DATEADD(HOUR, -6, SYSDATETIME()));
    
    DECLARE @GiId BIGINT = SCOPE_IDENTITY();

    INSERT INTO dbo.goods_issue_details (goods_issue_id, product_id, batch_id, quantity)
    VALUES 
    (@GiId, @ProdPana, @BatchPana, 100),
    (@GiId, @ProdAug, @BatchAug, 50);
END

-- 11.4 Đợt kiểm kê kho định kỳ (Inventory Audits)
DECLARE @Audit1Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.inventory_audits WHERE code = 'AUD-20261101-0001')
BEGIN
    INSERT INTO dbo.inventory_audits (code, store_id, requested_by, counted_by, reviewed_by, status, audit_date, review_note, created_at)
    VALUES ('AUD-20261101-0001', @WhStoreId, @WhMgrId, @WhStaffId, @WhMgrId, 2, CAST(DATEADD(DAY, -5, SYSDATETIME()) AS DATE), N'Kiểm kê đầu tháng 11 - Khớp 100% sổ sách', DATEADD(DAY, -5, SYSDATETIME()));
    SET @Audit1Id = SCOPE_IDENTITY();

    INSERT INTO dbo.inventory_audit_details (inventory_audit_id, product_id, batch_id, system_quantity, counted_quantity, note)
    VALUES 
    (@Audit1Id, @ProdPana, @BatchPana, 1000, 1000, N'Bao bì nguyên vẹn, xếp đúng kệ A1'),
    (@Audit1Id, @ProdAug, @BatchAug, 1000, 998, N'Lệch âm 2 hộp do nứt vỡ trong lúc dỡ hàng');
END
ELSE
    SET @Audit1Id = (SELECT id FROM dbo.inventory_audits WHERE code = 'AUD-20261101-0001');

-- 11.5 Phiếu điều chỉnh kiểm kê (Inventory Adjustments)
IF NOT EXISTS (SELECT 1 FROM dbo.inventory_adjustments WHERE reason LIKE N'%Hao hụt nứt vỡ%')
BEGIN
    INSERT INTO dbo.inventory_adjustments (store_id, product_id, batch_id, inventory_audit_id, created_by, approved_by, type, status, quantity_before, quantity_after, value_impact, reason, created_at, approved_at)
    VALUES (@WhStoreId, @ProdAug, @BatchAug, @Audit1Id, @WhStaffId, @WhMgrId, 3, 2, 1000, 998, -430000.00, N'Hao hụt nứt vỡ vỉ thuốc trong quá trình vận chuyển nội bộ', DATEADD(DAY, -5, SYSDATETIME()), DATEADD(DAY, -5, SYSDATETIME()));
END
GO

/* =========================================================================================
   PHẦN 11: ĐỐI SOÁT DOANH THU, THẺ KHO KIỂM TOÁN (STOCK MOVEMENTS) & THÔNG BÁO HỆ THỐNG
   ========================================================================================= */

DECLARE @St01Id BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'ST01');
DECLARE @Wh01Id BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'WH01');
DECLARE @MgrId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'manager_hn01');
DECLARE @StaffId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'pharmacist_hn01');

-- 12.1 Đối soát doanh thu ngày hôm qua cho ST01
DECLARE @Yesterday DATE = CAST(DATEADD(DAY, -1, SYSDATETIME()) AS DATE);
IF NOT EXISTS (SELECT 1 FROM dbo.daily_sales_reconciliations WHERE store_id = @St01Id AND business_date = @Yesterday)
BEGIN
    INSERT INTO dbo.daily_sales_reconciliations (store_id, business_date, system_cash, system_bank, system_vnpay, actual_cash, status, note, reconciled_by, reconciled_at)
    VALUES (@St01Id, @Yesterday, 395000.00, 0.00, 0.00, 395000.00, 1, N'Đối soát khớp 100% giữa tiền thực nộp và hệ thống POS', @MgrId, SYSDATETIME());
END

-- 12.2 Thẻ kho kiểm toán mẫu (Stock Movements)
DECLARE @P1 BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890123');
DECLARE @B1 BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @P1);

IF @P1 IS NOT NULL AND @B1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.stock_movements WHERE reference_type = 'INIT_STOCK')
BEGIN
    INSERT INTO dbo.stock_movements (store_id, product_id, batch_id, movement_type, quantity_change, quantity_after, reference_type, reference_id, created_by, note, created_at)
    VALUES 
    (@Wh01Id, @P1, @B1, 1, 1000, 1000, 'INIT_STOCK', 1, @MgrId, N'Khởi tạo số dư kho đầu kỳ', DATEADD(DAY, -10, SYSDATETIME())),
    (@St01Id, @P1, @B1, 1, 250, 250, 'INIT_STOCK', 2, @MgrId, N'Cấp phát tồn kho quầy thuốc đầu kỳ', DATEADD(DAY, -10, SYSDATETIME())),
    (@St01Id, @P1, @B1, 2, -1, 249, 'SALES_INVOICE', 1, @StaffId, N'Xuất bán lẻ theo hóa đơn INV-20261104-0001', DATEADD(HOUR, -25, SYSDATETIME()));
END

-- 12.3 Thông báo hệ thống (Notifications)
DECLARE @WhMgrAccId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'wh_manager01');
IF @WhMgrAccId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.notifications WHERE account_id = @WhMgrAccId)
BEGIN
    INSERT INTO dbo.notifications (account_id, store_id, type, title, message, ref_type, ref_id, is_read, created_at)
    VALUES 
    (@WhMgrAccId, @Wh01Id, 'WARNING', N'Cảnh báo lô thuốc cận hạn', N'Lô thuốc LOT-EXP-AUG-01 (Augmentin 1g) còn 45 ngày hết hạn. Vui lòng ưu tiên xuất FEFO.', 'BATCH', 1, 0, DATEADD(HOUR, -12, SYSDATETIME())),
    (@WhMgrAccId, @Wh01Id, 'INFO', N'Yêu cầu điều chuyển hàng mới', N'Nhà thuốc Cầu Giấy ST01 vừa gửi yêu cầu bổ sung 150 đơn vị thuốc.', 'REQUISITION', 1, 0, DATEADD(HOUR, -2, SYSDATETIME()));
END

-- 12.4 Nhật ký gửi Email (Email Logs)
DECLARE @Rfq1Id BIGINT = (SELECT TOP 1 id FROM dbo.rfqs ORDER BY id ASC);
IF NOT EXISTS (SELECT 1 FROM dbo.email_logs WHERE to_email = 'kinhdoanh@dhgpharma.com.vn')
BEGIN
    INSERT INTO dbo.email_logs (to_email, subject, body, ref_type, ref_id, status, error_message, created_at, sent_at)
    VALUES 
    ('kinhdoanh@dhgpharma.com.vn', N'Yêu cầu báo giá Panadol Extra và Augmentin 1g',
     N'Kính gửi Quý nhà cung cấp Dược Hậu Giang, vui lòng xem chi tiết yêu cầu báo giá đính kèm.',
     'RFQ', @Rfq1Id, 1, NULL, DATEADD(DAY, -5, SYSDATETIME()), DATEADD(DAY, -5, SYSDATETIME())),
    ('pharmacist.duty@pharmacy.com', N'Đặt lại mật khẩu tài khoản hệ thống',
     N'Mã đặt lại mật khẩu của bạn có hiệu lực trong 30 phút.',
     'PASSWORD_RESET', NULL, 1, NULL, DATEADD(HOUR, -5, SYSDATETIME()), DATEADD(HOUR, -5, SYSDATETIME()));
END

-- 12.5 Nhật ký kiểm toán thao tác (Audit Logs)
DECLARE @AdminAccId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'admin');
DECLARE @Prod1Id BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567010012');
IF @AdminAccId IS NOT NULL AND @Prod1Id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.audit_logs WHERE entity_name = 'Product' AND entity_id = @Prod1Id)
BEGIN
    INSERT INTO dbo.audit_logs (account_id, [action], entity_name, entity_id, old_value, new_value, ip_address, created_at)
    VALUES 
    (@AdminAccId, 1, 'Product', @Prod1Id, NULL, N'{"barcode":"8934567010012","name":"Panadol Extra Đỏ 500mg","price":15000}', '192.168.1.10', DATEADD(DAY, -30, SYSDATETIME())),
    (@MgrId, 2, 'SalesInvoice', 1, N'{"status":1}', N'{"status":3}', '192.168.1.24', DATEADD(HOUR, -20, SYSDATETIME()));
END

-- 12.6 Token đặt lại mật khẩu (Password Reset Tokens)
DECLARE @PharmAccId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'pharmacist_hn01');
IF @PharmAccId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.password_reset_tokens WHERE account_id = @PharmAccId)
BEGIN
    INSERT INTO dbo.password_reset_tokens (account_id, token_hash, expires_at, used_at, created_at)
    VALUES (@PharmAccId, 'f4c7a1d9e2b58c03a6d9f2b5c8e1a4d7b0c3f6a9', DATEADD(MINUTE, 30, SYSDATETIME()), NULL, DATEADD(MINUTE, -5, SYSDATETIME()));
END
GO

-- 12.7 Bảng lưu trữ Refresh Tokens (Refresh Token Rotation)
IF OBJECT_ID('dbo.refresh_tokens', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.refresh_tokens (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        account_id BIGINT NOT NULL,
        token VARCHAR(500) NOT NULL UNIQUE,
        expiry_date DATETIME2 NOT NULL,
        is_revoked BIT DEFAULT 0 NOT NULL,
        created_at DATETIME2 DEFAULT SYSDATETIME() NOT NULL,
        replaced_by_token VARCHAR(500) NULL,
        CONSTRAINT FK_refresh_tokens_accounts FOREIGN KEY (account_id) REFERENCES dbo.accounts(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_refresh_tokens_account_id ON dbo.refresh_tokens(account_id);
    CREATE INDEX IX_refresh_tokens_token ON dbo.refresh_tokens(token);
END
GO

-- 12.8 Bảng quy đổi đơn vị bán lẻ thuốc (Product Multi-Unit Conversion)
IF OBJECT_ID('dbo.product_units', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.product_units (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        product_id BIGINT NOT NULL,
        unit_name NVARCHAR(50) NOT NULL,
        conversion_factor INT NOT NULL DEFAULT 1,
        selling_price DECIMAL(18,2) NOT NULL,
        is_base_unit BIT NOT NULL DEFAULT 0,
        barcode VARCHAR(50) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_product_units_products FOREIGN KEY (product_id) REFERENCES dbo.products(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_product_units_product_id ON dbo.product_units(product_id);
    CREATE INDEX IX_product_units_barcode ON dbo.product_units(barcode);
END
GO

-- Bổ sung cột quy đổi vào sales_invoice_details nếu chưa có
IF COL_LENGTH('dbo.sales_invoice_details', 'unit_name') IS NULL
    ALTER TABLE dbo.sales_invoice_details ADD unit_name NVARCHAR(50) NULL;
IF COL_LENGTH('dbo.sales_invoice_details', 'conversion_factor') IS NULL
    ALTER TABLE dbo.sales_invoice_details ADD conversion_factor INT NOT NULL DEFAULT 1;
IF COL_LENGTH('dbo.sales_invoice_details', 'base_quantity') IS NULL
    ALTER TABLE dbo.sales_invoice_details ADD base_quantity INT NULL;
GO

-- Seed dữ liệu mẫu quy đổi đơn vị cho thuốc Panadol Extra (barcode: 8934567890123)
DECLARE @PanadolId BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890123');
IF @PanadolId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.product_units WHERE product_id = @PanadolId)
BEGIN
    INSERT INTO dbo.product_units (product_id, unit_name, conversion_factor, selling_price, is_base_unit, barcode, created_at)
    VALUES 
    (@PanadolId, N'Viên', 1, 1500.00, 1, '8934567890123-V', SYSDATETIME()),
    (@PanadolId, N'Vỉ', 12, 17000.00, 0, '8934567890123-VI', SYSDATETIME()),
    (@PanadolId, N'Hộp', 180, 245000.00, 0, '8934567890123', SYSDATETIME());
END
GO


