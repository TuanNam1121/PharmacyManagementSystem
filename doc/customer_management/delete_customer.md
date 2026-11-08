# Đặc Tả Kỹ Thuật: 3.8.5 Delete Customer (Vô Hiệu Hóa / Xóa Khách Hàng)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC31` (SRS 3.8.5)
- **Tên Use Case**: Delete Customer (Xóa / Vô hiệu hóa khách hàng)
- **Tác nhân (Actor)**: `Store Manager` (Quản lý cửa hàng), `Admin` (Quản trị viên)
- **Mô tả nghiệp vụ**: Cho phép cấp quản lý thực hiện xóa hoặc vô hiệu hóa hồ sơ khách hàng khi tài khoản bị trùng lặp, thông tin ảo hoặc khách hàng có yêu cầu chấm dứt lưu trữ dữ liệu cá nhân theo quy định. Để đảm bảo toàn vẹn dữ liệu hóa đơn tài chính và quy định y tế, hệ thống áp dụng cơ chế **Xóa mềm (Soft Delete)**: chuyển trạng thái khách hàng sang ngừng hoạt động (`status = 0`), khóa không cho phép phát sinh đơn hàng mới nhưng vẫn bảo lưu toàn bộ hóa đơn lịch sử cũ.
- **Tiền điều kiện (Preconditions)**:
  - Khách hàng tồn tại trong hệ thống.
  - Người dùng đăng nhập có vai trò `ROLE_STORE_MANAGER` hoặc `ROLE_ADMIN`.
- **Hậu điều kiện (Postconditions)**:
  - Trạng thái khách hàng được cập nhật thành `status = 0` (Inactive).
  - Khách hàng này sẽ không xuất hiện trong danh sách gợi ý tìm kiếm tại quầy bán hàng POS.
  - Ghi nhận lịch sử xóa vào bảng `dbo.audit_logs`.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Tại màn hình danh sách khách hàng (`/customers`), Quản lý bấm vào nút **"Xóa" (icon thùng rác màu đỏ)** tại dòng khách hàng tương ứng.
2. Hệ thống hiển thị Modal xác nhận **"Xác Nhận Vô Hiệu Hóa Khách Hàng"**:
   - Hiển thị thông tin tóm tắt: Tên khách hàng, Số điện thoại, Mã khách hàng, Tổng số đơn hàng đã mua.
   - Hiển thị thông điệp cảnh báo: *"Hành động này sẽ vô hiệu hóa tài khoản khách hàng. Toàn bộ lịch sử hóa đơn cũ vẫn được bảo lưu cho mục đích kế toán và kiểm toán"*.
   - Ô nhập: **Lý do xóa / vô hiệu hóa** (Bắt buộc).
3. Quản lý nhập lý do và bấm nút **"Xác nhận Xóa" (Confirm Deactivate)**.
4. Frontend gửi yêu cầu `DELETE /api/v1/customers/{id}?reason=...` lên Backend.
5. Backend tiếp nhận yêu cầu:
   - Kiểm tra quyền hạn vai trò (Role-based access control: chỉ `Store Manager` hoặc `Admin`).
   - Kiểm tra khách hàng trong bảng `dbo.customers`: nếu không tồn tại -> ném lỗi `ResourceNotFoundException`.
   - Cập nhật trường `status = 0` và `updated_at = NOW()`.
   - Lưu vào cơ sở dữ liệu.
   - Ghi nhận nhật ký kiểm toán vào `dbo.audit_logs` (`action_code = 'DELETE_CUSTOMER'`, kèm lý do xóa).
6. Backend trả về HTTP `200 OK`.
7. Frontend đóng modal, cập nhật lại trạng thái dòng trên bảng danh sách sang nhãn màu xám: **"Ngừng hoạt động"** và hiển thị thông báo thành công: *"Đã vô hiệu hóa khách hàng thành công!"*.

### 2.2. Luồng khôi phục tài khoản (Reactivate Flow)
- Trường hợp khách hàng quay lại mua sắm sau khi đã bị vô hiệu hóa:
1. Quản lý có thể lọc danh sách theo `Trạng thái: Ngừng hoạt động`.
2. Bấm vào nút **"Kích hoạt lại" (Reactivate - icon mũi tên xoay vòng)**.
3. Hệ thống gọi API `PATCH /api/v1/customers/{id}/reactivate` để khôi phục `status = 1`.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Nghiêm cấm Xóa cứng - Hard Delete)**: Khách hàng đã từng phát sinh ít nhất một hóa đơn bán lẻ (`SalesInvoice`) tuyệt đối KHÔNG được xóa cứng (DELETE FROM `customers`) ra khỏi cơ sở dữ liệu vì sẽ làm vi phạm ràng buộc khóa ngoại (Foreign Key Integrity) và vi phạm luật lưu trữ chứng từ kế toán 10 năm của Nhà nước.
- **BR-02 (Quyền hạn thực hiện)**: Dược sĩ hoặc Thu ngân thông thường KHÔNG có quyền xóa khách hàng. Nút xóa bị ẩn hoặc vô hiệu hóa đối với các tài khoản không có quyền hạn.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Modal Xác Nhận Xóa (`CustomerDeleteModal.jsx`)
| STT | Thành phần giao diện | Loại điều khiển | Chi tiết |
| :---: | :--- | :--- | :--- |
| 1 | Tiêu đề | Header (Warning Red) | "Vô hiệu hóa tài khoản khách hàng" |
| 2 | Thông tin đối tượng | Callout Card | Mã KH, Tên khách hàng, SĐT, Số đơn đã mua |
| 3 | Cảnh báo | Alert Box | Lưu ý về việc chuyển trạng thái thay vì xóa vĩnh viễn |
| 4 | `reason` | Text Area (Bắt buộc) | Lý do xóa (VD: "Khách hàng yêu cầu xóa thông tin") |
| 5 | Nút `Confirm` | Button (Danger Red) | "Xác nhận vô hiệu hóa" |
| 6 | Nút `Cancel` | Button (Secondary) | "Hủy bỏ" |

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract

#### A. Vô hiệu hóa (Xóa mềm) khách hàng:
- **Endpoint**: `DELETE /api/v1/customers/{id}`
- **Mức độ truy cập**: `ROLE_STORE_MANAGER`, `ROLE_ADMIN`
- **Query Params**: `reason` (String, mandatory)

#### Response Payload (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Vô hiệu hóa khách hàng thành công",
  "data": {
    "customerId": 105,
    "customerCode": "KH-20261104-0025",
    "status": 0,
    "updatedAt": "2026-11-04T11:00:00"
  }
}
```

#### B. Kích hoạt lại khách hàng:
- **Endpoint**: `PATCH /api/v1/customers/{id}/reactivate`
- **Mức độ truy cập**: `ROLE_STORE_MANAGER`, `ROLE_ADMIN`
- **Response Payload (HTTP 200 OK)**:
```json
{
  "status": 200,
  "message": "Kích hoạt lại khách hàng thành công",
  "data": {
    "customerId": 105,
    "status": 1
  }
}
```

### 4.2. Thuật Toán Service Layer (`CustomerServiceImpl.deleteCustomer`)
```java
@Transactional(rollbackFor = Exception.class)
public void deleteCustomer(Long customerId, String reason, Long accountId, String clientIp) {
    Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Khách hàng không tồn tại"));

    if (customer.getStatus() == 0) {
        throw new IllegalStateException("Khách hàng này đã ở trạng thái ngừng hoạt động");
    }

    // Xóa mềm: cập nhật status = 0
    customer.setStatus((short) 0);
    customer.setUpdatedAt(LocalDateTime.now());
    customerRepository.save(customer);

    // Ghi Audit Log chi tiết lý do
    auditLogService.log("CUSTOMER", "DELETE_CUSTOMER", accountId, clientIp, 
        "Vô hiệu hóa khách hàng #" + customer.getCustomerCode() + " (" + customer.getFullName() + ") - Lý do: " + reason);
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Điều kiện thực hiện | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-DEL-01** | Xóa mềm khách hàng có hóa đơn | Quản lý xác nhận xóa kèm lý do | Khách hàng chuyển `status = 0`, hóa đơn cũ vẫn nguyên vẹn |
| **TC-DEL-02** | Xóa nhưng không nhập lý do | Bỏ trống ô `reason` | Bị chặn lại, yêu cầu nhập lý do xóa |
| **TC-DEL-03** | Dược sĩ cố tình gọi API xóa | Token có role `ROLE_PHARMACIST` | Trả về HTTP 403 Forbidden "Không đủ quyền thực hiện" |
| **TC-DEL-04** | Xóa khách hàng đã bị vô hiệu hóa trước đó | Khách hàng có `status = 0` | Báo lỗi HTTP 400 "Khách hàng này đã ngừng hoạt động" |
| **TC-DEL-05** | Kích hoạt lại khách hàng đã xóa | Quản lý gọi API reactivate | Khách hàng chuyển lại `status = 1`, tìm kiếm lại được tại POS |
