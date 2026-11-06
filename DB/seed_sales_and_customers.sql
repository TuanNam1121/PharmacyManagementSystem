/* =====================================================================
   SEEDS DATA MÔ PHỎNG TOÀN DIỆN HỆ THỐNG:
   - CUSTOMER MANAGEMENT (Khách hàng & Hồ sơ dị ứng)
   - INVENTORY & MEDICINES (Danh mục, Thuốc, Lô FEFO, Tồn kho chi nhánh)
   - SALES & POS (Ca làm việc, Hóa đơn bán lẻ, Thanh toán, Đổi trả thuốc)
   Database: PMS (Microsoft SQL Server)

   LỆNH THỰC THI (Đảm bảo tiếng Việt UTF-8 có dấu với flag -f 65001):
   sqlcmd -I -S localhost -U na -P 123 -d PMS -C -f 65001 -i DB\seed_sales_and_customers.sql
   ===================================================================== */

USE [PMS];
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

SET NOCOUNT ON;
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

PRINT N'=====================================================================';
PRINT N'>>> BẮT ĐẦU NẠP SEED DATA MÔ PHỎNG QUÁ TRÌNH HOẠT ĐỘNG HỆ THỐNG...';
PRINT N'=====================================================================';

/* ---------------------------------------------------------------------
   1. ĐẢM BẢO CHI NHÁNH & TÀI KHOẢN HỢP LỆ
   --------------------------------------------------------------------- */
DECLARE @StoreId BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'ST01');
IF @StoreId IS NULL
BEGIN
    INSERT INTO dbo.stores (code, name, type, address, status, created_at)
    VALUES ('ST01', N'Nhà Thuốc Chi Nhánh 01 - Cầu Giấy', 1, N'123 Đường Cầu Giấy, P. Dịch Vọng, Q. Cầu Giấy, Hà Nội', 1, SYSDATETIME());
    SET @StoreId = SCOPE_IDENTITY();
END

DECLARE @PharmacistId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'pharmacist_hn01');
IF @PharmacistId IS NULL
BEGIN
    DECLARE @PharmacistRoleId INT = (SELECT TOP 1 id FROM dbo.roles WHERE code = 'PHARMACIST');
    INSERT INTO dbo.accounts (store_id, role_id, username, email, phone, [password], status, failed_login_count, created_at)
    VALUES (@StoreId, @PharmacistRoleId, 'pharmacist_hn01', 'pharmacist1@pharmacy.com', '0912345678',
            '$2a$10$ciaLqehD6IFox8uNKIggYuaPx/iNYDDq9yn/mmCKHSjWXH3//6//W', 1, 0, SYSDATETIME());
    SET @PharmacistId = SCOPE_IDENTITY();
END
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

/* ---------------------------------------------------------------------
   2. SEED NHÀ CUNG CẤP DƯỢC PHẨM (SUPPLIERS)
   --------------------------------------------------------------------- */
PRINT N'-> 2. Đang nạp danh sách Nhà cung cấp dược phẩm...';

IF NOT EXISTS (SELECT 1 FROM dbo.suppliers WHERE code = 'SUP-DHG')
    INSERT INTO dbo.suppliers (code, name, contact_person, phone, email, address, tax_code, status, note, created_at)
    VALUES ('SUP-DHG', N'Công ty Cổ phần Dược Hậu Giang (DHG Pharma)', N'Nguyễn Văn Hùng', '02923891433', 'dhgpharma@dhgpharma.com.vn', N'288 Bis Nguyễn Văn Cừ, P. An Hòa, Q. Ninh Kiều, Cần Thơ', '1800156801', 1, N'Nhà sản xuất dược phẩm hàng đầu VN', SYSDATETIME());

IF NOT EXISTS (SELECT 1 FROM dbo.suppliers WHERE code = 'SUP-TRA')
    INSERT INTO dbo.suppliers (code, name, contact_person, phone, email, address, tax_code, status, note, created_at)
    VALUES ('SUP-TRA', N'Công ty Cổ phần Traphaco', N'Trần Thị Mai', '02436814917', 'info@traphaco.com.vn', N'Ngõ 15, Đường Ngọc Hồi, P. Hoàng Liệt, Q. Hoàng Mai, Hà Nội', '0100108656', 1, N'Chuyên dược liệu, đông dược & thực phẩm chức năng', SYSDATETIME());

IF NOT EXISTS (SELECT 1 FROM dbo.suppliers WHERE code = 'SUP-SANOFI')
    INSERT INTO dbo.suppliers (code, name, contact_person, phone, email, address, tax_code, status, note, created_at)
    VALUES ('SUP-SANOFI', N'Sanofi-Aventis Việt Nam', N'Lê Minh Tuấn', '02838298526', 'contact-vn@sanofi.com', N'Số 10 Hàm Nghi, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh', '0300438189', 1, N'Nhà cung cấp dược phẩm đa quốc gia', SYSDATETIME());
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

/* ---------------------------------------------------------------------
   3. SEED DANH MỤC THUỐC (CATEGO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;RIES)
   --------------------------------------------------------------------- */
PRINT N'-> 3. Đang nạp danh mục thuốc...';

DECLARE @AdminId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'admin');
IF @AdminId IS NULL SET @AdminId = 1;

IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE name = N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm')
    INSERT INTO dbo.categories (name, description, status, created_by, created_at)
    VALUES (N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm', N'Nhóm thuốc chứa Paracetamol, NSAIDs giảm đau, hạ sốt thông thường', 1, @AdminId, SYSDATETIME());

IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE name = N'Thuốc Kháng Sinh & Kháng Khuẩn')
    INSERT INTO dbo.categories (name, description, status, created_by, created_at)
    VALUES (N'Thuốc Kháng Sinh & Kháng Khuẩn', N'Kháng sinh nhóm Penicillin, Cephalosporin, Macrolid (Kê đơn)', 1, @AdminId, SYSDATETIME());

IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE name = N'Thuốc Tiêu Hóa & Dạ Dày')
    INSERT INTO dbo.categories (name, description, status, created_by, created_at)
    VALUES (N'Thuốc Tiêu Hóa & Dạ Dày', N'Thuốc kháng acid, ức chế bơm proton PPI trị viêm loét dạ dày, trào ngược', 1, @AdminId, SYSDATETIME());

IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE name = N'Thuốc Tim Mạch & Huyết Áp')
    INSERT INTO dbo.categories (name, description, status, created_by, created_at)
    VALUES (N'Thuốc Tim Mạch & Huyết Áp', N'Thuốc điều trị tăng huyết áp, suy tim, hạ cholesterol (Kê đơn)', 1, @AdminId, SYSDATETIME());

IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE name = N'Vitamin, Khoáng Chất & TPCN')
    INSERT INTO dbo.categories (name, description, status, created_by, created_at)
    VALUES (N'Vitamin, Khoáng Chất & TPCN', N'Viên sủi, thực phẩm bảo vệ sức khỏe, bổ sung vi chất', 1, @AdminId, SYSDATETIME());
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

/* ---------------------------------------------------------------------
   4. SEED SẢN PHẨM / THUỐC THỰC TẾ (PRODUCTS)
   --------------------------------------------------------------------- */
PRINT N'-> 4. Đang nạp sản phẩm thuốc thực tế...';

DECLARE @CatGiamDau BIGINT = (SELECT id FROM dbo.categories WHERE name = N'Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm');
DECLARE @CatKhangSinh BIGINT = (SELECT id FROM dbo.categories WHERE name = N'Thuốc Kháng Sinh & Kháng Khuẩn');
DECLARE @CatTieuHoa BIGINT = (SELECT id FROM dbo.categories WHERE name = N'Thuốc Tiêu Hóa & Dạ Dày');
DECLARE @CatTimMach BIGINT = (SELECT id FROM dbo.categories WHERE name = N'Thuốc Tim Mạch & Huyết Áp');
DECLARE @CatTPCN BIGINT = (SELECT id FROM dbo.categories WHERE name = N'Vitamin, Khoáng Chất & TPCN');

-- 4.1. Panadol Extra Đỏ
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE barcode = '8934567890123')
    INSERT INTO dbo.products (category_id, barcode, name, unit, active_ingredient, manufacturer, is_prescription, cost_price, selling_price, min_quantity, description, status, created_at)
    VALUES (@CatGiamDau, '8934567890123', N'Panadol Extra Đỏ (Hộp 15 vỉ x 12 viên)', N'Hộp', N'Paracetamol, Caffeine', N'GSK Pharmaceuticals', 0, 160000, 195000, 10, N'Giảm đau, hạ sốt hiệu quả nhanh, giảm đau đầu, đau cơ', 1, SYSDATETIME());

-- 4.2. Paracetamol Hataphar 500mg
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE barcode = '8934567890124')
    INSERT INTO dbo.products (category_id, barcode, name, unit, active_ingredient, manufacturer, is_prescription, cost_price, selling_price, min_quantity, description, status, created_at)
    VALUES (@CatGiamDau, '8934567890124', N'Paracetamol 500mg Hataphar (Hộp 10 vỉ x 10 viên)', N'Hộp', N'Paracetamol', N'Dược phẩm Hà Tây', 0, 45000, 60000, 15, N'Hạ sốt, giảm các cơn đau vừa và nhẹ', 1, SYSDATETIME());

-- 4.3. Augmentin 1g (Kê đơn)
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE barcode = '8934567890125')
    INSERT INTO dbo.products (category_id, barcode, name, unit, active_ingredient, manufacturer, is_prescription, cost_price, selling_price, min_quantity, description, status, created_at)
    VALUES (@CatKhangSinh, '8934567890125', N'Augmentin 1g (Hộp 14 viên)', N'Hộp', N'Amoxicillin, Clavulanic Acid', N'GlaxoSmithKline', 1, 210000, 260000, 5, N'Kháng sinh điều trị nhiễm khuẩn đường hô hấp, tai mũi họng', 1, SYSDATETIME());

-- 4.4. Amoxicillin 500mg DHG (Kê đơn)
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE barcode = '8934567890126')
    INSERT INTO dbo.products (category_id, barcode, name, unit, active_ingredient, manufacturer, is_prescription, cost_price, selling_price, min_quantity, description, status, created_at)
    VALUES (@CatKhangSinh, '8934567890126', N'Amoxicillin 500mg DHG (Hộp 10 vỉ x 10 viên)', N'Hộp', N'Amoxicillin', N'Dược Hậu Giang', 1, 65000, 85000, 10, N'Kháng sinh phổ rộng đường uống', 1, SYSDATETIME());

-- 4.5. Nexium Mups 40mg (Kê đơn)
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE barcode = '8934567890127')
    INSERT INTO dbo.products (category_id, barcode, name, unit, active_ingredient, manufacturer, is_prescription, cost_price, selling_price, min_quantity, description, status, created_at)
    VALUES (@CatTieuHoa, '8934567890127', N'Nexium Mups 40mg (Hộp 14 viên)', N'Hộp', N'Esomeprazole', N'AstraZeneca', 1, 290000, 350000, 8, N'Điều trị trào ngược dạ dày thực quản, loét dạ dày tá tràng', 1, SYSDATETIME());

-- 4.6. Gaviscon Dual Action
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE barcode = '8934567890128')
    INSERT INTO dbo.products (category_id, barcode, name, unit, active_ingredient, manufacturer, is_prescription, cost_price, selling_price, min_quantity, description, status, created_at)
    VALUES (@CatTieuHoa, '8934567890128', N'Hỗn dịch uống Gaviscon Dual Action (Hộp 24 gói x 10ml)', N'Hộp', N'Natri alginate, Canxi cacbonat', N'Reckitt Benckiser', 0, 110000, 135000, 12, N'Giảm triệu chứng ợ nóng, trào ngược axit', 1, SYSDATETIME());

-- 4.7. Amlodipine 5mg Stada (Kê đơn)
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE barcode = '8934567890129')
    INSERT INTO dbo.products (category_id, barcode, name, unit, active_ingredient, manufacturer, is_prescription, cost_price, selling_price, min_quantity, description, status, created_at)
    VALUES (@CatTimMach, '8934567890129', N'Amlodipine 5mg Stada (Hộp 3 vỉ x 10 viên)', N'Hộp', N'Amlodipine besylate', N'Stada Pharmachemie', 1, 22000, 30000, 20, N'Thuốc điều trị tăng huyết áp nguyên phát, đau thắt ngực', 1, SYSDATETIME());

-- 4.8. Berocca Performance Vị Xoài
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE barcode = '8934567890130')
    INSERT INTO dbo.products (category_id, barcode, name, unit, active_ingredient, manufacturer, is_prescription, cost_price, selling_price, min_quantity, description, status, created_at)
    VALUES (@CatTPCN, '8934567890130', N'Viên sủi Berocca Performance Vị Xoài (Tuýp 10 viên)', N'Tuýp', N'Vitamin B, C, Kẽm, Magie', N'Bayer Consumer Care', 0, 75000, 95000, 25, N'Hỗ trợ tăng cường sức đề kháng, tỉnh táo, giảm mệt mỏi', 1, SYSDATETIME());

-- 4.9. Telfast HD 180mg
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE barcode = '8934567890131')
    INSERT INTO dbo.products (category_id, barcode, name, unit, active_ingredient, manufacturer, is_prescription, cost_price, selling_price, min_quantity, description, status, created_at)
    VALUES (@CatGiamDau, '8934567890131', N'Telfast HD 180mg (Hộp 1 vỉ x 10 viên)', N'Hộp', N'Fexofenadine HCl', N'Sanofi', 0, 70000, 90000, 15, N'Thuốc kháng dị ứng, viêm mũi dị ứng, mề đay', 1, SYSDATETIME());

-- 4.10. Dầu cá Omega 3 Fish Oil
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE barcode = '8934567890132')
    INSERT INTO dbo.products (category_id, barcode, name, unit, active_ingredient, manufacturer, is_prescription, cost_price, selling_price, min_quantity, description, status, created_at)
    VALUES (@CatTPCN, '8934567890132', N'Viên uống Dầu cá Omega 3 Fish Oil (Chai 100 viên)', N'Chai', N'Omega 3, EPA, DHA', N'Kirkland Signature', 0, 380000, 480000, 10, N'Hỗ trợ sức khỏe tim mạch, sáng mắt và giảm cholesterol', 1, SYSDATETIME());
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

/* ---------------------------------------------------------------------
   5. SEED LÔ THUỐC THEO NGUYÊN TẮC FEFO (PRODUCT BATCHES)
   --------------------------------------------------------------------- */
PRINT N'-> 5. Đang nạp lô thuốc FEFO & hạn sử dụng...';

DECLARE @SupDhg BIGINT = (SELECT TOP 1 id FROM dbo.suppliers WHERE code = 'SUP-DHG');
DECLARE @PPanadol BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890123');
DECLARE @PParacetamol BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890124');
DECLARE @PAugmentin BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890125');
DECLARE @PAmox BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890126');
DECLARE @PNexium BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890127');
DECLARE @PGaviscon BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890128');
DECLARE @PAmlodipine BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890129');
DECLARE @PBerocca BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890130');
DECLARE @PTelfast BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890131');
DECLARE @POmega BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890132');

-- Panadol Batches (Lô 1 cận hạn hơn, Lô 2 xa hơn)
IF NOT EXISTS (SELECT 1 FROM dbo.product_batches WHERE product_id = @PPanadol AND batch_number = 'PAN-2024A')
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    VALUES (@PPanadol, 'PAN-2024A', '2024-06-01', '2027-06-01', @SupDhg, SYSDATETIME());

IF NOT EXISTS (SELECT 1 FROM dbo.product_batches WHERE product_id = @PPanadol AND batch_number = 'PAN-2025B')
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    VALUES (@PPanadol, 'PAN-2025B', '2025-01-10', '2028-01-10', @SupDhg, SYSDATETIME());

-- Augmentin Batches
IF NOT EXISTS (SELECT 1 FROM dbo.product_batches WHERE product_id = @PAugmentin AND batch_number = 'AUG-202409')
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    VALUES (@PAugmentin, 'AUG-202409', '2024-09-01', '2026-09-01', @SupDhg, SYSDATETIME());

-- Nexium Batches
IF NOT EXISTS (SELECT 1 FROM dbo.product_batches WHERE product_id = @PNexium AND batch_number = 'NEX-202411')
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    VALUES (@PNexium, 'NEX-202411', '2024-11-01', '2027-11-01', @SupDhg, SYSDATETIME());

-- Gaviscon Batches
IF NOT EXISTS (SELECT 1 FROM dbo.product_batches WHERE product_id = @PGaviscon AND batch_number = 'GAV-202408')
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    VALUES (@PGaviscon, 'GAV-202408', '2024-08-15', '2026-12-31', @SupDhg, SYSDATETIME());

-- Amlodipine Batches
IF NOT EXISTS (SELECT 1 FROM dbo.product_batches WHERE product_id = @PAmlodipine AND batch_number = 'AML-202501')
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    VALUES (@PAmlodipine, 'AML-202501', '2025-01-05', '2028-01-05', @SupDhg, SYSDATETIME());

-- Berocca Batches
IF NOT EXISTS (SELECT 1 FROM dbo.product_batches WHERE product_id = @PBerocca AND batch_number = 'BER-202412')
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    VALUES (@PBerocca, 'BER-202412', '2024-12-01', '2027-06-30', @SupDhg, SYSDATETIME());

-- Telfast Batches
IF NOT EXISTS (SELECT 1 FROM dbo.product_batches WHERE product_id = @PTelfast AND batch_number = 'TEL-202502')
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    VALUES (@PTelfast, 'TEL-202502', '2025-02-10', '2027-02-10', @SupDhg, SYSDATETIME());

-- Omega 3 Batches
IF NOT EXISTS (SELECT 1 FROM dbo.product_batches WHERE product_id = @POmega AND batch_number = 'OMG-202405')
    INSERT INTO dbo.product_batches (product_id, batch_number, manufacture_date, expiry_date, supplier_id, created_at)
    VALUES (@POmega, 'OMG-202405', '2024-05-15', '2027-05-15', @SupDhg, SYSDATETIME());
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

/* ---------------------------------------------------------------------
   6. SEED TỒN KHO CHI NHÁNH CẦU GIẤY (INVENTORIES)
   --------------------------------------------------------------------- */
PRINT N'-> 6. Đang nạp tồn kho chi nhánh quầy bán lẻ...';

INSERT INTO dbo.inventories (store_id, product_id, batch_id, quantity, version, updated_at)
SELECT s.id, pb.product_id, pb.id, 50, 0, SYSDATETIME()
FROM dbo.stores s
CROSS JOIN dbo.product_batches pb
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.inventories inv WHERE inv.store_id = s.id AND inv.batch_id = pb.id
);
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

/* ---------------------------------------------------------------------
   7. SEED KHÁCH HÀNG & HỒ SƠ DỊ ỨNG (CUSTOMERS & HEALTH PROFILES)
   --------------------------------------------------------------------- */
PRINT N'-> 7. Đang nạp hồ sơ khách hàng & cảnh báo dị ứng...';

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

-- KH 5: Đỗ Thị Thu Trang - Khách hàng bị vô hiệu hóa (Soft-deleted) để test chức năng kích hoạt lại
IF NOT EXISTS (SELECT 1 FROM dbo.customers WHERE phone = '0966778899')
    INSERT INTO dbo.customers (full_name, phone, email, date_of_birth, gender, address, status, created_by, created_at)
    VALUES (N'Đỗ Thị Thu Trang', '0966778899', 'thutrang.do@gmail.com', '1998-07-28', 2, N'Số 12 Xuân Thủy, Cầu Giấy, Hà Nội', 0, @AdminId, SYSDATETIME());
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

/* ---------------------------------------------------------------------
   8. SEED MÔ PHỎNG HOẠT ĐỘNG BÁN HÀNG: CA LÀM VIỆC (SHIFTS)
   --------------------------------------------------------------------- */
PRINT N'-> 8. Đang nạp lịch sử Ca làm việc (Shifts)...';

DECLARE @StoreId BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'ST01');
DECLARE @PharmacistId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'pharmacist_hn01');
DECLARE @ManagerId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'manager_hn01');

-- 8.1. Ca Sáng Hôm Qua (CLOSED & RECONCILED)
DECLARE @ShiftYesterdayId BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.shifts WHERE account_id = @PharmacistId AND status = 2)
BEGIN
    INSERT INTO dbo.shifts (store_id, account_id, opened_at, closed_at, opening_cash, closing_cash, expected_cash, status, note, reconciled_by, reconciled_at)
    VALUES (
        @StoreId, @PharmacistId,
        DATEADD(HOUR, -30, SYSDATETIME()),  -- 30 tiếng trước
        DATEADD(HOUR, -23, SYSDATETIME()),  -- 23 tiếng trước
        1500000.00,
        1955000.00,
        1955000.00,
        2, -- CLOSED
        N'Ca sáng bàn giao chuẩn xác. Tiền két khớp 100%.',
        @ManagerId,
        DATEADD(HOUR, -22, SYSDATETIME())
    );
    SET @ShiftYesterdayId = SCOPE_IDENTITY();
END
ELSE
    SET @ShiftYesterdayId = (SELECT TOP 1 id FROM dbo.shifts WHERE account_id = @PharmacistId AND status = 2 ORDER BY id DESC);

-- 8.2. Ca Sáng Hôm Nay (ĐANG MỞ - OPEN) để người dùng vào quầy POS kiểm thử trực tiếp
DECLARE @ShiftTodayId BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.shifts WHERE account_id = @PharmacistId AND status = 1)
BEGIN
    INSERT INTO dbo.shifts (store_id, account_id, opened_at, closed_at, opening_cash, closing_cash, expected_cash, status, note)
    VALUES (
        @StoreId, @PharmacistId,
        DATEADD(HOUR, -4, SYSDATETIME()), -- Mở cách đây 4 tiếng
        NULL,
        1000000.00,
        NULL,
        NULL,
        1, -- OPEN
        N'Ca làm việc trực quầy POS buổi sáng'
    );
    SET @ShiftTodayId = SCOPE_IDENTITY();
END
ELSE
    SET @ShiftTodayId = (SELECT TOP 1 id FROM dbo.shifts WHERE account_id = @PharmacistId AND status = 1);
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

/* ---------------------------------------------------------------------
   9. SEED MÔ PHỎNG HÓA ĐƠN BÁN LẺ & THANH TOÁN (SALES INVOICES & PAYMENTS)
   --------------------------------------------------------------------- */
PRINT N'-> 9. Đang nạp hóa đơn bán lẻ, giao dịch thanh toán & đổi trả...';

DECLARE @StoreId BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'ST01');
DECLARE @PharmacistId BIGINT = (SELECT TOP 1 id FROM dbo.accounts WHERE username = 'pharmacist_hn01');
DECLARE @ShiftClosedId BIGINT = (SELECT TOP 1 id FROM dbo.shifts WHERE account_id = @PharmacistId AND status = 2 ORDER BY id DESC);
DECLARE @ShiftOpenId BIGINT = (SELECT TOP 1 id FROM dbo.shifts WHERE account_id = @PharmacistId AND status = 1 ORDER BY id DESC);

DECLARE @Cus1Id BIGINT = (SELECT id FROM dbo.customers WHERE phone = '0912345678');
DECLARE @Cus3Id BIGINT = (SELECT id FROM dbo.customers WHERE phone = '0903456789');
DECLARE @Cus4Id BIGINT = (SELECT id FROM dbo.customers WHERE phone = '0934567890');

DECLARE @PPanadol BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890123');
DECLARE @PAugmentin BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890125');
DECLARE @PNexium BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890127');
DECLARE @PGaviscon BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890128');
DECLARE @PAmlodipine BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890129');
DECLARE @PBerocca BIGINT = (SELECT id FROM dbo.products WHERE barcode = '8934567890130');

DECLARE @BPanadol BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @PPanadol);
DECLARE @BAugmentin BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @PAugmentin);
DECLARE @BNexium BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @PNexium);
DECLARE @BGaviscon BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @PGaviscon);
DECLARE @BAmlodipine BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @PAmlodipine);
DECLARE @BBerocca BIGINT = (SELECT TOP 1 id FROM dbo.product_batches WHERE product_id = @PBerocca);

-- 9.1. Hóa đơn 1 (Ca cũ): Khách vãng lai mua Panadol Extra + Gaviscon (Thanh toán TIỀN MẶT - 330.000đ)
IF NOT EXISTS (SELECT 1 FROM dbo.sales_invoices WHERE code = 'INV-20261104-0001')
BEGIN
    INSERT INTO dbo.sales_invoices (code, store_id, shift_id, account_id, customer_id, prescription_code, total_amount, discount, final_amount, status, created_at)
    VALUES ('INV-20261104-0001', @StoreId, @ShiftClosedId, @PharmacistId, NULL, NULL, 330000.00, 0.00, 330000.00, 1, DATEADD(HOUR, -28, SYSDATETIME()));
    
    DECLARE @Inv1Id BIGINT = SCOPE_IDENTITY();
    
    INSERT INTO dbo.sales_invoice_details (sales_invoice_id, product_id, batch_id, quantity, unit_price, unit_cost, dosage_instruction)
    VALUES 
    (@Inv1Id, @PPanadol, @BPanadol, 1, 195000.00, 160000.00, N'Uống 1 viên khi đau sốt, cách nhau ít nhất 4-6h'),
    (@Inv1Id, @PGaviscon, @BGaviscon, 1, 135000.00, 110000.00, N'Uống 1 gói sau bữa ăn và trước khi đi ngủ');

    INSERT INTO dbo.payments (sales_invoice_id, method, amount, status, transaction_ref, paid_at, created_at)
    VALUES (@Inv1Id, 1, 330000.00, 1, NULL, DATEADD(HOUR, -28, SYSDATETIME()), DATEADD(HOUR, -28, SYSDATETIME()));
END

-- 9.2. Hóa đơn 2 (Ca cũ): Khách Phạm Quỳnh Chi mua Berocca (Thanh toán VIETQR - 95.000đ)
IF NOT EXISTS (SELECT 1 FROM dbo.sales_invoices WHERE code = 'INV-20261104-0002')
BEGIN
    INSERT INTO dbo.sales_invoices (code, store_id, shift_id, account_id, customer_id, prescription_code, total_amount, discount, final_amount, status, created_at)
    VALUES ('INV-20261104-0002', @StoreId, @ShiftClosedId, @PharmacistId, @Cus4Id, NULL, 95000.00, 0.00, 95000.00, 1, DATEADD(HOUR, -26, SYSDATETIME()));
    
    DECLARE @Inv2Id BIGINT = SCOPE_IDENTITY();
    
    INSERT INTO dbo.sales_invoice_details (sales_invoice_id, product_id, batch_id, quantity, unit_price, unit_cost, dosage_instruction)
    VALUES (@Inv2Id, @PBerocca, @BBerocca, 1, 95000.00, 75000.00, N'Hòa tan 1 viên trong 200ml nước uống vào buổi sáng');

    INSERT INTO dbo.payments (sales_invoice_id, method, amount, status, transaction_ref, paid_at, created_at)
    VALUES (@Inv2Id, 3, 95000.00, 1, 'VNPAY_QR_20261104_8819', DATEADD(HOUR, -26, SYSDATETIME()), DATEADD(HOUR, -26, SYSDATETIME()));
END

-- 9.3. Hóa đơn 3 (Ca cũ): Khách mua Augmentin 1g kê đơn -> Có ĐỔI TRẢ HÀNG (UC25)
DECLARE @Inv3Id BIGINT;
IF NOT EXISTS (SELECT 1 FROM dbo.sales_invoices WHERE code = 'INV-20261104-0003')
BEGIN
    INSERT INTO dbo.sales_invoices (code, store_id, shift_id, account_id, customer_id, prescription_code, total_amount, discount, final_amount, status, cancel_reason, created_at)
    VALUES ('INV-20261104-0003', @StoreId, @ShiftClosedId, @PharmacistId, @Cus1Id, 'RX-BACHMAI-9912', 395000.00, 0.00, 395000.00, 3, N'Khách trả lại 1 hộp Gaviscon do mua nhầm', DATEADD(HOUR, -25, SYSDATETIME()));
    
    SET @Inv3Id = SCOPE_IDENTITY();
    
    DECLARE @Inv3Detail1 BIGINT, @Inv3Detail2 BIGINT;
    
    INSERT INTO dbo.sales_invoice_details (sales_invoice_id, product_id, batch_id, quantity, unit_price, unit_cost, dosage_instruction)
    VALUES (@Inv3Id, @PAugmentin, @BAugmentin, 1, 260000.00, 210000.00, N'Uống 1 viên x 2 lần/ngày sau bữa ăn');
    SET @Inv3Detail1 = SCOPE_IDENTITY();

    INSERT INTO dbo.sales_invoice_details (sales_invoice_id, product_id, batch_id, quantity, unit_price, unit_cost, dosage_instruction)
    VALUES (@Inv3Id, @PGaviscon, @BGaviscon, 1, 135000.00, 110000.00, N'Uống sau ăn');
    SET @Inv3Detail2 = SCOPE_IDENTITY();

    INSERT INTO dbo.payments (sales_invoice_id, method, amount, status, transaction_ref, paid_at, created_at)
    VALUES (@Inv3Id, 1, 395000.00, 1, NULL, DATEADD(HOUR, -25, SYSDATETIME()), DATEADD(HOUR, -25, SYSDATETIME()));

    -- Tạo phiếu đổi trả hàng hoàn tiền (UC25)
    IF NOT EXISTS (SELECT 1 FROM dbo.sales_returns WHERE code = 'RET-20261104-0001')
    BEGIN
        INSERT INTO dbo.sales_returns (code, sales_invoice_id, shift_id, processed_by, return_type, refund_method, refund_amount, reason, created_at)
        VALUES ('RET-20261104-0001', @Inv3Id, @ShiftClosedId, @PharmacistId, 2, 1, 135000.00, N'Khách mua nhầm loại hỗn dịch, muốn hoàn tiền', DATEADD(HOUR, -24, SYSDATETIME()));
        
        DECLARE @RetId BIGINT = SCOPE_IDENTITY();
        
        INSERT INTO dbo.sales_return_details (sales_return_id, sales_invoice_detail_id, product_id, batch_id, quantity, unit_price)
        VALUES (@RetId, @Inv3Detail2, @PGaviscon, @BGaviscon, 1, 135000.00);
    END
END

-- 9.4. Hóa đơn 4 (Ca Sáng HÔM NAY - Ca đang OPEN): Bán cho khách Lê Hoàng Long (TIỀN MẶT - 380.000đ)
IF NOT EXISTS (SELECT 1 FROM dbo.sales_invoices WHERE code = 'INV-20261105-0001')
BEGIN
    INSERT INTO dbo.sales_invoices (code, store_id, shift_id, account_id, customer_id, prescription_code, total_amount, discount, final_amount, status, created_at)
    VALUES ('INV-20261105-0001', @StoreId, @ShiftOpenId, @PharmacistId, @Cus3Id, 'RX-VIENTIM-8802', 380000.00, 0.00, 380000.00, 1, DATEADD(HOUR, -3, SYSDATETIME()));
    
    DECLARE @Inv4Id BIGINT = SCOPE_IDENTITY();
    
    INSERT INTO dbo.sales_invoice_details (sales_invoice_id, product_id, batch_id, quantity, unit_price, unit_cost, dosage_instruction)
    VALUES 
    (@Inv4Id, @PNexium, @BNexium, 1, 350000.00, 290000.00, N'Uống trước ăn sáng 30 phút'),
    (@Inv4Id, @PAmlodipine, @BAmlodipine, 1, 30000.00, 22000.00, N'Uống 1 viên cố định vào 8h sáng hàng ngày');

    INSERT INTO dbo.payments (sales_invoice_id, method, amount, status, transaction_ref, paid_at, created_at)
    VALUES (@Inv4Id, 1, 380000.00, 1, NULL, DATEADD(HOUR, -3, SYSDATETIME()), DATEADD(HOUR, -3, SYSDATETIME()));
END

-- 9.5. Hóa đơn 5 (Ca Sáng HÔM NAY - Ca đang OPEN): Bán cho khách vãng lai (VIETQR - 195.000đ)
IF NOT EXISTS (SELECT 1 FROM dbo.sales_invoices WHERE code = 'INV-20261105-0002')
BEGIN
    INSERT INTO dbo.sales_invoices (code, store_id, shift_id, account_id, customer_id, prescription_code, total_amount, discount, final_amount, status, created_at)
    VALUES ('INV-20261105-0002', @StoreId, @ShiftOpenId, @PharmacistId, NULL, NULL, 195000.00, 0.00, 195000.00, 1, DATEADD(HOUR, -1, SYSDATETIME()));
    
    DECLARE @Inv5Id BIGINT = SCOPE_IDENTITY();
    
    INSERT INTO dbo.sales_invoice_details (sales_invoice_id, product_id, batch_id, quantity, unit_price, unit_cost, dosage_instruction)
    VALUES (@Inv5Id, @PPanadol, @BPanadol, 1, 195000.00, 160000.00, N'Uống khi đau đầu hoặc sốt');

    INSERT INTO dbo.payments (sales_invoice_id, method, amount, status, transaction_ref, paid_at, created_at)
    VALUES (@Inv5Id, 3, 195000.00, 1, 'VNPAY_QR_20261105_1030', DATEADD(HOUR, -1, SYSDATETIME()), DATEADD(HOUR, -1, SYSDATETIME()));
END
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

PRINT N'=====================================================================';
PRINT N'>>> NẠP SEED DATA MÔ PHỎNG THÀNH CÔNG!';
PRINT N'=====================================================================';
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
