# Đặc Tả Kỹ Thuật: 3.13.1 Create Supplier (Đăng Ký Nhà Cung Cấp Mới)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC57` (SRS 3.13.1)
- **Tên Use Case**: Create Supplier (Đăng ký nhà cung cấp mới)
- **Tác nhân (Actor)**: `Purchasing Staff` (Nhân viên thu mua)
- **Mô tả nghiệp vụ**: Cho phép Nhân viên thu mua đăng ký một nhà cung cấp dược phẩm mới đã được công ty phê duyệt hợp tác vào hệ thống. Hồ sơ lưu trữ thông tin pháp lý (Tên, Mã số thuế), thông tin liên hệ (Người liên hệ, SĐT, Email, Địa chỉ trụ sở) và ghi chú mua hàng/công nợ, làm cơ sở để đưa nhà cung cấp này vào danh sách lựa chọn cho các phiếu yêu cầu báo giá (RFQ).
- **Tiền điều kiện (Preconditions)**:
  - PRE-01: Người dùng đã đăng nhập với vai trò `Purchasing Staff` (Nhân viên thu mua).
  - PRE-02: Nhà cung cấp đã được công ty phê duyệt chủ trương hợp tác.
- **Hậu điều kiện (Postconditions)**:
  - POS-01: Một bản ghi nhà cung cấp mới được tạo trong bảng `dbo.suppliers` với trạng thái `ACTIVE` (`status = 1`).
  - POS-02: Hành động được ghi nhận vào nhật ký kiểm toán (`audit_logs`).
  - POS-03: Nhà cung cấp mới xuất hiện trong danh sách và có thể được chọn cho các RFQ.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Nhân viên thu mua bấm nút **"Thêm Nhà Cung Cấp" (Add Supplier)** trên thanh công cụ danh sách (`SupplierFilters.jsx`).
2. Hệ thống hiển thị Modal đăng ký nhà cung cấp (`SupplierCreateModal.jsx`, `mode = 'create'`) gồm hai khối thông tin:
   - **Khối 1 — Thông tin doanh nghiệp**: Mã nhà cung cấp (`code`), Tên nhà cung cấp (`name`), Mã số thuế (`taxCode`), Người liên hệ (`contactPerson`).
   - **Khối 2 — Thông tin liên hệ & địa chỉ trụ sở**: Số điện thoại (`phone`), Email (`email`), Địa chỉ (`address`), Ghi chú mua hàng & công nợ (`note`).
3. Nhân viên thu mua điền thông tin bắt buộc và bấm **"Thêm Nhà Cung Cấp" (Save)**.
4. Frontend thực hiện kiểm tra định dạng phía client (xem mục 3.2).
5. Frontend gửi yêu cầu `POST /api/v1/supplier` kèm payload `CreateSupplierRequest`.
6. Backend tiếp nhận và xử lý:
   - Kiểm tra hợp lệ bắt buộc các trường (`@NotBlank`, `@Email`, `@Pattern`) — nếu vi phạm trả về HTTP 400.
   - Ánh xạ payload sang entity `Supplier` qua `CreateSupplierRequest.toEntity()`; trạng thái mặc định là `SupplierStatus.ACTIVE`.
   - Lưu bản ghi vào bảng `dbo.suppliers` (`supplierRepository.save(supplier)`).
   - Ghi nhật ký kiểm toán (`audit_logs`) và trả thông báo *"Supplier created successfully"*.
7. Backend trả về HTTP `201 Created` kèm `SupplierResponse` (tối thiểu `id`, `code`).
8. Frontend đóng modal, hiển thị thông báo *"Đăng ký nhà cung ứng đối tác thành công!"* và nạp lại danh sách; nhà cung cấp mới sẵn sàng để chọn trong các RFQ.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **AT1 - Hủy đăng ký**: Tại bước 3, nếu Nhân viên thu mua bấm nút **"Hủy" (Cancel)**:
  - 3.1 - Hệ thống xóa dữ liệu đã nhập và đóng modal, trở về màn hình Danh sách nhà cung cấp mà không lưu.
- **A1 - Trùng Mã số thuế**: Nếu `taxCode` đã tồn tại ở một nhà cung cấp khác (kể cả đã ngừng hoạt động) → Backend từ chối, thông báo lỗi nghiệp vụ, không tạo bản ghi.
- **A2 - Sai định dạng Mã số thuế**: `taxCode` không khớp regex `^$|^[0-9]{10}(-[0-9]{3})?$` → lỗi HTTP 400 *"Tax code must be 10 or 13 digits"*.
- **A3 - Sai định dạng Email**: `email` không đúng định dạng → lỗi HTTP 400 *"Invalid email format"*.
- **A4 - Thiếu trường bắt buộc**: `code`, `name` hoặc `phone` để trống → lỗi HTTP 400 tương ứng.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Bắt buộc theo SRS)**: Các trường bắt buộc: Tên nhà cung cấp, Mã số thuế, Người liên hệ, Số điện thoại, Email, Địa chỉ. Email và SĐT phải đúng định dạng.
- **BR-02 (Duy nhất Mã số thuế)**: `tax_code` phải duy nhất trên toàn bộ nhà cung cấp (bao gồm cả nhà cung cấp đã ngừng hoạt động).
- **BR-03 (Trạng thái khởi tạo)**: Nhà cung cấp mới luôn được tạo với trạng thái `ACTIVE`.
- **BR-04 (Nhật ký kiểm toán)**: Mọi thao tác tạo mới phải ghi một bản ghi `audit_logs` kèm `user_id` và `timestamp`.

> ⚠️ **Ghi chú lệch chuẩn SRS ↔ mã nguồn** (xem mục 4.4): SRS quy định Người liên hệ / Email / Địa chỉ là **bắt buộc**, nhưng DTO thực tế chỉ ràng buộc `code`, `name`, `phone`.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Bảng Định Nghĩa Các Trường Trong Form Đăng Ký (`SupplierCreateModal.jsx`)
| STT | Field Name | Loại điều khiển | Bắt buộc | Max Length | Mô tả & Placeholder |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | `code` — Mã nhà cung cấp | Text | Có (chỉ ở mode create) | 30 | Mã định danh NCC. Placeholder: `VD: SUP-DHG` |
| 2 | `name` — Tên nhà cung cấp | Text | Có | 250 | Tên đăng ký của nhà cung cấp |
| 3 | `taxCode` — Mã số thuế | Text | Theo SRS: Có | 20 | Chỉ chấp nhận 10 hoặc 13 chữ số (VD: `0101234567`) |
| 4 | `contactPerson` — Người liên hệ | Text | Theo SRS: Có | 150 | Placeholder: `VD: Nguyễn Văn An` |
| 5 | `phone` — Số điện thoại | Text | Có | 20 | Placeholder: `VD: 024 3822 1234` |
| 6 | `email` — Địa chỉ Email | Email | Theo SRS: Có | 150 | Placeholder: `VD: orders@duocpham.vn` |
| 7 | `address` — Địa chỉ trụ sở | Text | Theo SRS: Có | 500 | Placeholder: `VD: Số 298 Kim Mã, Ba Đình, Hà Nội` |
| 8 | `note` — Ghi chú mua hàng & công nợ | Textarea | Không | 1000 | Điều khoản thanh toán, chiết khấu thương mại, thời gian giao hàng |
| 9 | Nút Save | Button (Primary) | — | — | Nhãn: **"Thêm Nhà Cung Cấp"** |
| 10 | Nút Cancel | Button (Secondary) | — | — | Nhãn: **"Hủy"** — đóng modal, không lưu |

### 3.2. Quy Tắc Kiểm Tra Phía Client (Client-side Validation — `SupplierCreateModal.validate`)
| Trường | Điều kiện | Thông báo lỗi hiển thị |
| :--- | :--- | :--- |
| `code` | Không được rỗng (chỉ áp dụng khi tạo mới) | *"Mã nhà cung cấp là bắt buộc"* |
| `name` | Không được rỗng | *"Tên nhà cung cấp là bắt buộc"* |
| `phone` | Không được rỗng | *"Số điện thoại là bắt buộc"* |
| `email` | Nếu có nhập: khớp regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | *"Vui lòng nhập địa chỉ email hợp lệ"* |
| `taxCode` | Nếu có nhập: khớp regex `/^[0-9]{10}(-[0-9]{3})?$/` | *"Mã số thuế phải gồm 10 hoặc 13 chữ số (ví dụ: 0101234567)"* |

> **Hành vi UI**: Form chia 2 Section có tiêu đề in hoa màu thương hiệu; input áp chuẩn `pms-input pms-input-bare` (bo góc 8px, cao 38px); lỗi hiển thị đỏ ngay dưới ô; khi đang lưu nút Submit chuyển sang nhãn *"Đang lưu…"* và bị khóa (`disabled`).

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract
- **Endpoint**: `POST /api/v1/supplier`
- **Handler**: `SupplierController.createSupplier(@RequestBody CreateSupplierRequest request)`
- **Mức độ truy cập**: `Purchasing Staff`
- **Mã phản hồi**: HTTP `201 Created`

#### Request Payload:
```json
{
  "code": "SUP-DHG",
  "name": "Công ty Cổ phần Dược Hậu Giang",
  "contactPerson": "Nguyễn Văn An",
  "phone": "02923891234",
  "email": "orders@dhgpharma.com.vn",
  "address": "288 Bis Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ",
  "taxCode": "1800156123",
  "note": "Điều khoản thanh toán Net 30, chiết khấu 5%."
}
```

#### Response Payload (HTTP 201 Created):
```json
{
  "status": 201,
  "message": "Supplier created successfully",
  "data": {
    "id": 21,
    "code": "SUP-DHG"
  },
  "timestamp": "2026-11-08T09:15:00"
}
```

### 4.2. Khai Báo DTO Java (`CreateSupplierRequest`)
> Là Java `record` có gắn Bean Validation; có factory `toEntity()` chuyển thẳng sang entity `Supplier`.

```java
package com.pharmacy.dto.supplier;

import com.pharmacy.entity.Supplier;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record CreateSupplierRequest(
    @NotBlank(message = "Supplier code is required")
    String code,
    @NotBlank(message = "Supplier name is required")
    String name,
    String contactPerson,
    @NotBlank(message = "Phone number is required")
    String phone,
    @Email(message = "Invalid email format")
    String email,
    String address,
    @Pattern(regexp = "^$|^[0-9]{10}(-[0-9]{3})?$", message = "Tax code must be 10 or 13 digits")
    String taxCode,
    @Size(max = 1000, message = "Note cannot exceed 1000 characters")
    String note
) {
    public Supplier toEntity() {
        return Supplier.builder()
                .code(this.code)
                .name(this.name)
                .contactPerson(this.contactPerson)
                .phone(this.phone)
                .email(this.email)
                .address(this.address)
                .taxCode(this.taxCode)
                .note(this.note)
                .build();
    }
}
```

### 4.3. Thuật Toán Service Layer (`SupplierServiceImpl.createSupplier`)
```java
@Transactional
@Override
public SupplierResponse createSupplier(CreateSupplierRequest request) {
    if (request == null) {
        throw new IllegalArgumentException("Invalid request to create supplier");
    }
    Supplier supplier = request.toEntity();          // status mặc định ACTIVE (Supplier.@Builder.Default)
    Supplier savedSupplier = supplierRepository.save(supplier);
    return SupplierResponse.fromEntityToCreate(savedSupplier); // trả về id + code
}
```
> **Trạng thái mặc định**: Entity `Supplier` khai báo `@Builder.Default private SupplierStatus status = SupplierStatus.ACTIVE;` → bản ghi mới luôn `ACTIVE` nếu không truyền trạng thái.

### 4.4. Ghi Chú Lệch Chuẩn SRS ↔ Mã Nguồn
| # | SRS 3.13.1 quy định | Mã nguồn hiện tại | Khuyến nghị |
| :--: | :--- | :--- | :--- |
| 1 | Bắt buộc nhập Contact Person / Email / Address | `CreateSupplierRequest` chỉ `@NotBlank` cho `code`, `name`, `phone`; `contactPerson`, `email`, `address` để tự do | Bổ sung `@NotBlank` nếu muốn bám sát SRS |
| 2 | Trường "Payment Terms" và "Product Categories/Catalog" là trường riêng | Chưa có cột riêng; nội dung mua hàng gộp vào `note` | Cân nhắc thêm cột hoặc giữ trong `note` |
| 3 | Trạng thái chỉ có Active/Inactive | Enum `SupplierStatus` có thêm `PENDING = 3` | Ghi nhận `PENDING` dùng cho luồng chờ duyệt NCC |
| 4 | Chống trùng Mã số thuế | Repository chưa có `existsByTaxCode`; hiện chỉ `code` là duy nhất theo thiết kế merge key | Cần bổ sung kiểm tra duy nhất `tax_code` ở tầng Service |
| 5 | Ghi nhật ký kiểm toán | `createSupplier` **chưa** gọi `auditLogService.log(...)` | Bổ sung ghi `audit_logs` để đủ POS-02 |

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-CSU-01** | Đăng ký thành công đầy đủ | Payload hợp lệ, MST 10 số, email đúng định dạng | HTTP 201, bản ghi mới `status = ACTIVE`, có `code` |
| **TC-CSU-02** | Thiếu tên nhà cung cấp | `name`: `""` | HTTP 400 "Supplier name is required" |
| **TC-CSU-03** | Thiếu số điện thoại | `phone`: `null` | HTTP 400 "Phone number is required" |
| **TC-CSU-04** | Sai định dạng Mã số thuế | `taxCode`: `"ABC123"` | HTTP 400 "Tax code must be 10 or 13 digits" |
| **TC-CSU-05** | Sai định dạng email | `email`: `"abc@@"` | HTTP 400 "Invalid email format" |
| **TC-CSU-06** | Ghi chú vượt 1000 ký tự | `note`: 1001 ký tự | HTTP 400 "Note cannot exceed 1000 characters" |
| **TC-CSU-07** | Hủy đăng ký (AT1) | Bấm nút "Hủy" | Đóng modal, không tạo bản ghi nào |
| **TC-CSU-08** | Trạng thái mặc định | Payload không truyền `status` | Bản ghi lưu với `status = ACTIVE` |

