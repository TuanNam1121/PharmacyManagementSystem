# [BIỂU MẪU] TÀI LIỆU PHÂN TÍCH YÊU CẦU & KHẢO SÁT HIỆN TRẠNG
*(Sử dụng biểu mẫu này cho mỗi tính năng mới trước khi bước vào giai đoạn viết Spec)*

---

## 1. Thông Tin Chung
- **Tên tính năng**: `[Tên tính năng, ví dụ: Quản Lý Sản Phẩm & Danh Mục]`
- **Mã Use Case (SRS)**: `[Ví dụ: UC12, UC13]`
- **Người thực hiện**: `[Tên Dev / Agent]`
- **Ngày lập**: `YYYY-MM-DD`
- **Phiên bản tài liệu**: `v1.0`

---

## 2. Tóm Tắt Nghiệp Vụ (Business Overview)
- **Mục tiêu**: `[Mô tả ngắn gọn 1-2 câu về mục tiêu của tính năng]`
- **Tác nhân chính (Actors)**:
  - `[Actor 1, ví dụ: Quản trị viên (ADMIN) - toàn quyền CRUD]`
  - `[Actor 2, ví dụ: Dược sĩ (PHARMACIST) - quyền xem danh mục & giá niêm yết]`
- **Tiền điều kiện (Pre-conditions)**:
  - `[Ví dụ: Người dùng đã đăng nhập hệ thống với JWT token hợp lệ]`
  - `[Ví dụ: Quyền hạn tài khoản sở hữu permission PRODUCT_VIEW]`
- **Hậu điều kiện (Post-conditions)**:
  - `[Ví dụ: Bản ghi sản phẩm mới được lưu vào CSDL, có mã vạch barcode không trùng lặp]`

---

## 3. Các Quy Tắc Nghiệp Vụ Cần Tuân Thủ (Business Rules)
| Mã Quy Tắc | Tên Quy Tắc | Mô Tả Chi Tiết |
| :--- | :--- | :--- |
| **BR-xx** | Quy tắc giá niêm yết | Toàn bộ chuỗi nhà thuốc áp dụng chung 1 giá bán duy nhất tại thời điểm bán. |
| **BR-xx** | Quy tắc thuốc kê đơn | Thuốc có cờ `is_prescription = 1` bắt buộc phải có thông tin bác sĩ hoặc mã đơn thuốc khi bán lẻ. |
| **BR-xx** | Ràng buộc mã vạch | Barcode là duy nhất trên toàn hệ thống (không tính giá trị NULL). |

---

## 4. Khảo Sát Hiện Trạng Codebase (Code Exploration Findings)

### 4.1. Cơ sở dữ liệu (Database Schema)
- **Các bảng liên quan hiện có**: `[Ví dụ: dbo.categories, dbo.products, dbo.price_histories]`
- **Các cột / ràng buộc đã có**: `[Liệt kê các trường]`
- **Những điểm cần bổ sung hoặc điều chỉnh**: `[Ví dụ: Thêm foreign key category_id vào products]`

### 4.2. Backend (Spring Boot 3)
- **Entity**: `[File path, ví dụ: com.pharmacy.entity.Product]`
- **Repository**: `[File path, ví dụ: com.pharmacy.repository.ProductRepository]`
- **Service**: `[File path hoặc ghi chú: Chưa có, cần tạo mới ProductService / ProductServiceImpl]`
- **Controller & API Endpoint**: `[Liệt kê endpoint hiện có hoặc cần bổ sung]`

### 4.3. Frontend (React 18)
- **Trang / Màn hình**: `[File path, ví dụ: src/page/product/ProductListPage.jsx]`
- **Component dùng chung**: `[File path, ví dụ: src/component/common/Table.jsx]`
- **API Call**: `[File path, ví dụ: src/api/productApi.js]`

---

## 5. Rủi Ro & Vấn Đề Phát Hiện (Identified Risks & Gaps)
- [ ] **Khoảng trống tài liệu (Gap)**: `[Ví dụ: SRS chưa định nghĩa rõ quy cách đóng gói hộp/vỉ/viên có hệ số quy đổi hay không?]`
- [ ] **Rủi ro ảnh hưởng (Impact)**: `[Ví dụ: Sửa bảng products có thể ảnh hưởng đến màn hình POS bán lẻ]`
- [ ] **Vấn đề cần làm rõ**: `[Liệt kê các câu hỏi để chuyển tiếp sang Giai đoạn 2]`

