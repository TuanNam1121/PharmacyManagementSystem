/* =========================================================================================
   PMS - Bỏ trạng thái DRAFT (0) của bảng purchase_requests
   Chạy trong DBeaver (SQL Server). KHÔNG cần GO.
   - Dồn dữ liệu "Bản nháp" (0) -> "Đã gửi duyệt" (1)
   - Đổi DEFAULT constraint của cột status từ 0 -> 1
   ========================================================================================= */

USE [PMS];

-- 1) Dồn dữ liệu: mọi yêu cầu đang là Bản nháp (0) -> Đã gửi duyệt (1)
UPDATE dbo.purchase_requests
SET    status = 1,
       updated_at = SYSDATETIME()
WHERE  status = 0;

-- 2) Bỏ default constraint cũ (đang = 0) trên cột status (nếu có)
DECLARE @dfName sysname;
SELECT @dfName = dc.name
FROM   sys.default_constraints dc
JOIN   sys.columns c
         ON c.object_id = dc.parent_object_id
        AND c.column_id  = dc.parent_column_id
WHERE  dc.parent_object_id = OBJECT_ID('dbo.purchase_requests')
  AND  c.name = 'status';

IF @dfName IS NOT NULL
    EXEC(N'ALTER TABLE dbo.purchase_requests DROP CONSTRAINT [' + @dfName + N']');

-- 3) Đặt default mới = 1 (Đã gửi duyệt) nếu chưa có
IF NOT EXISTS (
    SELECT 1 FROM sys.default_constraints
    WHERE name = 'DF_purchase_requests_status'
      AND parent_object_id = OBJECT_ID('dbo.purchase_requests')
)
    ALTER TABLE dbo.purchase_requests
        ADD CONSTRAINT DF_purchase_requests_status DEFAULT (1) FOR status;
