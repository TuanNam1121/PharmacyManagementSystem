# Đặc Tả Kỹ Thuật: 3.2.1 Login (Đăng Nhập Hệ Thống)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC01` (SRS 3.2.1)
- **Tên Use Case**: Login (Đăng nhập)
- **Tác nhân (Actor)**: `ALL` (Admin, Store Manager, Pharmacist, Warehouse Staff)
- **Mô tả nghiệp vụ**: Cho phép người dùng xác thực vào hệ thống Pharmacy Chain Management System bằng tên đăng nhập (hoặc email) và mật khẩu đã đăng ký để truy cập vào các phân hệ theo quyền hạn được cấp.
- **Tiền điều kiện (Preconditions)**:
  - Tài khoản người dùng đã được khởi tạo trong hệ thống.
  - Trạng thái tài khoản đang hoạt động (`status = 1` - Active).
- **Hậu điều kiện (Postconditions)**:
  - Hệ thống cấp JWT Access Token và thiết lập phiên đăng nhập.
  - Người dùng được chuyển hướng đến trang bảng điều khiển (Dashboard / POS Counter) tương ứng với vai trò.
  - Ghi nhận lịch sử đăng nhập vào bảng `audit_logs`.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính (Main Flow)
1. Người dùng truy cập đường dẫn `/login` trên trình duyệt.
2. Hệ thống hiển thị form đăng nhập gồm: `User Name / Email`, `Password`, nút `Login`, nút `Cancel` và liên kết `Forgot Password?`.
3. Người dùng nhập tên đăng nhập (hoặc email) và mật khẩu.
4. Người dùng bấm nút **Login** (hoặc nhấn phím `Enter`).
5. Frontend kiểm tra định dạng đầu vào (client-side validation): các trường không được để trống, độ dài hợp lệ.
6. Frontend gửi yêu cầu đăng nhập tới Backend API: `POST /api/v1/auth/login`.
7. Backend kiểm tra tài khoản trong cơ sở dữ liệu (`dbo.accounts`):
   - Tìm kiếm tài khoản theo `username` hoặc `email`.
   - Kiểm tra trạng thái tài khoản: nếu `status != 1` -> từ chối đăng nhập.
   - So khớp mật khẩu với mã băm bằng `BCryptPasswordEncoder.matches()`.
8. Khi xác thực thành công:
   - Backend sinh JWT Access Token chứa các claims: `accountId`, `username`, `roleName`, `storeId` (nếu có).
   - Backend ghi nhật ký thành công vào bảng `audit_logs` (`action_code = 'LOGIN_SUCCESS'`).
   - Backend trả về HTTP `200 OK` kèm theo Access Token và thông tin tóm tắt người dùng.
9. Frontend nhận token, lưu trữ an toàn vào `localStorage` (hoặc `sessionStorage`), cập nhật state `AuthContext` và chuyển hướng người dùng vào trang làm việc tương ứng.

### 2.2. Luồng ngoại lệ & Rẽ nhánh (Alternative / Exception Flows)
- **A1 - Thông tin để trống**: Nếu người dùng bỏ trống Tên đăng nhập hoặc Mật khẩu, hệ thống hiển thị thông báo lỗi màu đỏ ngay dưới ô nhập liệu: *"Vui lòng nhập tên đăng nhập/email"* hoặc *"Vui lòng nhập mật khẩu"*.
- **A2 - Sai thông tin đăng nhập**: Nếu tên đăng nhập không tồn tại hoặc mật khẩu không khớp, Backend trả về HTTP `401 Unauthorized`. Frontend hiển thị toast/alert: *"Tên đăng nhập hoặc mật khẩu không chính xác"*.
- **A3 - Tài khoản bị khóa**: Nếu tài khoản có `status = 0` (Inactive/Locked), Backend trả về HTTP `403 Forbidden`. Frontend thông báo: *"Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt. Vui lòng liên hệ Quản trị viên"*.
- **A4 - Người dùng bấm Cancel**: Xóa sạch nội dung đã nhập trong hai ô input.
- **A5 - Người dùng bấm Forgot Password**: Hệ thống chuyển hướng tới trang `/forgot-password`.

### 2.3. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Mã hóa mật khẩu)**: Mật khẩu tuyệt đối không được lưu dưới dạng văn bản thuần (plain text). Mật khẩu phải được băm bằng thuật toán BCrypt với độ dài salt tiêu chuẩn (strength >= 10).
- **BR-02 (Bảo vệ brute-force)**: Khi đăng nhập thất bại quá 5 lần liên tiếp trên cùng một tài khoản, hệ thống áp dụng cơ chế khóa tạm thời hoặc yêu cầu thời gian chờ (cooldown 15 phút) để phòng chống tấn công dò mật khẩu.
- **BR-03 (Audit Log)**: Mọi nỗ lực đăng nhập thành công hay thất bại đều phải được ghi nhận vào `audit_logs` gồm: `account_id`, `timestamp`, `ip_address`, `module_name = 'AUTH'`, `action_code = 'LOGIN'`.
- **BR-04 (Thời hạn Token)**: Access Token có thời hạn mặc định là 8 giờ (tương đương một ca làm việc tiêu chuẩn).

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Cấu Trúc Màn Hình & Wireframe
- Màn hình căn giữa hiển thị dạng Card tinh tế với logo nhà thuốc, tiêu đề **"Đăng Nhập Hệ Thống"**, form đăng nhập và thông tin bản quyền.

### 3.2. Bảng Định Nghĩa Các Trường Form
| STT | Tên trường (Field Name) | Loại điều khiển (Control Type) | Bắt buộc | Max Length | Validation & Regex | Thông báo lỗi khi không hợp lệ |
| :---: | :--- | :--- | :---: | :---: | :--- | :--- |
| 1 | `username` | Text Box | Có | 50 | Không chứa khoảng trắng ở 2 đầu | "Tên đăng nhập không được để trống và tối đa 50 ký tự" |
| 2 | `password` | Password Box (icon ẩn/hiện) | Có | 32 | Độ dài 6 - 32 ký tự | "Mật khẩu phải từ 6 đến 32 ký tự" |
| 3 | `rememberMe` | Checkbox | Không | - | Boolean (`true`/`false`) | - |
| 4 | Nút `Login` | Button (Primary) | - | - | Trigger form submit; hiển thị Spinner khi `isLoading = true` | - |
| 5 | Nút `Cancel` | Button (Secondary) | - | - | Reset input fields | - |
| 6 | Link `Forgot Password?` | Hyperlink | - | - | Điều hướng tới `/forgot-password` | - |

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. RESTful API Contract
- **Endpoint**: `POST /api/v1/auth/login`
- **Mức độ truy cập**: Public (Không yêu cầu Bearer Token)
- **Content-Type**: `application/json`

#### Request Payload Schema:
```json
{
  "username": "pharmacist_hn01",
  "password": "Password@123",
  "rememberMe": true
}
```

#### Response Payload (Thành công - HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDAxIiwidXNlcm5hbWUiOiJwaGFybWFjaXN0X2huMDEiLCJyb2xlIjoiUk9MRV9QSEFSTUFDSVNUIiwic3RvcmVJZCI6MSwiaWF0IjoxNzgxNjA0ODAwLCJleHAiOjE3ODE2MzM2MDB9...",
    "tokenType": "Bearer",
    "expiresIn": 28800,
    "user": {
      "accountId": 1001,
      "username": "pharmacist_hn01",
      "email": "pharmacist1@pharmacy.com",
      "fullName": "Nguyễn Văn Dược",
      "role": "ROLE_PHARMACIST",
      "storeId": 1,
      "storeName": "Nhà thuốc Chi nhánh 1 - Cầu Giấy"
    }
  }
}
```

#### Response Payload (Thất bại - HTTP 401 Unauthorized):
```json
{
  "status": 401,
  "error": "UNAUTHORIZED",
  "message": "Tên đăng nhập hoặc mật khẩu không chính xác",
  "timestamp": "2026-11-04T08:00:00"
}
```

#### Response Payload (Tài khoản bị khóa - HTTP 403 Forbidden):
```json
{
  "status": 403,
  "error": "ACCOUNT_LOCKED",
  "message": "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên",
  "timestamp": "2026-11-04T08:00:00"
}
```

### 4.2. Khai Báo DTO Java
```java
package com.pharmacy.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Tên đăng nhập hoặc email không được để trống")
    @Size(max = 50, message = "Tên đăng nhập tối đa 50 ký tự")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 32, message = "Mật khẩu phải từ 6 đến 32 ký tự")
    private String password;

    private Boolean rememberMe = false;
}
```

### 4.3. Thuật Toán Xử Lý Tại Service Layer (`AuthServiceImpl.login`)
```java
@Transactional
public LoginResponse login(LoginRequest request, String ipAddress) {
    // 1. Tìm kiếm tài khoản theo username hoặc email
    Account account = accountRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
            .orElseThrow(() -> new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không chính xác"));

    // 2. Kiểm tra trạng thái hoạt động
    if (account.getStatus() != 1) {
        throw new AccountLockedException("Tài khoản đã bị khóa hoặc ngừng hoạt động");
    }

    // 3. So sánh mật khẩu bằng BCrypt
    if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
        auditLogService.log("AUTH", "LOGIN_FAILED", account.getAccountId(), ipAddress, "Sai mật khẩu");
        throw new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không chính xác");
    }

    // 4. Sinh JWT Token
    String token = jwtTokenProvider.generateToken(account);

    // 5. Ghi log thành công
    auditLogService.log("AUTH", "LOGIN_SUCCESS", account.getAccountId(), ipAddress, "Đăng nhập thành công");

    // 6. Map dữ liệu trả về LoginResponse
    return buildLoginResponse(account, token);
}
```

---

## 5. Kịch Bản Kiểm Thử (Test Cases)

| Mã TC | Tên ca kiểm thử | Dữ liệu đầu vào | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Đăng nhập thành công với thông tin đúng | `username`: "pharmacist1", `password`: "Password@123" | Trả về HTTP 200, JWT token, chuyển hướng về Dashboard |
| **TC-AUTH-02** | Bỏ trống Username | `username`: "", `password`: "Password@123" | Client báo lỗi "Tên đăng nhập không được để trống", chặn submit |
| **TC-AUTH-03** | Bỏ trống Password | `username`: "pharmacist1", `password`: "" | Client báo lỗi "Mật khẩu không được để trống", chặn submit |
| **TC-AUTH-04** | Sai mật khẩu | `username`: "pharmacist1", `password`: "WrongPass" | Trả về HTTP 401, thông báo lỗi bảo mật, ghi audit log thất bại |
| **TC-AUTH-05** | Tài khoản không tồn tại | `username`: "ghost_user", `password`: "Pass123" | Trả về HTTP 401 với cùng thông điệp chung để chống user enumeration |
| **TC-AUTH-06** | Đăng nhập vào tài khoản đã bị khóa | `username`: "locked_user", `password`: "Pass123" (`status = 0`) | Trả về HTTP 403, thông báo tài khoản bị khóa |

