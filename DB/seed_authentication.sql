/* =====================================================================
   SEEDS DATA CHO CỤM TÍNH NĂNG AUTHENTICATION (LOGIN / LOGOUT / RBAC)
   Hệ Thống Quản Lý Chuỗi Nhà Thuốc (Pharmacy Chain Management System)
   Database: PMS (Microsoft SQL Server)
   ===================================================================== */

USE [PMS];
GO

SET NOCOUNT ON;
GO

PRINT N'>>> BẮT ĐẦU NẠP SEED DATA CHO CỤM AUTHENTICATION...';

/* ---------------------------------------------------------------------
   1. ĐẢM BẢO DỮ LIỆU CỬA HÀNG (STORES) TỒN TẠI
   --------------------------------------------------------------------- */
IF NOT EXISTS (SELECT 1 FROM dbo.stores WHERE code = 'HQ')
    INSERT INTO dbo.stores (code, name, type, address, status, created_at)
    VALUES ('HQ', N'Trụ Sở Chính - Ban Giám Đốc', 0, N'Tầng 10, Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội', 1, SYSDATETIME());

IF NOT EXISTS (SELECT 1 FROM dbo.stores WHERE code = 'WH01')
    INSERT INTO dbo.stores (code, name, type, address, status, created_at)
    VALUES ('WH01', N'Kho Tổng Trung Tâm Miền Bắc', 2, N'Lô B2, KCN Đài Tư, 386 Nguyễn Văn Linh, Long Biên, Hà Nội', 1, SYSDATETIME());

IF NOT EXISTS (SELECT 1 FROM dbo.stores WHERE code = 'ST01')
    INSERT INTO dbo.stores (code, name, type, address, status, created_at)
    VALUES ('ST01', N'Nhà Thuốc Chi Nhánh 01 - Cầu Giấy', 1, N'123 Đường Cầu Giấy, P. Dịch Vọng, Q. Cầu Giấy, Hà Nội', 1, SYSDATETIME());
GO

/* ---------------------------------------------------------------------
   2. ĐẢM BẢO CÁC VAI TRÒ HỆ THỐNG (ROLES)
   --------------------------------------------------------------------- */
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
GO

/* ---------------------------------------------------------------------
   3. TẠO CÁC TÀI KHOẢN MẪU (ACCOUNTS)
   Mật khẩu chung cho tất cả tài khoản kiểm thử: Password@123
   Mã băm BCrypt: $2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W
   --------------------------------------------------------------------- */
DECLARE @AdminRoleId       INT = (SELECT id FROM dbo.roles WHERE code = 'ADMIN');
DECLARE @StoreManagerRoleId INT = (SELECT id FROM dbo.roles WHERE code = 'STORE_MANAGER');
DECLARE @PharmacistRoleId   INT = (SELECT id FROM dbo.roles WHERE code = 'PHARMACIST');
DECLARE @WarehouseMgrRoleId INT = (SELECT id FROM dbo.roles WHERE code = 'WAREHOUSE_MANAGER');
DECLARE @WarehouseStaffRoleId INT = (SELECT id FROM dbo.roles WHERE code = 'WAREHOUSE_STAFF');

DECLARE @HqStoreId    BIGINT = (SELECT id FROM dbo.stores WHERE code = 'HQ');
DECLARE @CentralWhId  BIGINT = (SELECT id FROM dbo.stores WHERE code = 'WH01');
DECLARE @Store01Id    BIGINT = (SELECT id FROM dbo.stores WHERE code = 'ST01');

-- 3.1. Tài khoản Quản Trị Viên (Admin)
IF NOT EXISTS (SELECT 1 FROM dbo.accounts WHERE username = 'admin')
    INSERT INTO dbo.accounts (store_id, role_id, username, email, phone, [password], status, failed_login_count, created_at)
    VALUES (@HqStoreId, @AdminRoleId, 'admin', 'admin@pharmacy.com', '0901234567',
            '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', 1, 0, SYSDATETIME());
ELSE
    UPDATE dbo.accounts 
    SET [password] = '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', status = 1, failed_login_count = 0
    WHERE username = 'admin';

-- 3.2. Dược Sĩ / Thu Ngân chi nhánh (pharmacist_hn01) - Actor chính cho Luồng Login & POS
IF NOT EXISTS (SELECT 1 FROM dbo.accounts WHERE username = 'pharmacist_hn01')
    INSERT INTO dbo.accounts (store_id, role_id, username, email, phone, [password], status, failed_login_count, created_at)
    VALUES (@Store01Id, @PharmacistRoleId, 'pharmacist_hn01', 'pharmacist1@pharmacy.com', '0912345678',
            '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', 1, 0, SYSDATETIME());
ELSE
    UPDATE dbo.accounts 
    SET [password] = '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', status = 1, failed_login_count = 0
    WHERE username = 'pharmacist_hn01';

-- 3.3. Dược Sĩ thứ 2 (pharmacist1) - Hỗ trợ alias test case TC-AUTH-01
IF NOT EXISTS (SELECT 1 FROM dbo.accounts WHERE username = 'pharmacist1')
    INSERT INTO dbo.accounts (store_id, role_id, username, email, phone, [password], status, failed_login_count, created_at)
    VALUES (@Store01Id, @PharmacistRoleId, 'pharmacist1', 'pharmacist_alt@pharmacy.com', '0918765432',
            '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', 1, 0, SYSDATETIME());
ELSE
    UPDATE dbo.accounts 
    SET [password] = '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', status = 1, failed_login_count = 0
    WHERE username = 'pharmacist1';

-- 3.4. Cửa Hàng Trưởng chi nhánh (manager_hn01)
IF NOT EXISTS (SELECT 1 FROM dbo.accounts WHERE username = 'manager_hn01')
    INSERT INTO dbo.accounts (store_id, role_id, username, email, phone, [password], status, failed_login_count, created_at)
    VALUES (@Store01Id, @StoreManagerRoleId, 'manager_hn01', 'manager1@pharmacy.com', '0923456789',
            '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', 1, 0, SYSDATETIME());
ELSE
    UPDATE dbo.accounts 
    SET [password] = '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', status = 1, failed_login_count = 0
    WHERE username = 'manager_hn01';

-- 3.5. Thủ Kho Trung Tâm (warehouse01)
IF NOT EXISTS (SELECT 1 FROM dbo.accounts WHERE username = 'warehouse01')
    INSERT INTO dbo.accounts (store_id, role_id, username, email, phone, [password], status, failed_login_count, created_at)
    VALUES (@CentralWhId, @WarehouseStaffRoleId, 'warehouse01', 'warehouse1@pharmacy.com', '0934567890',
            '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', 1, 0, SYSDATETIME());
ELSE
    UPDATE dbo.accounts 
    SET [password] = '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', status = 1, failed_login_count = 0
    WHERE username = 'warehouse01';

-- 3.6. Quản Lý Kho Tổng (wh_manager01)
IF NOT EXISTS (SELECT 1 FROM dbo.accounts WHERE username = 'wh_manager01')
    INSERT INTO dbo.accounts (store_id, role_id, username, email, phone, [password], status, failed_login_count, created_at)
    VALUES (@CentralWhId, @WarehouseMgrRoleId, 'wh_manager01', 'wh_manager1@pharmacy.com', '0945678901',
            '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', 1, 0, SYSDATETIME());
ELSE
    UPDATE dbo.accounts 
    SET [password] = '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', status = 1, failed_login_count = 0
    WHERE username = 'wh_manager01';

-- 3.7. Tài khoản Bị Khóa (locked_user) - Phục vụ kiểm thử TC-AUTH-06 (HTTP 403 Forbidden)
IF NOT EXISTS (SELECT 1 FROM dbo.accounts WHERE username = 'locked_user')
    INSERT INTO dbo.accounts (store_id, role_id, username, email, phone, [password], status, failed_login_count, created_at)
    VALUES (@Store01Id, @PharmacistRoleId, 'locked_user', 'locked@pharmacy.com', '0956789012',
            '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', 0, 5, SYSDATETIME());
ELSE
    UPDATE dbo.accounts 
    SET [password] = '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', status = 0, failed_login_count = 5
    WHERE username = 'locked_user';

-- 3.8. Tài khoản Ngừng Hoạt Động (inactive_user - status = 2)
IF NOT EXISTS (SELECT 1 FROM dbo.accounts WHERE username = 'inactive_user')
    INSERT INTO dbo.accounts (store_id, role_id, username, email, phone, [password], status, failed_login_count, created_at)
    VALUES (@Store01Id, @PharmacistRoleId, 'inactive_user', 'inactive@pharmacy.com', '0967890123',
            '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', 2, 0, SYSDATETIME());
ELSE
    UPDATE dbo.accounts 
    SET [password] = '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', status = 2, failed_login_count = 0
    WHERE username = 'inactive_user';
GO

/* ---------------------------------------------------------------------
   4. THÔNG TIN HỒ SƠ CHI TIẾT (ACCOUNT_INFORMATIONS)
   --------------------------------------------------------------------- */
-- 4.1. Admin
DECLARE @AdminId BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'admin');
IF NOT EXISTS (SELECT 1 FROM dbo.account_informations WHERE account_id = @AdminId)
    INSERT INTO dbo.account_informations (account_id, full_name, date_of_birth, gender, address, avatar_url)
    VALUES (@AdminId, N'Nguyễn Hoàng Nam (Quản Trị Viên)', '1988-05-15', 1, N'Khu Đô Thị Ciputra, Bắc Từ Liêm, Hà Nội', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
ELSE
    UPDATE dbo.account_informations 
    SET full_name = N'Nguyễn Hoàng Nam (Quản Trị Viên)', address = N'Khu Đô Thị Ciputra, Bắc Từ Liêm, Hà Nội'
    WHERE account_id = @AdminId;

-- 4.2. Dược sĩ pharmacist_hn01
DECLARE @PharmId BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'pharmacist_hn01');
IF NOT EXISTS (SELECT 1 FROM dbo.account_informations WHERE account_id = @PharmId)
    INSERT INTO dbo.account_informations (account_id, full_name, date_of_birth, gender, address, avatar_url)
    VALUES (@PharmId, N'Nguyễn Văn Dược', '1995-10-20', 1, N'Số 45 Ngõ 165 Cầu Giấy, P. Dịch Vọng, Hà Nội', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150');
ELSE
    UPDATE dbo.account_informations 
    SET full_name = N'Nguyễn Văn Dược', address = N'Số 45 Ngõ 165 Cầu Giấy, P. Dịch Vọng, Hà Nội'
    WHERE account_id = @PharmId;

-- 4.3. Dược sĩ pharmacist1
DECLARE @Pharm1Id BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'pharmacist1');
IF NOT EXISTS (SELECT 1 FROM dbo.account_informations WHERE account_id = @Pharm1Id)
    INSERT INTO dbo.account_informations (account_id, full_name, date_of_birth, gender, address, avatar_url)
    VALUES (@Pharm1Id, N'Đỗ Minh Ngọc', '1998-03-12', 0, N'Số 12 Chùa Láng, Đống Đa, Hà Nội', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');

-- 4.4. Cửa hàng trưởng manager_hn01
DECLARE @MgrId BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'manager_hn01');
IF NOT EXISTS (SELECT 1 FROM dbo.account_informations WHERE account_id = @MgrId)
    INSERT INTO dbo.account_informations (account_id, full_name, date_of_birth, gender, address, avatar_url)
    VALUES (@MgrId, N'Trần Thị Hương', '1990-08-25', 0, N'Tòa Landmark 72, Keangnam, Mễ Trì, Nam Từ Liêm, Hà Nội', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150');

-- 4.5. Thủ kho warehouse01
DECLARE @WhStaffId BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'warehouse01');
IF NOT EXISTS (SELECT 1 FROM dbo.account_informations WHERE account_id = @WhStaffId)
    INSERT INTO dbo.account_informations (account_id, full_name, date_of_birth, gender, address, avatar_url)
    VALUES (@WhStaffId, N'Lê Văn Kho', '1993-12-05', 1, N'Số 88 Sài Đồng, Long Biên, Hà Nội', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');

-- 4.6. Quản lý kho wh_manager01
DECLARE @WhMgrId BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'wh_manager01');
IF NOT EXISTS (SELECT 1 FROM dbo.account_informations WHERE account_id = @WhMgrId)
    INSERT INTO dbo.account_informations (account_id, full_name, date_of_birth, gender, address, avatar_url)
    VALUES (@WhMgrId, N'Phạm Đình Quân', '1987-04-18', 1, N'Số 22 Phúc Lợi, Long Biên, Hà Nội', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150');

-- 4.7. Tài khoản bị khóa locked_user
DECLARE @LockedId BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'locked_user');
IF NOT EXISTS (SELECT 1 FROM dbo.account_informations WHERE account_id = @LockedId)
    INSERT INTO dbo.account_informations (account_id, full_name, date_of_birth, gender, address, avatar_url)
    VALUES (@LockedId, N'Tài Khoản Đã Bị Khóa', '1999-01-01', 1, N'Hà Nội', NULL);
GO

/* ---------------------------------------------------------------------
   5. NHẬT KÝ KIỂM TOÁN BAN ĐẦU (AUDIT_LOGS)
   --------------------------------------------------------------------- */
DECLARE @AdminAccId BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'admin');
DECLARE @PharmAccId BIGINT = (SELECT id FROM dbo.accounts WHERE username = 'pharmacist_hn01');

IF NOT EXISTS (SELECT 1 FROM dbo.audit_logs WHERE entity_name = 'AUTH' AND entity_id = @AdminAccId)
BEGIN
    INSERT INTO dbo.audit_logs (account_id, [action], entity_name, entity_id, old_value, new_value, ip_address, created_at)
    VALUES 
    (@AdminAccId, 1, 'AUTH', @AdminAccId, NULL, 'LOGIN_SUCCESS', '127.0.0.1', DATEADD(MINUTE, -120, SYSDATETIME())),
    (@PharmAccId, 1, 'AUTH', @PharmAccId, NULL, 'LOGIN_SUCCESS', '192.168.1.105', DATEADD(MINUTE, -60, SYSDATETIME())),
    (@PharmAccId, 4, 'AUTH', @PharmAccId, NULL, 'LOGOUT', '192.168.1.105', DATEADD(MINUTE, -10, SYSDATETIME()));
END
GO

PRINT N'>>> NẠP SEED DATA CHO AUTHENTICATION HOÀN TẤT!';
PRINT N'========================================================================================';
PRINT N'DANH SÁCH TÀI KHOẢN MẪU ĐỂ ĐĂNG NHẬP (MẬT KHẨU CHUNG: Password@123):';
PRINT N'1. Admin:           Username: admin           | Email: admin@pharmacy.com';
PRINT N'2. Pharmacist:      Username: pharmacist_hn01 | Email: pharmacist1@pharmacy.com (hoặc: pharmacist1)';
PRINT N'3. Store Manager:   Username: manager_hn01    | Email: manager1@pharmacy.com';
PRINT N'4. Warehouse Staff: Username: warehouse01     | Email: warehouse1@pharmacy.com';
PRINT N'5. Warehouse Mgr:   Username: wh_manager01    | Email: wh_manager1@pharmacy.com';
PRINT N'6. Locked Account:  Username: locked_user     | (status = 0, kiểm thử HTTP 403 Forbidden)';
PRINT N'========================================================================================';
GO

