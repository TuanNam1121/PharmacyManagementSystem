/* =========================================================================================
   SCRIPT SEED DỮ LIỆU ĐƠN VỊ QUY ĐỔI MẪU CHO THUỐC PANADOL EXTRA
   Mục đích:
     - Tạo bảng dbo.product_units (nếu chưa có)
     - Cấu hình 3 cấp đơn vị bán lẻ cho thuốc Panadol Extra Đỏ:
         1. Viên : Hệ số quy đổi = 1   (Đơn vị cơ bản - Base Unit), Giá bán: 1,500 VND
         2. Vỉ   : Hệ số quy đổi = 12  (1 vỉ = 12 viên),           Giá bán: 17,000 VND
         3. Hộp  : Hệ số quy đổi = 180 (1 hộp = 15 vỉ x 12 viên),  Giá bán: 245,000 VND
   ========================================================================================= */

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET NOCOUNT ON;
GO

USE [PMS];
GO

-- 1. Đảm bảo bảng dbo.product_units đã tồn tại
IF OBJECT_ID('dbo.product_units', 'U') IS NULL
BEGIN
    PRINT N'Bảng dbo.product_units chưa tồn tại. Đang tiến hành tạo bảng...';
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
    PRINT N'Đã tạo thành công bảng dbo.product_units.';
END
GO

-- 2. Đảm bảo bảng sales_invoice_details có các cột mở rộng cho đơn vị bán
IF COL_LENGTH('dbo.sales_invoice_details', 'unit_name') IS NULL
    ALTER TABLE dbo.sales_invoice_details ADD unit_name NVARCHAR(50) NULL;
IF COL_LENGTH('dbo.sales_invoice_details', 'conversion_factor') IS NULL
    ALTER TABLE dbo.sales_invoice_details ADD conversion_factor INT NOT NULL DEFAULT 1;
IF COL_LENGTH('dbo.sales_invoice_details', 'base_quantity') IS NULL
    ALTER TABLE dbo.sales_invoice_details ADD base_quantity INT NULL;
GO

-- 3. Tìm sản phẩm Panadol Extra
DECLARE @PanadolId BIGINT = (SELECT TOP 1 id FROM dbo.products WHERE barcode = '8934567890123');
IF @PanadolId IS NULL
    SET @PanadolId = (SELECT TOP 1 id FROM dbo.products WHERE name LIKE N'%Panadol Extra%');

IF @PanadolId IS NULL
BEGIN
    PRINT N'[LỖI]: Không tìm thấy sản phẩm Panadol Extra trong bảng dbo.products (kiểm tra barcode 8934567890123). Vui lòng nạp danh mục sản phẩm trước.';
END
ELSE
BEGIN
    PRINT N'Đã tìm thấy sản phẩm Panadol Extra với Product ID = ' + CAST(@PanadolId AS NVARCHAR(20));

    -- Bảng tạm chứa thông tin cấu hình quy đổi đơn vị mẫu
    DECLARE @UnitData TABLE (
        unit_name NVARCHAR(50),
        conversion_factor INT,
        selling_price DECIMAL(18,2),
        is_base_unit BIT,
        barcode VARCHAR(50)
    );

    INSERT INTO @UnitData (unit_name, conversion_factor, selling_price, is_base_unit, barcode)
    VALUES 
        (N'Viên', 1,   1500.00,   1, '8934567890123-V'),
        (N'Vỉ',   12,  17000.00,  0, '8934567890123-VI'),
        (N'Hộp',  180, 245000.00, 0, '8934567890123');

    -- Thực hiện MERGE để đảm bảo chạy lại nhiều lần (idempotent) mà không bị trùng lặp dữ liệu
    MERGE INTO dbo.product_units AS target
    USING @UnitData AS source
    ON target.product_id = @PanadolId AND target.unit_name = source.unit_name
    WHEN MATCHED THEN
        UPDATE SET 
            target.conversion_factor = source.conversion_factor,
            target.selling_price     = source.selling_price,
            target.is_base_unit      = source.is_base_unit,
            target.barcode           = source.barcode
    WHEN NOT MATCHED THEN
        INSERT (product_id, unit_name, conversion_factor, selling_price, is_base_unit, barcode, created_at)
        VALUES (@PanadolId, source.unit_name, source.conversion_factor, source.selling_price, source.is_base_unit, source.barcode, SYSDATETIME());

    PRINT N'Nạp dữ liệu quy đổi đơn vị cho Panadol Extra thành công!';
END
GO

-- 4. Truy vấn hiển thị kiểm tra kết quả vừa nạp
SELECT 
    p.id AS product_id,
    p.barcode AS product_barcode,
    p.name AS product_name,
    pu.id AS unit_id,
    pu.unit_name,
    pu.conversion_factor,
    pu.selling_price,
    pu.is_base_unit,
    pu.barcode AS unit_barcode
FROM dbo.product_units pu
JOIN dbo.products p ON pu.product_id = p.id
WHERE p.barcode = '8934567890123' OR p.name LIKE N'%Panadol Extra%'
ORDER BY pu.conversion_factor ASC;
GO
