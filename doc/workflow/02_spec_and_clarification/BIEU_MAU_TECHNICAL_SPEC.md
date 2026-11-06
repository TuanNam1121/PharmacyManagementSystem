# [BIỂU MẪU] ĐẶC TẢ KỸ THUẬT CHI TIẾT (TECHNICAL SPECIFICATION)
*(Tài liệu này được lập cho từng tính năng và phải được PO / Tech Lead phê duyệt trước khi implement)*

---

## 1. Tổng Quan Kỹ Thuật (Technical Overview)
- **Tính năng**: `[Tên tính năng]`
- **Mã Use Case**: `[Mã UC trong SRS]`
- **Tác giả (Author)**: `[Tên Dev / AI Assistant]`
- **Trạng thái**: `[Draft / Reviewing / Approved]`
- **Ngày duyệt (Sign-off date)**: `YYYY-MM-DD`

---

## 2. Thiết Kế Cơ Sở Dữ Liệu (Database Schema Design)

### 2.1. Cấu Trúc Bảng (Table Structure)
```sql
-- DDL Script mẫu
CREATE TABLE dbo.products (
    id                BIGINT IDENTITY(1,1) CONSTRAINT PK_products PRIMARY KEY,
    category_id       BIGINT        NOT NULL CONSTRAINT FK_products_cat REFERENCES dbo.categories(id),
    barcode           VARCHAR(50)   NULL,
    name              NVARCHAR(250) NOT NULL,
    unit              NVARCHAR(30)  NOT NULL,
    active_ingredient NVARCHAR(250) NULL,
    manufacturer      NVARCHAR(200) NULL,
    is_prescription   BIT           NOT NULL DEFAULT 0,
    cost_price        DECIMAL(18,2) NOT NULL DEFAULT 0,
    selling_price     DECIMAL(18,2) NOT NULL DEFAULT 0,
    min_quantity      INT           NOT NULL DEFAULT 20,
    description       NVARCHAR(MAX) NULL,
    status            TINYINT       NOT NULL DEFAULT 1,
    created_at        DATETIME2(0)  NOT NULL DEFAULT SYSDATETIME(),
    updated_at        DATETIME2(0)  NULL
);
```

### 2.2. Chỉ Mục & Ràng Buộc (Indexes & Constraints)
- `UX_products_barcode`: Unique Filtered Index trên cột `barcode` (WHERE barcode IS NOT NULL).
- `IX_products_category`: B-Tree Index trên `category_id` để tăng tốc join & filter.
- `CK_products_cost`: Check constraint `cost_price >= 0`.
- `CK_products_sell`: Check constraint `selling_price >= 0`.

---

## 3. Thiết Kế RESTful API Contract

### 3.1. Danh Sách Endpoint
| Method | Endpoint URL | Phân Quyền (Permission) | Mô Tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/products` | `PRODUCT_VIEW` | Lấy danh sách sản phẩm phân trang & tìm kiếm |
| `GET` | `/api/v1/products/{id}` | `PRODUCT_VIEW` | Lấy chi tiết thông tin 1 sản phẩm |
| `POST` | `/api/v1/products` | `PRODUCT_CREATE` | Thêm mới một sản phẩm |
| `PUT` | `/api/v1/products/{id}` | `PRODUCT_UPDATE` | Cập nhật thông tin sản phẩm |
| `DELETE` | `/api/v1/products/{id}` | `PRODUCT_DELETE` | Xóa hoặc vô hiệu hóa sản phẩm (Soft delete) |

### 3.2. Đặc Tả Request / Response Chi Tiết (Ví dụ: Tạo mới Sản phẩm)
- **URL**: `POST /api/v1/products`
- **Headers**:
  - `Authorization: Bearer <jwt_token>`
  - `Content-Type: application/json`

**Request Body (JSON)**:
```json
{
  "categoryId": 11,
  "barcode": "8934567890123",
  "name": "Panadol Extra Đỏ (Hộp 15 vỉ x 12 viên)",
  "unit": "Hộp",
  "activeIngredient": "Paracetamol 500mg, Caffeine 65mg",
  "manufacturer": "GSK Consumer Healthcare",
  "isPrescription": false,
  "costPrice": 165000,
  "sellingPrice": 195000,
  "minQuantity": 40,
  "description": "Thuốc giảm đau nhanh, hạ sốt hiệu quả"
}
```

**Ràng buộc kiểm thực (Validation Rules)**:
- `categoryId`: `@NotNull(message = "Danh mục không được để trống")`
- `name`: `@NotBlank(message = "Tên thuốc không được để trống")`, `@Size(max = 250)`
- `unit`: `@NotBlank(message = "Đơn vị tính không được để trống")`
- `costPrice`: `@NotNull`, `@DecimalMin(value = "0.0")`
- `sellingPrice`: `@NotNull`, `@DecimalMin(value = "0.0")`

**Response Thành Công (HTTP 201 Created)**:
```json
{
  "code": 201,
  "message": "Tạo sản phẩm thành công",
  "data": {
    "id": 11,
    "barcode": "8934567890123",
    "name": "Panadol Extra Đỏ (Hộp 15 vỉ x 12 viên)",
    "category": {
      "id": 11,
      "name": "Thuốc Giảm Đau, Hạ Sốt, Kháng Viêm"
    },
    "costPrice": 165000,
    "sellingPrice": 195000,
    "status": 1,
    "createdAt": "2026-11-06T10:15:00"
  }
}
```

**Response Lỗi (HTTP 400 / 409 / 404 / 403)**:
```json
{
  "timestamp": "2026-11-06T10:15:00",
  "status": 409,
  "error": "Conflict",
  "message": "Mã vạch barcode '8934567890123' đã tồn tại trong hệ thống!",
  "path": "/api/v1/products"
}
```

---

## 4. Thiết Kế Giao Diện UI & Trải Nghiệm Người Dùng (Frontend UI/UX)
- **Màn hình Danh sách (List View)**:
  - Thanh tìm kiếm từ khóa linh hoạt (tìm theo tên, mã barcode, hoạt chất).
  - Bộ lọc danh mục (Dropdown chọn nhóm thuốc) và bộ lọc loại thuốc (Kê đơn Rx / Không kê đơn OTC).
  - Bảng dữ liệu hiển thị: Mã thuốc, Tên thuốc, Nhóm, Đơn vị, Giá bán niêm yết, Cờ Rx, Trạng thái hoạt động, Cột thao tác (Sửa/Xóa).
  - Phân trang chuẩn (`page`, `size`, `totalElements`).
- **Modal Thêm / Sửa Sản phẩm (Form Modal)**:
  - Form chia nhóm trực quan: Thông tin cơ bản, Thông tin giá & tồn kho, Phân loại kê đơn & mô tả.
  - Hiển thị thông báo lỗi inline dưới từng ô nhập khi submit không hợp lệ.
  - Xử lý trạng thái nút bấm (Loading spinner khi đang gửi API, ngăn ngừa double-click).
- **Modal Xác Nhận Xóa**:
  - Hộp thoại cảnh báo xác nhận trước khi thực hiện xóa.

---

## 5. Quy Tắc Bảo Mật & RBAC (Role-Based Access Control)
- Endpoint chỉ chấp nhận request có Bearer JWT Token hợp lệ còn thời hạn.
- Kiểm tra quyền hạn chi tiết bằng `@PreAuthorize("hasAuthority('...')")`.
- Ghi nhật ký kiểm toán vào bảng `dbo.audit_logs` khi có hành động tạo mới, cập nhật hoặc xóa sản phẩm.
