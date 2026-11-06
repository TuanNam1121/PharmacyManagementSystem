/* =====================================================================
   PMS - SEED DATA: CATALOG (CATEGORIES & PRODUCTS ONLY)
   Database: PMS (Microsoft SQL Server)
   Encoding: UTF-8
   Description:
     Kịch bản SQL nạp dữ liệu danh mục (Categories) và sản phẩm (Products)
     thuộc hệ thống quản lý chuỗi nhà thuốc PharmaChain.
     Chỉ chứa dữ liệu danh mục tĩnh (Master Catalog Data).
     TUYỆT ĐỐI KHÔNG chứa dữ liệu nghiệp vụ kinh doanh (không có ca làm việc,
     hóa đơn bán lẻ, trả hàng, xuất nhập kho hay lô hàng).
   ===================================================================== */

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET NOCOUNT ON;
USE [PMS];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'>>> [1/3] Bắt đầu nạp danh mục nhóm thuốc (dbo.categories)...';

DECLARE @AdminId BIGINT;
SELECT TOP 1 @AdminId = id FROM dbo.accounts WHERE username = 'admin';
IF @AdminId IS NULL
    SELECT TOP 1 @AdminId = id FROM dbo.accounts ORDER BY id ASC;

IF @AdminId IS NULL
BEGIN
    RAISERROR(N'Lỗi: Cần có ít nhất một tài khoản (admin) trong bảng dbo.accounts để gán created_by cho categories!', 16, 1);
    RETURN;
END;

-- Bảng tạm chứa danh sách 12 nhóm danh mục chuẩn
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

-- Chèn hoặc cập nhật danh mục bảo đảm tính toàn vẹn và idempotent
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

PRINT N'>>> Đã cập nhật thành công danh sách nhóm danh mục categories.';
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'>>> [2/3] Bắt đầu nạp danh mục sản phẩm thuốc & y tế (dbo.products)...';

-- Bảng tạm chứa danh sách 38 sản phẩm thực tế phổ biến tại Việt Nam
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

-- Chèn hoặc cập nhật sản phẩm theo barcode
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

PRINT N'>>> Đã cập nhật thành công danh mục sản phẩm dbo.products.';
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'>>> [3/3] Tạo bản ghi lịch sử giá ban đầu (dbo.price_histories)...';

DECLARE @AdminId BIGINT;
SELECT TOP 1 @AdminId = id FROM dbo.accounts WHERE username = 'admin';
IF @AdminId IS NULL
    SELECT TOP 1 @AdminId = id FROM dbo.accounts ORDER BY id ASC;

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

PRINT N'>>> Đã tạo lịch sử giá niêm yết ban đầu cho các sản phẩm chưa có price_history.';
PRINT N'=====================================================================';
PRINT N'>>> HOÀN TẤT SEED CATALOG DATA: CATEGORIES & PRODUCTS THÀNH CÔNG!';
PRINT N'=====================================================================';
GO
