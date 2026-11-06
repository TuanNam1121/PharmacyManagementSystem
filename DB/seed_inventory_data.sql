USE PMS;
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

PRINT N'=====================================================================';
PRINT N'>>> [1/2] NẠP LÔ THUỐC (PRODUCT BATCHES) CHO TẤT CẢ SẢN PHẨM...';
PRINT N'=====================================================================';

DECLARE @defaultSupplierId BIGINT = (SELECT TOP 1 id FROM dbo.suppliers ORDER BY id);

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
    SELECT 1 FROM dbo.product_batches pb WHERE pb.product_id = p.id
);
GO

PRINT N'=====================================================================';
PRINT N'>>> [2/2] NẠP TỒN KHO KHẢ DỤNG (INVENTORIES) CHO TẤT CẢ CÁC CHI NHÁNH / POS...';
PRINT N'=====================================================================';

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

SELECT 
    s.name AS store_name,
    COUNT(i.id) AS total_inventory_items,
    SUM(i.quantity) AS total_units
FROM dbo.stores s
LEFT JOIN dbo.inventories i ON i.store_id = s.id
GROUP BY s.id, s.name;
GO
