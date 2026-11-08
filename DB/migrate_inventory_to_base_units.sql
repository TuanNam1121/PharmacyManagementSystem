/* =========================================================================================
   SCRIPT MIGRATION: ĐỒNG BỘ TỒN KHO CHI NHÁNH & KHO TỔNG SANG ĐƠN VỊ CƠ BẢN (BASE UNIT)
   
   Bối cảnh:
     - Trước đây: inventories.quantity được lưu theo đơn vị Hộp (ví dụ: 250 hộp tại ST01, 1000 hộp tại WH01).
     - Khi bán lẻ theo Viên/Vỉ/Hộp: inventories.quantity BẮT BUỘC phải quy đổi và lưu theo
       ĐƠN VỊ CƠ BẢN NHỎ NHẤT (Base Unit - ví dụ: Viên / Gói / Ống / Miếng).
       
   Công thức đồng bộ:
     quantity_mới = quantity_cũ * MAX(conversion_factor)
     Ví dụ: Panadol 250 hộp cũ * 180 viên/hộp = 45,000 viên.
   ========================================================================================= */

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET NOCOUNT ON;
GO

USE [PMS];
GO

PRINT N'--------------------------------------------------------------------------------';
PRINT N'BẮT ĐẦU ĐỒNG BỘ DỮ LIỆU TỒN KHO SANG ĐƠN VỊ CƠ BẢN (BASE UNIT)...';
PRINT N'--------------------------------------------------------------------------------';

-- 1. Cập nhật số lượng tồn kho trong bảng dbo.inventories
-- Chỉ áp dụng cho các bản ghi đang lưu theo số lượng hộp cũ (quantity <= 1000)
-- để đảm bảo tính idempotent nếu chạy lại nhiều lần
DECLARE @UpdatedRows INT = 0;

UPDATE inv
SET 
    inv.quantity = inv.quantity * max_u.max_factor,
    inv.updated_at = SYSDATETIME()
FROM dbo.inventories inv
JOIN (
    SELECT 
        product_id, 
        MAX(conversion_factor) AS max_factor
    FROM dbo.product_units
    GROUP BY product_id
    HAVING MAX(conversion_factor) > 1
) max_u ON max_u.product_id = inv.product_id
WHERE inv.quantity <= 1000; -- Ngưỡng an toàn nhận biết số lượng hộp cũ

SET @UpdatedRows = @@ROWCOUNT;
PRINT N'[INVENTORIES] Đã quy đổi thành công ' + CAST(@UpdatedRows AS NVARCHAR(10)) + N' bản ghi tồn kho sang Đơn vị Cơ bản.';

-- 2. Cập nhật products.unit sang tên đơn vị cơ bản (Base unit) nếu chưa cập nhật
UPDATE p
SET 
    p.unit = base_u.unit_name,
    p.selling_price = base_u.selling_price
FROM dbo.products p
JOIN dbo.product_units base_u ON base_u.product_id = p.id AND (base_u.is_base_unit = 1 OR base_u.conversion_factor = 1)
WHERE p.unit <> base_u.unit_name;

-- 2.1 Chuẩn hóa giá vốn cost_price về đơn vị cơ bản (tránh phóng đại giá trị tài sản kho tổng)
UPDATE p
SET p.cost_price = ROUND(p.cost_price / max_u.max_factor, 2)
FROM dbo.products p
JOIN (
    SELECT product_id, MAX(conversion_factor) AS max_factor
    FROM dbo.product_units
    GROUP BY product_id
    HAVING MAX(conversion_factor) > 1
) max_u ON max_u.product_id = p.id
WHERE p.cost_price > p.selling_price;

PRINT N'[PRODUCTS] Đã đồng bộ đơn vị cơ bản, giá niêm yết tối thiểu và chuẩn hóa giá vốn cost_price.';

-- 3. Hiển thị báo cáo kiểm tra tồn kho tại Nhà Thuốc Chi Nhánh 01 (ST01) sau khi quy đổi
DECLARE @St01Id BIGINT = (SELECT TOP 1 id FROM dbo.stores WHERE code = 'ST01');

SELECT 
    p.barcode,
    p.name AS product_name,
    p.unit AS base_unit,
    b.batch_number,
    inv.quantity AS base_quantity_in_stock,
    FORMAT(inv.quantity, '#,##0') + ' ' + p.unit AS formatted_stock,
    CONCAT(
        inv.quantity / max_u.max_factor, N' Hộp',
        CASE WHEN (inv.quantity % max_u.max_factor) > 0 
             THEN CONCAT(N' (dư ', inv.quantity % max_u.max_factor, N' ', p.unit, ')') 
             ELSE N'' 
        END
    ) AS packaging_equivalent
FROM dbo.inventories inv
JOIN dbo.products p ON inv.product_id = p.id
JOIN dbo.product_batches b ON inv.batch_id = b.id
LEFT JOIN (
    SELECT product_id, MAX(conversion_factor) AS max_factor
    FROM dbo.product_units
    GROUP BY product_id
) max_u ON max_u.product_id = p.id
WHERE inv.store_id = @St01Id
ORDER BY p.name ASC;
GO

PRINT N'--------------------------------------------------------------------------------';
PRINT N'HOÀN TẤT ĐỒNG BỘ DỮ LIỆU TỒN KHO!';
PRINT N'--------------------------------------------------------------------------------';
GO

