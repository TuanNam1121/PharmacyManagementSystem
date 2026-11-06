# Đặc Tả Kỹ Thuật: 3.2.5 Forgot Password (Quên Mật Khẩu)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC05` (SRS 3.2.5)
- **Tên Use Case**: Forgot Password (Quên mật khẩu & Khôi phục)
- **Tác nhân (Actor)**: `ALL` (Người dùng quên thông tin đăng nhập)
- **Mô tả nghiệp vụ**: Cung cấp quy trình an toàn giúp người dùng tự khôi phục quyền truy cập vào tài khoản thông qua đường link và mã xác thực (Reset Token) được gửi tới hòm thư điện tử đã đăng ký.
- **Tiền điều kiện (Preconditions)**:
  - Tài khoản người dùng tồn tại và có địa chỉ email hợp lệ được lưu trong hệ thống.
- **Hậu điều kiện (Postconditions)**:
  - Sinh mã token khôi phục và ghi vào bảng `dbo.password_reset_tokens`.
  - Gửi email thông báo chứa link/token đặt lại mật khẩu cho người dùng.
  - Sau khi xác nhận thành công, mật khẩu mới được băm BCrypt và cập nhật vào `dbo.accounts`, token được đánh dấu đã sử dụng (`is_used = 1`).

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow - 2 Giai Đoạn)

#### Giai đoạn 1: Yêu cầu khôi phục mật khẩu (Forgot Password Request)
1. Người dùng bấm liên kết **"Forgot Password?"** tại màn hình đăng nhập.
2. Trình duyệt chuyển đến trang `/forgot-password`.
3. Người dùng nhập địa chỉ email (hoặc tên đăng nhập) và bấm nút **"Gửi yêu cầu" (Send)**.
4. Frontend validate định dạng email và gửi request `POST /api/v1/auth/forgot-password` kèm payload `{ "email": "user@pharmacy.com" }`.
5. Backend tiếp nhận:
   - Kiểm tra email trong bảng `dbo.accounts`.
   - Nếu tồn tại và tài khoản đang hoạt động, Backend sinh một token ngẫu nhiên bảo mật (UUID hoặc mã hex 32 ký tự).
   - Thiết lập thời gian hết hạn của token là **15 phút** kể từ thời điểm tạo.
   - Lưu bản ghi vào bảng `dbo.password_reset_tokens` (`account_id`, `token`, `expiry_date`, `is_used = 0`).
   - Tạo nội dung email chứa đường link đặt lại mật khẩu:  
     `https://pms.pharmacy.com/reset-password?token=abcdef123456...`
   - Gửi email thông qua dịch vụ Mail Service và ghi nhận vào bảng `dbo.email_logs`.
   - Ghi audit log (`action_code = 'FORGOT_PASSWORD_REQUEST'`).
6. Backend trả về thông báo HTTP `200 OK`: *"Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu tới hòm thư của bạn"*.
7. Frontend hiển thị thông báo thành công và đếm ngược thời gian chờ gửi lại (60 giây).

#### Giai đoạn 2: Đặt lại mật khẩu mới (Reset Password Execution)
1. Người dùng mở email, bấm vào đường link hoặc truy cập `/reset-password?token=...`.
2. Giao diện hiển thị form đặt lại mật khẩu gồm: Mật khẩu mới, Xác nhận mật khẩu mới.
3. Người dùng nhập mật khẩu mới và bấm **"Đặt lại mật khẩu" (Reset Password)**.
4. Frontend kiểm tra độ mạnh mật khẩu và gửi `POST /api/v1/auth/reset-password` kèm `{ "token", "newPassword", "confirmPassword" }`.
5. Backend kiểm tra:
   - Tìm kiếm token trong bảng `password_reset_tokens`.
   - Kiểm tra token còn trong hạn (`expiry_date > NOW()`) và chưa được sử dụng (`is_used == 0`).
   - Cập nhật mật khẩu mới (BCrypt) vào bảng `accounts`.
   - Đánh dấu token đã dùng (`is_used = 1`).
   - Ghi audit log (`action_code = 'RESET_PASSWORD_SUCCESS'`).
6. Backend trả về HTTP `200 OK`.
7. Frontend hiển thị thông báo: *"Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới"* và tự động chuyển về `/login`.

### 2.2. Luồng ngoại lệ & Rẽ nhánh
- **A1 - Token không hợp lệ hoặc đã hết hạn**: Backend trả về HTTP `400 Bad Request` với message *"Liên kết khôi phục mật khẩu không hợp lệ hoặc đã hết hạn"*. Frontend hiển thị thông báo và nút "Yêu cầu liên kết mới".
- **A2 - Token đã được sử dụng trước đó**: Backend từ chối với mã lỗi HTTP `400` *"Token này đã được sử dụng"*.
- **A3 - Email không tồn tại**: Để đảm bảo tính bảo mật và chống tấn công dò danh sách người dùng (User Enumeration), hệ thống luôn trả về cùng thông điệp thành công ở bước 1 dù email có tồn tại hay không.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Thời gian sống Token)**: Reset Token chỉ có hiệu lực duy nhất trong vòng **15 phút**. Sau thời gian này, token tự động mất hiệu lực.
- **BR-02 (Sử dụng 1 lần)**: Token chỉ được dùng đúng 1 lần duy nhất. Ngay sau khi reset mật khẩu thành công, cờ `is_used` lập tức chuyển thành `1`.
- **BR-03 (Chống Spam Email - Rate Limiting)**: Một địa chỉ email chỉ được phép gửi yêu cầu khôi phục mật khẩu tối đa 3 lần trong vòng 1 giờ.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Form Yêu Cầu Quên Mật Khẩu (`ForgotPasswordPage.jsx`)
| STT | Tên trường | Control Type | Bắt buộc | Validation |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `email` | Email Input | Có | Đúng cú pháp RFC 5322 (`^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$`) |
| 2 | Nút `Send` | Button (Primary) | - | Trigger gửi email, hiển thị countdown 60s sau khi bấm |
| 3 | Link `Back to Login` | Hyperlink | - | Quay lại màn hình `/login` |

### 3.2. Form Đặt Mật Khẩu Mới (`ResetPasswordPage.jsx`)
| STT | Tên trường | Control Type | Bắt buộc | Validation |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `newPassword` | Password Box | Có | Tối thiểu 8 ký tự, có chữ hoa, thường, số, ký tự đặc biệt |
| 2 | `confirmPassword` | Password Box | Có | Phải trùng khớp với `newPassword` |
| 3 | Nút `Reset Password`| Button (Primary) | - | Submit cập nhật mật khẩu mới |

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract

#### A. Yêu cầu cấp mã token quên mật khẩu:
- **Endpoint**: `POST /api/v1/auth/forgot-password`
- **Quyền**: Public
- **Request Body**:
```json
{
  "email": "duocsihn01@pharmacy.com"
}
```
- **Response 200 OK**:
```json
{
  "status": 200,
  "message": "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn nếu địa chỉ hợp lệ",
  "data": null
}
```

#### B. Đặt lại mật khẩu bằng token:
- **Endpoint**: `POST /api/v1/auth/reset-password`
- **Quyền**: Public
- **Request Body**:
```json
{
  "token": "4a7b9c1d-8f2e-4a6c-9b1a-8c5d3e2f1a0b",
  "newPassword": "NewStrongPass@2026",
  "confirmPassword": "NewStrongPass@2026"
}
```
- **Response 200 OK**:
```json
{
  "status": 200,
  "message": "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ",
  "data": null
}
```

### 4.2. Khai Báo DTO Java
```java
package com.pharmacy.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank(message = "Vui lòng nhập địa chỉ email")
    @Email(message = "Địa chỉ email không đúng định dạng")
    private String email;
}

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "Token không được để trống")
    private String token;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 8, max = 32, message = "Mật khẩu phải từ 8 đến 32 ký tự")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,32}$",
        message = "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
    )
    private String newPassword;

    @NotBlank(message = "Vui lòng xác nhận mật khẩu mới")
    private String confirmPassword;
}
```

### 4.3. Thuật Toán Xử Lý Tại Service Layer
```java
@Transactional
public void processForgotPassword(ForgotPasswordRequest request, String clientIp) {
    Optional<Account> accountOpt = accountRepository.findByEmail(request.getEmail());
    if (accountOpt.isEmpty()) {
        // Vẫn return thành công để tránh tấn công dò tìm email người dùng
        return;
    }

    Account account = accountOpt.get();
    if (account.getStatus() != 1) {
        return;
    }

    // Sinh token ngẫu nhiên bảo mật
    String token = UUID.randomUUID().toString();
    LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(15);

    PasswordResetToken resetToken = new PasswordResetToken();
    resetToken.setAccountId(account.getAccountId());
    resetToken.setToken(token);
    resetToken.setExpiryDate(expiryDate);
    resetToken.setIsUsed((short) 0);
    resetToken.setCreatedAt(LocalDateTime.now());
    passwordResetTokenRepository.save(resetToken);

    // Gửi email hướng dẫn
    emailService.sendResetPasswordEmail(account.getEmail(), token);
    auditLogService.log("AUTH", "FORGOT_PW_REQUEST", account.getAccountId(), clientIp, "Yêu cầu khôi phục mật khẩu");
}

@Transactional
public void resetPassword(ResetPasswordRequest request, String clientIp) {
    if (!request.getNewPassword().equals(request.getConfirmPassword())) {
        throw new IllegalArgumentException("Mật khẩu xác nhận không khớp");
    }

    PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
            .orElseThrow(() -> new InvalidTokenException("Token khôi phục mật khẩu không hợp lệ"));

    if (resetToken.getIsUsed() == 1 || resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
        throw new InvalidTokenException("Token đã hết hạn hoặc đã được sử dụng");
    }

    Account account = accountRepository.findById(resetToken.getAccountId())
            .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));

    // Cập nhật mật khẩu mới
    account.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    account.setUpdatedAt(LocalDateTime.now());
    accountRepository.save(account);

    // Đánh dấu token đã dùng
    resetToken.setIsUsed((short) 1);
    passwordResetTokenRepository.save(resetToken);

    auditLogService.log("AUTH", "RESET_PW_SUCCESS", account.getAccountId(), clientIp, "Đặt lại mật khẩu thành công qua token");
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)
| Mã TC | Tên ca kiểm thử | Dữ liệu đầu vào | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-FPW-01** | Yêu cầu quên mật khẩu email đúng | `email`: "user@pharmacy.com" | Token được lưu vào DB, email được gửi đi, trả về HTTP 200 |
| **TC-FPW-02** | Yêu cầu với email không tồn tại | `email`: "unknown@email.com" | Hệ thống vẫn trả về HTTP 200 giả định an toàn, không gửi mail |
| **TC-FPW-03** | Đặt lại mật khẩu với token hợp lệ | Token đúng, còn hạn, mật khẩu mới mạnh | Cập nhật mật khẩu thành công, token chuyển `is_used = 1` |
| **TC-FPW-04** | Đặt lại mật khẩu với token hết hạn | Token đã tạo quá 15 phút | Báo lỗi HTTP 400 "Token đã hết hạn" |
| **TC-FPW-05** | Tái sử dụng token đã dùng | Token có `is_used = 1` | Báo lỗi HTTP 400 "Token đã được sử dụng" |

