-- Synchronize and link procurement data
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;

-- 1. Insert new purchase requests in SUBMITTED status (status = 1) for proposal creation
IF NOT EXISTS (SELECT 1 FROM purchase_requests WHERE code = 'PR-202611-0001')
BEGIN
    INSERT INTO purchase_requests (code, store_id, created_by, status, reason, created_at, updated_at)
    VALUES ('PR-202611-0001', 1, 8, 1, N'Bổ sung dự trữ kho tổng cho đợt cao điểm tháng 11', DATEADD(day, -1, SYSDATETIME()), SYSDATETIME());
END

IF NOT EXISTS (SELECT 1 FROM purchase_requests WHERE code = 'PR-202611-0002')
BEGIN
    INSERT INTO purchase_requests (code, store_id, created_by, status, reason, created_at, updated_at)
    VALUES ('PR-202611-0002', 1, 8, 1, N'Bổ sung nhóm thuốc tim mạch và kháng sinh theo định mức tồn kho tối thiểu', DATEADD(hour, -5, SYSDATETIME()), SYSDATETIME());
END

-- 2. Link Purchase Proposals to Purchase Requests in purchase_proposal_requests
IF NOT EXISTS (SELECT 1 FROM purchase_proposal_requests WHERE purchase_proposal_id = 1)
    INSERT INTO purchase_proposal_requests (purchase_proposal_id, purchase_request_id) VALUES (1, 1);

IF NOT EXISTS (SELECT 1 FROM purchase_proposal_requests WHERE purchase_proposal_id = 2)
    INSERT INTO purchase_proposal_requests (purchase_proposal_id, purchase_request_id) VALUES (2, 2);

IF NOT EXISTS (SELECT 1 FROM purchase_proposal_requests WHERE purchase_proposal_id = 3)
    INSERT INTO purchase_proposal_requests (purchase_proposal_id, purchase_request_id) VALUES (3, 3);

IF NOT EXISTS (SELECT 1 FROM purchase_proposal_requests WHERE purchase_proposal_id = 4)
    INSERT INTO purchase_proposal_requests (purchase_proposal_id, purchase_request_id) VALUES (4, 4);

IF NOT EXISTS (SELECT 1 FROM purchase_proposal_requests WHERE purchase_proposal_id = 5)
    INSERT INTO purchase_proposal_requests (purchase_proposal_id, purchase_request_id) VALUES (5, 5);

-- 3. Populate purchase_request_details
-- PR 1
IF NOT EXISTS (SELECT 1 FROM purchase_request_details WHERE purchase_request_id = 1)
BEGIN
    INSERT INTO purchase_request_details (purchase_request_id, product_id, requested_quantity, note)
    VALUES (1, 1, 100, N'Bổ sung tồn kho kho tổng'),
           (1, 2, 150, N'Bổ sung tồn kho kho tổng');
END

-- PR 2
IF NOT EXISTS (SELECT 1 FROM purchase_request_details WHERE purchase_request_id = 2)
BEGIN
    INSERT INTO purchase_request_details (purchase_request_id, product_id, requested_quantity, note)
    VALUES (2, 3, 120, N'Bổ sung tồn kho kho tổng'),
           (2, 5, 200, N'Bổ sung tồn kho kho tổng');
END

-- PR 3
IF NOT EXISTS (SELECT 1 FROM purchase_request_details WHERE purchase_request_id = 3)
BEGIN
    INSERT INTO purchase_request_details (purchase_request_id, product_id, requested_quantity, note)
    VALUES (3, 2, 300, N'Bổ sung dự trữ'),
           (3, 7, 80, N'Bổ sung dự trữ');
END

-- PR 4
IF NOT EXISTS (SELECT 1 FROM purchase_request_details WHERE purchase_request_id = 4)
BEGIN
    INSERT INTO purchase_request_details (purchase_request_id, product_id, requested_quantity, note)
    VALUES (4, 6, 120, N'Hàng nhập khẩu'),
           (4, 8, 90, N'Hàng nhập khẩu');
END

-- PR 5
IF NOT EXISTS (SELECT 1 FROM purchase_request_details WHERE purchase_request_id = 5)
BEGIN
    INSERT INTO purchase_request_details (purchase_request_id, product_id, requested_quantity, note)
    VALUES (5, 4, 100, N'Dự phòng nhu cầu tăng'),
           (5, 9, 150, N'Dự phòng nhu cầu tăng');
END

-- PR 9 (PR-202611-0001)
DECLARE @pr9_id BIGINT = (SELECT id FROM purchase_requests WHERE code = 'PR-202611-0001');
IF @pr9_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM purchase_request_details WHERE purchase_request_id = @pr9_id)
BEGIN
    INSERT INTO purchase_request_details (purchase_request_id, product_id, requested_quantity, note)
    VALUES (@pr9_id, 1, 200, N'Bổ sung đợt 1 tháng 11'),
           (@pr9_id, 3, 150, N'Bổ sung đợt 1 tháng 11'),
           (@pr9_id, 10, 300, N'Bổ sung đợt 1 tháng 11');
END

-- PR 10 (PR-202611-0002)
DECLARE @pr10_id BIGINT = (SELECT id FROM purchase_requests WHERE code = 'PR-202611-0002');
IF @pr10_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM purchase_request_details WHERE purchase_request_id = @pr10_id)
BEGIN
    INSERT INTO purchase_request_details (purchase_request_id, product_id, requested_quantity, note)
    VALUES (@pr10_id, 4, 80, N'Bổ sung kháng sinh đợt 1'),
           (@pr10_id, 5, 250, N'Bổ sung kháng sinh đợt 1');
END

-- 4. Populate purchase_proposal_details
IF NOT EXISTS (SELECT 1 FROM purchase_proposal_details WHERE purchase_proposal_id = 1)
    INSERT INTO purchase_proposal_details (purchase_proposal_id, product_id, quantity) VALUES (1, 1, 100), (1, 2, 150);

IF NOT EXISTS (SELECT 1 FROM purchase_proposal_details WHERE purchase_proposal_id = 2)
    INSERT INTO purchase_proposal_details (purchase_proposal_id, product_id, quantity) VALUES (2, 3, 120), (2, 5, 200);

IF NOT EXISTS (SELECT 1 FROM purchase_proposal_details WHERE purchase_proposal_id = 3)
    INSERT INTO purchase_proposal_details (purchase_proposal_id, product_id, quantity) VALUES (3, 2, 300), (3, 7, 80);

IF NOT EXISTS (SELECT 1 FROM purchase_proposal_details WHERE purchase_proposal_id = 4)
    INSERT INTO purchase_proposal_details (purchase_proposal_id, product_id, quantity) VALUES (4, 6, 120), (4, 8, 90);

IF NOT EXISTS (SELECT 1 FROM purchase_proposal_details WHERE purchase_proposal_id = 5)
    INSERT INTO purchase_proposal_details (purchase_proposal_id, product_id, quantity) VALUES (5, 4, 100), (5, 9, 150);

IF NOT EXISTS (SELECT 1 FROM purchase_proposal_details WHERE purchase_proposal_id = 6)
    INSERT INTO purchase_proposal_details (purchase_proposal_id, product_id, quantity) VALUES (6, 11, 500), (6, 16, 200);

-- 5. Populate supplier_quotation_details (without computed subtotal)
IF NOT EXISTS (SELECT 1 FROM supplier_quotation_details WHERE supplier_quotation_id = 1)
BEGIN
    INSERT INTO supplier_quotation_details (supplier_quotation_id, product_id, quantity, unit_price, tax_rate)
    VALUES (1, 4, 100, 235000.00, 5.00),
           (1, 9, 150, 72000.00, 5.00);
END

IF NOT EXISTS (SELECT 1 FROM supplier_quotation_details WHERE supplier_quotation_id = 2)
BEGIN
    INSERT INTO supplier_quotation_details (supplier_quotation_id, product_id, quantity, unit_price, tax_rate)
    VALUES (2, 3, 120, 65000.00, 5.00),
           (2, 5, 200, 60000.00, 5.00);
END

IF NOT EXISTS (SELECT 1 FROM supplier_quotation_details WHERE supplier_quotation_id = 3)
BEGIN
    INSERT INTO supplier_quotation_details (supplier_quotation_id, product_id, quantity, unit_price, tax_rate)
    VALUES (3, 2, 300, 45000.00, 5.00),
           (3, 7, 80, 155000.00, 5.00);
END

IF NOT EXISTS (SELECT 1 FROM supplier_quotation_details WHERE supplier_quotation_id = 4)
BEGIN
    INSERT INTO supplier_quotation_details (supplier_quotation_id, product_id, quantity, unit_price, tax_rate)
    VALUES (4, 6, 120, 375000.00, 5.00),
           (4, 8, 90, 250000.00, 5.00);
END

IF NOT EXISTS (SELECT 1 FROM supplier_quotation_details WHERE supplier_quotation_id = 5)
BEGIN
    INSERT INTO supplier_quotation_details (supplier_quotation_id, product_id, quantity, unit_price, tax_rate)
    VALUES (5, 1, 100, 140000.00, 5.00),
           (5, 2, 150, 46000.00, 5.00);
END

IF NOT EXISTS (SELECT 1 FROM supplier_quotation_details WHERE supplier_quotation_id = 6)
BEGIN
    INSERT INTO supplier_quotation_details (supplier_quotation_id, product_id, quantity, unit_price, tax_rate)
    VALUES (6, 11, 500, 160000.00, 5.00),
           (6, 16, 200, 65000.00, 5.00);
END

-- 6. Update total amounts on supplier_quotations
UPDATE supplier_quotations SET total_amount = 36015000.00 WHERE id = 1;
UPDATE supplier_quotations SET total_amount = 20790000.00 WHERE id = 2;
UPDATE supplier_quotations SET total_amount = 27195000.00 WHERE id = 3;
UPDATE supplier_quotations SET total_amount = 70875000.00 WHERE id = 4;
UPDATE supplier_quotations SET total_amount = 21945000.00 WHERE id = 5;
UPDATE supplier_quotations SET total_amount = 97650000.00 WHERE id = 6;

-- 7. Update purchase proposals with total amount and linked quotation
UPDATE purchase_proposals SET total_amount = 21945000.00, supplier_quotation_id = 5 WHERE id = 1;
UPDATE purchase_proposals SET total_amount = 20790000.00, supplier_quotation_id = 2 WHERE id = 2;
UPDATE purchase_proposals SET total_amount = 27195000.00, supplier_quotation_id = 3 WHERE id = 3;
UPDATE purchase_proposals SET total_amount = 70875000.00, supplier_quotation_id = 4 WHERE id = 4;
UPDATE purchase_proposals SET total_amount = 36015000.00, supplier_quotation_id = 1 WHERE id = 5;
UPDATE purchase_proposals SET total_amount = 97650000.00, supplier_quotation_id = 6 WHERE id = 6;
UPDATE purchase_proposals SET total_amount = 95500000.00 WHERE id = 7;

-- 8. Link RFQs to appropriate proposals and suppliers
UPDATE rfqs SET purchase_proposal_id = 5, supplier_id = 5 WHERE id = 1;
UPDATE rfqs SET purchase_proposal_id = 2, supplier_id = 1 WHERE id = 2;
UPDATE rfqs SET purchase_proposal_id = 3, supplier_id = 3 WHERE id = 3;
UPDATE rfqs SET purchase_proposal_id = 4, supplier_id = 4 WHERE id = 4;
UPDATE rfqs SET purchase_proposal_id = 1, supplier_id = 2 WHERE id = 5;
UPDATE rfqs SET purchase_proposal_id = 6, supplier_id = 1 WHERE id = 8;
