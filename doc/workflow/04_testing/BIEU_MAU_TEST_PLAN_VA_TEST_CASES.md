# [BIỂU MẪU] MA TRẬN KỊCH BẢN KIỂM THỬ (TEST PLAN & TEST CASES MATRIX)
*(Dùng để thiết kế và ghi nhận kết quả kiểm thử cho từng tính năng)*

---

## 1. Thông Tin Kế Hoạch Kiểm Thử
- **Tên tính năng**: `[Tên tính năng]`
- **Mã Use Case**: `[Mã UC trong SRS]`
- **Tester / Dev thực hiện**: `[Tên người thực hiện]`
- **Môi trường kiểm thử**: `Local (Windows 11, SQL Server 2022, Spring Boot 3, React 18)`
- **Thời gian thực hiện**: `YYYY-MM-DD`

---

## 2. Ma Trận Kịch Bản Kiểm Thử (Test Cases Matrix)

| Test Case ID | Phân Loại | Tên Kịch Bản Kiểm Thử | Các Bước Thực Hiện (Steps) | Dữ Liệu Đầu Vào (Test Data) | Kết Quả Mong Đợi (Expected Result) | Kết Quả Thực Tế (Actual) | Trạng Thái (Pass/Fail) |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Happy Path | Thêm mới sản phẩm hợp lệ | 1. Gọi API `POST /api/v1/products`<br/>2. Truyền đầy đủ dữ liệu hợp lệ | Name: "Panadol Extra"<br/>Barcode: "8934567890123"<br/>Price: 195000 | HTTP 201 Created. Dữ liệu được lưu vào DB, có ID tự tăng. | HTTP 201 Created. Đã lưu DB. | ✅ Pass |
| **TC-02** | Boundary | Giá bán bằng 0 hoặc âm | 1. Gửi request tạo sản phẩm với `sellingPrice = -1000` | `sellingPrice: -1000` | HTTP 400 Bad Request. Báo lỗi "Giá bán phải lớn hơn hoặc bằng 0". | HTTP 400 Bad Request. Báo lỗi đúng. | ✅ Pass |
| **TC-03** | Boundary | Tên sản phẩm để trống | 1. Gửi request với `name = ""` hoặc chỉ chứa khoảng trắng | `name: "   "` | HTTP 400 Bad Request. Báo lỗi "Tên sản phẩm không được để trống". | HTTP 400 Bad Request. | ✅ Pass |
| **TC-04** | Negative | Trùng lặp mã vạch barcode | 1. Tạo sản phẩm với barcode đã tồn tại trong CSDL | `barcode: "8934567890123"` | HTTP 409 Conflict. Báo lỗi "Mã vạch barcode đã tồn tại trong hệ thống". | HTTP 409 Conflict. | ✅ Pass |
| **TC-05** | Negative | Danh mục category không tồn tại | 1. Tạo sản phẩm với `categoryId = 999999` | `categoryId: 999999` | HTTP 404 Not Found. Báo lỗi "Nhóm danh mục không tồn tại". | HTTP 404 Not Found. | ✅ Pass |
| **TC-06** | Security | Không có quyền PRODUCT_CREATE | 1. Dùng token của tài khoản có role `WAREHOUSE_STAFF`<br/>2. Gọi API `POST /api/v1/products` | Header: Bearer Token (Kho) | HTTP 403 Forbidden. Từ chối truy cập. | HTTP 403 Forbidden. | ✅ Pass |
| **TC-07** | UI / Flow | Hiển thị danh sách phân trang | 1. Truy cập trang `/products`<br/>2. Xem 10 sản phẩm đầu tiên<br/>3. Chuyển sang trang 2 | URL: `/products?page=1&size=10` | Bảng hiển thị đúng 10 dòng dữ liệu, phân trang chuyển trang mượt mà không giật lag. | Hiển thị đúng 10 dòng, chuyển trang mượt. | ✅ Pass |
| **TC-08** | UI / Flow | Tìm kiếm thuốc theo tên và barcode | 1. Gõ từ khóa "Panadol" vào ô tìm kiếm | Keyword: "Panadol" | Danh sách tự động lọc hiển thị các sản phẩm có chứa từ khóa "Panadol". | Lọc chính xác các sản phẩm tương ứng. | ✅ Pass |

---

## 3. Tóm Tắt Kết Quả Kiểm Thử (Execution Summary)
- **Tổng số test cases**: `8`
- **Số ca Đạt (Pass)**: `8` (100%)
- **Số ca Không Đạt (Fail)**: `0` (0%)
- **Số ca Bị Chặn (Blocked)**: `0`
- **Đánh giá chung**: Tính năng hoạt động ổn định, đáp ứng đầy đủ yêu cầu nghiệp vụ và các tiêu chí an toàn dữ liệu.
