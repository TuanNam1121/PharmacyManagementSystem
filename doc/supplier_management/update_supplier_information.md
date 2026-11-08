# Đặc Tả Kỹ Thuật: 3.13.3 Update Supplier Information (Cập Nhật Thông Tin Nhà Cung Cấp)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC59` (SRS 3.13.3)
- **Tên Use Case**: Update Supplier Information (Cập nhật thông tin nhà cung cấp)
- **Tác nhân (Actor)**: `Purchasing Staff` (Nhân viên thu mua)
- **Mô tả nghiệp vụ**: Cho phép Nhân viên thu mua chỉnh sửa và cập nhật hồ sơ của một nhà cung cấp đã tồn tại (Tên, Người liên hệ, SĐT, Email, Địa chỉ, Mã số thuế, Ghi chú). **Mã nhà cung cấp (`code`) là bất biến**, không cho phép sửa.
- **Tiền điều kiện (Preconditions)**:
  - PRE-01: Người dùng đã đăng nhập với vai trò `Purchasing Staff`.
  - PRE-02: Bản ghi nhà cung cấp tồn tại và đang ở trạng thái `ACTIVE`.
- **Trigger**:
  - TRG-01: Người dùng bấm nút **"Chỉnh sửa"** trên màn hình danh sách hoặc nút **"Chỉnh Sửa Nhà Cung Cấp"** trong Modal hồ sơ chi tiết.
- **Hậu điều kiện (Postconditions)**:
  - POS-01: Thông tin nhà cung cấp được cập nhật trong bảng `dbo.suppliers`.
  - POS-02: Thay đổi (giá trị cũ/mới) được ghi vào nhật ký kiểm toán (`audit_logs`).

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Nhân viên thu mua bấm nút **"Chỉnh sửa"** trên dòng nhà cung cấp ở danh sách, hoặc nút **"Chỉnh Sửa Nhà Cung Cấp"** trong Modal Hồ sơ chi tiết (nút chỉ hiện khi NCC đang `ACTIVE`).
2. Hệ thống mở Modal `SupplierCreateModal.jsx` ở chế độ `mode = 'edit'`, **điền sẵn (pre-fill)** dữ liệu hiện tại; trường **Mã nhà cung cấp (`code`) ở trạng thái chỉ đọc (read-only)**.
3. Nhân viên thu mua chỉnh sửa thông tin cần thiết và bấm **"Lưu Thay Đổi" (Save)**.
4. Frontend kiểm tra định dạng phía client (giống UC57; riêng `code` không kiểm tra vì read-only).
5. Frontend gửi yêu cầu `PATCH /api/v1/supplier/{id}` kèm payload `UpdateSupplierRequest`.
6. Backend tiếp nhận và xử lý:
   - Tìm nhà cung cấp theo `id`; nếu không tồn tại → `EntityNotFoundException` (HTTP 404).
   - Nếu nhà cung cấp đang ở trạng thái `INACTIVE` → ném `IllegalArgumentException` *"Supplier is inactive and cannot be updated"* (HTTP 400).
   - Cập nhật các trường `name`, `contactPerson`, `phone`, `email`, `address`, `taxCode`, `note` và lưu lại.
   - Ghi nhật ký kiểm toán và trả thông báo *"Supplier updated successfully"*.
7. Backend trả về HTTP `200 OK` kèm `SupplierResponse` đã cập nhật.
8. Frontend đóng modal, hiển thị *"Cập nhật nhà cung ứng đối tác thành công!"*, nạp lại danh sách và (nếu đang mở) làm mới hồ sơ chi tiết.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **AT1 - Hủy chỉnh sửa**: Tại bước 3, nếu bấm **"Hủy" (Cancel)** → bỏ mọi thay đổi, trở về màn hình trước đó mà không lưu.
- **A1 - Nhà cung cấp đã ngừng hoạt động**: `status = INACTIVE` → chặn cập nhật, HTTP 400 *"Supplier is inactive and cannot be updated"*.
- **A2 - Không tìm thấy nhà cung cấp**: `id` không tồn tại → HTTP 404 *"Supplier not found with id: {id}"*.
- **A3 - Trùng Mã số thuế / Email**: `taxCode` hoặc `email` xung đột với nhà cung cấp khác → HTTP 400.
- **A4 - Sai định dạng**: `taxCode` sai regex hoặc `email` sai định dạng → HTTP 400.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Bất biến Mã nhà cung cấp)**: Trường `code` không được phép thay đổi (read-only; DTO cập nhật không chứa `code`).
- **BR-02 (Duy nhất Mã số thuế)**: `tax_code` phải duy nhất trên toàn bộ nhà cung cấp.
- **BR-03 (Chặn sửa NCC ngừng hoạt động)**: Không thể cập nhật nhà cung cấp đang `INACTIVE`.
- **BR-04 (Nhật ký kiểm toán)**: Ghi lại giá trị cũ và mới vào `audit_logs` kèm `user_id`/`timestamp`.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Modal Chỉnh Sửa (`SupplierCreateModal.jsx`, `mode = 'edit'`)
Dùng chung component với UC57 nhưng ở chế độ chỉnh sửa:
| STT | Field Name | Loại điều khiển | Bắt buộc | Max Length | Mô tả |
| :--: | :--- | :--- | :--: | :--: | :--- |
| 1 | `code` — Mã nhà cung cấp | Text (read-only) | — | 30 | Điền sẵn, khoá, không cho chỉnh sửa |
| 2 | `name` — Tên nhà cung cấp | Text | Có | 250 | Điền sẵn giá trị hiện tại |
| 3 | `taxCode` — Mã số thuế | Text | Theo SRS: Có | 20 | 10 hoặc 13 chữ số |
| 4 | `contactPerson` — Người liên hệ | Text | Không | 150 | — |
| 5 | `phone` — Số điện thoại | Text | Có | 20 | — |
| 6 | `email` — Địa chỉ Email | Email | Không | 150 | Đúng định dạng nếu nhập |
| 7 | `address` — Địa chỉ trụ sở | Text | Không | 500 | — |
| 8 | `note` — Ghi chú mua hàng | Textarea | Không | 1000 | — |
| 9 | Nút Save | Button (Primary) | — | — | Nhãn **"Lưu Thay Đổi"** |
| 10 | Nút Cancel | Button (Secondary) | — | — | Nhãn **"Hủy"** |

> **Hành vi UI**: Khi `submitting`, nút Submit đổi nhãn *"Đang lưu…"* và bị khoá. Thành công → hook `useSuppliers.handleUpdate` đặt thông báo *"Supplier partner updated successfully!"* và gọi `fetchList()` + `fetchDetail(id)`.

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract
- **Endpoint**: `PATCH /api/v1/supplier/{id}`
- **Handler**: `SupplierController.updateSupplierInformation(@PathVariable Long id, @RequestBody UpdateSupplierRequest request)`
- **Mức độ truy cập**: `Purchasing Staff`
- **Mã phản hồi**: HTTP `200 OK`

#### Request Payload:
```json
{
  "name": "Công ty Cổ phần Dược Hậu Giang",
  "contactPerson": "Nguyễn Văn An",
  "phone": "02923891234",
  "email": "orders@dhgpharma.com.vn",
  "address": "288 Bis Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ",
  "taxCode": "1800156123",
  "note": "Điều khoản thanh toán Net 45."
}
```

#### Response Payload (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Supplier updated successfully",
  "data": {
    "id": 21,
    "code": "SUP-DHG",
    "name": "Công ty Cổ phần Dược Hậu Giang",
    "contactPerson": "Nguyễn Văn An",
    "phone": "02923891234",
    "email": "orders@dhgpharma.com.vn",
    "address": "288 Bis Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ",
    "taxCode": "1800156123",
    "note": "Điều khoản thanh toán Net 45.",
    "status": "ACTIVE"
  }
}
```

#### Response lỗi:
| Trường hợp | HTTP | Message |
| :--- | :--: | :--- |
| Không tìm thấy NCC | 404 | `Supplier not found with id: {id}` |
| NCC đã `INACTIVE` | 400 | `Supplier is inactive and cannot be updated` |
| Sai định dạng | 400 | `Tax code must be 10 or 13 digits` / `Invalid email format` |
| Thiếu trường bắt buộc | 400 | `Supplier name is required` / `Phone number is required` |

### 4.2. Khai Báo DTO Java (`UpdateSupplierRequest`)
> Là Java `record` **không chứa trường `code`** → đảm bảo Mã NCC bất biến ở tầng dữ liệu.

```java
package com.pharmacy.dto.supplier;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record UpdateSupplierRequest(
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
}
```

### 4.3. Thuật Toán Service Layer (`SupplierServiceImpl.updateSupplierInformation`)
```java
@Transactional
@Override
public SupplierResponse updateSupplierInformation(Long id, UpdateSupplierRequest request) {
    if (id == null) {
        throw new IllegalArgumentException("Invalid request to update supplier");
    }

    Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + id));

    if (SupplierStatus.INACTIVE.equals(supplier.getStatus())) {
        throw new IllegalArgumentException("Supplier is inactive and cannot be updated");
    }

    supplier.setName(request.name());
    supplier.setContactPerson(request.contactPerson());
    supplier.setPhone(request.phone());
    supplier.setEmail(request.email());
    supplier.setAddress(request.address());
    supplier.setTaxCode(request.taxCode());
    supplier.setNote(request.note());

    Supplier updatedSupplier = supplierRepository.save(supplier);
    return SupplierResponse.fromEntityToUpdate(updatedSupplier);
}
```

### 4.4. Ghi Chú Lệch Chuẩn SRS ↔ Mã Nguồn
| # | SRS 3.13.3 quy định | Mã nguồn hiện tại | Khuyến nghị |
| :--: | :--- | :--- | :--- |
| 1 | `code` không được thay đổi | DTO cập nhật không có `code` → đã đảm bảo | OK |
| 2 | Tax Code/Email duy nhất | Chưa có `existsByTaxCode`/kiểm tra trùng ở tầng Service | Bổ sung kiểm tra duy nhất |
| 3 | Ghi nhật ký kiểm toán (old/new) | `updateSupplierInformation` **chưa** gọi `auditLogService.log(...)` | Bổ sung ghi `audit_logs` |
| 4 | — | Còn 2 dòng `System.out.println("DEBUG - ...")` sót lại trong service | **Xoá** trước khi lên production |

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-USU-01** | Cập nhật thành công | Payload hợp lệ, NCC `ACTIVE` | HTTP 200, các trường được ghi nhận |
| **TC-USU-02** | Cập nhật NCC đã ngừng hoạt động | NCC `INACTIVE` | HTTP 400 "Supplier is inactive and cannot be updated" |
| **TC-USU-03** | Không tìm thấy NCC | `id = 999` | HTTP 404 "Supplier not found with id: 999" |
| **TC-USU-04** | Sai định dạng MST | `taxCode = "ABC123"` | HTTP 400 "Tax code must be 10 or 13 digits" |
| **TC-USU-05** | Sai định dạng email | `email = "abc@@"` | HTTP 400 "Invalid email format" |
| **TC-USU-06** | Bỏ trống tên | `name = ""` | HTTP 400 "Supplier name is required" |
| **TC-USU-07** | Mã NCC không đổi | Gửi payload không có `code` | `code` giữ nguyên sau khi cập nhật |

