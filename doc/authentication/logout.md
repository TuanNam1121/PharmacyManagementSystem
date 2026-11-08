# Đặc Tả Kỹ Thuật: 3.2.2 Logout (Đăng Xuất Hệ Thống)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC02` (SRS 3.2.2)
- **Tên Use Case**: Logout (Đăng xuất)
- **Tác nhân (Actor)**: `ALL` (Bất kỳ người dùng nào đang đăng nhập trong hệ thống)
- **Mô tả nghiệp vụ**: Cho phép người dùng chủ động kết thúc phiên làm việc hiện tại, vô hiệu hóa quyền truy cập và đảm bảo an toàn dữ liệu trên thiết bị trước khi rời khỏi máy làm việc.
- **Tiền điều kiện (Preconditions)**:
  - Người dùng đang trong trạng thái đăng nhập và sở hữu JWT Token hợp lệ.
- **Hậu điều kiện (Postconditions)**:
  - Phiên làm việc phía client bị hủy bỏ (xóa token khỏi storage).
  - Backend ghi nhận nhật ký đăng xuất vào `audit_logs`.
  - Trình duyệt chuyển hướng người dùng về màn hình `/login`.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Người dùng bấm vào menu hồ sơ hoặc avatar ở góc phải trên cùng của giao diện.
2. Người dùng chọn mục **"Đăng xuất" (Logout)**.
3. Hệ thống hiển thị hộp thoại xác nhận: *"Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"*.
4. Người dùng bấm **"Xác nhận"**.
5. Frontend gửi request `POST /api/v1/auth/logout` kèm Header `Authorization: Bearer <token>`.
6. Backend tiếp nhận request:
   - Trích xuất thông tin người dùng từ SecurityContext.
   - Ghi nhật ký kiểm toán vào bảng `audit_logs` (`action_code = 'LOGOUT'`, `module_name = 'AUTH'`).
   - hủy refreshToken tương ứng.
   - Trả về HTTP `200 OK`.
7. Frontend xóa sạch `accessToken`, `user` khỏi `localStorage` và `sessionStorage`.
8. Frontend reset toàn bộ trạng thái trong `AuthContext`.
9. Trình duyệt chuyển hướng người dùng về màn hình `/login` kèm thông báo: *"Đăng xuất thành công"*.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **A1 - Hủy bỏ đăng xuất**: Người dùng bấm "Hủy" trên hộp thoại xác nhận -> Đóng popup và tiếp tục phiên làm việc bình thường.
- **A2 - Mất kết nối mạng**: Nếu request gửi lên server bị timeout hoặc lỗi mạng, Frontend vẫn chủ động dọn dẹp bộ nhớ cục bộ (Clear Local Storage) và điều hướng về trang `/login` để bảo vệ tài khoản của người dùng trên thiết bị hiện tại.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Dọn sạch bộ nhớ đệm)**: Mọi dữ liệu tạm thời như giỏ hàng chưa lưu, thông tin ca chưa chốt trên trình duyệt phải được cảnh báo trước khi đăng xuất nếu người dùng là Thu ngân/Dược sĩ đang mở ca.
- **BR-02 (Audit Trail)**: Ghi lại thời điểm đăng xuất chính xác cùng địa chỉ IP để đối soát bảo mật.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)
- Vị trí: Dropdown menu tại Header góc phải.
- Modal xác nhận:
  - Tiêu đề: "Xác nhận đăng xuất"
  - Nội dung: "Bạn có chắc chắn muốn kết thúc phiên làm việc?"
  - Nút "Hủy bỏ" (`secondary`), Nút "Đăng xuất" (`danger`).

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract
- **Endpoint**: `POST /api/v1/auth/logout`
- **Mức độ truy cập**: Authenticated (`ALL`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`

#### Request Payload:
Không yêu cầu Request Body (trống).

#### Response Payload (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Đăng xuất thành công",
  "data": null
}
```

### 4.2. Triển Khai Tại Backend Service
```java
@Transactional
public void logout(String authHeader, String clientIp) {
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String token = authHeader.substring(7);
        Long accountId = jwtTokenProvider.getAccountIdFromToken(token);
        
        // Ghi nhận nhật ký kiểm toán
        auditLogService.log("AUTH", "LOGOUT", accountId, clientIp, "Người dùng đã đăng xuất");
    }
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Thao tác | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-OUT-01** | Đăng xuất thông thường | Bấm Logout -> Xác nhận trên modal | Token bị xóa, chuyển hướng về /login |
| **TC-OUT-02** | Hủy xác nhận đăng xuất | Bấm Logout -> Bấm "Hủy bỏ" | Modal đóng lại, người dùng tiếp tục ở trang hiện tại |
| **TC-OUT-03** | Truy cập trang được bảo vệ sau khi logout | Sử dụng nút Back trình duyệt sau khi đăng xuất | Hệ thống chặn và tự động đẩy về /login |

