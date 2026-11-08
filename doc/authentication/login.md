# Đặc Tả Kỹ Thuật: 3.2.1 Login & Quản Lý Phiên Làm Việc (Authentication & Refresh Token)

## 1. Thông Tin Định Danh Use Case
- **Mã Use Case**: `UC01` (SRS 3.2.1)
- **Tên Use Case**: Login (Đăng nhập hệ thống)
- **Tác nhân (Actor)**: `ALL` (Admin, Store Manager, Pharmacist, Warehouse Staff)
- **Mô tả nghiệp vụ**: Cho phép người dùng xác thực vào hệ thống Pharmacy Chain Management System bằng tên đăng nhập (hoặc email) và mật khẩu đã đăng ký. Hệ thống thiết lập cơ chế xác thực hai lớp token (**Access Token** ngắn hạn và **Refresh Token** dài hạn trong HttpOnly Cookie với cơ chế Rotation) để đảm bảo tối đa tính bảo mật và trải nghiệm người dùng liền mạch trong suốt ca làm việc.
- **Tiền điều kiện (Preconditions)**:
  - Tài khoản người dùng đã được khởi tạo trong hệ thống.
  - Trạng thái tài khoản đang hoạt động (`status = 1` - Active).
- **Hậu điều kiện (Postconditions)**:
  - Hệ thống cấp JWT Access Token (trả về trong response body) và Refresh Token (thiết lập qua HttpOnly Cookie và lưu trữ trong Database).
  - Người dùng được chuyển hướng đến trang bảng điều khiển (Dashboard / POS Counter) tương ứng với vai trò.
  - Ghi nhận lịch sử đăng nhập vào bảng `audit_logs`.

---

## 2. Quy Trình Nghiệp Vụ Chi Tiết (Business Flow)

### 2.1. Luồng chính: Đăng nhập hệ thống (Main Flow - Login)
1. Người dùng truy cập đường dẫn `/login` trên trình duyệt.
2. Hệ thống hiển thị form đăng nhập gồm: `User Name / Email`, `Password`, nút `Login` và liên kết `Forgot Password?`.
3. Người dùng nhập tên đăng nhập (hoặc email) và mật khẩu.
4. Người dùng bấm nút **Login** (hoặc nhấn phím `Enter`).
5. Frontend kiểm tra định dạng đầu vào (client-side validation): các trường không được để trống, độ dài hợp lệ.
6. Frontend gửi yêu cầu đăng nhập tới Backend API: `POST /api/v1/auth/login`.
7. Backend kiểm tra tài khoản trong cơ sở dữ liệu (`dbo.accounts`):
   - Tìm kiếm tài khoản theo `username` hoặc `email`.
   - Kiểm tra trạng thái tài khoản: nếu `status != 1` -> từ chối đăng nhập.
   - So khớp mật khẩu với mã băm bằng `BCryptPasswordEncoder.matches()`.
8. Khi xác thực thành công:
   - **Tạo Access Token (AT)**: Chứa các claims (`userId`/`accountId`, `username`, `role`, `storeId`,...) được ký bằng `ACCESS_TOKEN_SECRET` với thời hạn **15 phút**.
   - **Tạo Refresh Token (RT)**: Chuỗi ngẫu nhiên bảo mật cao (hoặc JWT được ký bằng `REFRESH_TOKEN_SECRET`) với thời hạn **8 tiếng** (tương đương 1 ca làm việc tiêu chuẩn).
   - **Lưu RT vào Database**: Lưu thông tin RT vào bảng `dbo.refresh_tokens` gắn liền với `account_id`, thời hạn hết hạn, trạng thái thu hồi.
   - **Gắn RT vào Cookie**: Thiết lập RT vào HttpOnly Cookie trong response header (`Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=28800`).
   - Backend ghi nhật ký thành công vào bảng `audit_logs` (`action_code = 'LOGIN_SUCCESS'`).
   - Backend trả về HTTP `200 OK` kèm Access Token và thông tin tóm tắt người dùng trong JSON body.
9. Frontend nhận Access Token, lưu vào bộ nhớ cục bộ (React Auth Context/State). Trình duyệt tự động lưu và bảo vệ Refresh Token trong Cookie bảo mật.
10. Frontend chuyển hướng người dùng đến trang làm việc tương ứng với quyền hạn.

---

### 2.2. Luồng tự động làm mới Token (Silent Refresh Flow - Axios Interceptor)
Áp dụng cơ chế **Refresh Token Rotation (RTR)** khi Access Token hết hạn trong quá trình thao tác:
1. Khi Access Token (15 phút) hết hạn, các request gọi API tài nguyên từ Frontend sẽ nhận phản hồi lỗi `401 Unauthorized` từ Backend.
2. **Axios Response Interceptor** phía Client chặn mã lỗi 401:
   - Tạm dừng các request tiếp theo và đưa vào hàng đợi (queue).
   - Tự động gọi API `POST /api/v1/auth/refresh-token` (trình duyệt tự động gửi kèm HttpOnly Cookie chứa RT với `withCredentials: true`).
3. **Backend tiếp nhận và xác thực RT**:
   - Server đọc RT từ HttpOnly Cookie.
   - Kiểm tra tính hợp lệ:
     - RT có đúng định dạng và chưa hết hạn?
     - RT có tồn tại trong Database không?
     - RT đã bị thu hồi (`is_revoked = 1`) hoặc đã từng được sử dụng trước đó chưa?
   - *Cơ chế phòng chống Token Reuse Attack*: Nếu phát hiện RT đã bị thu hồi hoặc đã được thay thế (token reuse), hệ thống lập tức vô hiệu hóa toàn bộ chuỗi token (token family) của người dùng đó và yêu cầu đăng nhập lại ngay lập tức.
4. **Nếu RT hợp lệ**:
   - Áp dụng **Refresh Token Rotation**: Vô hiệu hóa (revoke hoặc xóa) RT cũ trong Database.
   - Sinh một cặp token mới: **Access Token mới (15 phút)** và **Refresh Token mới (8 tiếng)**.
   - Lưu RT mới vào Database và gửi lại qua response header `Set-Cookie` (HttpOnly Cookie mới).
   - Trả về Access Token mới trong response body (HTTP `200 OK`).
5. **Xử lý tại Client khi thành công**:
   - Cập nhật Access Token mới vào bộ nhớ (Auth Context).
   - Giải phóng hàng đợi: Thực thi lại toàn bộ các request bị tạm dừng trước đó với Access Token mới.
6. **Xử lý khi thất bại (RT cũng hết hạn, không hợp lệ hoặc bị thu hồi)**:
   - Xóa sạch trạng thái ứng dụng (Auth Context, memory state).
   - Chuyển hướng người dùng về trang `/login` kèm thông báo: *"Phiên làm việc đã kết thúc. Vui lòng đăng nhập lại."*.

---

### 2.3. Luồng đăng xuất (Logout Flow)
1. Người dùng bấm nút **Đăng xuất (Logout)** trên giao diện.
2. Frontend gửi request `POST /api/v1/auth/logout` tới Backend (kèm cookie chứa RT).
3. Backend xử lý:
   - Thu hồi/Xóa RT tương ứng khỏi Database (`dbo.refresh_tokens`) hoặc Redis.
   - Xóa Cookie chứa RT ở phía Client bằng cách trả về header `Set-Cookie: refreshToken=; Path=/api/v1/auth; Max-Age=0; HttpOnly; SameSite=Strict`.
   - Ghi nhận `audit_logs` (`action_code = 'LOGOUT'`).
4. Frontend xử lý:
   - Xóa Access Token khỏi React Context/bộ nhớ.
   - Xóa mọi thông tin profile người dùng trong state ứng dụng.
   - Điều hướng người dùng về trang `/login`.

---

### 2.4. Luồng ngoại lệ & Rẽ nhánh (Alternative / Exception Flows)
- **A1 - Thông tin để trống**: Nếu người dùng bỏ trống Tên đăng nhập hoặc Mật khẩu, hệ thống hiển thị thông báo lỗi màu đỏ ngay dưới ô nhập liệu: *"Vui lòng nhập tên đăng nhập/email"* hoặc *"Vui lòng nhập mật khẩu"*.
- **A2 - Sai thông tin đăng nhập**: Nếu tên đăng nhập không tồn tại hoặc mật khẩu không khớp, Backend trả về HTTP `401 Unauthorized`. Frontend hiển thị toast/alert: *"Tên đăng nhập hoặc mật khẩu không chính xác"*.
- **A3 - Tài khoản bị khóa**: Nếu tài khoản có `status = 0` (Inactive/Locked), Backend trả về HTTP `403 Forbidden`. Frontend thông báo: *"Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt. Vui lòng liên hệ Quản trị viên"*.
- **A4 - Người dùng bấm Forgot Password**: Hệ thống chuyển hướng tới trang `/forgot-password`.
- **A5 - Refresh Token không hợp lệ / Hết hạn**: Khi gọi `/refresh-token` thất bại (HTTP 401), Frontend lập tức xóa context và điều hướng về `/login`.

---

### 2.5. Quy Tắc Nghiệp Vụ (Business Rules)
- **BR-01 (Mã hóa mật khẩu)**: Mật khẩu tuyệt đối không được lưu dưới dạng plain text; bắt buộc băm bằng thuật toán BCrypt với độ dài salt tiêu chuẩn (strength >= 10).
- **BR-02 (Bảo vệ brute-force)**: Khi đăng nhập thất bại quá 5 lần liên tiếp trên cùng một tài khoản, hệ thống áp dụng cơ chế khóa tạm thời hoặc yêu cầu thời gian chờ để phòng chống tấn công dò mật khẩu.
- **BR-03 (Audit Log)**: Mọi nỗ lực đăng nhập thành công hay thất bại, làm mới token và đăng xuất đều phải được ghi nhận vào `audit_logs` gồm: `account_id`, `timestamp`, `ip_address`, `module_name = 'AUTH'`, `action_code` (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `TOKEN_REFRESH`, `LOGOUT`).
- **BR-04 (Thời hạn và cơ chế Token)**:
  - **Access Token (AT)**: Có thời hạn mặc định là **15 phút**. Được ký bằng `ACCESS_TOKEN_SECRET`. Chứa các claims: `userId`, `username`, `role`, `storeId`. Lưu trữ tại biến cục bộ Context (In-Memory) ở Frontend.
  - **Refresh Token (RT)**: Có thời hạn mặc định là **8 tiếng** (tương đương 1 ca làm việc tiêu chuẩn). Được ký bằng `REFRESH_TOKEN_SECRET` (hoặc chuỗi ngẫu nhiên bảo mật cao). Được lưu trữ vào Database và truyền qua HttpOnly Cookie (`HttpOnly`, `Secure`, `SameSite=Strict/Lax`).
  - **Refresh Token Rotation (RTR)**: Mỗi lần Client gọi refresh token thành công, cặp token cũ bị vô hiệu hóa và một cặp (AT mới + RT mới) được phát hành.
  - **Xử lý Đăng xuất**: Thu hồi RT trong Database/Redis và đặt `Max-Age = 0` cho HttpOnly Cookie ở Client.

---

## 3. Đặc Tả Giao Diện Frontend (UI/UX Specification)

### 3.1. Cấu Trúc Màn Hình & Wireframe
- Màn hình căn giữa hiển thị dạng Card với logo nhà thuốc, tiêu đề **"Đăng Nhập Hệ Thống"**, form đăng nhập gồm `username`, `password`, nút `Login` và liên kết `Quên mật khẩu?`.

### 3.2. Bảng Định Nghĩa Các Trường Form
| STT | Tên trường (Field Name) | Loại điều khiển (Control Type) | Bắt buộc | Max Length | Validation & Regex | Thông báo lỗi khi không hợp lệ |
| :---: | :--- | :--- | :---: | :---: | :--- | :--- |
| 1 | `username` | Text Box | Có | 50 | Không chứa khoảng trắng ở 2 đầu | "Tên đăng nhập không được để trống và tối đa 50 ký tự" |
| 2 | `password` | Password Box (icon ẩn/hiện) | Có | 32 | Độ dài 6 - 32 ký tự | "Mật khẩu phải từ 6 đến 32 ký tự" |
| 3 | Nút `Login` | Button (Primary) | - | - | Trigger form submit; hiển thị Spinner khi `isLoading = true` | - |
| 4 | Link `Forgot Password?` | Hyperlink | - | - | Điều hướng tới `/forgot-password` | - |

---

## 4. Đặc Tả Kỹ Thuật Backend (Backend Specification)

### 4.1. Cơ Sở Dữ Liệu Lưu Trữ Refresh Token (`dbo.refresh_tokens`)
```sql
CREATE TABLE dbo.refresh_tokens (
    token_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    account_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expiry_date DATETIME2 NOT NULL,
    is_revoked BIT DEFAULT 0 NOT NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME() NOT NULL,
    replaced_by_token VARCHAR(255) NULL,
    CONSTRAINT FK_refresh_tokens_accounts FOREIGN KEY (account_id) REFERENCES dbo.accounts(account_id) ON DELETE CASCADE
);

CREATE INDEX IX_refresh_tokens_account_id ON dbo.refresh_tokens(account_id);
CREATE INDEX IX_refresh_tokens_hash ON dbo.refresh_tokens(token_hash);
```

---

### 4.2. RESTful API Contracts

#### API 1: Đăng nhập (`POST /api/v1/auth/login`)
- **Mức độ truy cập**: Public
- **Content-Type**: `application/json`

**Request Payload:**
```json
{
  "username": "pharmacist_hn01",
  "password": "Password@123"
}
```

**Response Header:**
```http
Set-Cookie: refreshToken=d8f1e2c3b4a5...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=28800
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDAxIiwidXNlcm5hbWUiOiJwaGFybWFjaXN0X2huMDEiLCJyb2xlIjoiUk9MRV9QSEFSTUFDSVNUIiwic3RvcmVJZCI6MSwiaWF0IjoxNzgxNjA0ODAwLCJleHAiOjE3ODE2MDU3MDB9...",
    "tokenType": "Bearer",
    "expiresIn": 900,
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

---

#### API 2: Làm mới Token (`POST /api/v1/auth/refresh-token`)
- **Mức độ truy cập**: Public (Yêu cầu HttpOnly Cookie chứa `refreshToken`)
- **Request Header**:
  ```http
  Cookie: refreshToken=d8f1e2c3b4a5...
  ```
- **Request Body**: Trống

**Response Header (Khi thành công):**
```http
Set-Cookie: refreshToken=new_rotational_token_9988...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=28800
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": 200,
  "message": "Làm mới token thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDAxIiwidXNlcm5hbWUiOiJwaGFybWFjaXN0X2huMDEiLCJyb2xlIjoiUk9MRV9QSEFSTUFDSVNUIiwic3RvcmVJZCI6MSwiaWF0IjoxNzgxNjA1NzAwLCJleHAiOjE3ODE2MDY2MDB9...",
    "tokenType": "Bearer",
    "expiresIn": 900
  }
}
```

**Response Body (HTTP 401 Unauthorized - Hết hạn hoặc token không hợp lệ):**
```json
{
  "status": 401,
  "error": "REFRESH_TOKEN_EXPIRED",
  "message": "Phiên làm việc đã kết thúc. Vui lòng đăng nhập lại",
  "timestamp": "2026-11-08T14:30:00"
}
```

---

#### API 3: Đăng xuất (`POST /api/v1/auth/logout`)
- **Mức độ truy cập**: Đã xác thực hoặc có HttpOnly Cookie
- **Request Header**:
  ```http
  Cookie: refreshToken=...
  ```

**Response Header:**
```http
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=0
```

**Response Body (HTTP 200 OK):**
```json
{
  "status": 200,
  "message": "Đăng xuất thành công"
}
```

---

### 4.3. Khai Báo DTO Java

#### `LoginRequest.java`:
```java
package com.pharmacy.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Tên đăng nhập hoặc email không được để trống")
    @Size(max = 50, message = "Tên đăng nhập tối đa 50 ký tự")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 32, message = "Mật khẩu phải từ 6 đến 32 ký tự")
    private String password;
}
```

#### `TokenRefreshResponse.java`:
```java
package com.pharmacy.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenRefreshResponse {
    private String accessToken;
    @Builder.Default
    private String tokenType = "Bearer";
    @Builder.Default
    private Long expiresIn = 900L; // 15 phút
}
```

---

### 4.4. Thuật Toán Xử Lý Tại Service Layer (`AuthServiceImpl`)

```java
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditLogService auditLogService;

    @Transactional
    public LoginResult login(LoginRequest request, String ipAddress) {
        // 1. Kiểm tra tài khoản
        Account account = accountRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không chính xác"));

        if (account.getStatus() != 1) {
            throw new AccountLockedException("Tài khoản đã bị khóa hoặc ngừng hoạt động");
        }

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            auditLogService.log("AUTH", "LOGIN_FAILED", account.getAccountId(), ipAddress, "Sai mật khẩu");
            throw new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không chính xác");
        }

        // 2. Tạo Access Token (15 phút)
        String accessToken = jwtTokenProvider.generateAccessToken(account);

        // 3. Tạo và lưu Refresh Token (8 tiếng)
        RefreshToken refreshToken = refreshTokenRepository.createRefreshToken(account, 8 * 3600L);

        // 4. Ghi nhật ký đăng nhập
        auditLogService.log("AUTH", "LOGIN_SUCCESS", account.getAccountId(), ipAddress, "Đăng nhập thành công");

        return new LoginResult(buildLoginResponse(account, accessToken), refreshToken.getToken());
    }

    @Transactional
    public RefreshTokenResult refreshToken(String requestRefreshToken, String ipAddress) {
        // 1. Tìm kiếm và kiểm tra Refresh Token trong DB
        RefreshToken token = refreshTokenRepository.findByToken(requestRefreshToken)
                .orElseThrow(() -> new TokenRefreshException("Refresh Token không hợp lệ"));

        // 2. Phát hiện tái sử dụng Token đã thu hồi (Reuse Detection)
        if (token.isRevoked()) {
            refreshTokenRepository.revokeAllTokensByAccountId(token.getAccount().getAccountId());
            auditLogService.log("AUTH", "TOKEN_REUSE_DETECTED", token.getAccount().getAccountId(), ipAddress, "Cảnh báo bảo mật: Token đã thu hồi bị tái sử dụng");
            throw new SecurityException("Phát hiện hành vi đáng ngờ. Vui lòng đăng nhập lại!");
        }

        // 3. Kiểm tra hết hạn
        if (token.getExpiryDate().isBefore(Instant.now())) {
            throw new TokenRefreshException("Refresh Token đã hết hạn");
        }

        // 4. Áp dụng Refresh Token Rotation (RTR)
        token.setRevoked(true);
        refreshTokenRepository.save(token);

        Account account = token.getAccount();
        String newAccessToken = jwtTokenProvider.generateAccessToken(account);
        RefreshToken newRefreshToken = refreshTokenRepository.createRefreshToken(account, 8 * 3600L);
        token.setReplacedByToken(newRefreshToken.getToken());
        refreshTokenRepository.save(token);

        auditLogService.log("AUTH", "TOKEN_REFRESH", account.getAccountId(), ipAddress, "Làm mới Token thành công");

        return new RefreshTokenResult(newAccessToken, newRefreshToken.getToken());
    }

    @Transactional
    public void logout(String requestRefreshToken) {
        if (requestRefreshToken != null) {
            refreshTokenRepository.findByToken(requestRefreshToken).ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });
        }
    }
}
```

---

## 5. Đặc Tả Kiến Trúc & Xử Lý Phía Client (Frontend Architecture)

### 5.1. Mô Hình Lưu Trữ Token An Toàn
- **Access Token (AT)**:
  - Lưu trữ trực tiếp trong **React AuthContext** (in-memory state).
  - Không lưu trữ vào `localStorage` nhằm triệt tiêu hoàn toàn rủi ro bị đánh cắp qua tấn công XSS (Cross-Site Scripting).
  - Đính kèm vào header `Authorization: Bearer <access_token>` cho toàn bộ các request gọi API tài nguyên.
- **Refresh Token (RT)**:
  - Được lưu trữ an toàn trong **HttpOnly Cookie** do trình duyệt tự động quản lý.
  - Các script JavaScript phía client không thể đọc trực tiếp cookie này (miễn nhiễm với XSS).
  - Trình duyệt tự động đính kèm cookie mỗi khi gọi API đến domain thông qua cấu hình `withCredentials: true`.

---

### 5.2. Cấu Hình Tự Động Làm Mới Token (Axios Interceptors)
Triển khai cơ chế chờ (Queue) để tránh nhiều request 401 đồng thời cùng kích hoạt nhiều lệnh refresh token cùng lúc:

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Tự động gửi HttpOnly Cookie chứa Refresh Token
});

// 1. Request Interceptor: Đính kèm Access Token vào mọi request
export const setupAxiosInterceptors = (getAccessToken, updateAccessToken, onLogout) => {
  apiClient.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  // 2. Response Interceptor: Bắt mã lỗi 401 và thực hiện Silent Refresh
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Tránh lặp vô hạn nếu chính API refresh-token hoặc login bị 401
      if (originalRequest.url.includes('/auth/refresh-token') || originalRequest.url.includes('/auth/login')) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Nếu đang có 1 tiến trình refresh chạy, đưa request hiện tại vào hàng đợi
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Gọi API refresh token (HttpOnly cookie được tự động đính kèm)
          const res = await axios.post('/api/v1/auth/refresh-token', {}, { withCredentials: true });
          const newAccessToken = res.data.data.accessToken;

          // Cập nhật Access Token mới vào Auth Context
          updateAccessToken(newAccessToken);

          // Giải phóng hàng đợi với token mới
          processQueue(null, newAccessToken);

          // Thực hiện lại request ban đầu với token mới
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh Token cũng hết hạn hoặc bị thu hồi -> Đăng xuất người dùng
          processQueue(refreshError, null);
          onLogout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

export default apiClient;
```

---

## 6. Kịch Bản Kiểm Thử (Test Cases)

| Mã TC | Tên ca kiểm thử | Dữ liệu đầu vào / Điều kiện | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Đăng nhập thành công | `username`: "pharmacist1", `password`: "Password@123" | HTTP 200. Trả về Access Token (15p) trong body, Set-Cookie chứa RT (8h, HttpOnly), lưu token vào AuthContext, điều hướng Dashboard |
| **TC-AUTH-02** | Bỏ trống Username | `username`: "", `password`: "Password@123" | Client báo lỗi "Tên đăng nhập không được để trống", chặn submit |
| **TC-AUTH-03** | Bỏ trống Password | `username`: "pharmacist1", `password`: "" | Client báo lỗi "Mật khẩu không được để trống", chặn submit |
| **TC-AUTH-04** | Sai mật khẩu | `username`: "pharmacist1", `password`: "WrongPass" | HTTP 401, thông báo sai thông tin đăng nhập, ghi audit log thất bại |
| **TC-AUTH-05** | Tài khoản không tồn tại | `username`: "ghost_user", `password`: "Pass123" | HTTP 401, thông báo lỗi chung phòng chống dò quét tài khoản |
| **TC-AUTH-06** | Tài khoản bị khóa | `username`: "locked_user", `status = 0` | HTTP 403, thông báo tài khoản bị khóa |
| **TC-AUTH-07** | Tự động làm mới Token khi AT hết hạn (Silent Refresh) | AT hết hạn (sau 15p), gửi request API tài nguyên, RT còn hạn | Interceptor bắt 401, gọi `/refresh-token` thành công, nhận AT mới và RT mới (RTR), thực thi lại request cũ thành công, người dùng không bị gián đoạn |
| **TC-AUTH-08** | Refresh Token Rotation (RTR) thành công | Gọi `/refresh-token` với RT hợp lệ | DB vô hiệu hóa RT cũ, phát hành RT mới qua Set-Cookie, trả về AT mới trong body |
| **TC-AUTH-09** | Phát hiện Token Reuse Attack | Gửi lại RT đã bị revoked hoặc replaced | HTTP 401/403, Backend thu hồi toàn bộ token family của tài khoản, ghi cảnh báo bảo mật vào audit log |
| **TC-AUTH-10** | Refresh Token hết hạn (quá 8 tiếng) | RT hết hạn, gọi `/refresh-token` | HTTP 401, Client xóa Context, chuyển hướng về `/login` với thông báo phiên làm việc đã kết thúc |
| **TC-AUTH-11** | Đăng xuất người dùng (Logout) | Người dùng nhấn Đăng xuất | HTTP 200, RT bị vô hiệu hóa trong DB, Set-Cookie với `Max-Age=0` xóa cookie ở trình duyệt, Client xóa AT khỏi Context và điều hướng về `/login` |
