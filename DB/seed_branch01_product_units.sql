/* =========================================================================================
   SCRIPT SEED DỮ LIỆU ĐƠN VỊ QUY ĐỔI MẪU CHO DANH MỤC THUỐC TẠI CHI NHÁNH 01 (ST01)
   Chi nhánh: ST01 - Nhà Thuốc Chi Nhánh 01 - Cầu Giấy (123 Cầu Giấy, Hà Nội)
   
   Mục đích:
     1. Khởi tạo bảng dbo.product_units và các cột mở rộng (nếu chưa có).
     2. Nạp cấu hình đa đơn vị (Viên / Vỉ / Gói / Ống / Hộp) cho các loại thuốc bán lẻ.
     3. Giữ nguyên một số sản phẩm đơn chiếc (Siro Prospan, Nước muối sinh lý) không cấu hình
        để phục vụ kiểm chứng tính "TƯƠNG THÍCH NGƯỢC" (Backward Compatibility).
   ========================================================================================= */

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET NOCOUNT ON;
GO

USE [PMS];
GO

-- 1. Đảm bảo cấu trúc bảng product_units & sales_invoice_details
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
    PRINT N'[SCHEMA] Đã tạo bảng dbo.product_units thành công.';
END

IF COL_LENGTH('dbo.sales_invoice_details', 'unit_name') IS NULL
    ALTER TABLE dbo.sales_invoice_details ADD unit_name NVARCHAR(50) NULL;
IF COL_LENGTH('dbo.sales_invoice_details', 'conversion_factor') IS NULL
    ALTER TABLE dbo.sales_invoice_details ADD conversion_factor INT NOT NULL DEFAULT 1;
IF COL_LENGTH('dbo.sales_invoice_details', 'base_quantity') IS NULL
    ALTER TABLE dbo.sales_invoice_details ADD base_quantity INT NULL;
GO

-- 2. Bảng tạm chứa danh sách cấu hình quy đổi mẫu cho các sản phẩm
DECLARE @SeedUnits TABLE (
    product_barcode VARCHAR(50),
    unit_name NVARCHAR(50),
    conversion_factor INT,
    selling_price DECIMAL(18,2),
    is_base_unit BIT,
    unit_barcode VARCHAR(50)
);

INSERT INTO @SeedUnits (product_barcode, unit_name, conversion_factor, selling_price, is_base_unit, unit_barcode)
VALUES
    -- 1. Panadol Extra Đỏ (Hộp 15 vỉ x 12 viên)
    ('8934567890123', N'Viên', 1,   1500.00,   1, '8934567890123-V'),
    ('8934567890123', N'Vỉ',   12,  17000.00,  0, '8934567890123-VI'),
    ('8934567890123', N'Hộp',  180, 245000.00, 0, '8934567890123'),

    -- 2. Paracetamol 500mg Hataphar (Hộp 10 vỉ x 10 viên)
    ('8934567890124', N'Viên', 1,   700.00,    1, '8934567890124-V'),
    ('8934567890124', N'Vỉ',   10,  6500.00,   0, '8934567890124-VI'),
    ('8934567890124', N'Hộp',  100, 60000.00,  0, '8934567890124'),

    -- 3. Efferalgan 500mg (Hộp 4 vỉ x 4 viên sủi)
    ('8934567890133', N'Viên', 1,   5500.00,   1, '8934567890133-V'),
    ('8934567890133', N'Vỉ',   4,   20000.00,  0, '8934567890133-VI'),
    ('8934567890133', N'Hộp',  16,  78000.00,  0, '8934567890133'),

    -- 4. Mobic 7.5mg (Hộp 2 vỉ x 10 viên)
    ('8934567890134', N'Viên', 1,   10000.00,  1, '8934567890134-V'),
    ('8934567890134', N'Vỉ',   10,  95000.00,  0, '8934567890134-VI'),
    ('8934567890134', N'Hộp',  20,  185000.00, 0, '8934567890134'),

    -- 5. Hapacol 250 Trẻ Em Vị Cam (Hộp 24 gói)
    ('8934567890135', N'Gói',  1,   2500.00,   1, '8934567890135-G'),
    ('8934567890135', N'Hộp',  24,  55000.00,  0, '8934567890135'),

    -- 6. Augmentin 1g (Hộp 14 viên)
    ('8934567890125', N'Viên', 1,   20000.00,  1, '8934567890125-V'),
    ('8934567890125', N'Vỉ',   7,   135000.00, 0, '8934567890125-VI'),
    ('8934567890125', N'Hộp',  14,  260000.00, 0, '8934567890125'),

    -- 7. Amoxicillin 500mg DHG (Hộp 10 vỉ x 10 viên)
    ('8934567890126', N'Viên', 1,   1000.00,   1, '8934567890126-V'),
    ('8934567890126', N'Vỉ',   10,  9000.00,   0, '8934567890126-VI'),
    ('8934567890126', N'Hộp',  100, 85000.00,  0, '8934567890126'),

    -- 8. Cefixim 200mg DHG (Hộp 2 vỉ x 10 viên)
    ('8934567890136', N'Viên', 1,   5000.00,   1, '8934567890136-V'),
    ('8934567890136', N'Vỉ',   10,  49000.00,  0, '8934567890136-VI'),
    ('8934567890136', N'Hộp',  20,  95000.00,  0, '8934567890136'),

    -- 9. Zithromax 500mg (Hộp 1 vỉ x 3 viên)
    ('8934567890137', N'Viên', 1,   60000.00,  1, '8934567890137-V'),
    ('8934567890137', N'Hộp',  3,   165000.00, 0, '8934567890137'),

    -- 10. Ciprofloxacin 500mg Vidipha (Hộp 10 vỉ x 10 viên)
    ('8934567890138', N'Viên', 1,   1200.00,   1, '8934567890138-V'),
    ('8934567890138', N'Vỉ',   10,  11500.00,  0, '8934567890138-VI'),
    ('8934567890138', N'Hộp',  100, 110000.00, 0, '8934567890138'),

    -- 11. Nexium Mups 40mg (Hộp 14 viên)
    ('8934567890127', N'Viên', 1,   27000.00,  1, '8934567890127-V'),
    ('8934567890127', N'Vỉ',   7,   180000.00, 0, '8934567890127-VI'),
    ('8934567890127', N'Hộp',  14,  350000.00, 0, '8934567890127'),

    -- 12. Hỗn dịch uống Gaviscon Dual Action (Hộp 24 gói x 10ml)
    ('8934567890128', N'Gói',  1,   6000.00,   1, '8934567890128-G'),
    ('8934567890128', N'Hộp',  24,  135000.00, 0, '8934567890128'),

    -- 13. Phosphalugel Chữ P (Hộp 26 gói x 20g)
    ('8934567890139', N'Gói',  1,   5000.00,   1, '8934567890139-G'),
    ('8934567890139', N'Hộp',  26,  120000.00, 0, '8934567890139'),

    -- 14. Men vi sinh Enterogermina 4 Tỷ/5ml (Hộp 20 ống)
    ('8934567890140', N'Ống',  1,   10000.00,  1, '8934567890140-O'),
    ('8934567890140', N'Vỉ',   5,   48000.00,  0, '8934567890140-VI'),
    ('8934567890140', N'Hộp',  20,  185000.00, 0, '8934567890140'),

    -- 15. Amlor 5mg (Hộp 3 vỉ x 10 viên)
    ('8934567890141', N'Viên', 1,   11000.00,  1, '8934567890141-V'),
    ('8934567890141', N'Vỉ',   10,  105000.00, 0, '8934567890141-VI'),
    ('8934567890141', N'Hộp',  30,  310000.00, 0, '8934567890141'),

    -- 16. Concor 5mg (Hộp 5 vỉ x 10 viên)
    ('8934567890142', N'Viên', 1,   5000.00,   1, '8934567890142-V'),
    ('8934567890142', N'Vỉ',   10,  47000.00,  0, '8934567890142-VI'),
    ('8934567890142', N'Hộp',  50,  225000.00, 0, '8934567890142'),

    -- 17. Micardis 40mg (Hộp 3 vỉ x 10 viên)
    ('8934567890143', N'Viên', 1,   10000.00,  1, '8934567890143-V'),
    ('8934567890143', N'Vỉ',   10,  96000.00,  0, '8934567890143-VI'),
    ('8934567890143', N'Hộp',  30,  280000.00, 0, '8934567890143'),

    -- 18. Lipitor 20mg (Hộp 3 vỉ x 10 viên)
    ('8934567890144', N'Viên', 1,   18000.00,  1, '8934567890144-V'),
    ('8934567890144', N'Vỉ',   10,  170000.00, 0, '8934567890144-VI'),
    ('8934567890144', N'Hộp',  30,  495000.00, 0, '8934567890144'),

    -- 19. Viên ngậm ho Bảo Thanh (Hộp 20 vỉ x 5 viên)
    ('8934567890146', N'Viên', 1,   1500.00,   1, '8934567890146-V'),
    ('8934567890146', N'Vỉ',   5,   7500.00,   0, '8934567890146-VI'),
    ('8934567890146', N'Hộp',  100, 140000.00, 0, '8934567890146'),

    -- 20. Decolgen Cảm Cúm (Hộp 25 vỉ x 4 viên)
    ('8934567890147', N'Viên', 1,   1300.00,   1, '8934567890147-V'),
    ('8934567890147', N'Vỉ',   4,   5000.00,   0, '8934567890147-VI'),
    ('8934567890147', N'Hộp',  100, 115000.00, 0, '8934567890147'),

    -- 21. Telfast HD 180mg (Hộp 1 vỉ x 10 viên)
    ('8934567890131', N'Viên', 1,   9500.00,   1, '8934567890131-V'),
    ('8934567890131', N'Hộp',  10,  90000.00,  0, '8934567890131'),

    -- 22. Cetirizin 10mg Stada (Hộp 5 vỉ x 10 viên)
    ('8934567890149', N'Viên', 1,   1200.00,   1, '8934567890149-V'),
    ('8934567890149', N'Vỉ',   10,  11500.00,  0, '8934567890149-VI'),
    ('8934567890149', N'Hộp',  50,  55000.00,  0, '8934567890149'),

    -- 23. Băng dán y tế cá nhân Urgo Waterproof (Hộp 20 miếng)
    ('8934567890157', N'Miếng',1,   2000.00,   1, '8934567890157-M'),
    ('8934567890157', N'Hộp',  20,  38000.00,  0, '8934567890157');

-- LƯU Ý TƯƠNG THÍCH NGƯỢC:
-- 2 sản phẩm dưới đây CỐ TÌNH KHÔNG NẠP VÀO product_units để kiểm chứng quy ước ngầm định (conversion_factor = 1):
--   * Siro Ho Prospan Chai 100ml             (Barcode: 8934567890145) -> Giữ nguyên ĐVT 'Chai'
--   * Nước muối sinh lý Natri Clorid 0.9%    (Barcode: 8934567890156) -> Giữ nguyên ĐVT 'Chai'

-- 3. Nạp dữ liệu vào bảng product_units bằng cú pháp MERGE
MERGE INTO dbo.product_units AS target
USING (
    SELECT 
        p.id AS product_id,
        src.unit_name,
        src.conversion_factor,
        src.selling_price,
        src.is_base_unit,
        src.unit_barcode
    FROM @SeedUnits src
    JOIN dbo.products p ON p.barcode = src.product_barcode
) AS source
ON target.product_id = source.product_id AND target.unit_name = source.unit_name
WHEN MATCHED THEN
    UPDATE SET 
        target.conversion_factor = source.conversion_factor,
        target.selling_price     = source.selling_price,
        target.is_base_unit      = source.is_base_unit,
        target.barcode           = source.unit_barcode
WHEN NOT MATCHED THEN
    INSERT (product_id, unit_name, conversion_factor, selling_price, is_base_unit, barcode, created_at)
    VALUES (source.product_id, source.unit_name, source.conversion_factor, source.selling_price, source.is_base_unit, source.unit_barcode, SYSDATETIME());

PRINT N'[THÀNH CÔNG] Đã nạp / cập nhật bảng quy đổi đơn vị cho toàn bộ danh mục thuốc tại Chi nhánh 01 (ST01).';
GO

-- 4. Báo cáo tổng hợp số lượng đơn vị đã được nạp
SELECT 
    p.barcode,
    p.name AS product_name,
    COUNT(pu.id) AS total_configured_units,
    STRING_AGG(CONCAT(pu.unit_name, ' (x', pu.conversion_factor, ': ', FORMAT(pu.selling_price, '#,##0'), 'đ)'), ', ') AS units_detail
FROM dbo.products p
LEFT JOIN dbo.product_units pu ON pu.product_id = p.id
GROUP BY p.barcode, p.name
ORDER BY total_configured_units DESC, p.name ASC;
GO
