# Đặc Tả Kỹ Thuật: 3.2.3 Change Password (Đổi Mật Khẩu)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC03` (SRS 3.2.3)
- **Tên Use Case**: Change Password (Đổi mật khẩu)
- **Tác nhân (Actor)**: `ALL` (Người dùng có tài khoản đang đăng nhập trong hệ thống)
- **Mô tả nghiệp vụ**: Cho phép người dùng chủ động cập nhật mật khẩu đăng nhập mới nhằm bảo đảm tính an toàn cho tài khoản cá nhân.
- **Tiền điều kiện (Preconditions)**:
  - Người dùng đã đăng nhập thành công vào hệ thống.
- **Hậu điều kiện (Postconditions)**:
  - Mật khẩu mới được mã hóa BCrypt và cập nhật vào trường `password_hash` của bảng `dbo.accounts`.
  - Ghi nhận nhật ký thay đổi mật khẩu vào `audit_logs`.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Người dùng chọn mục "Đổi mật khẩu" từ menu tài khoản hoặc trong trang Hồ sơ cá nhân.
2. Hệ thống hiển thị Modal hoặc Form Đổi mật khẩu.
3. Người dùng nhập:
   - Mật khẩu hiện tại (`currentPassword`).
   - Mật khẩu mới (`newPassword`).
   - Xác nhận mật khẩu mới (`confirmPassword`).
4. Người dùng bấm nút **"Lưu thay đổi" (Save)**.
5. Frontend kiểm tra ràng buộc dữ liệu:
   - Các trường không được để trống.
   - Mật khẩu mới và Xác nhận mật khẩu phải trùng khớp 100%.
   - Mật khẩu mới phải khác mật khẩu hiện tại.
   - Mật khẩu mới phải thỏa mãn độ mạnh: tối thiểu 8 ký tự, có chứa chữ hoa, chữ thường, số và ký tự đặc biệt.
6. Frontend gửi yêu cầu `POST /api/v1/auth/change-password`.
7. Backend kiểm tra:
   - Xác thực người dùng hiện tại từ SecurityContext.
   - Kiểm tra `currentPassword` có khớp với `password_hash` trong DB hay không.
   - Kiểm tra mật khẩu mới không được trùng với mật khẩu hiện tại.
8. Backend mã hóa mật khẩu mới bằng `BCryptPasswordEncoder` và cập nhật trường `password_hash` cùng `updated_at`.
9. Backend ghi nhật ký `audit_logs` (`action_code = 'CHANGE_PASSWORD'`).
10. Backend trả về HTTP `200 OK`.
11. Frontend hiển thị thông báo thành công: *"Đổi mật khẩu thành công!"* và tự động đóng modal.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **A1 - Sai mật khẩu hiện tại**: Backend trả về HTTP `400 Bad Request` với message *"Mật khẩu hiện tại không chính xác"*.
- **A2 - Mật khẩu mới trùng mật khẩu cũ**: Backend trả về HTTP `400 Bad Request` với message *"Mật khẩu mới không được trùng với mật khẩu cũ"*.
- **A3 - Xác nhận mật khẩu không khớp**: Frontend chặn ngay tại client với cảnh báo *"Xác nhận mật khẩu mới không khớp"*.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Độ phức tạp mật khẩu)**: Mật khẩu mới phải có tối thiểu 8 ký tự, tối đa 32 ký tự, bao gồm ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt (`^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,32}$`).
- **BR-02 (Không tái sử dụng mật khẩu cũ)**: Không cho phép đổi thành chính mật khẩu đang sử dụng.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Bảng Định Nghĩa Các Trường Form
| STT | Tên trường | Control Type | Bắt buộc | Max Length | Ràng buộc & Gợi ý |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | `currentPassword` | Password Box | Có | 32 | Mật khẩu đang sử dụng |
| 2 | `newPassword` | Password Box + Thanh đo độ mạnh | Có | 32 | Tối thiểu 8 ký tự, đủ chữ hoa/thường/số/ký tự đặc biệt |
| 3 | `confirmPassword` | Password Box | Có | 32 | Phải khớp hoàn toàn với `newPassword` |
| 4 | Nút `Save` | Button (Primary) | - | - | Submit dữ liệu |
| 5 | Nút `Cancel` | Button (Secondary) | - | - | Đóng form/modal |

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract
- **Endpoint**: `POST /api/v1/auth/change-password`
- **Mức độ truy cập**: Authenticated (`ALL`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`

#### Request Payload:
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@456",
  "confirmPassword": "NewPassword@456"
}
```

#### Response Payload (Thành công - HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Đổi mật khẩu thành công",
  "data": null
}
```

#### Response Payload (Lỗi - HTTP 400 Bad Request):
```json
{
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Mật khẩu hiện tại không chính xác",
  "timestamp": "2026-11-04T08:00:00"
}
```

### 4.2. Khai Báo DTO Java
```java
package com.pharmacy.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank(message = "Vui lòng nhập mật khẩu hiện tại")
    private String currentPassword;

    @NotBlank(message = "Vui lòng nhập mật khẩu mới")
    @Size(min = 8, max = 32, message = "Mật khẩu mới phải từ 8 đến 32 ký tự")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,32}$",
        message = "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
    )
    private String newPassword;

    @NotBlank(message = "Vui lòng xác nhận mật khẩu mới")
    private String confirmPassword;
}
```

### 4.3. Thuật Toán Service Layer (`ProfileServiceImpl.changePassword`)
```java
@Transactional
public void changePassword(Long accountId, ChangePasswordRequest request, String clientIp) {
    // 1. Kiểm tra xác nhận mật khẩu
    if (!request.getNewPassword().equals(request.getConfirmPassword())) {
        throw new IllegalArgumentException("Mật khẩu xác nhận không khớp");
    }

    Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));

    // 2. So khớp mật khẩu cũ
    if (!passwordEncoder.matches(request.getCurrentPassword(), account.getPasswordHash())) {
        throw new BadCredentialsException("Mật khẩu hiện tại không chính xác");
    }

    // 3. Kiểm tra không được trùng mật khẩu cũ
    if (passwordEncoder.matches(request.getNewPassword(), account.getPasswordHash())) {
        throw new IllegalArgumentException("Mật khẩu mới không được trùng với mật khẩu hiện tại");
    }

    // 4. Băm mật khẩu mới và lưu
    account.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    account.setUpdatedAt(LocalDateTime.now());
    accountRepository.save(account);

    // 5. Ghi nhật ký kiểm toán
    auditLogService.log("AUTH", "CHANGE_PASSWORD", accountId, clientIp, "Đổi mật khẩu thành công");
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu đầu vào | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-CPW-01** | Đổi mật khẩu thành công | Mật khẩu cũ đúng, mật khẩu mới mạnh và trùng confirm | Đổi thành công, HTTP 200, mật khẩu mới có hiệu lực ngay |
| **TC-CPW-02** | Mật khẩu hiện tại không đúng | `currentPassword`: "WrongPass" | Báo lỗi HTTP 400 "Mật khẩu hiện tại không chính xác" |
| **TC-CPW-03** | Mật khẩu mới trùng mật khẩu cũ | `newPassword` giống `currentPassword` | Báo lỗi HTTP 400 "Mật khẩu mới không được trùng mật khẩu cũ" |
| **TC-CPW-04** | Confirm password không khớp | `confirmPassword` khác `newPassword` | Báo lỗi tại Client và Server |
| **TC-CPW-05** | Mật khẩu mới không đủ độ phức tạp | `newPassword`: "123456" | Validation lỗi "Mật khẩu phải từ 8 đến 32 ký tự..." |

